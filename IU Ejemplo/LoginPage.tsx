import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Award, ArrowLeft, Shield, User } from "lucide-react";
import { students, adminCredentials } from "../data/mockData";

export default function LoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    setError("");

    if (isAdmin) {
      if (cedula === adminCredentials.cedula && password === adminCredentials.password) {
        localStorage.setItem("isAdmin", "true");
        navigate("/admin");
      } else {
        setError("Credenciales de administrador incorrectas");
      }
    } else {
      const student = students.find(s => s.cedula === cedula && s.password === password);
      if (student) {
        localStorage.setItem("studentId", student.id);
        localStorage.setItem("studentName", student.name);
        navigate("/dashboard");
      } else {
        setError("Cédula o contraseña incorrecta");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, var(--isn-bg-light) 0%, #e0e7ff 100%)' }}>

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
        {/* Student Login */}
        {!isAdmin && (
          <Card className="shadow-2xl border-2 overflow-hidden">
            <div className="h-2" style={{ background: 'var(--isn-gold)' }}></div>
            <CardHeader className="text-center pt-8 pb-6">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                style={{ background: 'var(--isn-blue)' }}>
                <Award className="w-10 h-10" />
              </div>
              <h2 className="font-serif text-3xl mb-2" style={{ color: 'var(--isn-blue)' }}>

              </h2>
              <p style={{ color: 'var(--isn-charcoal)' }}>
                Acceso para Estudiantes
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="student-cedula" className="mb-2 block" style={{ color: 'var(--isn-blue)' }}>
                    Número de Cédula
                  </Label>
                  <Input
                    id="student-cedula"
                    type="text"
                    placeholder="12345678"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="border-2"
                    style={{ borderColor: 'var(--isn-gold)' }}
                  />
                  <p className="text-xs mt-1 opacity-70">Ingrese su número de cédula sin puntos ni guiones</p>
                </div>

                <div>
                  <Label htmlFor="student-password" className="mb-2 block" style={{ color: 'var(--isn-blue)' }}>
                    Contraseña
                  </Label>
                  <Input
                    id="student-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2"
                    style={{ borderColor: 'var(--isn-gold)' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleLogin}
                  className="w-full text-white text-lg py-6"
                  style={{ background: 'var(--isn-blue)' }}>
                  <User className="mr-2 w-5 h-5" />
                  Ingresar al Curso
                </Button>

                <div className="rounded-lg p-4" style={{ background: 'var(--isn-bg-light)' }}>
                  <p className="text-sm mb-2" style={{ color: 'var(--isn-blue)', fontWeight: 600 }}>
                    Credenciales de Acceso Demo:
                  </p>
                  <div className="text-xs space-y-1" style={{ color: 'var(--isn-charcoal)' }}>
                    <p>Cédula: <span className="font-mono bg-white px-2 py-1 rounded">12345678</span></p>
                    <p>Contraseña: <span className="font-mono bg-white px-2 py-1 rounded">demo123</span></p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAdmin(true)}
                  className="w-full text-sm py-3 rounded-lg border-2 transition-all hover:bg-opacity-10"
                  style={{
                    borderColor: 'var(--isn-blue)',
                    color: 'var(--isn-blue)',
                  }}>
                  Entrar como Administrador →
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Login */}
        {isAdmin && (
          <Card className="shadow-2xl border-2 overflow-hidden md:col-span-2 max-w-xl mx-auto w-full">
            <div className="h-2" style={{ background: 'var(--isn-blue)' }}></div>
            <CardHeader className="text-center pt-8 pb-6" style={{ background: 'var(--isn-blue)' }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white text-white"
                style={{ background: 'var(--isn-blue-dark)' }}>
                <Shield className="w-10 h-10" />
              </div>
              <h2 className="font-serif text-3xl mb-2 text-white">
                Acceso Administrativo
              </h2>
              <p className="text-white opacity-90">
                Gestión de Estudiantes y Certificados
              </p>
            </CardHeader>

            <CardContent className="px-8 py-8">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="admin-cedula" className="mb-2 block" style={{ color: 'var(--isn-blue)' }}>
                    Cédula del Administrador
                  </Label>
                  <Input
                    id="admin-cedula"
                    type="text"
                    placeholder="admin"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="border-2"
                    style={{ borderColor: 'var(--isn-blue)' }}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-password" className="mb-2 block" style={{ color: 'var(--isn-blue)' }}>
                    Contraseña
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2"
                    style={{ borderColor: 'var(--isn-blue)' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleLogin}
                  className="w-full text-white text-lg py-6"
                  style={{ background: 'var(--isn-blue)' }}>
                  <Shield className="mr-2 w-5 h-5" />
                  Ingresar al Panel
                </Button>

                <div className="rounded-lg p-4" style={{ background: 'var(--isn-bg-light)' }}>
                  <p className="text-sm mb-2" style={{ color: 'var(--isn-blue)', fontWeight: 600 }}>
                    Credenciales de Acceso Admin:
                  </p>
                  <div className="text-xs space-y-1" style={{ color: 'var(--isn-charcoal)' }}>
                    <p>Usuario: <span className="font-mono bg-white px-2 py-1 rounded">admin</span></p>
                    <p>Contraseña: <span className="font-mono bg-white px-2 py-1 rounded">admin123</span></p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsAdmin(false);
                    setError("");
                    setCedula("");
                    setPassword("");
                  }}
                  className="w-full text-sm py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2"
                  style={{
                    borderColor: 'var(--isn-gold)',
                    color: 'var(--isn-gold)',
                  }}>
                  <ArrowLeft className="w-4 h-4" />
                  Volver a Estudiantes
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Panel - Only visible on student view */}
        {!isAdmin && (
          <div className="hidden md:flex flex-col justify-center">
            <div className="rounded-2xl p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)'
              }}>
              <h3 className="font-serif text-2xl mb-6" style={{ color: 'var(--isn-blue)' }}>
                Bienvenido al Campus Virtual
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--isn-gold)', color: 'white' }}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="mb-1" style={{ color: 'var(--isn-blue)' }}>
                      Certificación Oficial
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--isn-charcoal)' }}>
                      Obtén certificados reconocidos nacionalmente
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--isn-gold)', color: 'white' }}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="mb-1" style={{ color: 'var(--isn-blue)' }}>
                      Aprendizaje Flexible
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--isn-charcoal)' }}>
                      Estudia a tu propio ritmo, cuando quieras
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--isn-gold)', color: 'white' }}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="mb-1" style={{ color: 'var(--isn-blue)' }}>
                      Contenido de Calidad
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--isn-charcoal)' }}>
                      Material didáctico actualizado y profesional
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
