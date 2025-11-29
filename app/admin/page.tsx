'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
    const router = useRouter();

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
                marginBottom: 'var(--spacing-xl)'
            }}>
                <h1>Painel Administrativo</h1>
                <button onClick={handleLogout} className="btn btn-outline">
                    Sair
                </button>
            </div>

            <div className="grid grid-3">
                <Link href="/admin/chaves" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>🔑</div>
                        <h2>Gerenciar Chaves</h2>
                        <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-body)' }}>
                            Criar, editar e gerenciar chaves de acesso
                        </p>
                    </div>
                </Link>

                <Link href="/admin/aulas" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>🎓</div>
                        <h2>Gerenciar Aulas</h2>
                        <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-body)' }}>
                            Criar, editar e organizar aulas
                        </p>
                    </div>
                </Link>

                <Link href="/admin/config" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>⚙️</div>
                        <h2>Configurações</h2>
                        <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-body)' }}>
                            Overlay e outras configurações
                        </p>
                    </div>
                </Link>
            </div>

            <div className="card mt-lg" style={{ backgroundColor: '#E7F5FF' }}>
                <h3>Bem-vindo ao Painel Administrativo</h3>
                <p style={{ fontSize: 'var(--font-size-body)' }}>
                    Aqui você pode gerenciar todas as chaves de acesso e aulas da plataforma
                    Encanto em Fios. Escolha uma das opções acima para começar.
                </p>
            </div>
        </div>
    );
}
