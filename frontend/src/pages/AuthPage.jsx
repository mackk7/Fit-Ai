import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode]     = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', goal: '', fitnessLevel: 'beginner',
  });

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required.'); setLoading(false); return; }
        await register(form.name, form.email, form.password, form.goal, form.fitnessLevel);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Background image */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.15)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 440,
        background: '#111', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '40px 36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 42, fontWeight: 900, letterSpacing: 4,
            color: '#c6f135', marginBottom: 4,
          }}>
            FIT<span style={{ color: '#f2f0ea', fontWeight: 300 }}>AI</span>
          </div>
          <div style={{ fontSize: 12, color: '#6b6b6b', letterSpacing: 2, textTransform: 'uppercase' }}>
            AI Personal Fitness Coach
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', background: '#181818',
          borderRadius: 10, padding: 4, marginBottom: 28,
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
              flex: 1, padding: '9px', borderRadius: 8,
              background: mode === m ? '#c6f135' : 'transparent',
              color: mode === m ? '#0a0a0a' : '#6b6b6b',
              fontWeight: mode === m ? 600 : 400,
              fontSize: 13, border: 'none', cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              textTransform: 'capitalize', transition: 'all 0.18s',
            }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Full Name</label>
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder="Arjun Kumar"
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Email</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: mode === 'register' ? 14 : 24 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Password</label>
            <input
              type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Min. 6 characters"
              style={inputStyle}
            />
          </div>

          {mode === 'register' && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Fitness Goal</label>
                <select name="goal" value={form.goal} onChange={handleChange} style={inputStyle}>
                  <option value="">Select a goal (optional)</option>
                  <option value="Build Muscle">Build Muscle</option>
                  <option value="Lose Fat">Lose Fat</option>
                  <option value="Improve Endurance">Improve Endurance</option>
                  <option value="General Fitness">General Fitness</option>
                  <option value="Athletic Performance">Athletic Performance</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Fitness Level</label>
                <select name="fitnessLevel" value={form.fitnessLevel} onChange={handleChange} style={inputStyle}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: 'rgba(255,107,107,0.08)', borderRadius: 8, border: '1px solid rgba(255,107,107,0.2)' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? '#8aaa25' : '#c6f135',
            color: '#0a0a0a', borderRadius: 12,
            fontSize: 15, fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}>
            {loading
              ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
              : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 20 }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ color: '#c6f135', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', background: '#181818',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 9, padding: '11px 14px',
  color: '#f2f0ea', fontSize: 14,
  fontFamily: "'Outfit', sans-serif",
  outline: 'none', appearance: 'none',
  boxSizing: 'border-box',
};
