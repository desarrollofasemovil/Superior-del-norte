import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Award, AlertTriangle, RefreshCw, ChevronRight, FileCheck, ArrowLeft } from 'lucide-react';

const Exam = () => {
  const { token, submitExam, setCurrentView, API_BASE_URL } = useContext(AppContext);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { 1: 'A', 2: 'C', ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { puntaje, aprobado, intentos, message }

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/exam/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Debe completar los 8 módulos del curso antes de realizar la evaluación final.');
        }
        throw new Error('Error al cargar las preguntas del examen');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all questions are answered
    if (Object.keys(answers).length < questions.length) {
      alert('Por favor responda todas las preguntas antes de enviar.');
      return;
    }

    try {
      const resData = await submitExam(answers);
      setResult(resData);
    } catch (err) {
      alert(err.message || 'Error al enviar la evaluación');
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    fetchQuestions();
  };

  if (loading) {
    return <div style={{ color: 'var(--text-primary)', textAlign: 'center', padding: '40px', fontWeight: 600 }}>Cargando evaluación...</div>;
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
        <AlertTriangle size={48} color="var(--accent-rose)" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Acceso Bloqueado</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: '1.5' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => setCurrentView('dashboard')}>Volver al Dashboard</button>
      </div>
    );
  }

  // Render Result Screen
  if (result) {
    const isPass = result.aprobado;
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
        <div className="glass-panel glow-panel" style={{ padding: '40px', textAlign: 'center' }}>
          
          {isPass ? (
            <>
              <div style={{
                background: 'rgba(78, 159, 61, 0.1)',
                border: '1px solid rgba(78, 159, 61, 0.2)',
                borderRadius: '50%',
                padding: '20px',
                width: '80px',
                height: '80px',
                margin: '0 auto 24px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={48} color="var(--accent-emerald)" />
              </div>
              <h2 style={{ fontSize: '2rem', color: 'var(--accent-emerald)', marginBottom: '8px', fontWeight: 800 }}>¡Examen Aprobado!</h2>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Calificación: {result.puntaje}%
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px', fontSize: '0.95rem' }}>
                ¡Excelente trabajo! Has demostrado conocer las normas fundamentales de higiene y seguridad alimentaria. Tu certificado oficial de manipulación de alimentos de 3 horas ha sido generado con éxito.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setCurrentView('certificate')}>
                  <FileCheck size={18} />
                  <span>Ver Certificado</span>
                </button>
                <button className="btn btn-secondary" onClick={() => setCurrentView('dashboard')}>
                  Ir al Inicio
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '50%',
                padding: '20px',
                width: '80px',
                height: '80px',
                margin: '0 auto 24px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={48} color="var(--accent-rose)" />
              </div>
              <h2 style={{ fontSize: '2rem', color: 'var(--accent-rose)', marginBottom: '8px', fontWeight: 800 }}>Evaluación No Aprobada</h2>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Calificación: {result.puntaje}%
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px', fontSize: '0.95rem' }}>
                Se requiere un puntaje mínimo de <b>80%</b> (7 de 8 respuestas correctas) para aprobar el curso y emitir tu certificación. Te recomendamos repasar los módulos del curso y volver a intentarlo.
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 600 }}>
                Intento N° {result.intentos} realizado.
              </p>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleRetry}>
                  <RefreshCw size={18} />
                  <span>Reintentar Evaluación</span>
                </button>
                <button className="btn btn-secondary" onClick={() => setCurrentView('dashboard')}>
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
        <span>Cancelar y Volver</span>
      </button>

      <div className="glass-panel" style={{ padding: '32px' }}>
        
        {/* Title */}
        <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 800 }}>Evaluación de Manipulación de Alimentos</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '8px', lineHeight: '1.5' }}>
            Responde correctamente las siguientes preguntas sobre las buenas prácticas de manufactura. Se requiere al menos un <b>80% de respuestas correctas</b> (7 de 8) para aprobar y obtener tu certificado.
          </p>
        </div>

        {/* Questions form */}
        <form onSubmit={handleSubmit}>
          {questions.map((q, idx) => {
            const selectedAns = answers[q.id];
            return (
              <div key={q.id} style={{ marginBottom: '32px', background: '#FAFAFA', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px', lineHeight: '1.4' }}>
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
                          background: isSelected ? 'rgba(78, 159, 61, 0.06)' : '#FFFFFF',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--accent-emerald)' : '#E2E8F0',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
                        }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--accent-emerald)' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
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
            style={{ width: '100%', padding: '16px', fontSize: '1rem', height: '52px' }}
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
