import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logoNormal from '../assets/logoNormal.png';
import { ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [cedula, setCedula] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');

  const context = useContext(AppContext);
  if (!context) return null;
  const { login, loading, error: apiError } = context;

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await login(cedula, password);
    } catch (err) {
      // API error handled by context
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '16px' }}>
      <div className="glass-panel isn-border-blue-2" style={{ width: '100%', maxWidth: '420px', padding: '32px', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
        
        {/* Top Decorative Blue Accent Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'var(--isn-blue)'
        }} />

        <div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <img 
              src={logoNormal} 
              alt="Instituto Superior del Norte" 
              style={{ width: '150px', height: 'auto', marginBottom: '16px' }} 
            />
            <p className="font-serif" style={{ color: 'var(--isn-blue)', fontSize: '1.25rem', textAlign: 'center', margin: 0 }}>
              Acceso Administrativo
            </p>
            <p style={{ color: 'var(--isn-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '4px' }}>
              Gestión de Estudiantes y Certificados
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
              color: 'var(--isn-danger)',
              fontSize: '0.875rem'
            }}>
              <ShieldAlert size={20} style={{ flexShrink: 0 }} />
              <span>{localError || apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="admin-cedula">Cédula del Administrador</label>
              <input
                className="input-field isn-input-focus"
                type="text"
                id="admin-cedula"
                placeholder="Ej. 999999999"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '28px' }}>
              <label className="input-label" htmlFor="admin-password">Contraseña</label>
              <input
                className="input-field isn-input-focus"
                type="password"
                id="admin-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              style={{ width: '100%', padding: '14px', background: 'var(--isn-blue-dark)', color: '#FFFFFF' }}
              disabled={loading}
            >
              {loading ? (
                <span>Iniciando sesión...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Ingresar al Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle back link */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--isn-blue)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={16} />
              <span>Volver a Estudiantes</span>
            </button>
          </div>

          {/* Seed Credentials Admin */}
          <div style={{
            marginTop: '24px',
            padding: '14px',
            borderRadius: '12px',
            background: '#F8F9FA',
            border: '1px solid #E2E8F0',
            fontSize: '0.75rem',
            color: 'var(--isn-charcoal)',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 700, color: 'var(--isn-blue)', marginBottom: '6px' }}>🔑 Credenciales de Administrador</p>
            <p style={{ marginBottom: '4px' }}>Cédula: <code style={{ color: 'var(--isn-blue)', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>999999999</code></p>
            <p>Contraseña: <code style={{ color: 'var(--isn-blue)', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>adminpassword</code></p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
