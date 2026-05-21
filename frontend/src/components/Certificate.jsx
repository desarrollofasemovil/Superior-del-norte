import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import logoNormal from '../assets/logoNormal.jpeg';
import { Download, ArrowLeft, Copy, Check, ShieldCheck } from 'lucide-react';

const Certificate = () => {
  const { user, downloadCertificate, setCurrentView, token, API_BASE_URL } = useContext(AppContext);
  const [certData, setCertData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch certificate metadata from `/api/certificate/detail`
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const resCert = await fetch(`${API_BASE_URL}/certificate/detail`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resCert.ok) {
          const data = await resCert.json();
          setCertData(data);
        }
      } catch (err) {
        console.error('Error fetching cert metadata:', err);
      }
    };
    fetchMetadata();
  }, [token, API_BASE_URL]);

  const handleCopyCode = () => {
    if (certData?.codigo_verificacion) {
      navigator.clipboard.writeText(certData.codigo_verificacion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      {/* Back Button */}
      <button
        onClick={() => setCurrentView('dashboard')}
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
        <span>Volver al Dashboard</span>
      </button>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 800 }}>Tu Certificación Oficial</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              Curso de Manipulación Higiénica de Alimentos
            </p>
          </div>
          <button className="btn btn-primary" onClick={downloadCertificate} style={{ height: '46px' }}>
            <Download size={18} />
            <span>Descargar PDF Oficial</span>
          </button>
        </div>

        {/* Certificate Preview Card */}
        <div style={{
          background: '#FFFFFF',
          border: '4px solid #0F2C59',
          borderRadius: '12px',
          padding: '48px 32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
          
          {/* Inner Gold Border */}
          <div style={{
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            bottom: 8,
            border: '1.5px solid var(--accent-gold)',
            pointerEvents: 'none'
          }} />

          {/* Decorative Corner Boxes */}
          <div style={{ position: 'absolute', top: 4, left: 4, width: 12, height: 12, border: '1px solid var(--accent-gold)' }} />
          <div style={{ position: 'absolute', top: 4, right: 4, width: 12, height: 12, border: '1px solid var(--accent-gold)' }} />
          <div style={{ position: 'absolute', bottom: 4, left: 4, width: 12, height: 12, border: '1px solid var(--accent-gold)' }} />
          <div style={{ position: 'absolute', bottom: 4, right: 4, width: 12, height: 12, border: '1px solid var(--accent-gold)' }} />

          <img src={logoNormal} alt="AlimSafe" style={{ width: '120px', height: 'auto', margin: '0 auto 16px auto', borderRadius: '8px', display: 'block' }} />
          <h3 style={{ fontSize: '1.65rem', fontFamily: 'serif', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '4px' }}>
            CERTIFICADO DE APROBACIÓN
          </h3>
          
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--accent-gold)', fontWeight: 800, marginBottom: '24px' }}>
            CURSO DE MANIPULACIÓN HIGIÉNICA DE ALIMENTOS
          </p>
          
          {certData?.numero_certificado && (
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
              REGISTRO N°: <span style={{ color: 'var(--accent-teal)' }}>{certData.numero_certificado}</span>
            </p>
          )}
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Se otorga el presente documento de certificación y participación a:
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '8px' }}>
            {user?.nombre_completo?.toUpperCase()}
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
            Cédula de Identidad N°: {user?.cedula}
          </p>
          
          <div style={{ width: '80%', height: '1px', background: '#E2E8F0', margin: '0 auto 20px auto' }} />
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '80%', margin: '0 auto', lineHeight: '1.5' }}>
            Por haber cumplido con todos los requisitos académicos del curso y aprobado satisfactoriamente la evaluación de conocimientos sobre normas higiénico-sanitarias vigentes.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Intensidad: 3 Horas Lectivas
            </p>
            {certData?.calificacion_obtenida && (
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                Calificación: {certData.calificacion_obtenida}%
              </p>
            )}
          </div>
        </div>

        {/* Verification Details */}
        {certData && (
          <div style={{
            background: '#F8F9FA',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 700 }}>
                Verificación de Autenticidad
              </p>
              <p style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                {certData.codigo_verificacion}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Emitido el: {certData.fecha_emision}
              </p>
            </div>
            
            <button
              onClick={handleCopyCode}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: '0.85rem', height: '42px' }}
            >
              {copied ? (
                <>
                  <Check size={16} color="var(--accent-emerald)" />
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Copiado</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Certificate;
