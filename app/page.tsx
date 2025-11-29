'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login');
        setLoading(false);
        return;
      }

      // Redirect based on user type
      router.push(data.redirectUrl);
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      setLoading(false);
    }
  };

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="container container-narrow" style={{ paddingTop: '64px' }}>
      <div className="text-center mb-xl">
        <h1>Encanto em Fios</h1>
        <p className="text-large" style={{ color: 'var(--color-text-light)' }}>
          Digite sua chave de acesso para entrar na área de aulas.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="key" className="form-label">
              Chave de Acesso
            </label>
            <input
              type="text"
              id="key"
              className="input"
              placeholder="Digite sua chave"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-lg">
          <a
            onClick={() => setShowModal(true)}
            style={{ cursor: 'pointer', fontSize: 'var(--font-size-large)' }}
          >
            Adquirir sua Chave
          </a>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Adquirir Chave de Acesso</h2>
            <div className="modal-content">
              <p>
                Você ainda não tem sua chave de acesso? Clique no botão abaixo
                para adquirir.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <a
                href="https://inlead.digital/encantoemfios/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ textDecoration: 'none', flex: 1 }}
              >
                Adquirir Chave
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
