'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lesson {
    id: number;
    title: string;
    video_id: string;
    cover_image: string | null;
    seal_difficulty: string | null;
    seal_time_value: string | null;
    seal_time_color: string | null;
    points: number;
}

export default function MinhasReceitasPage() {
    const router = useRouter();
    const [favoriteLessons, setFavoriteLessons] = useState<Lesson[]>([]);
    const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [userLevel, setUserLevel] = useState('Aprendiz');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch user progress (favorites, recent, stats)
            const response = await fetch('/api/progress');
            if (response.ok) {
                const data = await response.json();
                setTotalPoints(data.totalPoints);
                setUserLevel(data.level);
                setFavoriteLessons(data.favorites || []);
                setRecentLessons(data.recent || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
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

    const LessonCard = ({ lesson }: { lesson: Lesson }) => (
        <Link
            href={`/aulas/${lesson.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            <div className="lesson-card" style={{
                border: '2px solid #ddd',
                borderRadius: 'var(--border-radius)',
                padding: 'var(--spacing-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'white'
            }}>
                {lesson.cover_image && (
                    <div style={{
                        width: '100%',
                        paddingBottom: '56.25%',
                        position: 'relative',
                        borderRadius: 'var(--border-radius)',
                        overflow: 'hidden',
                        marginBottom: 'var(--spacing-sm)',
                        background: '#f0f0f0'
                    }}>
                        <img
                            src={lesson.cover_image}
                            alt={lesson.title}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                )}
                <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-heading3)' }}>
                    {lesson.title}
                </h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                    {lesson.seal_difficulty && (
                        <span className="badge badge-difficulty" style={{ fontSize: 'var(--font-size-small)' }}>
                            {lesson.seal_difficulty}
                        </span>
                    )}
                    {lesson.seal_time_value && (
                        <span
                            className="badge badge-time"
                            style={{
                                backgroundColor: lesson.seal_time_color || '#FF6B6B',
                                fontSize: 'var(--font-size-small)'
                            }}
                        >
                            ⏱️ {lesson.seal_time_value}
                        </span>
                    )}
                    <span className="badge" style={{ backgroundColor: '#4ECDC4', fontSize: 'var(--font-size-small)' }}>
                        🏆 {lesson.points} pts
                    </span>
                </div>
            </div>
        </Link>
    );

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
                    ← Voltar para Aulas
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

            <h1>Minhas Receitas</h1>

            {loading ? (
                <div className="loading">Carregando...</div>
            ) : (
                <>
                    {/* Favoritas */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2>❤️ Aulas Favoritas</h2>
                        {favoriteLessons.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#666', padding: 'var(--spacing-xl)' }}>
                                Você ainda não tem aulas favoritas. Adicione clicando no ❤️ nas aulas!
                            </p>
                        ) : (
                            <div className="grid grid-3" style={{ gap: 'var(--spacing-md)' }}>
                                {favoriteLessons.map(lesson => (
                                    <LessonCard key={lesson.id} lesson={lesson} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Histórico */}
                    <div className="card">
                        <h2>🕐 Aulas Recentes</h2>
                        <p style={{ color: '#666', marginBottom: 'var(--spacing-md)' }}>
                            Suas últimas 5 aulas assistidas
                        </p>
                        {recentLessons.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#666', padding: 'var(--spacing-xl)' }}>
                                Nenhuma aula assistida ainda.
                            </p>
                        ) : (
                            <div className="grid grid-3" style={{ gap: 'var(--spacing-md)' }}>
                                {recentLessons.map(lesson => (
                                    <LessonCard key={lesson.id} lesson={lesson} />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
