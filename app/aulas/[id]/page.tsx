'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { UserProgress } from '@/lib/models/user-progress';

// Dynamically import VideoPlayer to avoid hydration mismatch
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', width: '100%', background: '#000' }}></div>
});

interface Lesson {
    id: number;
    title: string;
    video_id: string;
    description: string | null;
    materials: string | null;
    steps: string | null;
    cover_image: string | null;
    seal_difficulty: string | null;
    seal_time_value: string | null;
    seal_time_color: string | null;
    points: number;
    min_watch_time: number;
}

export default function LessonDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [totalPoints, setTotalPoints] = useState(0);
    const [userLevel, setUserLevel] = useState('Aprendiz');
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchLesson(params.id as string);
            fetchProgress(params.id as string);
            trackView(params.id as string);
        }
    }, [params.id]);

    const fetchLesson = async (id: string) => {
        try {
            const response = await fetch('/api/lessons');
            if (response.ok) {
                const lessons = await response.json();
                const foundLesson = lessons.find((l: Lesson) => l.id === parseInt(id));
                setLesson(foundLesson || null);
            }
        } catch (error) {
            console.error('Error fetching lesson:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async (lessonId: string) => {
        try {
            const response = await fetch(`/api/progress?lessonId=${lessonId}`);
            if (response.ok) {
                const data = await response.json();
                setProgress(data.progress);
                setTotalPoints(data.totalPoints);
                setUserLevel(data.level);
                setNotes(data.progress?.notes || '');
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const trackView = async (lessonId: string) => {
        try {
            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, watchTimeSeconds: 0, action: 'updateWatchTime' })
            });
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    };

    const handleWatchTimeUpdate = async (seconds: number) => {
        if (!params.id) return;
        try {
            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId: params.id,
                    watchTimeSeconds: seconds,
                    action: 'updateWatchTime'
                })
            });
        } catch (error) {
            console.error('Error updating watch time:', error);
        }
    };

    const toggleComplete = async () => {
        if (!params.id) return;
        try {
            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId: params.id, action: 'markCompleted' })
            });
            await fetchProgress(params.id as string);
        } catch (error) {
            console.error('Error marking complete:', error);
        }
    };

    const toggleFavorite = async () => {
        if (!params.id) return;
        try {
            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId: params.id, action: 'toggleFavorite' })
            });
            await fetchProgress(params.id as string);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const saveNotes = async () => {
        if (!params.id) return;
        setSavingNotes(true);
        try {
            await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId: params.id, action: 'saveNotes', notes })
            });
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setSavingNotes(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Carregando aula...</div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="container">
                <div className="card text-center">
                    <h2>Aula não encontrada</h2>
                    <Link href="/aulas" className="btn btn-primary mt-lg" style={{ textDecoration: 'none' }}>
                        Voltar para Aulas
                    </Link>
                </div>
            </div>
        );
    }

    const watchTimeMinutes = Math.floor((progress?.watch_time_seconds || 0) / 60);
    const canEarnPoints = watchTimeMinutes >= lesson.min_watch_time;

    return (
        <div className="container">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-lg)',
                flexWrap: 'wrap',
                gap: 'var(--spacing-sm)'
            }}>
                <Link href="/aulas" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                    ← Voltar
                </Link>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 'var(--font-size-small)', color: '#666' }}>Total de Pontos</div>
                        <div style={{ fontSize: 'var(--font-size-heading2)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            {totalPoints} pts
                        </div>
                        <div style={{ fontSize: 'var(--font-size-small)', color: '#666' }}>Nível: {userLevel}</div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline">
                        Sair
                    </button>
                </div>
            </div>

            <div className="card">
                <h1 style={{ marginBottom: 'var(--spacing-md)' }}>{lesson.title}</h1>

                <div className="badges-container" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {lesson.seal_difficulty && (
                        <span className="badge badge-difficulty">
                            {lesson.seal_difficulty}
                        </span>
                    )}
                    {lesson.seal_time_value && (
                        <span
                            className="badge badge-time"
                            style={{ backgroundColor: lesson.seal_time_color || '#FF6B6B' }}
                        >
                            ⏱️ {lesson.seal_time_value}
                        </span>
                    )}
                </div>

                {/* Video Player Container - No Clipping */}
                <div style={{
                    width: '100%',
                    marginBottom: 'var(--spacing-lg)',
                    borderRadius: 'var(--border-radius)'
                }}>
                    <VideoPlayer videoId={lesson.video_id} onTimeUpdate={handleWatchTimeUpdate} />
                </div>

                {/* Progress Info */}
                <div style={{
                    marginTop: 'var(--spacing-lg)',
                    padding: 'var(--spacing-md)',
                    background: '#f9f9f9',
                    borderRadius: 'var(--border-radius)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>Tempo assistido:</strong> {watchTimeMinutes} minutos
                            {!canEarnPoints && ` (mínimo ${lesson.min_watch_time} min para ganhar pontos)`}
                        </div>
                        {progress && progress.points_earned > 0 && (
                            <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                ✓ {progress.points_earned} pontos ganhos!
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    marginTop: 'var(--spacing-lg)',
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={toggleComplete}
                        className={`btn ${progress?.completed ? 'btn-success' : 'btn-primary'}`}
                        style={{ flex: '1', minWidth: '200px' }}
                    >
                        {progress?.completed ? '✓ Concluído' : 'Marcar como Concluído'}
                    </button>
                    <button
                        onClick={toggleFavorite}
                        className={`btn ${progress?.favorited ? 'btn-danger' : 'btn-outline'}`}
                        style={{ minWidth: '150px' }}
                    >
                        {progress?.favorited ? '❤️ Favorito' : '🤍 Favoritar'}
                    </button>
                </div>

                {/* Notes Section */}
                <div style={{ marginTop: 'var(--spacing-xl)' }}>
                    <h3>Minhas Anotações</h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Escreva suas anotações sobre esta aula..."
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            padding: 'var(--spacing-md)',
                            fontSize: 'var(--font-size-body)',
                            borderRadius: 'var(--border-radius)',
                            border: '2px solid #ddd',
                            marginTop: 'var(--spacing-sm)'
                        }}
                    />
                    <button
                        onClick={saveNotes}
                        disabled={savingNotes}
                        className="btn btn-primary"
                        style={{ marginTop: 'var(--spacing-sm)' }}
                    >
                        {savingNotes ? 'Salvando...' : 'Salvar Anotações'}
                    </button>
                </div>

                {/* Description */}
                {lesson.description && (
                    <div style={{ marginTop: 'var(--spacing-xl)' }}>
                        <h2>Sobre esta Aula</h2>
                        <p style={{
                            fontSize: 'var(--font-size-body)',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-line'
                        }}>
                            {lesson.description}
                        </p>
                    </div>
                )}

                {/* Materials */}
                {lesson.materials && (
                    <div style={{ marginTop: 'var(--spacing-xl)' }}>
                        <h2>Materiais Necessários</h2>
                        <div style={{
                            backgroundColor: '#FDF0F2',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--border-radius)',
                            fontSize: 'var(--font-size-body)',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-line',
                            borderLeft: '4px solid var(--color-primary)'
                        }}>
                            {lesson.materials}
                        </div>
                    </div>
                )}

                {/* Steps */}
                {lesson.steps && (
                    <div style={{ marginTop: 'var(--spacing-xl)' }}>
                        <h2>Passo a Passo</h2>
                        <div style={{
                            backgroundColor: '#EBF5F4',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--border-radius)',
                            fontSize: 'var(--font-size-body)',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-line',
                            borderLeft: '4px solid var(--color-secondary)'
                        }}>
                            {lesson.steps}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <Link href="/aulas" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>
                        Voltar para Lista de Aulas
                    </Link>
                </div>
            </div>
        </div>
    );
}
