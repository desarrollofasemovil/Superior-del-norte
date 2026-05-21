import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { BookOpen, CheckCircle, Circle, Award, FileText, Compass, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, progress, modules, setCurrentView, setActiveModuleId, examStatus, downloadCertificate } = useContext(AppContext);

  const totalModules = modules.length;
  const completedCount = progress.modulos_completados.length;
  const isFinishedAllModules = completedCount === totalModules && totalModules > 0;
  const hasApprovedExam = examStatus && examStatus.aprobado;

  const handleCourseAction = () => {
    if (isFinishedAllModules) {
      if (hasApprovedExam) {
        setCurrentView('certificate');
      } else {
        setCurrentView('exam');
      }
    } else {
      // Find first uncompleted module, or default to first module
      const firstUncompleted = modules.find(m => !progress.modulos_completados.includes(m.id));
      const targetId = firstUncompleted ? firstUncompleted.id : (modules[0]?.id || null);
      setActiveModuleId(targetId);
      setCurrentView('course');
    }
  };

  const handleModuleClick = (moduleId) => {
    setActiveModuleId(moduleId);
    setCurrentView('course');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      {/* Welcome Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.25rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '6px' }}>
          ¡Bienvenido, {user?.nombre_completo}!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          {isFinishedAllModules 
            ? 'Has completado todos los contenidos formativos. Continúa con tu evaluación.'
            : 'Continúa tu aprendizaje de manipulación higiénica de alimentos donde lo dejaste.'}
        </p>
      </div>

      {/* Main Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px',
      }} className="course-grid">
        
        {/* Left Side: Course Progress & Modules list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            {/* Banner Image */}
            <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1567710593500-19fb333fe351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGhlYWx0aHklMjBmb29kJTIwaW5ncmVkaWVudHN8ZW58MXx8fHwxNzc5MzAyOTMwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Ingredientes frescos de alimentos"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Overlay Gradient */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 44, 89, 0.85) 0%, rgba(15, 44, 89, 0.3) 60%, transparent 100%)'
              }} />
              
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', color: '#FFFFFF' }}>
                <span style={{
                  background: isFinishedAllModules ? 'var(--accent-emerald)' : 'var(--accent-gold)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'inline-block',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {isFinishedAllModules ? 'Contenido Finalizado' : 'En Progreso'}
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Curso de Manipulación de Alimentos
                </h2>
              </div>
            </div>

            <div style={{ padding: '28px' }}>
              {/* Progress Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Progreso de la formación</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{progress.progreso_porcentaje}%</span>
                </div>
                
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${progress.progreso_porcentaje}%` }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} color="var(--accent-emerald)" />
                    <span>{completedCount} de {totalModules} módulos completados</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="var(--accent-gold)" />
                    <span>3 Horas Lectivas</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="btn btn-primary" 
                onClick={handleCourseAction} 
                style={{ width: '100%', height: '52px', fontSize: '1rem' }}
              >
                {isFinishedAllModules ? (
                  hasApprovedExam ? (
                    <>
                      <Award size={20} />
                      <span>Ver Certificado</span>
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      <span>Realizar Examen Final</span>
                    </>
                  )
                ) : (
                  <>
                    <BookOpen size={20} />
                    <span>{progress.progreso_porcentaje > 0 ? 'Continuar Curso' : 'Iniciar Aprendizaje'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Modules List */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)' }}>
              Temario del Curso (8 Módulos obligatorios)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modules.map((m, index) => {
                const isCompleted = progress.modulos_completados.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => handleModuleClick(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      background: isCompleted ? '#FAFAFA' : '#FFFFFF',
                      border: isCompleted ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                    }}
                    className="module-item-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      {isCompleted ? (
                        <CheckCircle size={20} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                      ) : (
                        <Circle size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      )}
                      
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          Módulo {index + 1}: {m.titulo}
                        </p>
                      </div>
                    </div>
                    
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: isCompleted ? '#E2E8F0' : '#008DDA15',
                      color: isCompleted ? 'var(--text-muted)' : 'var(--accent-teal)',
                      marginLeft: '12px',
                      flexShrink: 0
                    }}>
                      {m.tipo_recurso}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Status Widget */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: hasApprovedExam ? 'rgba(78, 159, 61, 0.1)' : 'rgba(0, 141, 218, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {hasApprovedExam ? (
                  <ShieldCheck size={22} color="var(--accent-emerald)" />
                ) : (
                  <Clock size={22} color="var(--accent-teal)" />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {hasApprovedExam ? 'Formación Finalizada' : 'Próximo Paso Requerido'}
                </h3>
                
                {hasApprovedExam ? (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      Has aprobado exitosamente el examen final con una calificación del {examStatus.puntaje}%.
                    </p>
                    <div style={{ background: '#4E9F3D0C', border: '1px solid #4E9F3D30', padding: '12px', borderRadius: '10px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        Certificado Emitido
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Calificación: {examStatus.puntaje}%
                      </p>
                    </div>
                  </div>
                ) : isFinishedAllModules ? (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      ¡Has completado todos los módulos formativos! Ya puedes realizar el examen final.
                    </p>
                    <button 
                      onClick={() => setCurrentView('exam')}
                      className="btn" 
                      style={{
                        background: 'var(--accent-gold)',
                        color: '#FFFFFF',
                        width: '100%',
                        padding: '10px 16px',
                        fontSize: '0.9rem'
                      }}
                    >
                      <span>Comenzar Examen</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      Debes visualizar y completar los 8 módulos del temario para desbloquear el examen.
                    </p>
                    <div style={{ background: 'rgba(240, 165, 0, 0.08)', border: '1px solid rgba(240, 165, 0, 0.2)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <AlertCircle size={18} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Examen final bloqueado temporalmente
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificate Card */}
          <div className="glass-panel" style={{
            background: 'linear-gradient(135deg, #0F2C59 0%, #008DDA 100%)',
            color: '#FFFFFF',
            padding: '28px',
            border: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-20px',
              opacity: 0.1,
              transform: 'rotate(-10deg)',
              color: '#FFFFFF'
            }}>
              <Award size={180} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                Certificación Oficial
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', marginBottom: '20px' }}>
                Obtén tu acreditación en Manipulación Higiénica de Alimentos, válida a nivel nacional por autoridades sanitarias vigentes.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.95)' }}>
                  <CheckCircle size={16} color="#FFFFFF" />
                  <span>Acreditación de 3 horas lectivas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.95)' }}>
                  <CheckCircle size={16} color="#FFFFFF" />
                  <span>Código único de verificación en línea</span>
                </div>
              </div>

              {hasApprovedExam ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setCurrentView('certificate')}
                    className="btn" 
                    style={{ background: '#FFFFFF', color: 'var(--text-primary)', flex: 1, padding: '12px' }}
                  >
                    Ver Diploma
                  </button>
                  <button 
                    onClick={downloadCertificate}
                    className="btn" 
                    style={{ background: 'var(--accent-emerald)', color: '#FFFFFF', flex: 1, padding: '12px' }}
                  >
                    Descargar PDF
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  Completa el curso y aprueba el examen final para descargar.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
