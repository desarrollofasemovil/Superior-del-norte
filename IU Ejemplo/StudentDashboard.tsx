import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { 
  Award, 
  LogOut, 
  CheckCircle, 
  Circle,
  PlayCircle,
  FileText,
  Headphones,
  Image as ImageIcon,
  Video,
  Download,
  Eye,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { courses, students } from "../data/mockData";

const moduleTypeIcons: { [key: string]: any } = {
  video: Video,
  text: FileText,
  audio: Headphones,
  image: ImageIcon,
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [studentData, setStudentData] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("studentName");
    const id = localStorage.getItem("studentId");
    
    if (!name || !id) {
      navigate("/login");
      return;
    }
    
    setStudentName(name);
    const student = students.find(s => s.id === id);
    setStudentData(student);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentId");
    navigate("/login");
  };

  if (!studentData) return null;

  const enrolledCourses = courses.filter(c => studentData.enrolledCourses.includes(c.id));
  const completedCourseIds = studentData.completedCourses || [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--isn-bg-light)' }}>
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
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
              <p className="text-sm opacity-70">Campus Virtual</p>
            </div>
          </div>
          
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        {!selectedCourse && (
          <>
            <div className="rounded-2xl p-8 mb-8 text-white shadow-lg"
                 style={{ background: 'linear-gradient(135deg, var(--isn-blue) 0%, var(--isn-blue-dark) 100%)' }}>
              <h1 className="text-3xl font-serif mb-2">
                ¡Bienvenido, {studentName}!
              </h1>
              <p className="opacity-90">
                Continúa con tu formación profesional. Tienes {enrolledCourses.length} curso(s) activo(s).
              </p>
            </div>

            {/* Course Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => {
                const progress = studentData.courseProgress[course.id] || 0;
                const isCompleted = completedCourseIds.includes(course.id);
                
                return (
                  <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all">
                    <div className="h-40 flex items-center justify-center text-white relative"
                         style={{ background: 'linear-gradient(135deg, var(--isn-blue) 0%, var(--isn-blue-dark) 100%)' }}>
                      <BookOpen className="w-16 h-16 opacity-90" />
                      {isCompleted && (
                        <div className="absolute top-3 right-3 bg-white rounded-full p-2"
                             style={{ color: 'var(--isn-success)' }}>
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="mb-3">
                        {isCompleted ? (
                          <Badge className="text-white" style={{ background: 'var(--isn-success)' }}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Finalizado
                          </Badge>
                        ) : (
                          <Badge style={{ background: 'var(--isn-gold)', color: 'white' }}>
                            En Progreso
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-serif mb-2" style={{ color: 'var(--isn-blue)' }}>
                        {course.title}
                      </h3>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span style={{ color: 'var(--isn-charcoal)' }}>Progreso</span>
                          <span style={{ color: 'var(--isn-gold)', fontWeight: 600 }}>
                            {progress}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <Button 
                        onClick={() => setSelectedCourse(course.id)}
                        className="w-full text-white"
                        style={{ background: 'var(--isn-blue)' }}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Ingresar al Curso
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Single Course View */}
        {selectedCourse && (() => {
          const course = courses.find(c => c.id === selectedCourse);
          if (!course) return null;
          
          const progress = studentData.courseProgress[selectedCourse] || 0;
          const isCompleted = completedCourseIds.includes(selectedCourse);
          const completedModules = course.modules.filter(m => m.completed).length;
          
          return (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Button 
                  onClick={() => setSelectedCourse(null)}
                  variant="outline"
                  className="mb-4">
                  ← Volver a Mis Cursos
                </Button>
                
                {/* Course Header */}
                <Card className="overflow-hidden">
                  <div className="h-48 flex items-center justify-center text-white relative"
                       style={{ background: 'linear-gradient(135deg, var(--isn-blue) 0%, var(--isn-blue-dark) 100%)' }}>
                    <div className="text-center">
                      <BookOpen className="w-20 h-20 mx-auto mb-3 opacity-90" />
                      <h2 className="text-2xl font-serif">{course.title}</h2>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span style={{ color: 'var(--isn-charcoal)' }}>
                          {completedModules} de {course.modules.length} módulos completados
                        </span>
                        <span className="text-xl" style={{ color: 'var(--isn-gold)', fontWeight: 700 }}>
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                    
                    <Link to={`/course/${course.id}`}>
                      <Button size="lg" className="w-full text-white text-lg"
                              style={{ background: 'var(--isn-blue)' }}>
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Continuar Aprendizaje
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Module List */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-serif mb-4" style={{ color: 'var(--isn-blue)' }}>
                      Contenido del Curso
                    </h3>
                    
                    <div className="space-y-3">
                      {course.modules.map((module, index) => {
                        const Icon = moduleTypeIcons[module.type];
                        
                        return (
                          <div key={module.id} 
                               className="flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md"
                               style={{ 
                                 borderColor: module.completed ? 'var(--isn-success)' : 'var(--isn-gold)',
                                 background: module.completed ? 'rgba(16, 185, 129, 0.05)' : 'white'
                               }}>
                            <div className="flex-shrink-0">
                              {module.completed ? (
                                <CheckCircle className="w-8 h-8" style={{ color: 'var(--isn-success)' }} />
                              ) : (
                                <Circle className="w-8 h-8" style={{ color: 'var(--isn-gold)' }} />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs px-2 py-1 rounded"
                                      style={{ background: 'var(--isn-bg-light)', color: 'var(--isn-blue)' }}>
                                  Módulo {index + 1}
                                </span>
                                <Icon className="w-4 h-4" style={{ color: 'var(--isn-gold)' }} />
                              </div>
                              <h4 className="mb-1" style={{ color: 'var(--isn-charcoal)' }}>
                                {module.title}
                              </h4>
                              <p className="text-sm opacity-70">{module.duration}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Next Step */}
                <Card className="border-2" style={{ borderColor: 'var(--isn-gold)' }}>
                  <CardContent className="p-6">
                    <h3 className="font-serif mb-4 flex items-center gap-2" 
                        style={{ color: 'var(--isn-blue)' }}>
                      <ArrowRight className="w-5 h-5" style={{ color: 'var(--isn-gold)' }} />
                      Próximo Paso Requerido
                    </h3>
                    
                    {!isCompleted ? (
                      <div className="text-sm space-y-3" style={{ color: 'var(--isn-charcoal)' }}>
                        <p>
                          Complete todos los módulos del curso para desbloquear el examen final.
                        </p>
                        <div className="p-3 rounded-lg" style={{ background: 'var(--isn-bg-light)' }}>
                          <p className="text-xs opacity-70 mb-1">Progreso actual:</p>
                          <p className="text-2xl" style={{ color: 'var(--isn-gold)', fontWeight: 700 }}>
                            {completedModules}/{course.modules.length}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Link to={`/exam/${course.id}`}>
                        <Button className="w-full text-white" style={{ background: 'var(--isn-gold)' }}>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Iniciar Examen
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>

                {/* Certificate */}
                <Card className="border-2" style={{ borderColor: 'var(--isn-blue)' }}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                         style={{ background: 'var(--isn-gold)' }}>
                      <Award className="w-8 h-8" />
                    </div>
                    
                    <h3 className="font-serif mb-2" style={{ color: 'var(--isn-blue)' }}>
                      Certificación Oficial
                    </h3>
                    
                    {isCompleted ? (
                      <div className="space-y-3">
                        <p className="text-sm" style={{ color: 'var(--isn-success)' }}>
                          ✓ Curso completado exitosamente
                        </p>
                        <div className="space-y-2">
                          <Link to={`/certificate/${course.id}`}>
                            <Button variant="outline" className="w-full gap-2"
                                    style={{ borderColor: 'var(--isn-gold)', color: 'var(--isn-gold)' }}>
                              <Eye className="w-4 h-4" />
                              Ver Diploma
                            </Button>
                          </Link>
                          <Button variant="outline" className="w-full gap-2"
                                  style={{ borderColor: 'var(--isn-blue)', color: 'var(--isn-blue)' }}>
                            <Download className="w-4 h-4" />
                            Descargar PDF
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm opacity-70">
                        Completa el curso y aprueba el examen final para obtener tu certificado
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
