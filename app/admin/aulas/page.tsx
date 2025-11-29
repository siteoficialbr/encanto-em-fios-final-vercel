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
    description: string | null;
    materials: string | null;
    steps: string | null;
    order_num: number;
    points: number;
    min_watch_time: number;
}

const MIN_WATCH_TIME_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120];

export default function AdminLessonsPage() {
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        video_id: '',
        cover_image: '',
        seal_difficulty: 'Fácil',
        seal_time_value: '',
        seal_time_color: '#FF6B6B',
        description: '',
        materials: '',
        steps: '',
        order_num: 1,
        points: 10,
        min_watch_time: 10
    });

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const response = await fetch('/api/admin/lessons');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const url = '/api/admin/lessons';
            const method = editingLesson ? 'PATCH' : 'POST';
            const body = editingLesson
                ? { id: editingLesson.id, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setSuccess(editingLesson ? 'Aula atualizada com sucesso!' : 'Aula criada com sucesso!');
                resetForm();
                fetchLessons();
            } else {
                const data = await response.json();
                setError(data.error || 'Erro ao salvar aula');
            }
        } catch (error) {
            setError('Erro ao conectar com o servidor');
        }
    };

    const handleEdit = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setFormData({
            title: lesson.title,
            video_id: lesson.video_id,
            cover_image: lesson.cover_image || '',
            seal_difficulty: lesson.seal_difficulty || 'Fácil',
            seal_time_value: lesson.seal_time_value || '',
            seal_time_color: lesson.seal_time_color || '#FF6B6B',
            description: lesson.description || '',
            materials: lesson.materials || '',
            steps: lesson.steps || '',
            order_num: lesson.order_num,
            points: lesson.points || 10,
            min_watch_time: lesson.min_watch_time || 10
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja deletar esta aula?')) {
            return;
        }

        try {
            const response = await fetch('/api/admin/lessons', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                setSuccess('Aula deletada com sucesso!');
                fetchLessons();
            } else {
                setError('Erro ao deletar aula');
            }
        } catch (error) {
            setError('Erro ao conectar com o servidor');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            video_id: '',
            cover_image: '',
            seal_difficulty: 'Fácil',
            seal_time_value: '',
            seal_time_color: '#FF6B6B',
            description: '',
            materials: '',
            steps: '',
            order_num: lessons.length + 1,
            points: 10,
            min_watch_time: 10
        });
        setEditingLesson(null);
        setShowForm(false);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

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
                <Link href="/admin" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                    ← Voltar
                </Link>
                <button onClick={handleLogout} className="btn btn-outline">
                    Sair
                </button>
            </div>

            <h1>Gerenciar Aulas</h1>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <button
                    onClick={() => {
                        resetForm();
                        setFormData({ ...formData, order_num: lessons.length + 1 });
                        setShowForm(true);
                    }}
                    className="btn btn-primary"
                >
                    ➕ Criar Nova Aula
                </button>
            </div>

            {showForm && (
                <div className="card mb-lg">
                    <h3>{editingLesson ? 'Editar Aula' : 'Nova Aula'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label htmlFor="title" className="form-label">Título *</label>
                                <input
                                    type="text"
                                    id="title"
                                    className="input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="order_num" className="form-label">Ordem *</label>
                                <input
                                    type="number"
                                    id="order_num"
                                    className="input"
                                    value={formData.order_num}
                                    onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) })}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="video_id" className="form-label">
                                ID do Vídeo YouTube *
                            </label>
                            <input
                                type="text"
                                id="video_id"
                                className="input"
                                value={formData.video_id}
                                onChange={(e) => setFormData({ ...formData, video_id: e.target.value })}
                                placeholder="Ex: nkRg5Xsnxis"
                                required
                            />
                            <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
                                Apenas o código final do link do YouTube (após v=)
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="cover_image" className="form-label">URL da Imagem de Capa</label>
                            <input
                                type="text"
                                id="cover_image"
                                className="input"
                                value={formData.cover_image}
                                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                                placeholder="https://exemplo.com/imagem.jpg"
                            />
                        </div>

                        {/* GAMIFICATION SECTION */}
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: '#f0f9ff',
                            borderRadius: 'var(--border-radius)',
                            marginBottom: 'var(--spacing-md)',
                            border: '2px solid #4ECDC4'
                        }}>
                            <h4 style={{ marginBottom: 'var(--spacing-sm)', color: '#4ECDC4' }}>🏆 Gamificação</h4>
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label htmlFor="points" className="form-label">Pontos da Aula *</label>
                                    <input
                                        type="number"
                                        id="points"
                                        className="input"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                        min="1"
                                        max="100"
                                        required
                                        style={{ fontSize: 'var(--font-size-heading3)', fontWeight: 'bold' }}
                                    />
                                    <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                                        Pontos que o usuário ganha ao completar
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="min_watch_time" className="form-label">Tempo Mínimo Assistido *</label>
                                    <select
                                        id="min_watch_time"
                                        className="input"
                                        value={formData.min_watch_time}
                                        onChange={(e) => setFormData({ ...formData, min_watch_time: parseInt(e.target.value) })}
                                        required
                                        style={{ fontSize: 'var(--font-size-heading3)', fontWeight: 'bold' }}
                                    >
                                        {MIN_WATCH_TIME_OPTIONS.map(time => (
                                            <option key={time} value={time}>{time} minutos</option>
                                        ))}
                                    </select>
                                    <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                                        Tempo mínimo para liberar os pontos
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label htmlFor="seal_difficulty" className="form-label">Dificuldade</label>
                                <select
                                    id="seal_difficulty"
                                    className="input"
                                    value={formData.seal_difficulty}
                                    onChange={(e) => setFormData({ ...formData, seal_difficulty: e.target.value })}
                                >
                                    <option value="Fácil">Fácil</option>
                                    <option value="Médio">Médio</option>
                                    <option value="Difícil">Difícil</option>
                                    <option value="Profissional">Profissional</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="seal_time_value" className="form-label">Tempo Estimado</label>
                                <input
                                    type="text"
                                    id="seal_time_value"
                                    className="input"
                                    value={formData.seal_time_value}
                                    onChange={(e) => setFormData({ ...formData, seal_time_value: e.target.value })}
                                    placeholder="Ex: 2 Horas"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="seal_time_color" className="form-label">Cor do Selo de Tempo</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    id="seal_time_color_picker"
                                    value={formData.seal_time_color}
                                    onChange={(e) => setFormData({ ...formData, seal_time_color: e.target.value })}
                                    style={{ height: '50px', width: '50px', padding: '0', border: 'none' }}
                                />
                                <input
                                    type="text"
                                    id="seal_time_color"
                                    className="input"
                                    value={formData.seal_time_color}
                                    onChange={(e) => setFormData({ ...formData, seal_time_color: e.target.value })}
                                    placeholder="#FF0000"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Descrição</label>
                            <textarea
                                id="description"
                                className="input textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="materials" className="form-label">Materiais Necessários</label>
                            <textarea
                                id="materials"
                                className="input textarea"
                                value={formData.materials}
                                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="steps" className="form-label">Passo a Passo</label>
                            <textarea
                                id="steps"
                                className="input textarea"
                                value={formData.steps}
                                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                            <button type="submit" className="btn btn-primary">
                                {editingLesson ? 'Atualizar Aula' : 'Criar Aula'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn btn-outline"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>Aulas Cadastradas ({lessons.length})</h2>
                {loading ? (
                    <div className="loading">Carregando aulas...</div>
                ) : lessons.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', padding: 'var(--spacing-xl)' }}>
                        Nenhuma aula cadastrada ainda.
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Ordem</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Título</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Pontos</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Tempo Min</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lessons.map((lesson) => (
                                    <tr key={lesson.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{lesson.order_num}</td>
                                        <td style={{ padding: '12px' }}>{lesson.title}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#4ECDC4' }}>
                                            🏆 {lesson.points}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            ⏱️ {lesson.min_watch_time}min
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleEdit(lesson)}
                                                className="btn btn-sm btn-outline"
                                                style={{ marginRight: '8px' }}
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lesson.id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                🗑️ Deletar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
