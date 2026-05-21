import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, ShieldCheck, ShieldAlert, ArrowLeft, Loader2, Calendar, User, CreditCard, Award, FileText } from 'lucide-react';

const VerifyCertificate = ({ initialCode }) => {
  const { setCurrentView, API_BASE_URL } = useContext(AppContext);
  const [code, setCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // If a code was provided, auto verify it on load
  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  const handleVerify = async (codeToVerify) => {
    const targetCode = (codeToVerify || code).trim();
    if (!targetCode) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/certificate/verify/${targetCode}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Código de verificación no válido');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      {/* Back Button */}
      <button
        onClick={() => setCurrentView('login')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--accent-teal)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginBottom: '24px',
          fontWeight: 700
        }}
      >
        <ArrowLeft size={18} />
        <span>Ir al Portal de Acceso</span>
      </button>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '8px', textAlign: 'center', fontWeight: 800 }}>
          Portal de Verificación
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '28px', textAlign: 'center', lineHeight: '1.5' }}>
          Ingrese el código de verificación del certificado para constatar su autenticidad y vigencia en nuestro registro nacional.
        </p>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Ej: ALIM-ABCD-EFGH"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input-field"
              style={{ paddingLeft: '44px', height: '46px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify();
              }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          
          <button className="btn btn-primary" onClick={() => handleVerify()} disabled={loading || !code.trim()} style={{ height: '46px' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Verificar</span>}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Loader2 size={16} className="animate-spin" />
            <span>Consultando base de datos de AlimSafe...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            color: 'var(--accent-rose)'
          }}>
            <ShieldAlert size={36} style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.15rem', marginBottom: '6px', fontWeight: 800 }}>Código No Encontrado</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{error}</p>
          </div>
        )}

        {/* Success / Result State */}
        {result && !loading && (
          <div className="glow-panel" style={{
            background: 'rgba(78, 159, 61, 0.04)',
            border: '1px solid var(--accent-emerald)',
            borderRadius: '12px',
            padding: '28px',
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid rgba(78, 159, 61, 0.15)', paddingBottom: '16px' }}>
              <ShieldCheck size={36} color="var(--accent-emerald)" />
              <div>
                <h4 style={{ fontSize: '1.25rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>CERTIFICADO VÁLIDO</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Validación oficial completada con éxito</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Estudiante Certificado</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.usuario}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CreditCard size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Cédula de Identidad</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.cedula}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Registro Oficial</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-teal)' }}>{result.numero_certificado || 'AS-2026-0001'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Fecha de Emisión</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.fecha_emision}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Calificación Evaluada</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{result.calificacion_obtenida || 100}%</p>
                </div>
              </div>

            </div>

            <div style={{
              marginTop: '24px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#E2E8F0',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              fontWeight: 700,
              textAlign: 'center'
            }}>
              REF: {result.codigo_verificacion}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyCertificate;
