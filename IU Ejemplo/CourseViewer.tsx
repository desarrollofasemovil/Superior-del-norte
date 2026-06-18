import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Slider } from "../components/ui/slider";
import { 
  ArrowLeft,
  CheckCircle,
  Circle,
  Play,
  Pause,
  Volume2,
  Maximize,
  FileText,
  Video,
  Headphones,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Award
} from "lucide-react";
import { courses } from "../data/mockData";

const moduleTypeIcons: { [key: string]: any } = {
  video: Video,
  text: FileText,
  audio: Headphones,
  image: ImageIcon,
};

export default function CourseViewer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);

  const course = courses.find(c => c.id === courseId);

  useEffect(() => {
    if (!localStorage.getItem("studentId")) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 0.5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Curso no encontrado</p>
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];
  const Icon = moduleTypeIcons[currentModule.type];

  const handleNext = () => {
    if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const allModulesCompleted = course.modules.every(m => m.completed);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--isn-bg-light)' }}>
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <Link to="/dashboard">
            <Button variant="outline" className="w-full mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Button>
          </Link>
          
          <h2 className="font-serif text-xl mb-2" style={{ color: 'var(--isn-blue)' }}>
            {course.title}
          </h2>
          <p className="text-sm opacity-70">
            {course.modules.filter(m => m.completed).length} de {course.modules.length} módulos
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {course.modules.map((module, index) => {
              const ModIcon = moduleTypeIcons[module.type];
              const isCurrent = index === currentModuleIndex;
              
              return (
                <button
                  key={module.id}
                  onClick={() => {
                    setCurrentModuleIndex(index);
                    setProgress(0);
                    setIsPlaying(false);
                  }}
                  className="w-full text-left p-3 rounded-lg transition-all border-2"
                  style={{
                    background: isCurrent ? 'var(--isn-blue)' : 'white',
                    color: isCurrent ? 'white' : 'var(--isn-charcoal)',
                    borderColor: isCurrent ? 'var(--isn-blue)' : (module.completed ? 'var(--isn-success)' : 'transparent')
                  }}>
                  <div className="flex items-center gap-3">
                    {module.completed ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" 
                                   style={{ color: isCurrent ? 'white' : 'var(--isn-success)' }} />
                    ) : (
                      <Circle className="w-5 h-5 flex-shrink-0" 
                              style={{ color: isCurrent ? 'white' : 'var(--isn-gold)' }} />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs opacity-70">Módulo {index + 1}</span>
                        <ModIcon className="w-3 h-3" />
                      </div>
                      <p className="text-sm truncate">{module.title}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="w-6 h-6" style={{ color: 'var(--isn-gold)' }} />
              <span className="text-sm px-3 py-1 rounded-full" 
                    style={{ background: 'var(--isn-bg-light)', color: 'var(--isn-blue)' }}>
                MÓDULO {currentModuleIndex + 1}
              </span>
              <span className="text-sm px-3 py-1 rounded-full capitalize"
                    style={{ background: 'var(--isn-gold)', color: 'white' }}>
                {currentModule.type}
              </span>
            </div>
            <h1 className="text-2xl font-serif" style={{ color: 'var(--isn-blue)' }}>
              {currentModule.title}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Media Player */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-black flex items-center justify-center relative">
                <div className="text-white text-center p-8">
                  <Icon className="w-24 h-24 mx-auto mb-4 opacity-80" />
                  <p className="text-lg mb-2">
                    {currentModule.type === 'video' && 'Reproductor de Video'}
                    {currentModule.type === 'audio' && 'Reproductor de Audio'}
                    {currentModule.type === 'text' && 'Documento de Texto'}
                    {currentModule.type === 'image' && 'Presentación Visual'}
                  </p>
                  <p className="text-sm opacity-70">Simulación de contenido educativo</p>
                </div>
              </div>

              {/* Player Controls */}
              {(currentModule.type === 'video' || currentModule.type === 'audio') && (
                <div className="bg-white p-4">
                  <div className="mb-3">
                    <Slider 
                      value={[progress]} 
                      onValueChange={(value) => setProgress(value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-white"
                        style={{ background: 'var(--isn-blue)' }}>
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" style={{ color: 'var(--isn-charcoal)' }} />
                        <Slider 
                          value={[volume]} 
                          onValueChange={(value) => setVolume(value[0])}
                          max={100}
                          step={1}
                          className="w-24"
                        />
                      </div>
                      
                      <span className="text-sm" style={{ color: 'var(--isn-charcoal)' }}>
                        {Math.floor(progress / 100 * parseInt(currentModule.duration))}:
                        {String(Math.floor((progress / 100 * parseInt(currentModule.duration)) % 1 * 60)).padStart(2, '0')} / {currentModule.duration}
                      </span>
                    </div>
                    
                    <Button size="sm" variant="ghost">
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Content Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-serif mb-4" style={{ color: 'var(--isn-blue)' }}>
                  Descripción del Módulo
                </h3>
                <div className="prose max-w-none" style={{ color: 'var(--isn-charcoal)' }}>
                  <p className="mb-4">
                    Este módulo cubre aspectos fundamentales sobre <strong>{currentModule.title.toLowerCase()}</strong>. 
                    A través de contenido multimedia de alta calidad, aprenderás conceptos clave, técnicas prácticas 
                    y mejores prácticas del sector.
                  </p>
                  <p className="mb-4">
                    Duración estimada: <strong>{currentModule.duration}</strong>
                  </p>
                  
                  <div className="p-4 rounded-lg mt-6" style={{ background: 'var(--isn-bg-light)' }}>
                    <h4 className="mb-2" style={{ color: 'var(--isn-blue)' }}>
                      Objetivos de Aprendizaje:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--isn-success)' }} />
                        <span>Comprender los conceptos fundamentales del tema</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--isn-success)' }} />
                        <span>Aplicar técnicas prácticas en escenarios reales</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--isn-success)' }} />
                        <span>Desarrollar habilidades profesionales relevantes</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentModuleIndex === 0}
                    variant="outline"
                    className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>

                  <div className="text-center">
                    <p className="text-sm opacity-70 mb-1">Progreso del curso</p>
                    <p className="text-2xl" style={{ color: 'var(--isn-gold)', fontWeight: 700 }}>
                      {currentModuleIndex + 1} / {course.modules.length}
                    </p>
                  </div>

                  {currentModuleIndex < course.modules.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      className="gap-2 text-white"
                      style={{ background: 'var(--isn-blue)' }}>
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : allModulesCompleted ? (
                    <Link to={`/exam/${courseId}`}>
                      <Button className="gap-2 text-white" style={{ background: 'var(--isn-gold)' }}>
                        <Award className="w-4 h-4" />
                        Ir al Examen Final
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => navigate("/dashboard")}
                      variant="outline"
                      className="gap-2">
                      Finalizar
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
