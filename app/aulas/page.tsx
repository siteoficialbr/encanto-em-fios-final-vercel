'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lesson {
    id: number;
    title: string;
    description: string | null;
    cover_image: string | null;
    seal_difficulty: string | null;
    seal_time_value: string | null;
    seal_time_color: string | null;
    order_num: number;
}

export default function AulasPage() {
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const response = await fetch('/api/lessons');
            if (response.ok) {
                const data = await response.json();
                setLessons(data);
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
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

    const getShortDescription = (description: string | null) => {
        if (!description) return 'Descrição não disponível.';
        return description.length > 120
            ? description.substring(0, 120) + '...'
            : description;
    };

    return (
        <div className="container">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-xl)',
                flexWrap: 'wrap',
                gap: 'var(--spacing-md)'
            }}>
                <div>
                    <h1>Aulas do Encanto em Fios</h1>
                    <p className="text-large" style={{ color: 'var(--color-text-light)' }}>
                        Escolha a aula que deseja assistir.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <Link href="/minhas-receitas" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        ❤️ Minhas Receitas
                    </Link>
                    <button onClick={handleLogout} className="btn btn-outline">
                        Sair
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading">Carregando aulas...</div>
            ) : lessons.length === 0 ? (
                <div className="card text-center">
                    <p className="text-large">Nenhuma aula disponível no momento.</p>
                </div>
            ) : (
                <div className="grid grid-2">
                    {lessons.map((lesson) => (
                        <div key={lesson.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {lesson.cover_image && (
                                <img
                                    src={lesson.cover_image}
                                    alt={lesson.title}
                                    className="lesson-card-image"
                                    style={{ borderRadius: '0', marginBottom: '0' }}
                                />
                            )}

                            <div style={{ padding: 'var(--spacing-lg)' }}>
                                <div className="badges-container">
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

                                <h3>{lesson.title}</h3>
                                <p style={{
                                    color: 'var(--color-text-light)',
                                    marginBottom: 'var(--spacing-md)',
                                    fontSize: 'var(--font-size-body)'
                                }}>
                                    {getShortDescription(lesson.description)}
                                </p>
                                <Link
                                    href={`/aulas/${lesson.id}`}
                                    className="btn btn-primary btn-full"
                                    style={{ textDecoration: 'none' }}
                                >
                                    Assistir Aula
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
