import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logoLogo from '../assets/logo instituto superior del norte.webp';
import { Award, BookOpen, Clock, ShieldCheck, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const coursesData = [
  {
    id: 1,
    titulo: "Manipulación Higiénica de Alimentos",
    descripcion: "Certificación oficial obligatoria para personal del sector de alimentos. Normativas sanitarias de higiene, control de puntos críticos y prevención de contaminación.",
    horas: 3,
    nivel: "Básico - Obligatorio",
    imagenText: "Manipulación e Higiene de Alimentos"
  },
  {
    id: 2,
    titulo: "Sistemas de Aseguramiento de Calidad (HACCP)",
    descripcion: "Análisis de peligros y control de puntos críticos. Diseñado para supervisores y jefes de calidad en la industria alimentaria.",
    horas: 8,
    nivel: "Avanzado",
    imagenText: "Control de Calidad HACCP"
  },
  {
    id: 3,
    titulo: "Buenas Prácticas de Manufactura (BPM)",
    descripcion: "Principios básicos y requisitos de higiene bajo regulaciones nacionales vigentes para establecimientos alimentarios.",
    horas: 6,
    nivel: "Intermedio",
    imagenText: "Principios de Manufactura BPM"
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { API_BASE_URL } = useContext(AppContext);

  // Verification states
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = verificationCode.trim();
    if (!code) return;

    setLoading(true);
    setVerifyError(null);
    setVerifyResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/certificate/verify/${code}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Código de certificado no válido');
      }
      setVerifyResult(data);
    } catch (err) {
      setVerifyError(err.message || 'Código de verificación no encontrado en el registro oficial');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--isn-bg-light)', minHeight: '100vh', width: '100%' }}>
      {/* 1. Header de Navegación Estacionario */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#FFFFFF',
        borderBottom: '2px solid var(--isn-gold)',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => scrollToSection('home')}>
            <img src={logoLogo} alt="Instituto Superior del Norte" style={{ height: '45px', width: 'auto' }} />
            <h1 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--isn-blue)', margin: 0 }}>
              INSTITUTO SUPERIOR DEL NORTE
            </h1>
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button onClick={() => scrollToSection('home')} style={{ background: 'none', border: 'none', color: 'var(--isn-charcoal)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Inicio</button>
            <button onClick={() => scrollToSection('courses')} style={{ background: 'none', border: 'none', color: 'var(--isn-charcoal)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Programas</button>
            <button onClick={() => scrollToSection('verification')} style={{ background: 'none', border: 'none', color: 'var(--isn-charcoal)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Verificación</button>
            <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: 'var(--isn-charcoal)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Nosotros</button>
            
            <button
              onClick={() => navigate('/login')}
              className="btn"
              style={{
                background: 'var(--isn-blue)',
                color: '#FFFFFF',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 4px 6px rgba(15, 44, 89, 0.15)',
                cursor: 'pointer'
              }}
            >
              Acceder al Campus Virtual
            </button>
          </div>
        </div>
      </nav>

      <div id="home" style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        
        {/* 2. Sección Hero Principal */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', marginBottom: '64px' }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: '3rem', color: 'var(--isn-blue)', lineHeight: 1.15, fontWeight: 900, marginBottom: '24px' }}>
              Formación Técnica Superior para el Mundo Real
            </h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--isn-charcoal)', lineHeight: '1.6', marginBottom: '36px' }}>
              Capacítate bajo estándares oficiales del Instituto Superior del Norte. Desarrolla las competencias técnicas obligatorias y certifica tus conocimientos en manipulación higiénica de alimentos con validez curricular nacional.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => scrollToSection('courses')}
                className="btn"
                style={{
                  background: 'var(--isn-success)',
                  color: '#FFFFFF',
                  padding: '14px 28px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(78, 159, 61, 0.2)'
                }}
              >
                Ver Programas Académicos
              </button>
              <button
                onClick={() => scrollToSection('verification')}
                className="btn"
                style={{
                  background: '#FFFFFF',
                  border: '2px solid var(--isn-gold)',
                  color: 'var(--isn-blue)',
                  padding: '12px 26px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Validar Certificado
              </button>
            </div>
          </div>

          {/* 3. Reserva de Espacios para Contenido Gráfico (Hero Side) */}
          <div style={{
            height: '400px',
            border: '3px dashed var(--isn-gold)',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'var(--isn-gold)',
              color: 'var(--isn-blue-dark)',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              Espacio de Reserva
            </div>
            <div style={{ width: '48px', height: '48px', border: '4px solid #E2E8F0', borderTop: '4px solid var(--isn-gold)', borderRadius: '50%', animation: 'spin 1.5s linear infinite', marginBottom: '16px' }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h4 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--isn-blue)', fontWeight: 700, marginBottom: '8px' }}>
              Infografía de Formación del Campus
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--isn-charcoal)', maxWidth: '280px' }}>
              Este contenedor está reservado para el recurso gráfico de formación oficial.
            </p>
          </div>
        </section>

        {/* 4. Sección de Programas Destacados */}
        <section id="courses" style={{ marginBottom: '80px', paddingTop: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--isn-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Especialidades Académicas</span>
            <h3 className="font-serif" style={{ fontSize: '2.25rem', color: 'var(--isn-blue)', fontWeight: 800, marginTop: '4px' }}>Programas Disponibles</h3>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--isn-success)', margin: '12px auto 0 auto', borderRadius: '2px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {coursesData.map((course) => (
              <div key={course.id} className="glass-panel" style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '2px solid var(--isn-blue)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-card)',
                transition: 'transform 0.2s, border-color 0.2s'
              }}>
                {/* Visual Placeholder for Course Image */}
                <div style={{
                  height: '180px',
                  backgroundColor: 'var(--isn-blue-dark)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '20px',
                  borderBottom: '2px solid var(--isn-gold)',
                  color: '#FFFFFF',
                  position: 'relative'
                }}>
                  <BookOpen size={36} color="var(--isn-gold)" style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{course.imagenText}</span>
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'var(--isn-success)',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {course.nivel}
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--isn-blue)', fontWeight: 800, marginBottom: '12px' }}>
                    {course.titulo}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--isn-charcoal)', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
                    {course.descripcion}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--isn-charcoal)', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Clock size={16} color="var(--isn-gold)" />
                      <span>{course.horas} horas lectivas</span>
                    </div>
                    
                    <button
                      onClick={() => navigate('/login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--isn-gold)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Matricularse →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Sección de Verificación en Línea */}
        <section id="verification" style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid var(--isn-blue)',
          borderRadius: '12px',
          padding: '48px 32px',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '80px',
          position: 'relative'
        }}>
          {/* Inner Accent Gold Box Border */}
          <div style={{
            position: 'absolute',
            top: '8px', left: '8px', right: '8px', bottom: '8px',
            border: '1px solid var(--isn-gold)',
            borderRadius: '8px',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '48px', position: 'relative', zIndex: 1 }}>
            <div>
              <span style={{ color: 'var(--isn-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem' }}>Registro Académico Nacional</span>
              <h3 className="font-serif" style={{ fontSize: '2rem', color: 'var(--isn-blue)', fontWeight: 900, marginTop: '4px', marginBottom: '16px' }}>
                Verificación Pública de Diplomas
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--isn-charcoal)', lineHeight: '1.6', marginBottom: '24px' }}>
                Todos los certificados emitidos por el Instituto Superior del Norte poseen un código único de verificación. Los empleadores y autoridades sanitarias pueden comprobar de manera inmediata la autenticidad de cualquier credencial académica en nuestro servidor central.
              </p>

              {/* Formular input estilizado con bordes dorados de 2px */}
              <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Ej. ALIM-1234-5678"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '6px',
                      border: '2px solid var(--isn-gold)',
                      fontSize: '1rem',
                      outline: 'none',
                      backgroundColor: 'var(--isn-bg-light)',
                      color: 'var(--isn-blue-dark)',
                      fontWeight: 700
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !verificationCode.trim()}
                  className="btn"
                  style={{
                    background: 'var(--isn-blue)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    padding: '0 24px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  <span>Validar Diploma</span>
                </button>
              </form>

              {/* Results Container */}
              {verifyError && (
                <div style={{
                  marginTop: '20px',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--accent-rose)',
                  fontSize: '0.9rem'
                }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                  <span>{verifyError}</span>
                </div>
              )}

              {verifyResult && (
                <div style={{
                  marginTop: '20px',
                  backgroundColor: 'rgba(78, 159, 61, 0.05)',
                  border: '2px solid var(--isn-success)',
                  borderRadius: '6px',
                  padding: '20px',
                  color: 'var(--isn-blue-dark)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--isn-success)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
                    <CheckCircle size={18} />
                    <span>CERTIFICADO OFICIAL VÁLIDO</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px 16px', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Estudiante:</span>
                    <span className="font-serif" style={{ fontWeight: 800 }}>{verifyResult.nombre_completo}</span>
                    
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Identificación:</span>
                    <span className="font-sans-mono">{verifyResult.cedula}</span>
                    
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Programa:</span>
                    <span style={{ fontWeight: 600 }}>{verifyResult.curso_titulo}</span>
                    
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Registro N°:</span>
                    <span className="font-sans-mono" style={{ color: 'var(--isn-gold)', fontWeight: 700 }}>{verifyResult.numero_certificado}</span>

                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Calificación:</span>
                    <span style={{ fontWeight: 700 }}>{verifyResult.calificacion_obtenida}%</span>

                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Fecha de Emisión:</span>
                    <span>{verifyResult.fecha_emision}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Reserva de Espacios para Contenido Gráfico (Verification Side) */}
            <div style={{
              border: '2px solid var(--isn-gold)',
              borderRadius: '8px',
              backgroundColor: 'var(--isn-bg-light)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <Award size={48} color="var(--isn-gold)" style={{ marginBottom: '12px' }} />
              <h4 className="font-serif" style={{ fontSize: '1.1rem', color: 'var(--isn-blue)', fontWeight: 700, marginBottom: '6px' }}>
                Sello de Seguridad Digital
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--isn-charcoal)', maxWidth: '200px' }}>
                Reserva gráfica para el sello de seguridad y código QR institucional.
              </p>
              <div style={{
                width: '100px',
                height: '100px',
                border: '2px dashed var(--isn-gold)',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontWeight: 700
              }}>
                CQR Placeholder
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px', alignItems: 'center', paddingBottom: '24px' }}>
          {/* Graphic Placeholder (About Side) */}
          <div style={{
            height: '350px',
            border: '2px solid var(--isn-gold)',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Loader2 className="animate-spin" size={32} color="var(--isn-gold)" style={{ marginBottom: '12px' }} />
            <h4 className="font-serif" style={{ fontSize: '1.1rem', color: 'var(--isn-blue)', fontWeight: 700 }}>
              Sede e Instalaciones
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--isn-charcoal)', maxWidth: '240px', marginTop: '4px' }}>
              Este contenedor reservado mostrará fotografías de la infraestructura académica del Instituto.
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--isn-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Sobre Nuestra Institución</span>
            <h3 className="font-serif" style={{ fontSize: '2.25rem', color: 'var(--isn-blue)', fontWeight: 800, marginTop: '4px', marginBottom: '16px' }}>
              Comprometidos con la Calidad Académica
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--isn-charcoal)', lineHeight: '1.6', marginBottom: '16px' }}>
              El Instituto Superior del Norte (ISN) es un centro de formación técnica superior enfocado en proveer cursos, diplomados y capacitaciones profesionales con certificación oficial para la inserción en el mercado productivo.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--isn-charcoal)', lineHeight: '1.6' }}>
              Nuestra plataforma LMS digital (Campus Virtual) cuenta con ambientes dinámicos de aprendizaje, simuladores multimedia avanzados y sistemas automatizados de calificación y emisión de registros para garantizar un proceso educativo transparente, ágil y de excelencia.
            </p>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--isn-blue-dark)',
        borderTop: '3px solid var(--isn-gold)',
        color: '#FFFFFF',
        padding: '36px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--isn-gold)', margin: 0 }}>
            INSTITUTO SUPERIOR DEL NORTE
          </p>
          <p style={{ fontSize: '0.8rem', color: '#D2D6DC', margin: 0 }}>
            © 2026 Instituto Superior del Norte. Todos los derechos reservados.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#9AA5B1', maxWidth: '600px', margin: '0 auto' }}>
            Acreditación académica de programas educativos. Para consultas de soporte y matrículas adicionales, contáctese directamente con la administración del Campus Virtual.
          </p>
        </div>
      </footer>
    </div>
  );
}
