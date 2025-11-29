import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
    getAllLessons,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    CreateLessonData,
    UpdateLessonData
} from '@/lib/models/lessons';

// GET - List all lessons or get single lesson
export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const lesson = await getLessonById(parseInt(id));
            if (!lesson) {
                return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 });
            }
            return NextResponse.json(lesson);
        }

        const lessons = await getAllLessons();
        return NextResponse.json(lessons);
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ error: 'Erro ao buscar aulas' }, { status: 500 });
    }
}

// POST - Create new lesson
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();

        const {
            title,
            video_id,
            cover_image,
            seal_difficulty,
            seal_time_value,
            seal_time_color,
            description,
            materials,
            steps,
            order_num
        } = body;

        if (!title || !video_id || order_num === undefined) {
            return NextResponse.json(
                { error: 'Título, ID do vídeo e ordem são obrigatórios' },
                { status: 400 }
            );
        }

        const lessonData: CreateLessonData = {
            title,
            video_id,
            cover_image,
            seal_difficulty,
            seal_time_value,
            seal_time_color,
            description,
            materials,
            steps,
            order_num: parseInt(order_num)
        };

        const lesson = await createLesson(lessonData);
        return NextResponse.json(lesson, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        console.error('Error creating lesson:', error);
        return NextResponse.json({ error: 'Erro ao criar aula' }, { status: 500 });
    }
}

// PATCH - Update lesson
export async function PATCH(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
        }

        const lessonData: UpdateLessonData = {};
        if (updates.title !== undefined) lessonData.title = updates.title;
        if (updates.video_id !== undefined) lessonData.video_id = updates.video_id;
        if (updates.cover_image !== undefined) lessonData.cover_image = updates.cover_image;
        if (updates.seal_difficulty !== undefined) lessonData.seal_difficulty = updates.seal_difficulty;
        if (updates.seal_time_value !== undefined) lessonData.seal_time_value = updates.seal_time_value;
        if (updates.seal_time_color !== undefined) lessonData.seal_time_color = updates.seal_time_color;
        if (updates.description !== undefined) lessonData.description = updates.description;
        if (updates.materials !== undefined) lessonData.materials = updates.materials;
        if (updates.steps !== undefined) lessonData.steps = updates.steps;
        if (updates.order_num !== undefined) lessonData.order_num = parseInt(updates.order_num);

        await updateLesson(parseInt(id), lessonData);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        console.error('Error updating lesson:', error);
        return NextResponse.json({ error: 'Erro ao atualizar aula' }, { status: 500 });
    }
}

// DELETE - Delete lesson
export async function DELETE(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
        }

        await deleteLesson(parseInt(id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        console.error('Error deleting lesson:', error);
        return NextResponse.json({ error: 'Erro ao deletar aula' }, { status: 500 });
    }
}
