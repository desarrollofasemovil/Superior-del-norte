import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logoNormal from '../assets/logoNormal.png';
import { Award, AlertTriangle, RefreshCw, ChevronRight, FileCheck, ArrowLeft, Clock } from 'lucide-react';

interface Question {
  id: number;
  pregunta: string;
  opciones: Record<string, string>;
}

const Exam: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { token, submitExam, API_BASE_URL, activeCourseId, studentCourses } = context;
  
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // { 1: 'A', 2: 'C', ... }
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null); // { puntaje, aprobado, intentos, message }

  const currentCourse = studentCourses.find((c: any) => c.id === activeCourseId);
  const courseTitle = currentCourse ? currentCourse.titulo : 'Manipulación de Alimentos';

  useEffect(() => {
    if (activeCourseId) {
      fetchQuestions();
    }
  }, [activeCourseId]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/exam/questions?courseId=${activeCourseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Debe completar todos los módulos del curso antes de realizar la evaluación final.');
      }
      setQuestions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionKey: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all questions are answered
    if (Object.keys(answers).length < questions.length) {
      alert('Por favor responda todas las preguntas antes de enviar.');
      return;
    }

    try {
      const resData = await submitExam(answers);
      setResult(resData);
    } catch (err: any) {
      alert(err.message || 'Error al enviar la evaluación');
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    fetchQuestions();
  };

  if (loading) {
    return <div style={{ color: 'var(--isn-charcoal)', textAlign: 'center', padding: '40px', fontWeight: 600 }}>Cargando evaluación...</div>;
  }

  if (error) {
    const isCooldown = error.includes('bloqueada') || error.includes('esperar');
    return (
      <div className="glass-panel isn-border-gold-2" style={{ padding: '32px', textAlign: 'center', maxWidth: '500px', margin: '40px auto', borderRadius: '16px' }}>
        <img src={logoNormal} alt="Instituto Superior del Norte" style={{ width: '120px', height: 'auto', marginBottom: '16px', filter: 'grayscale(0.8)' }} />
        {isCooldown ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--isn-gold)', marginBottom: '12px' }}>
              <Clock size={24} />
              <h3 className="font-serif" style={{ fontSize: '1.25rem', margin: 0 }}>Examen Bloqueado (Cooldown)</h3>
            </div>
            <p style={{ color: 'var(--isn-charcoal)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.5' }}>{error}</p>
          </>
        ) : (
          <>
            <h3 className="font-serif" style={{ marginBottom: '12px', fontSize: '1.25rem', color: 'var(--isn-blue)' }}>Acceso Bloqueado</h3>
            <p style={{ color: 'var(--isn-charcoal)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.5' }}>{error}</p>
          </>
        )}
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ background: 'var(--isn-blue)', color: '#FFFFFF' }}>Volver al Dashboard</button>
      </div>
    );
  }

  // Render Result Screen
  if (result) {
    const isPass = result.aprobado;
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
        <div className="glass-panel isn-border-gold-2 glow-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
          
          {isPass ? (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                <img src={logoNormal} alt="Instituto Superior del Norte" style={{ width: '140px', height: 'auto' }} />
              </div>
              <h2 className="font-serif" style={{ fontSize: '2rem', color: 'var(--isn-success)', marginBottom: '8px' }}>¡Examen Aprobado!</h2>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--isn-charcoal)', marginBottom: '16px' }}>
                Calificación: {result.puntaje}%
              </p>
              <p style={{ color: 'var(--isn-charcoal)', lineHeight: '1.6', marginBottom: '32px', fontSize: '0.95rem' }}>
                ¡Excelente trabajo! Has demostrado conocer las normas fundamentales de higiene y seguridad alimentaria. Tu certificado oficial de manipulación de alimentos ha sido generado con éxito.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => navigate(`/certificate/${activeCourseId}`)} style={{ background: 'var(--isn-blue)', color: '#FFFFFF' }}>
                  <FileCheck size={18} />
                  <span>Ver Certificado</span>
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                  Ir al Inicio
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                <img src={logoNormal} alt="Instituto Superior del Norte" style={{ width: '140px', height: 'auto', filter: 'grayscale(1)' }} />
              </div>
              <h2 className="font-serif" style={{ fontSize: '2rem', color: 'var(--isn-danger)', marginBottom: '8px' }}>Evaluación No Aprobada</h2>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--isn-charcoal)', marginBottom: '16px' }}>
                Calificación: {result.puntaje}%
              </p>
              <p style={{ color: 'var(--isn-charcoal)', lineHeight: '1.6', marginBottom: '32px', fontSize: '0.95rem' }}>
                Se requiere un puntaje mínimo de <b>80%</b> (7 de 8 respuestas correctas) para aprobar el curso y emitir tu certificación. Te recomendamos repasar los módulos del curso y volver a intentarlo.
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--isn-muted)', marginBottom: '24px', fontWeight: 600 }}>
                Intento N° {result.intentos} realizado.
              </p>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleRetry} style={{ background: 'var(--isn-blue)', color: '#FFFFFF' }}>
                  <RefreshCw size={18} />
                  <span>Reintentar Evaluación</span>
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                  Volver al Temario
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
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
        <span>Cancelar y Volver</span>
      </button>

      <div className="glass-panel isn-border-blue-2" style={{ padding: '32px', borderRadius: '16px' }}>
        
        {/* Title */}
        <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '28px' }}>
          <h2 className="font-serif isn-title-solemn" style={{ fontSize: '1.75rem', margin: 0 }}>Evaluación de {courseTitle}</h2>
          <p style={{ color: 'var(--isn-charcoal)', fontSize: '0.95rem', marginTop: '8px', lineHeight: '1.5' }}>
            Responde correctamente las siguientes preguntas sobre las buenas prácticas de manufactura. Se requiere al menos un <b>80% de respuestas correctas</b> (7 de 8) para aprobar y obtener tu certificado.
          </p>
        </div>

        {/* Questions form */}
        <form onSubmit={handleSubmit}>
          {questions.map((q, idx) => {
            const selectedAns = answers[q.id];
            return (
              <div key={q.id} style={{ marginBottom: '32px', background: '#FAFAFA', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--isn-blue)', marginBottom: '18px', lineHeight: '1.4' }}>
                  {idx + 1}. {q.pregunta}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(q.opciones).map(([key, text]) => {
                    const isSelected = selectedAns === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectOption(q.id, key)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          background: isSelected ? 'rgba(15, 44, 89, 0.04)' : '#FFFFFF',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--isn-blue)' : '#E2E8F0',
                          color: 'var(--isn-charcoal)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--isn-blue)' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : 'var(--isn-muted)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          flexShrink: 0
                        }}>
                          {key}
                        </span>
                        <span style={{ fontSize: '0.95rem', lineHeight: '1.4', fontWeight: isSelected ? 600 : 500 }}>{text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1rem', height: '52px', background: 'var(--isn-blue)', color: '#FFFFFF' }}
          >
            <span>Enviar Evaluación</span>
            <ChevronRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default Exam;
