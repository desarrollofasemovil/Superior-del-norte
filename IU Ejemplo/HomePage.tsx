import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
  Wrench, 
  Heart, 
  Shield, 
  Stethoscope, 
  Truck, 
  Users,
  Search,
  CheckCircle,
  Award,
  BookOpen
} from "lucide-react";
import { courses } from "../data/mockData";

const courseIcons: { [key: string]: any } = {
  Wrench,
  Heart,
  Shield,
  Stethoscope,
  Truck,
  Users,
};

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--isn-bg-light)' }}>
      {/* Navigation Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" 
                 style={{ background: 'var(--isn-blue)' }}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif tracking-tight" style={{ color: 'var(--isn-blue)', fontSize: '1.25rem', fontWeight: 600 }}>
                Instituto Superior del Norte
              </h1>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="transition-colors hover:opacity-70" style={{ color: 'var(--isn-charcoal)' }}>
              Inicio
            </a>
            <a href="#courses" className="transition-colors hover:opacity-70" style={{ color: 'var(--isn-charcoal)' }}>
              Cursos
            </a>
            <a href="#verification" className="transition-colors hover:opacity-70" style={{ color: 'var(--isn-charcoal)' }}>
              Verificación
            </a>
            <a href="#about" className="transition-colors hover:opacity-70" style={{ color: 'var(--isn-charcoal)' }}>
              Nosotros
            </a>
          </nav>
          
          <Link to="/login">
            <Button className="text-white border-0 shadow-md hover:opacity-90" 
                    style={{ background: 'var(--isn-blue)' }}>
              Acceder al Campus Virtual
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 rounded-full mb-6" 
                 style={{ background: 'var(--isn-gold)', color: 'white' }}>
              <span className="text-sm tracking-wide">Excelencia Educativa</span>
            </div>
            <h1 className="font-serif mb-6" 
                style={{ 
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
                  lineHeight: 1.2,
                  color: 'var(--isn-blue)',
                  fontWeight: 700
                }}>
              Formación Técnica Superior para el Mundo Real
            </h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--isn-charcoal)' }}>
              Adquiere habilidades profesionales con certificaciones oficiales reconocidas nacionalmente. 
              Impulsa tu carrera con programas de alta calidad diseñados para el éxito.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#courses">
                <Button size="lg" className="text-white" style={{ background: 'var(--isn-blue)' }}>
                  <BookOpen className="mr-2 w-5 h-5" />
                  Explorar Cursos
                </Button>
              </a>
              <a href="#verification">
                <Button size="lg" variant="outline" 
                        style={{ 
                          borderColor: 'var(--isn-gold)', 
                          color: 'var(--isn-gold)',
                          borderWidth: '2px'
                        }}>
                  <CheckCircle className="mr-2 w-5 h-5" />
                  Verificar Certificado
                </Button>
              </a>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4" 
                 style={{ borderColor: 'var(--isn-gold)' }}>
              <div className="w-full h-full flex items-center justify-center text-white"
                   style={{ background: 'linear-gradient(135deg, var(--isn-blue) 0%, var(--isn-blue-dark) 100%)' }}>
                <div className="text-center p-8">
                  <Award className="w-32 h-32 mx-auto mb-6 opacity-90" />
                  <p className="text-2xl font-serif">
                    Certificaciones<br />Oficiales Reconocidas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Programs Section */}
      <section id="courses" className="py-20" style={{ background: 'var(--isn-bg-light)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif mb-4" 
                style={{ 
                  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  color: 'var(--isn-blue)',
                  fontWeight: 700
                }}>
              Programas Académicos Destacados
            </h2>
            <p className="text-lg" style={{ color: 'var(--isn-charcoal)' }}>
              Cursos técnicos profesionales con certificación oficial
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const IconComponent = courseIcons[course.icon];
              return (
                <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 border-2 overflow-hidden">
                  <div className="h-3" style={{ background: 'var(--isn-gold)' }}></div>
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white"
                         style={{ background: 'var(--isn-blue)' }}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full text-xs mb-3"
                         style={{ background: 'var(--isn-bg-light)', color: 'var(--isn-gold)' }}>
                      {course.duration}
                    </div>
                    <h3 className="mb-3 font-serif" style={{ color: 'var(--isn-blue)', fontSize: '1.5rem' }}>
                      {course.title}
                    </h3>
                    <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--isn-charcoal)' }}>
                      {course.description}
                    </p>
                    <Link to="/login">
                      <Button variant="outline" className="w-full group-hover:text-white group-hover:border-0 transition-all"
                              style={{ 
                                borderColor: 'var(--isn-gold)',
                                color: 'var(--isn-gold)',
                                borderWidth: '2px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--isn-gold)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}>
                        Ver Detalles
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certificate Verification Section */}
      <section id="verification" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl p-12 shadow-2xl border-2"
               style={{ 
                 background: 'rgba(255, 255, 255, 0.95)',
                 borderColor: 'var(--isn-gold)',
                 backdropFilter: 'blur(10px)'
               }}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-white"
                   style={{ background: 'var(--isn-blue)' }}>
                <Award className="w-10 h-10" />
              </div>
              <h2 className="font-serif mb-4"
                  style={{ 
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    color: 'var(--isn-blue)',
                    fontWeight: 700
                  }}>
                Verificación de Autenticidad
              </h2>
              <p className="text-lg" style={{ color: 'var(--isn-charcoal)' }}>
                Valida la autenticidad de certificados emitidos por nuestra institución
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <label className="block mb-3 font-serif" style={{ color: 'var(--isn-blue)' }}>
                Verificar Certificado Oficial
              </label>
              <div className="flex gap-3">
                <Input 
                  placeholder="Ej: ISN-ABCD-2026"
                  className="flex-1 border-2"
                  style={{ borderColor: 'var(--isn-gold)' }}
                />
                <Button className="text-white" style={{ background: 'var(--isn-gold)' }}>
                  <Search className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm mt-3 text-center" style={{ color: 'var(--isn-charcoal)' }}>
                Ingrese el código de verificación de su certificado
              </p>
            </div>

            <div className="mt-8 pt-8 border-t grid md:grid-cols-3 gap-6 text-center">
              <div>
                <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--isn-success)' }} />
                <p className="font-serif" style={{ color: 'var(--isn-blue)' }}>Verificación Inmediata</p>
              </div>
              <div>
                <Award className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--isn-gold)' }} />
                <p className="font-serif" style={{ color: 'var(--isn-blue)' }}>Certificación Nacional</p>
              </div>
              <div>
                <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--isn-blue)' }} />
                <p className="font-serif" style={{ color: 'var(--isn-blue)' }}>Validez Oficial</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-white" style={{ background: 'var(--isn-blue)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-8 h-8" />
            <h3 className="font-serif text-2xl">Instituto Superior del Norte</h3>
          </div>
          <p className="opacity-90 mb-4">
            Excelencia en formación técnica profesional desde 2020
          </p>
          <div className="text-sm opacity-75">
            © 2026 Instituto Superior del Norte. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
