// src/components/Auth/AuthPage.tsx
'use client';

import { useState } from 'react';
import { useProfileContext } from '@/contexts/ProfileContext';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text)',
  fontSize: '0.875rem',
  outline: 'none',
};

export function AuthPage() {
  const { signIn, signUp } = useProfileContext();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (mode === 'signup') {
      setSuccess('Check your email to confirm your account, then sign in.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Wordmark */}
        <p style={{
          fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '2rem', textAlign: 'center',
        }}>
          Life RPG
        </p>

        {/* Heading */}
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', textAlign: 'center' }}>
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: '2rem', textAlign: 'center' }}>
          {mode === 'signin'
            ? 'Sign in to continue your journey'
            : 'Start tracking habits and building skills'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <p className="stat-label" style={{ marginBottom: '0.375rem' }}>Email</p>
            <input
              type="email" required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="you@example.com"
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <p className="stat-label" style={{ marginBottom: '0.375rem' }}>Password</p>
            <input
              type="password" required minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="6+ characters"
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-20)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <p style={{ fontSize: '0.75rem', color: '#f87171', padding: '0.5rem 0.75rem', background: 'rgba(248,113,113,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </p>
          )}

          {success && (
            <p style={{ fontSize: '0.75rem', color: '#34d399', padding: '0.5rem 0.75rem', background: 'rgba(52,211,153,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(52,211,153,0.2)' }}>
              {success}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '0.25rem', opacity: loading ? 0.6 : 1 }}
            disabled={loading}
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', textAlign: 'center', marginTop: '1.5rem' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccess(null); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8125rem', padding: 0 }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
