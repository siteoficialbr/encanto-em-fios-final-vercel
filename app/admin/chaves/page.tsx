'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AccessKey {
    id: number;
    key: string;
    owner_name: string | null;
    is_admin: boolean;
    is_active: boolean;
    created_at: string;
}

export default function AdminKeysPage() {
    const router = useRouter();
    const [keys, setKeys] = useState<AccessKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const response = await fetch('/api/admin/keys');
            if (response.ok) {
                const data = await response.json();
                setKeys(data);
            }
        } catch (error) {
            console.error('Error fetching keys:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateRandomKey = async () => {
        setError('');
        setSuccess('');
        try {
            const response = await fetch('/api/admin/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ random: true }),
            });

            if (response.ok) {
                const newKey = await response.json();
                setSuccess(`Chave gerada com sucesso: ${newKey.key}`);
                fetchKeys();
            } else {
                setError('Erro ao gerar chave');
            }
        } catch (error) {
            setError('Erro ao conectar com o servidor');
        }
    };

    const createManualKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newKey.trim()) {
            setError('Digite uma chave válida');
            return;
        }

        try {
            const response = await fetch('/api/admin/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: newKey.trim(),
                    ownerName: ownerName.trim() || undefined
                }),
            });

            if (response.ok) {
                setSuccess('Chave criada com sucesso!');
                setNewKey('');
                setOwnerName('');
                setShowCreateForm(false);
                fetchKeys();
            } else {
                const data = await response.json();
                setError(data.error || 'Erro ao criar chave');
            }
        } catch (error) {
            setError('Erro ao conectar com o servidor');
        }
    };

    const toggleKeyStatus = async (id: number) => {
        try {
            const response = await fetch('/api/admin/keys', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                fetchKeys();
            }
        } catch (error) {
            console.error('Error toggling key:', error);
        }
    };

    const deleteKey = async (id: number, keyValue: string) => {
        if (keyValue === 'admin2020') {
            alert('A chave do administrador não pode ser deletada!');
            return;
        }

        if (!confirm('Tem certeza que deseja deletar esta chave?')) {
            return;
        }

        try {
            const response = await fetch('/api/admin/keys', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                fetchKeys();
            } else {
                const data = await response.json();
                alert(data.error || 'Erro ao deletar chave');
            }
        } catch (error) {
            console.error('Error deleting key:', error);
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

            <h1>Gerenciar Chaves de Acesso</h1>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-lg)',
                flexWrap: 'wrap'
            }}>
                <button onClick={generateRandomKey} className="btn btn-success">
                    🎲 Gerar Chave Aleatória
                </button>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="btn btn-secondary"
                >
                    ✏️ Criar Chave Manualmente
                </button>
            </div>

            {showCreateForm && (
                <div className="card mb-lg">
                    <h3>Criar Nova Chave</h3>
                    <form onSubmit={createManualKey}>
                        <div className="form-group">
                            <label htmlFor="newKey" className="form-label">Chave *</label>
                            <input
                                type="text"
                                id="newKey"
                                className="input"
                                placeholder="Ex: maria123"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="ownerName" className="form-label">
                                Nome do Proprietário (Opcional)
                            </label>
                            <input
                                type="text"
                                id="ownerName"
                                className="input"
                                placeholder="Ex: Maria Silva"
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button type="submit" className="btn btn-primary">
                                Criar Chave
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="btn btn-outline"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading">Carregando chaves...</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Chave</th>
                                <th>Proprietário</th>
                                <th>Admin</th>
                                <th>Status</th>
                                <th>Criada em</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((key) => (
                                <tr key={key.id}>
                                    <td style={{ fontWeight: 600 }}>{key.key}</td>
                                    <td>{key.owner_name || '-'}</td>
                                    <td>{key.is_admin ? '✅ Sim' : '❌ Não'}</td>
                                    <td>
                                        <span style={{
                                            color: key.is_active ? 'var(--color-success)' : 'var(--color-danger)',
                                            fontWeight: 600
                                        }}>
                                            {key.is_active ? '✅ Ativa' : '❌ Inativa'}
                                        </span>
                                    </td>
                                    <td>{new Date(key.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => toggleKeyStatus(key.id)}
                                                className="btn btn-secondary"
                                                style={{ minWidth: 'auto', padding: '8px 16px', fontSize: '16px' }}
                                                disabled={key.key === 'admin2020'}
                                            >
                                                {key.is_active ? '🔒 Desativar' : '🔓 Ativar'}
                                            </button>
                                            <button
                                                onClick={() => deleteKey(key.id, key.key)}
                                                className="btn btn-danger"
                                                style={{ minWidth: 'auto', padding: '8px 16px', fontSize: '16px' }}
                                                disabled={key.key === 'admin2020'}
                                            >
                                                🗑️ Deletar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {keys.length === 0 && !loading && (
                <div className="card text-center">
                    <p className="text-large">Nenhuma chave cadastrada.</p>
                </div>
            )}
        </div>
    );
}
