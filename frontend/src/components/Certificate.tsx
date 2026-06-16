import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logoNormal from '../assets/logoNormal.png';
import { Download, ArrowLeft, Copy, Check, ShieldCheck } from 'lucide-react';

const decodeMojibake = (str: string | undefined): string => {
  if (!str) return '';
  try {
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    if (!decoded.includes('\uFFFD')) {
      return decoded;
    }
  } catch (e) {}

  const map: Record<string, string> = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã±': 'ñ', 'Ã‘': 'Ñ', 'Ã ': 'Á', 'Ã‰': 'É', 'Ã ': 'Í',
    'Ã“': 'Ó', 'Ãš': 'Ú', 'Ã¼': 'ü', 'Ãœ': 'Ü'
  };
  let result = str;
  for (const [mojibake, correct] of Object.entries(map)) {
    result = result.replaceAll(mojibake, correct);
  }
  return result;
};

const Certificate: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { user, downloadCertificate, token, API_BASE_URL, activeCourseId, studentCourses } = context;
  
  const navigate = useNavigate();
  const [certData, setCertData] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const currentCourse = studentCourses.find((c: any) => c.id === activeCourseId);
  const courseTitle = currentCourse ? currentCourse.titulo : 'Curso de Manipulación Higiénica de Alimentos';

  // Fetch certificate metadata from `/api/certificate/detail`
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const resCert = await fetch(`${API_BASE_URL}/certificate/detail?courseId=${activeCourseId}`, {
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
    if (activeCourseId) {
      fetchMetadata();
    }
  }, [token, API_BASE_URL, activeCourseId]);

  const handleCopyCode = () => {
    if (certData?.codigo_verificacion) {
      navigator.clipboard.writeText(certData.codigo_verificacion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
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
        <span>Volver al Dashboard</span>
      </button>

      <div className="glass-panel isn-border-blue-2" style={{ padding: '32px', marginBottom: '24px', borderRadius: '16px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '32px' }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--isn-blue)', margin: 0 }}>Tu Certificación Oficial</h2>
            <p style={{ color: 'var(--isn-charcoal)', fontSize: '0.95rem', marginTop: '4px' }}>
              {courseTitle}
            </p>
          </div>
          <button className="btn btn-primary" onClick={downloadCertificate} style={{ height: '46px', background: 'var(--isn-blue)', color: '#FFFFFF' }}>
            <Download size={18} />
            <span>Descargar PDF Oficial</span>
          </button>
        </div>

        {/* Certificate Preview Card */}
        <div className="isn-border-blue-4" style={{
          background: '#FFFFFF',
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
            border: '2px solid var(--isn-gold)',
            pointerEvents: 'none'
          }} />

          {/* Decorative Corner Boxes */}
          <div style={{ position: 'absolute', top: 4, left: 4, width: 12, height: 12, border: '1px solid var(--isn-gold)' }} />
          <div style={{ position: 'absolute', top: 4, right: 4, width: 12, height: 12, border: '1px solid var(--isn-gold)' }} />
          <div style={{ position: 'absolute', bottom: 4, left: 4, width: 12, height: 12, border: '1px solid var(--isn-gold)' }} />
          <div style={{ position: 'absolute', bottom: 4, right: 4, width: 12, height: 12, border: '1px solid var(--isn-gold)' }} />

          <img src={logoNormal} alt="Instituto Superior del Norte" style={{ width: '110px', height: 'auto', margin: '0 auto 16px auto', display: 'block' }} />
          
          <h4 style={{ fontSize: '0.85rem', color: 'var(--isn-gold)', letterSpacing: '0.15em', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
            INSTITUTO SUPERIOR DEL NORTE
          </h4>
          
          <h3 className="font-serif" style={{ fontSize: '2rem', color: 'var(--isn-blue)', fontWeight: 'bold', marginBottom: '4px' }}>
            CERTIFICADO DE APROBACIÓN
          </h3>
          
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--isn-muted)', fontWeight: 800, marginBottom: '24px' }}>
            {courseTitle.toUpperCase()}
          </p>
          
          {certData?.numero_certificado && (
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--isn-charcoal)', marginBottom: '20px', fontFamily: 'monospace' }}>
              REGISTRO N°: <span style={{ color: 'var(--isn-blue)', fontWeight: 'bold' }}>{certData.numero_certificado}</span>
            </p>
          )}
          
          <p style={{ fontSize: '0.9rem', color: 'var(--isn-charcoal)', marginBottom: '8px' }}>
            Se otorga el presente documento de certificación y participación a:
          </p>
          
          <h2 className="font-serif" style={{ fontSize: '2.25rem', color: 'var(--isn-blue)', marginBottom: '8px', borderBottom: '2px solid var(--isn-gold)', display: 'inline-block', padding: '0 24px 8px 24px' }}>
            {decodeMojibake(user?.nombre_completo)?.toUpperCase()}
          </h2>
          
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--isn-charcoal)', marginTop: '8px', marginBottom: '24px', fontFamily: 'monospace' }}>
            Cédula de Identidad N°: {user?.cedula}
          </p>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--isn-charcoal)', maxWidth: '85%', margin: '0 auto', lineHeight: '1.6' }}>
            Por haber cumplido con todos los requisitos académicos del curso y aprobado satisfactoriamente la evaluación de conocimientos sobre normas higiénico-sanitarias vigentes.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--isn-muted)', fontStyle: 'italic' }}>
              Intensidad: 3 Horas Lectivas
            </p>
            {certData?.calificacion_obtenida && (
              <p style={{ fontSize: '0.8rem', color: 'var(--isn-success)', fontWeight: 700 }}>
                Calificación: {certData.calificacion_obtenida}%
              </p>
            )}
          </div>

          {/* Simulated digital signatures block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px', borderTop: '1px solid #E2E8F0', paddingTop: '24px', flexWrap: 'wrap', gap: '24px' }}>
            
            {/* Left signature */}
            <div style={{ flex: 1, minWidth: '150px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--isn-blue)', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Dr. Alejandro M.
              </div>
              <div style={{ width: '80%', height: '1px', background: '#CBD5E1', margin: '4px auto 6px auto' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--isn-muted)', margin: 0, fontWeight: 700 }}>Director Académico</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--isn-muted)', margin: 0 }}>Instituto Superior del Norte</p>
            </div>

            {/* Center digital security badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.08)', border: '2px dashed var(--isn-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={32} color="var(--isn-gold)" />
              </div>
              <span style={{ fontSize: '0.6rem', color: 'var(--isn-gold)', fontWeight: 800, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VERIFICADO DIGITAL</span>
            </div>

            {/* Right signature */}
            <div style={{ flex: 1, minWidth: '150px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--isn-blue)', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                L. Restrepo G.
              </div>
              <div style={{ width: '80%', height: '1px', background: '#CBD5E1', margin: '4px auto 6px auto' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--isn-muted)', margin: 0, fontWeight: 700 }}>Comité de Certificación</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--isn-muted)', margin: 0 }}>Registro Oficial</p>
            </div>

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
              <p style={{ fontSize: '0.75rem', color: 'var(--isn-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 700 }}>
                Verificación de Autenticidad
              </p>
              <p style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--isn-blue)' }}>
                {certData.codigo_verificacion}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--isn-charcoal)', marginTop: '4px' }}>
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
                  <Check size={16} color="var(--isn-success)" />
                  <span style={{ color: 'var(--isn-success)', fontWeight: 700 }}>Copiado</span>
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
