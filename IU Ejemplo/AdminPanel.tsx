import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Progress } from "../components/ui/progress";
import { 
  Shield,
  LogOut,
  Users,
  BookOpen,
  TrendingUp,
  Search,
  UserPlus,
  Edit,
  Award
} from "lucide-react";
import { courses, students } from "../data/mockData";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditCourses, setShowEditCourses] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [newStudent, setNewStudent] = useState({
    name: "",
    cedula: "",
    password: "",
    courses: [] as string[]
  });

  useEffect(() => {
    if (!localStorage.getItem("isAdmin")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cedula.includes(searchTerm)
  );

  const totalActiveStudents = students.length;
  const totalCoursesInProgress = students.reduce((sum, s) => sum + s.enrolledCourses.length, 0);
  const totalCoursesCompleted = students.reduce((sum, s) => sum + s.completedCourses.length, 0);

  const handleToggleCourse = (courseId: string) => {
    setNewStudent(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(c => c !== courseId)
        : [...prev.courses, courseId]
    }));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--isn-bg-light)' }}>
      {/* Header */}
      <header className="bg-white border-b shadow-sm" style={{ background: 'var(--isn-blue)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white"
                 style={{ background: 'var(--isn-blue-dark)' }}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif tracking-tight text-xl">
                Panel Administrativo
              </h1>
              <p className="text-sm opacity-90">Instituto Superior del Norte</p>
            </div>
          </div>
          
          <Button onClick={handleLogout} variant="outline" className="gap-2 text-white border-white hover:bg-white hover:text-[var(--isn-blue)]">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Dashboard */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 overflow-hidden">
            <div className="h-2" style={{ background: 'var(--isn-blue)' }}></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                     style={{ background: 'var(--isn-blue)' }}>
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Estudiantes Activos</p>
                  <p className="text-3xl" style={{ color: 'var(--isn-blue)', fontWeight: 700 }}>
                    {totalActiveStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 overflow-hidden">
            <div className="h-2" style={{ background: 'var(--isn-success)' }}></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                     style={{ background: 'var(--isn-success)' }}>
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Cursos Completados</p>
                  <p className="text-3xl" style={{ color: 'var(--isn-success)', fontWeight: 700 }}>
                    {totalCoursesCompleted}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 overflow-hidden">
            <div className="h-2" style={{ background: 'var(--isn-gold)' }}></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                     style={{ background: 'var(--isn-gold)' }}>
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm opacity-70 mb-1">Cursos en Curso</p>
                  <p className="text-3xl" style={{ color: 'var(--isn-gold)', fontWeight: 700 }}>
                    {totalCoursesInProgress}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Management */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif" style={{ color: 'var(--isn-blue)' }}>
                Gestión de Estudiantes
              </h2>
              <Button 
                onClick={() => setShowAddStudent(true)}
                className="gap-2 text-white"
                style={{ background: 'var(--isn-blue)' }}>
                <UserPlus className="w-4 h-4" />
                Matricular Nuevo Estudiante
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <Input
                  placeholder="Buscar por cédula o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2"
                  style={{ borderColor: 'var(--isn-gold)' }}
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="border-2 rounded-lg overflow-hidden" style={{ borderColor: 'var(--isn-gold)' }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ background: 'var(--isn-bg-light)' }}>
                    <TableHead className="font-serif" style={{ color: 'var(--isn-blue)' }}>
                      Nombre Completo
                    </TableHead>
                    <TableHead className="font-serif" style={{ color: 'var(--isn-blue)' }}>
                      Cédula
                    </TableHead>
                    <TableHead className="font-serif" style={{ color: 'var(--isn-blue)' }}>
                      Fecha de Registro
                    </TableHead>
                    <TableHead className="font-serif" style={{ color: 'var(--isn-blue)' }}>
                      Progreso
                    </TableHead>
                    <TableHead className="font-serif text-right" style={{ color: 'var(--isn-blue)' }}>
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const avgProgress = student.enrolledCourses.length > 0
                      ? Math.round(
                          student.enrolledCourses.reduce((sum, cId) => 
                            sum + (student.courseProgress[cId] || 0), 0
                          ) / student.enrolledCourses.length
                        )
                      : 0;

                    return (
                      <TableRow key={student.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                 style={{ background: 'var(--isn-blue)' }}>
                              {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <span style={{ color: 'var(--isn-charcoal)', fontWeight: 500 }}>
                              {student.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono" style={{ color: 'var(--isn-charcoal)' }}>
                            {student.cedula}
                          </span>
                        </TableCell>
                        <TableCell style={{ color: 'var(--isn-charcoal)' }}>
                          {new Date(student.registrationDate).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Progress value={avgProgress} className="flex-1 h-2" />
                              <span className="text-sm" style={{ color: 'var(--isn-gold)', fontWeight: 600 }}>
                                {avgProgress}%
                              </span>
                            </div>
                            <p className="text-xs opacity-70">
                              {student.enrolledCourses.length} curso(s) activo(s)
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowEditCourses(true);
                            }}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            style={{ borderColor: 'var(--isn-blue)', color: 'var(--isn-blue)' }}>
                            <Edit className="w-4 h-4" />
                            Editar Cursos
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl" style={{ color: 'var(--isn-blue)' }}>
              Matricular Nuevo Estudiante
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-2 block" style={{ color: 'var(--isn-blue)' }}>
                  Nombre Completo
                </Label>
                <Input
                  id="name"
                  placeholder="Ej: Juan Pérez"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="border-2"
                  style={{ borderColor: 'var(--isn-gold)' }}
                />
              </div>

              <div>
                <Label htmlFor="cedula" className="mb-2 block" style={{ color: 'var(--isn-blue)' }}>
                  Número de Cédula
                </Label>
                <Input
                  id="cedula"
                  placeholder="12345678"
                  value={newStudent.cedula}
                  onChange={(e) => setNewStudent({ ...newStudent, cedula: e.target.value })}
                  className="border-2"
                  style={{ borderColor: 'var(--isn-gold)' }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block" style={{ color: 'var(--isn-blue)' }}>
                Contraseña Inicial
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                className="border-2"
                style={{ borderColor: 'var(--isn-gold)' }}
              />
            </div>

            <div>
              <Label className="mb-3 block" style={{ color: 'var(--isn-blue)' }}>
                Cursos a Matricular
              </Label>
              <div className="grid md:grid-cols-2 gap-3">
                {courses.map((course) => (
                  <div key={course.id} 
                       className="flex items-center gap-3 p-3 rounded-lg border-2"
                       style={{ borderColor: newStudent.courses.includes(course.id) ? 'var(--isn-gold)' : '#e5e7eb' }}>
                    <Checkbox
                      checked={newStudent.courses.includes(course.id)}
                      onCheckedChange={() => handleToggleCourse(course.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: 'var(--isn-charcoal)', fontWeight: 500 }}>
                        {course.title}
                      </p>
                      <p className="text-xs opacity-70">{course.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  // In a real app, this would save to a database
                  alert("Estudiante matriculado exitosamente");
                  setShowAddStudent(false);
                  setNewStudent({ name: "", cedula: "", password: "", courses: [] });
                }}
                className="flex-1 text-white"
                style={{ background: 'var(--isn-blue)' }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Guardar y Matricular
              </Button>
              <Button
                onClick={() => {
                  setShowAddStudent(false);
                  setNewStudent({ name: "", cedula: "", password: "", courses: [] });
                }}
                variant="outline"
                className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Courses Dialog */}
      <Dialog open={showEditCourses} onOpenChange={setShowEditCourses}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl" style={{ color: 'var(--isn-blue)' }}>
              Gestionar Matrículas
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 py-4">
              <div className="p-4 rounded-lg" style={{ background: 'var(--isn-bg-light)' }}>
                <p className="text-sm opacity-70 mb-1">Estudiante</p>
                <p className="text-lg" style={{ color: 'var(--isn-blue)', fontWeight: 600 }}>
                  {selectedStudent.name}
                </p>
                <p className="text-sm font-mono opacity-70">
                  Cédula: {selectedStudent.cedula}
                </p>
              </div>

              <div>
                <Label className="mb-3 block" style={{ color: 'var(--isn-blue)' }}>
                  Cursos Matriculados
                </Label>
                <div className="space-y-2">
                  {courses.map((course) => {
                    const isEnrolled = selectedStudent.enrolledCourses.includes(course.id);
                    
                    return (
                      <div key={course.id} 
                           className="flex items-center gap-3 p-3 rounded-lg border-2"
                           style={{ borderColor: isEnrolled ? 'var(--isn-gold)' : '#e5e7eb' }}>
                        <Checkbox checked={isEnrolled} />
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: 'var(--isn-charcoal)', fontWeight: 500 }}>
                            {course.title}
                          </p>
                          {isEnrolled && (
                            <div className="flex items-center gap-2 mt-1">
                              <Progress 
                                value={selectedStudent.courseProgress[course.id] || 0} 
                                className="flex-1 h-1.5" 
                              />
                              <span className="text-xs" style={{ color: 'var(--isn-gold)' }}>
                                {selectedStudent.courseProgress[course.id] || 0}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    alert("Cambios guardados exitosamente");
                    setShowEditCourses(false);
                    setSelectedStudent(null);
                  }}
                  className="flex-1 text-white"
                  style={{ background: 'var(--isn-blue)' }}>
                  Guardar Cambios
                </Button>
                <Button
                  onClick={() => {
                    setShowEditCourses(false);
                    setSelectedStudent(null);
                  }}
                  variant="outline"
                  className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
