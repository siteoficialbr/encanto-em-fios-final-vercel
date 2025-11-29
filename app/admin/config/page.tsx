'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminConfigPage() {
    const router = useRouter();
    const [overlayImageUrl, setOverlayImageUrl] = useState('');
    const [overlayDuration, setOverlayDuration] = useState(1500);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/config/overlay');
            if (response.ok) {
                const data = await response.json();
                setOverlayImageUrl(data.imageUrl || '');
                setOverlayDuration(data.durationMs || 1500);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/admin/config/overlay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: overlayImageUrl,
                    durationMs: overlayDuration
                }),
            });

            if (response.ok) {
                setSuccess('Configurações salvas com sucesso!');
            } else {
                const data = await response.json();
                setError(data.error || 'Erro ao salvar configurações');
            }
        } catch (error) {
            setError('Erro ao conectar com o servidor');
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

            <h1>Configurações do Site</h1>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card">
                <h2>Overlay de Imersão do Player</h2>
                <p style={{ color: '#666', marginBottom: 'var(--spacing-lg)' }}>
                    Configure a imagem e duração do overlay que aparece ao pausar/iniciar o vídeo para esconder a interface do YouTube.
                </p>

                {loading ? (
                    <div className="loading">Carregando configurações...</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="overlay_image_url" className="form-label">
                                URL da Imagem do Overlay
                            </label>
                            <input
                                type="text"
                                id="overlay_image_url"
                                className="input"
                                value={overlayImageUrl}
                                onChange={(e) => setOverlayImageUrl(e.target.value)}
                                placeholder="https://exemplo.com/logo-encanto-em-fios.png"
                            />
                            <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
                                Deixe vazio para desativar o overlay. Recomendamos uma imagem PNG com fundo transparente.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="overlay_duration" className="form-label">
                                Duração de Exibição (milissegundos)
                            </label>
                            <input
                                type="number"
                                id="overlay_duration"
                                className="input"
                                value={overlayDuration}
                                onChange={(e) => setOverlayDuration(parseInt(e.target.value))}
                                min="500"
                                max="5000"
                                step="100"
                                style={{ fontSize: 'var(--font-size-heading3)', fontWeight: 'bold' }}
                            />
                            <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
                                Tempo que o overlay fica visível (recomendado: 1000-2000ms). 1000ms = 1 segundo.
                            </small>
                        </div>

                        {overlayImageUrl && (
                            <div style={{
                                marginTop: 'var(--spacing-lg)',
                                padding: 'var(--spacing-md)',
                                background: '#f9f9f9',
                                borderRadius: 'var(--border-radius)',
                                textAlign: 'center'
                            }}>
                                <h4>Pré-visualização</h4>
                                <div style={{
                                    marginTop: 'var(--spacing-sm)',
                                    padding: '40px',
                                    background: 'rgba(0,0,0,0.8)',
                                    borderRadius: 'var(--border-radius)',
                                    display: 'inline-block'
                                }}>
                                    <img
                                        src={overlayImageUrl}
                                        alt="Preview"
                                        style={{
                                            maxWidth: '300px',
                                            maxHeight: '200px',
                                            objectFit: 'contain'
                                        }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                <p style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-small)', color: '#666' }}>
                                    Duração: {overlayDuration}ms ({(overlayDuration / 1000).toFixed(1)}s)
                                </p>
                            </div>
                        )}

                        <div style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button type="submit" className="btn btn-primary">
                                💾 Salvar Configurações
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
