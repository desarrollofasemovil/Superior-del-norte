import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BookOpen, CheckCircle, Circle, Award, FileText, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const {
    user,
    progress,
    modules,
    setActiveModuleId,
    examStatus,
    downloadCertificate,
    studentCourses,
    activeCourseId,
    setActiveCourseId
  } = context;
  
  const navigate = useNavigate();

  const totalModules = modules.length;
  const completedCount = progress.modulos_completados.length;
  const isFinishedAllModules = completedCount === totalModules && totalModules > 0;
  const hasApprovedExam = examStatus && examStatus.aprobado;

  // Active course details if any
  const activeCourse = studentCourses.find((c: any) => c.id === activeCourseId) || studentCourses[0];

  const handleCourseAction = (courseId: number) => {
    setActiveCourseId(courseId);

    // If it's the currently active course and we already loaded it
    if (courseId === activeCourseId) {
      if (isFinishedAllModules) {
        if (hasApprovedExam) {
          navigate(`/certificate/${courseId}`);
        } else {
          navigate(`/course/${courseId}/exam`);
        }
      } else {
        const firstUncompleted = modules.find((m: any) => !progress.modulos_completados.includes(m.id));
        const targetId = firstUncompleted ? firstUncompleted.id : (modules[0]?.id || null);
        setActiveModuleId(targetId);
        navigate(`/course/${courseId}`);
      }
    } else {
      // Just go to course view and let it load
      navigate(`/course/${courseId}`);
    }
  };

  const handleModuleClick = (moduleId: number) => {
    setActiveModuleId(moduleId);
    navigate(`/course/${activeCourseId}`);
  };

  // 1. Loading state if no courses loaded yet
  if (!studentCourses || studentCourses.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '32px' }} className="glass-panel isn-border-gold-2">
        <BookOpen size={48} color="var(--isn-muted)" style={{ marginBottom: '16px' }} />
        <h2 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--isn-blue)' }}>Cargando tus cursos...</h2>
        <p style={{ color: 'var(--isn-charcoal)' }}>
          Si es la primera vez que ingresas, espera a que el administrador te matricule en un curso formativo.
        </p>
      </div>
    );
  }

  // 2. Multiple Courses View
  if (studentCourses.length > 1 && !activeCourseId) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 className="font-serif isn-title-solemn" style={{ fontSize: '2.25rem', marginBottom: '6px' }}>
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
          {studentCourses.map((course: any) => (
            <div key={course.id} className="glass-panel isn-border-gold-2" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px' }}>
              
              {/* Card Header Image */}
              <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: 'linear-gradient(135deg, var(--isn-blue) 0%, var(--isn-blue-dark) 100%)' }}>
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
                  background: 'linear-gradient(to top, rgba(7, 25, 53, 0.85) 0%, rgba(7, 25, 53, 0.2) 60%, transparent 100%)'
                }} />
                
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: course.progreso_porcentaje === 100 ? 'var(--isn-success)' : 'var(--isn-gold)',
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
                <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--isn-blue)', marginBottom: '8px' }}>
                  {course.titulo}
                </h3>
                <p style={{ color: 'var(--isn-charcoal)', fontSize: '0.875rem', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
                  {course.descripcion || 'Sin descripción disponible.'}
                </p>

                {/* Progress bar inside card */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--isn-muted)', marginBottom: '6px' }}>
                    <span>Progreso</span>
                    <span>{course.progreso_porcentaje}%</span>
                  </div>
                  <div className="progress-container" style={{ height: '6px' }}>
                    <div className="progress-bar" style={{ width: `${course.progreso_porcentaje}%`, background: 'var(--isn-success)' }} />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveCourseId(course.id);
                    navigate(`/course/${course.id}`);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '44px', fontSize: '0.9rem', background: 'var(--isn-blue)' }}
                >
                  <span>Ingresar al Curso</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Single Course View (either enrolled in 1, or has active course selected)
  const displayCourse = activeCourse || studentCourses[0];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      {/* Return button if enrolled in multiple courses */}
      {studentCourses.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setActiveCourseId(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--isn-blue)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            ← Volver a todos mis cursos
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="font-serif isn-title-solemn" style={{ fontSize: '2.25rem', marginBottom: '6px' }}>
          ¡Bienvenido, {decodeMojibake(user?.nombre_completo)}!
        </h1>
        <p style={{ color: 'var(--isn-charcoal)', fontSize: '1.05rem' }}>
          {isFinishedAllModules 
            ? 'Has completado todos los contenidos formativos. Continúa con tu evaluación.'
            : 'Continúa tu aprendizaje donde lo dejaste.'}
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="course-grid">
        
        {/* Left Side: Course Progress & Modules list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel isn-border-gold-2" style={{ overflow: 'hidden', borderRadius: '16px' }}>
            {/* Banner Image */}
            <div style={{ position: 'relative', height: '240px', overflow: 'hidden', background: 'linear-gradient(135deg, var(--isn-blue) 0%, var(--isn-blue-dark) 100%)' }}>
              {displayCourse.imagen_url && (
                <img
                  src={displayCourse.imagen_url}
                  alt={displayCourse.titulo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {/* Overlay Gradient */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(7, 25, 53, 0.85) 0%, rgba(7, 25, 53, 0.3) 60%, transparent 100%)'
              }} />
              
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', color: '#FFFFFF' }}>
                <span style={{
                  background: isFinishedAllModules ? 'var(--isn-success)' : 'var(--isn-gold)',
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
                <h2 className="font-serif" style={{ fontSize: '1.75rem', color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: 0 }}>
                  {displayCourse.titulo}
                </h2>
              </div>
            </div>

            <div style={{ padding: '28px' }}>
              {/* Progress Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--isn-blue)' }}>Progreso de la formación</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--isn-success)' }}>{progress.progreso_porcentaje}%</span>
                </div>
                
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${progress.progreso_porcentaje}%`, background: 'var(--isn-success)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem', color: 'var(--isn-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} color="var(--isn-success)" />
                    <span>{completedCount} de {totalModules} módulos completados</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="var(--isn-gold)" />
                    <span>Autogestionado</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="btn btn-primary" 
                onClick={() => handleCourseAction(displayCourse.id)} 
                style={{ width: '100%', height: '52px', fontSize: '1rem', background: 'var(--isn-blue)' }}
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
          <div className="glass-panel isn-border-blue-2" style={{ padding: '28px', borderRadius: '16px' }}>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--isn-blue)' }}>
              Temario del Curso ({totalModules} Módulos obligatorios)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modules.map((m: any, index: number) => {
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
                        <CheckCircle size={20} color="var(--isn-success)" style={{ flexShrink: 0 }} />
                      ) : (
                        <Circle size={20} color="var(--isn-muted)" style={{ flexShrink: 0 }} />
                      )}
                      
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: isCompleted ? 'var(--isn-muted)' : 'var(--isn-charcoal)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          Módulo {index + 1}: {m.titulo}
                        </p>
                      </div>
                    </div>
                    
                    <span className="isn-badge-blue" style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '6px',
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
          <div className="glass-panel isn-border-gold-2" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: hasApprovedExam ? 'rgba(22, 163, 74, 0.1)' : 'rgba(15, 44, 89, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {hasApprovedExam ? (
                  <ShieldCheck size={22} color="var(--isn-success)" />
                ) : (
                  <Clock size={22} color="var(--isn-blue)" />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 className="font-serif" style={{ fontSize: '1.1rem', color: 'var(--isn-blue)', marginBottom: '6px' }}>
                  {hasApprovedExam ? 'Formación Finalizada' : 'Próximo Paso Requerido'}
                </h3>
                
                {hasApprovedExam ? (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--isn-charcoal)', marginBottom: '14px' }}>
                      Has aprobado exitosamente el examen final con una calificación del {examStatus.score}%.
                    </p>
                    <div style={{ background: 'rgba(22, 163, 74, 0.05)', border: '1px solid rgba(22, 163, 74, 0.2)', padding: '12px', borderRadius: '10px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--isn-success)' }}>
                        Certificado Emitido
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--isn-charcoal)', marginTop: '2px' }}>
                        Calificación: {examStatus.score}%
                      </p>
                    </div>
                  </div>
                ) : isFinishedAllModules ? (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--isn-charcoal)', marginBottom: '14px' }}>
                      ¡Has completado todos los módulos formativos! Ya puedes realizar el examen final.
                    </p>
                    <button
                      onClick={() => navigate(`/course/${activeCourseId}/exam`)}
                      className="btn"
                      style={{
                        background: 'var(--isn-gold)',
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
                    <p style={{ fontSize: '0.875rem', color: 'var(--isn-charcoal)', marginBottom: '14px' }}>
                      Debes visualizar y completar los {totalModules} módulos del temario para desbloquear el examen.
                    </p>
                    <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <AlertCircle size={18} color="var(--isn-gold)" style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--isn-blue)' }}>
                        Examen final bloqueado temporalmente
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificate Card */}
          <div className="glass-panel isn-border-gold-2 animate-pulse-glow" style={{
            background: 'linear-gradient(135deg, var(--isn-blue) 0%, var(--isn-blue-dark) 100%)',
            color: '#FFFFFF',
            padding: '28px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '16px'
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
              <h3 className="font-serif" style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '8px' }}>
                Certificación Oficial
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', marginBottom: '20px' }}>
                Obtén tu acreditación en {displayCourse.titulo}, válida a nivel nacional por autoridades sanitarias vigentes.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.95)' }}>
                  <CheckCircle size={16} color="var(--isn-gold)" />
                  <span>Acreditación curricular válida</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.95)' }}>
                  <CheckCircle size={16} color="var(--isn-gold)" />
                  <span>Código único de verificación en línea</span>
                </div>
              </div>

              {hasApprovedExam ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => navigate(`/certificate/${activeCourseId}`)}
                    className="btn"
                    style={{ background: '#FFFFFF', color: 'var(--isn-blue)', flex: 1, padding: '12px', fontWeight: 700 }}
                  >
                    Ver Diploma
                  </button>
                  <button 
                    onClick={downloadCertificate}
                    className="btn" 
                    style={{ background: 'var(--isn-success)', color: '#FFFFFF', flex: 1, padding: '12px', fontWeight: 700 }}
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
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF'
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
