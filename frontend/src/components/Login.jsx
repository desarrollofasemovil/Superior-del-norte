import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import logoNormal from '../assets/logoNormal.jpeg';
import { Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, loading, error: apiError } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Local Validations
    if (!cedula.trim() || !password.trim()) {
      setLocalError('Por favor complete todos los campos.');
      return;
    }

    if (!/^\d+$/.test(cedula)) {
      setLocalError('La cédula debe contener únicamente números.');
      return;
    }

    try {
      await login(cedula, password);
    } catch (err) {
      // API error handled by context, but we can catch to prevent crashes
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Top Decorative Green Accent Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'var(--accent-emerald)'
        }} />

        <div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <img 
              src={logoNormal} 
              alt="AlimSafe" 
              style={{ width: '160px', height: 'auto', marginBottom: '16px', borderRadius: '12px' }} 
            />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500 }}>
              Learning Management System (LMS)
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '2px' }}>
              Curso de Manipulación Higiénica de Alimentos
            </p>
          </div>

          {(localError || apiError) && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--accent-rose)',
              fontSize: '0.875rem'
            }}>
              <ShieldAlert size={20} style={{ flexShrink: 0 }} />
              <span>{localError || apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="cedula">Número de Cédula</label>
              <input
                className="input-field"
                type="text"
                id="cedula"
                placeholder="Ej. 123456789"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '28px' }}>
              <label className="input-label" htmlFor="password">Contraseña</label>
              <input
                className="input-field"
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              style={{ width: '100%', padding: '14px' }}
              disabled={loading}
            >
              {loading ? (
                <span>Iniciando sesión...</span>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Ingresar al Curso</span>
                </>
              )}
            </button>
          </form>

          {/* Test Credentials Seed Banner */}
          <div style={{
            marginTop: '28px',
            padding: '14px',
            borderRadius: '12px',
            background: '#F8F9FA',
            border: '1px solid #E2E8F0',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>🔑 Credenciales de Acceso Demo</p>
            <p style={{ marginBottom: '4px' }}>Cédula: <code style={{ color: 'var(--accent-emerald)', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>123456789</code></p>
            <p>Contraseña: <code style={{ color: 'var(--accent-emerald)', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>password123</code></p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
