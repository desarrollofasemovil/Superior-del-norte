import { useNavigate } from "react-router";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Navigation } from "./Navigation";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CheckCircle2, Clock } from "lucide-react";

export function DashboardScreen() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("userName") || "Usuario";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F2C59] mb-2">
            ¡Bienvenido, {userName}!
          </h1>
          <p className="text-gray-600">Continúa tu aprendizaje donde lo dejaste</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Course Card */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-[2/1] relative overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1567710593500-19fb333fe351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGhlYWx0aHklMjBmb29kJTIwaW5ncmVkaWVudHN8ZW58MXx8fHwxNzc5MzAyOTMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Fresh healthy food ingredients"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-block px-3 py-1 bg-[#4E9F3D] text-white text-sm rounded-full mb-2">
                    En Progreso
                  </div>
                  <h2 className="text-white text-2xl font-bold">
                    Curso de Manipulación de Alimentos
                  </h2>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Progreso del curso</span>
                    <span className="font-semibold text-[#0F2C59]">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#4E9F3D]" />
                      <span>6 de 8 módulos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#F0A500]" />
                      <span>2h 30min restantes</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/course")}
                  className="w-full h-12 bg-[#4E9F3D] hover:bg-[#3d8030] text-white mt-2"
                >
                  Continuar Curso
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Widget */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#008DDA]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#008DDA]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F2C59] mb-1">
                      Próximo Paso
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Completa el módulo actual para desbloquear el examen final
                    </p>
                    <div className="px-3 py-2 bg-[#F0A500]/10 rounded-lg">
                      <p className="text-sm font-semibold text-[#F0A500]">
                        Examen Final
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Disponible al completar módulo 8
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-[#0F2C59] to-[#008DDA]">
              <CardContent className="p-6 text-white">
                <h3 className="font-semibold mb-2">Tu Certificado</h3>
                <p className="text-sm text-white/90 mb-4">
                  Completa el curso y obtén tu certificado oficial de manipulación de alimentos
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Válido a nivel nacional</span>
                  <span>Mas chimba que una arepa</span>
                </div>
                
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
