import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logoNormal from '../assets/logoNormal.png';
import { Search, ShieldCheck, ShieldAlert, ArrowLeft, Loader2, Calendar, User, CreditCard, Award, FileText } from 'lucide-react';

interface VerifyCertificateProps {
  initialCode?: string;
}

const VerifyCertificate: React.FC<VerifyCertificateProps> = ({ initialCode }) => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { API_BASE_URL } = context;
  
  const navigate = useNavigate();
  const [code, setCode] = useState<string>(initialCode || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // If a code was provided, auto verify it on load
  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  const handleVerify = async (codeToVerify?: string) => {
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/login')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--isn-blue)',
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

      <div className="glass-panel isn-border-gold-2" style={{ padding: '32px', borderRadius: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <img src={logoNormal} alt="Instituto Superior del Norte" style={{ width: '120px', height: 'auto', marginBottom: '12px' }} />
          <h2 className="font-serif isn-title-solemn" style={{ fontSize: '1.75rem', textAlign: 'center', margin: 0 }}>
            Portal de Verificación
          </h2>
        </div>
        
        <p style={{ color: 'var(--isn-charcoal)', fontSize: '0.95rem', marginBottom: '28px', textAlign: 'center', lineHeight: '1.5' }}>
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
              className="input-field isn-input-focus"
              style={{ paddingLeft: '44px', height: '46px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify();
              }}
            />
            <Search size={18} color="var(--isn-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          
          <button className="btn btn-primary" onClick={() => handleVerify()} disabled={loading || !code.trim()} style={{ height: '46px', background: 'var(--isn-blue)', color: '#FFFFFF' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Verificar</span>}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--isn-charcoal)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Loader2 size={16} className="animate-spin" />
            <span>Consultando base de datos de ISN...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="isn-border-gold-2" style={{
            background: 'rgba(239, 68, 68, 0.04)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            color: 'var(--isn-danger)'
          }}>
            <ShieldAlert size={36} style={{ margin: '0 auto 12px auto', color: 'var(--isn-gold)' }} />
            <h4 className="font-serif" style={{ fontSize: '1.15rem', marginBottom: '6px', color: 'var(--isn-blue)' }}>Código No Encontrado</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--isn-charcoal)', lineHeight: '1.5', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Success / Result State */}
        {result && !loading && (
          <div className="glow-panel isn-border-gold-2" style={{
            background: 'rgba(22, 163, 74, 0.04)',
            borderRadius: '12px',
            padding: '28px',
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid rgba(22, 163, 74, 0.15)', paddingBottom: '16px' }}>
              <ShieldCheck size={36} color="var(--isn-success)" />
              <div>
                <h4 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--isn-success)', margin: 0 }}>CERTIFICADO VÁLIDO</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--isn-charcoal)', fontWeight: 600, margin: '2px 0 0 0' }}>Validación oficial completada con éxito</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={18} color="var(--isn-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--isn-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>Estudiante Certificado</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--isn-charcoal)', margin: 0 }}>{result.usuario}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CreditCard size={18} color="var(--isn-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--isn-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>Cédula de Identidad</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--isn-charcoal)', margin: 0, fontFamily: 'monospace' }}>{result.cedula}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={18} color="var(--isn-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--isn-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>Curso Formativo</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--isn-charcoal)', margin: 0 }}>{result.curso_titulo || 'Manipulación de Alimentos'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={18} color="var(--isn-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--isn-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>Registro Oficial</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--isn-blue)', margin: 0, fontFamily: 'monospace' }}>{result.numero_certificado || 'AS-2026-0001'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={18} color="var(--isn-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--isn-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>Fecha de Emisión</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--isn-charcoal)', margin: 0, fontFamily: 'monospace' }}>{result.fecha_emision}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={18} color="var(--isn-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--isn-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>Calificación Evaluada</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--isn-success)', margin: 0 }}>{result.calificacion_obtenida || 100}%</p>
                </div>
              </div>

            </div>

            <div style={{
              marginTop: '24px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#E2E8F0',
              fontSize: '0.8rem',
              color: 'var(--isn-blue)',
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
