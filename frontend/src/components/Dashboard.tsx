import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BookOpen, ArrowRight } from 'lucide-react';
import emptyState from '../assets/empty_state.png';

const decodeMojibake = (str: string | undefined): string | undefined => {
  if (!str) return str;
  try {
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    if (!decoded.includes('\uFFFD')) {
      return decoded;
    }
  } catch (e) {}

  const mapping = [
    ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã­', 'í'], ['Ã³', 'ó'], ['Ãº', 'ú'],
    ['Ã±', 'ñ'], ['Ã‘', 'Ñ'], ['Ã ', 'Á'], ['Ã‰', 'É'], ['Ã ', 'Í'],
    ['Ã“', 'Ó'], ['Ãš', 'Ú'], ['Ã¼', 'ü'], ['Ãœ', 'Ü']
  ];
  let result = str;
  for (const [mojibake, correct] of mapping) {
    result = result.replaceAll(mojibake, correct);
  }
  return result;
};

const Dashboard = () => {
  const { user, studentCourses } = useContext(AppContext);
  const navigate = useNavigate();

  // Loading state if no courses loaded yet
  if (!studentCourses || studentCourses.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '40px 32px', backgroundColor: '#FFFFFF', borderRadius: '24px', boxShadow: 'var(--shadow-card)', border: 'none' }} className="glass-panel">
        <img 
          src={emptyState} 
          alt="Aún no tienes cursos" 
          style={{ width: '220px', height: 'auto', display: 'block', margin: '0 auto 24px auto' }} 
        />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--isn-blue-dark)', fontWeight: 800 }}>Cargando tus cursos...</h2>
        <p style={{ color: 'var(--isn-charcoal)', lineHeight: '1.5' }}>
          Si es la primera vez que ingresas, espera a que el administrador te matricule en un curso formativo.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="font-serif" style={{ fontSize: '2.25rem', color: 'var(--isn-blue)', fontWeight: 900, marginBottom: '6px' }}>
          ¡Bienvenido, {decodeMojibake(user?.nombre_completo)}!
        </h1>
        <p style={{ color: 'var(--isn-charcoal)', fontSize: '1.05rem' }}>
          Selecciona uno de tus cursos matriculados para continuar tu formación.
        </p>
      </div>

      {/* Courses Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {studentCourses.map(course => (
          <div key={course.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '20px', backgroundColor: '#FFFFFF' }}>
            
            {/* Card Header Image */}
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: 'linear-gradient(135deg, #0F2C59 0%, #008DDA 100%)' }}>
              {course.imagen_url && (
                <img
                  src={course.imagen_url}
                  alt={course.titulo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 44, 89, 0.85) 0%, rgba(15, 44, 89, 0.2) 60%, transparent 100%)'
              }} />
              
              <span style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: course.progreso_porcentaje === 100 ? 'var(--accent-emerald)' : 'var(--accent-gold)',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                {course.progreso_porcentaje === 100 ? 'Finalizado' : `${course.progreso_porcentaje}%`}
              </span>
            </div>

            {/* Card Body */}
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--isn-blue)', marginBottom: '8px' }}>
                {course.titulo}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
                {course.descripcion || 'Sin descripción disponible.'}
              </p>

              {/* Progress bar inside card */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <span>Progreso</span>
                  <span>{course.progreso_porcentaje}%</span>
                </div>
                <div className="progress-container" style={{ height: '6px' }}>
                  <div className="progress-bar" style={{ width: `${course.progreso_porcentaje}%` }} />
                </div>
              </div>

              <button
                onClick={() => navigate(`/course/${course.id}/detail`)}
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', fontSize: '0.9rem' }}
              >
                <span>Ver Detalles</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
