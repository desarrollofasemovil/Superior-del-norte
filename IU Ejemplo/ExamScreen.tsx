import { useState } from "react";
import { Navigation } from "./Navigation";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { CertificateModal } from "./CertificateModal";
import { Clock, CheckCircle2 } from "lucide-react";

const questions = [
  {
    id: 1,
    question: "¿Cuál es la temperatura mínima segura para cocinar pollo?",
    options: [
      "60°C (140°F)",
      "70°C (158°F)",
      "74°C (165°F)",
      "80°C (176°F)",
    ],
    correctAnswer: 2,
  },
  {
    id: 2,
    question: "¿Qué es la contaminación cruzada?",
    options: [
      "Cuando un alimento se cocina demasiado",
      "La transferencia de microorganismos de un alimento a otro",
      "Cuando se mezclan diferentes ingredientes",
      "El proceso de congelación de alimentos",
    ],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: "¿Con qué frecuencia debe lavarse las manos un manipulador de alimentos?",
    options: [
      "Solo al inicio del turno",
      "Una vez por hora",
      "Cada vez que cambie de tarea y después de tocar superficies contaminadas",
      "Solamente antes de comer",
    ],
    correctAnswer: 2,
  },
  {
    id: 4,
    question: "¿Cuál es el rango de temperatura de la 'zona de peligro' para alimentos?",
    options: [
      "0°C a 10°C",
      "5°C a 60°C",
      "10°C a 40°C",
      "20°C a 50°C",
    ],
    correctAnswer: 1,
  },
  {
    id: 5,
    question: "¿Qué debe hacer si encuentra un alimento vencido en el almacén?",
    options: [
      "Usarlo si no huele mal",
      "Descartarlo inmediatamente y reportarlo",
      "Mezclarlo con alimentos frescos",
      "Guardarlo para revisión posterior",
    ],
    correctAnswer: 1,
  },
  {
    id: 6,
    question: "¿Cuál es la primera etapa del proceso de limpieza y desinfección?",
    options: [
      "Aplicar desinfectante",
      "Enjuagar con agua",
      "Remover los residuos visibles",
      "Secar las superficies",
    ],
    correctAnswer: 2,
  },
  {
    id: 7,
    question: "¿Qué característica NO debe tener un manipulador de alimentos?",
    options: [
      "Uñas cortas y limpias",
      "Joyas y accesorios en las manos",
      "Ropa limpia y apropiada",
      "Cabello recogido o cubierto",
    ],
    correctAnswer: 1,
  },
  {
    id: 8,
    question: "¿Cuánto tiempo máximo pueden permanecer alimentos perecederos a temperatura ambiente?",
    options: [
      "30 minutos",
      "1 hora",
      "2 horas",
      "4 horas",
    ],
    correctAnswer: 2,
  },
];

export function ExamScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [timeRemaining] = useState("45:00");

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: parseInt(value) });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // In a real app, this would calculate the score
    // For demo purposes, we'll show the certificate
    setShowCertificate(true);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Exam Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#0F2C59] mb-1">
                Examen Final
              </h1>
              <p className="text-gray-600">Curso de Manipulación de Alimentos</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F0A500]/10 rounded-lg">
              <Clock className="w-5 h-5 text-[#F0A500]" />
              <span className="font-semibold text-[#F0A500]">{timeRemaining}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Pregunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="font-semibold text-[#0F2C59]">
                {Math.round(progress)}% Completado
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-md">
          <div className="p-8">
            <div className="mb-6">
              <div className="inline-block px-3 py-1 bg-[#008DDA]/10 text-[#008DDA] rounded-full text-sm font-semibold mb-4">
                Pregunta {currentQuestion + 1}
              </div>
              <h2 className="text-xl font-semibold text-[#0F2C59] leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            {/* Answer Options */}
            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {currentQ.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    answers[currentQuestion] === index
                      ? "border-[#4E9F3D] bg-[#4E9F3D]/5"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-base text-gray-700 leading-relaxed"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ← Anterior
          </Button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                  index === currentQuestion
                    ? "bg-[#008DDA] text-white"
                    : answers[index] !== undefined
                    ? "bg-[#4E9F3D] text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
              className="bg-[#4E9F3D] hover:bg-[#3d8030] text-white disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Finalizar Examen
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-[#4E9F3D] hover:bg-[#3d8030] text-white"
            >
              Siguiente →
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Card className="border-0 shadow-md bg-[#008DDA]/5 mt-6">
          <div className="p-6">
            <h3 className="font-semibold text-[#0F2C59] mb-2">Instrucciones</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Seleccione la opción que considere correcta para cada pregunta</li>
              <li>• Puede navegar entre preguntas usando los botones o los números</li>
              <li>• Debe responder todas las preguntas para finalizar el examen</li>
              <li>• Se requiere un 80% de respuestas correctas para aprobar</li>
            </ul>
          </div>
        </Card>
      </div>

      {showCertificate && <CertificateModal onClose={() => setShowCertificate(false)} />}
    </div>
  );
}
