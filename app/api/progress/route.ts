import { NextRequest, NextResponse } from 'next/server';
import { updateWatchTime, markAsCompleted, toggleFavorite, saveNotes, getUserPoints, getUserLevel, getProgress } from '@/lib/models/user-progress';
import { getLessonById } from '@/lib/models/lessons';
import { requireAuth } from '@/lib/auth';

// GET - Get progress for a lesson OR dashboard data
export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth();
        const { searchParams } = new URL(request.url);
        const lessonId = searchParams.get('lessonId');

        // If lessonId is provided, return specific lesson progress
        if (lessonId) {
            const progress = await getProgress(session.key, parseInt(lessonId));
            const totalPoints = await getUserPoints(session.key);
            const level = await getUserLevel(totalPoints);

            return NextResponse.json({
                progress: progress || null,
                totalPoints,
                level
            });
        }

        // If no lessonId, return dashboard data (favorites, recent, stats)
        const totalPoints = await getUserPoints(session.key);
        const level = await getUserLevel(totalPoints);

        // We need to fetch the actual lesson details for favorites and recent
        // This is a bit inefficient (N+1) but fine for small scale
        const { getFavoriteLessons, getRecentLessons } = await import('@/lib/models/user-progress');
        const { getLessonById } = await import('@/lib/models/lessons');

        const favoriteIds = await getFavoriteLessons(session.key);
        const recentIds = await getRecentLessons(session.key);

        const favoriteLessons = await Promise.all(favoriteIds.map(id => getLessonById(id)));
        const recentLessons = await Promise.all(recentIds.map(id => getLessonById(id)));

        return NextResponse.json({
            totalPoints,
            level,
            favorites: favoriteLessons.filter(l => l !== undefined),
            recent: recentLessons.filter(l => l !== undefined)
        });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        console.error('Error fetching progress:', error);
        return NextResponse.json({ error: 'Erro ao buscar progresso' }, { status: 500 });
    }
}

// POST - Update watch time
export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth();
        const body = await request.json();
        const { lessonId, watchTimeSeconds, action, notes } = body;

        if (!lessonId) {
            return NextResponse.json({ error: 'lessonId é obrigatório' }, { status: 400 });
        }

        const lessonIdNum = parseInt(lessonId);

        if (action === 'updateWatchTime' && watchTimeSeconds !== undefined) {
            await updateWatchTime(session.key, lessonIdNum, parseInt(watchTimeSeconds));
        } else if (action === 'markCompleted') {
            const lesson = await getLessonById(lessonIdNum);
            if (!lesson) {
                return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 });
            }
            await markAsCompleted(session.key, lessonIdNum, lesson.points, lesson.min_watch_time);
        } else if (action === 'toggleFavorite') {
            await toggleFavorite(session.key, lessonIdNum);
        } else if (action === 'saveNotes' && notes !== undefined) {
            await saveNotes(session.key, lessonIdNum, notes);
        } else {
            return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        console.error('Error updating progress:', error);
        return NextResponse.json({ error: 'Erro ao atualizar progresso' }, { status: 500 });
    }
}
