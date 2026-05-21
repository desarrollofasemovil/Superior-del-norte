import { useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CheckCircle2, Circle, Play, Pause, Volume2, Image as ImageIcon } from "lucide-react";

const modules = [
  { id: 1, title: "Introducción a la Seguridad Alimentaria", completed: true },
  { id: 2, title: "Higiene Personal y Buenas Prácticas", completed: true },
  { id: 3, title: "Contaminación de Alimentos", completed: true },
  { id: 4, title: "Almacenamiento Seguro", completed: true },
  { id: 5, title: "Temperaturas de Cocción", completed: true },
  { id: 6, title: "Prevención de Enfermedades", completed: true },
  { id: 7, title: "Limpieza y Desinfección", completed: false, current: true },
  { id: 8, title: "Legislación Alimentaria", completed: false },
];

export function CourseViewerScreen() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentModule] = useState(7);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Module Checklist */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md sticky top-6">
              <div className="p-6">
                <h2 className="font-bold text-[#0F2C59] mb-4">Módulos del Curso</h2>
                <div className="space-y-2">
                  {modules.map((module) => (
                    <div
                      key={module.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        module.current
                          ? "bg-[#4E9F3D]/10 border-l-4 border-[#4E9F3D]"
                          : module.completed
                          ? "bg-gray-50"
                          : "bg-white"
                      }`}
                    >
                      {module.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#4E9F3D] flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Módulo {module.id}</p>
                        <p className={`text-sm ${
                          module.current ? "font-semibold text-[#0F2C59]" : "text-gray-700"
                        }`}>
                          {module.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Module Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-[#008DDA]">Módulo {currentModule}</span>
              </div>
              <h1 className="text-2xl font-bold text-[#0F2C59] mb-1">
                Limpieza y Desinfección
              </h1>
              <p className="text-gray-600">
                Aprende las técnicas correctas de limpieza y desinfección en áreas de manipulación de alimentos
              </p>
            </div>

            {/* Text Content */}
            <Card className="border-0 shadow-md">
              <div className="p-6 space-y-4">
                <h3 className="font-semibold text-[#0F2C59]">Conceptos Fundamentales</h3>
                <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
                  <p>
                    La limpieza y desinfección son procesos fundamentales en cualquier establecimiento 
                    que manipule alimentos. Estos procedimientos garantizan la eliminación de 
                    microorganismos patógenos que pueden causar enfermedades transmitidas por alimentos.
                  </p>
                  <p>
                    <strong className="text-[#0F2C59]">Limpieza:</strong> Es el proceso de remover la 
                    suciedad visible, residuos de alimentos, grasa y otras materias indeseables de 
                    las superficies.
                  </p>
                  <p>
                    <strong className="text-[#0F2C59]">Desinfección:</strong> Es la aplicación de 
                    agentes químicos o métodos físicos para reducir el número de microorganismos a 
                    niveles seguros.
                  </p>
                </div>
              </div>
            </Card>

            {/* Audio Player */}
            <Card className="border-0 shadow-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Volume2 className="w-5 h-5 text-[#008DDA]" />
                  <h3 className="font-semibold text-[#0F2C59]">Audio Explicativo</h3>
                </div>
                <div className="bg-gradient-to-r from-[#008DDA]/5 to-[#4E9F3D]/5 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-[#008DDA] hover:bg-[#0077b8] flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-[#008DDA] rounded-full"></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1:24</span>
                        <span>4:15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Video Player */}
            <Card className="border-0 shadow-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Play className="w-5 h-5 text-[#F0A500]" />
                  <h3 className="font-semibold text-[#0F2C59]">Video Tutorial</h3>
                </div>
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden relative">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1762329924239-e204f101fca4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwc2FmZXR5JTIwcHJvZmVzc2lvbmFsJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NzkzMDI5Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Food safety video tutorial"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Button className="w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center">
                      <Play className="w-8 h-8 text-[#0F2C59] ml-1" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-sm">Técnicas de Limpieza Profesional - 8:30 min</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Image Gallery */}
            <Card className="border-0 shadow-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <ImageIcon className="w-5 h-5 text-[#4E9F3D]" />
                  <h3 className="font-semibold text-[#0F2C59]">Galería Instructiva</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1752652013528-6e49aa7978ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwaW5zdHJ1Y3Rpb24lMjBsZWFybmluZ3xlbnwxfHx8fDE3NzkzMDI5Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Cooking instruction"
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1769515376350-bcff86d49499?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmb29kJTIwcHJlcGFyYXRpb24lMjBjbGVhbnxlbnwxfHx8fDE3NzkzMDI5Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Professional food preparation"
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1567710593500-19fb333fe351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGhlYWx0aHklMjBmb29kJTIwaW5ncmVkaWVudHN8ZW58MXx8fHwxNzc5MzAyOTMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Fresh food ingredients"
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ← Módulo Anterior
              </Button>
              <Button
                onClick={() => navigate("/exam")}
                className="bg-[#4E9F3D] hover:bg-[#3d8030] text-white"
              >
                Siguiente: Módulo Final →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
