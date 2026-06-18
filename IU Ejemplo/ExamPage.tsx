import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { 
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Trophy,
  RotateCcw
} from "lucide-react";
import { courses, examQuestions } from "../data/mockData";

export default function ExamPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const questions = examQuestions[courseId || ""] || [];

  useEffect(() => {
    if (!localStorage.getItem("studentId")) {
      navigate("/login");
    }
  }, [navigate]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Curso no encontrado</p>
      </div>
    );
  }

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    setScore(percentage);
    setPassed(percentage >= 80);
    setShowResults(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setPassed(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--isn-bg-light)' }}>
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" 
                 style={{ background: 'var(--isn-blue)' }}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif tracking-tight" style={{ color: 'var(--isn-blue)', fontSize: '1.25rem', fontWeight: 600 }}>
                Examen Final
              </h1>
              <p className="text-sm opacity-70">{course.title}</p>
            </div>
          </div>
          
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Instructions */}
        <Card className="mb-8 border-2" style={{ borderColor: 'var(--isn-gold)' }}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                   style={{ background: 'var(--isn-gold)' }}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif mb-2" style={{ color: 'var(--isn-blue)' }}>
                  Instrucciones del Examen
                </h2>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--isn-charcoal)' }}>
                  <li>• El examen consta de {questions.length} preguntas de opción múltiple</li>
                  <li>• Se requiere un mínimo de <strong>80% de respuestas correctas</strong> para aprobar</li>
                  <li>• Lea cada pregunta cuidadosamente antes de seleccionar su respuesta</li>
                  <li>• Puede reintentar el examen si no alcanza la calificación mínima</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                       style={{ background: answers[question.id] !== undefined ? 'var(--isn-success)' : 'var(--isn-blue)' }}>
                    {qIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg" style={{ color: 'var(--isn-blue)' }}>
                      {question.question}
                    </h3>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  {question.options.map((option, oIndex) => {
                    const isSelected = answers[question.id] === oIndex;
                    
                    return (
                      <button
                        key={oIndex}
                        onClick={() => setAnswers({ ...answers, [question.id]: oIndex })}
                        className="w-full text-left p-4 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: isSelected ? 'var(--isn-gold)' : '#e5e7eb',
                          background: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'white',
                        }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                               style={{
                                 borderColor: isSelected ? 'var(--isn-gold)' : '#d1d5db',
                                 background: isSelected ? 'var(--isn-gold)' : 'white',
                                 color: isSelected ? 'white' : 'var(--isn-charcoal)'
                               }}>
                            {String.fromCharCode(65 + oIndex)}
                          </div>
                          <span style={{ color: 'var(--isn-charcoal)' }}>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'var(--isn-charcoal)' }}>
                  Preguntas respondidas: <strong>{Object.keys(answers).length} / {questions.length}</strong>
                </p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
                size="lg"
                className="text-white text-lg px-8"
                style={{ background: 'var(--isn-blue)' }}>
                <Trophy className="w-5 h-5 mr-2" />
                Enviar Evaluación
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {passed ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white"
                       style={{ background: 'var(--isn-success)' }}>
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-serif" style={{ color: 'var(--isn-success)' }}>
                    ¡Examen Aprobado!
                  </h2>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white"
                       style={{ background: '#ef4444' }}>
                    <XCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-serif" style={{ color: '#ef4444' }}>
                    Evaluación No Aprobada
                  </h2>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-6 py-4">
            <div className="inline-block px-8 py-4 rounded-2xl"
                 style={{ 
                   background: passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                   border: `2px solid ${passed ? 'var(--isn-success)' : '#ef4444'}`
                 }}>
              <p className="text-sm opacity-70 mb-1">Calificación Final</p>
              <p className="text-5xl" 
                 style={{ 
                   color: passed ? 'var(--isn-success)' : '#ef4444',
                   fontWeight: 700
                 }}>
                {score}%
              </p>
            </div>

            {passed ? (
              <div className="space-y-3">
                <p style={{ color: 'var(--isn-charcoal)' }}>
                  ¡Felicitaciones! Has completado exitosamente el curso de <strong>{course.title}</strong>.
                </p>
                <p className="text-sm opacity-70">
                  Tu certificado oficial está disponible para visualización y descarga.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p style={{ color: 'var(--isn-charcoal)' }}>
                  Has obtenido <strong>{score}%</strong> de respuestas correctas.
                  Se requiere un mínimo de <strong>80%</strong> para aprobar.
                </p>
                <p className="text-sm opacity-70">
                  No te preocupes, puedes volver a intentar el examen.
                </p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              {passed ? (
                <Button
                  onClick={() => navigate(`/certificate/${courseId}`)}
                  className="w-full text-white text-lg py-6"
                  style={{ background: 'var(--isn-success)' }}>
                  <Award className="w-5 h-5 mr-2" />
                  Ver Certificado
                </Button>
              ) : (
                <Button
                  onClick={handleRetry}
                  className="w-full text-white text-lg py-6"
                  style={{ background: 'var(--isn-blue)' }}>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reintentar Evaluación
                </Button>
              )}
              
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="w-full">
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
