import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logoNormal from '../assets/logoNormal.png';
import { Users, CheckCircle2, Clock, Plus, UserPlus, RefreshCw, X, ShieldAlert, Edit } from 'lucide-react';

const decodeMojibake = (str: string | undefined): string => {
  if (!str) return '';
  try {
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    if (!decoded.includes('\uFFFD')) {
      return decoded;
    }
  } catch (e) {}

  const map: Record<string, string> = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã±': 'ñ', 'Ã‘': 'Ñ', 'Ã ': 'Á', 'Ã‰': 'É', 'Ã ': 'Í',
    'Ã“': 'Ó', 'Ãš': 'Ú', 'Ã¼': 'ü', 'Ãœ': 'Ü'
  };
  let result = str;
  for (const [mojibake, correct] of Object.entries(map)) {
    result = result.replaceAll(mojibake, correct);
  }
  return result;
};

const AdminDashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const {
    adminMetrics,
    adminUsers,
    courses,
    coursesList,
    fetchAdminMetrics,
    fetchAdminUsers,
    fetchCourses,
    fetchCoursesList,
    createStudentUser,
    updateStudentCourses,
    loading: contextLoading
  } = context;

  const navigate = useNavigate();

  // Local States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [nombre, setNombre] = useState<string>('');
  const [cedula, setCedula] = useState<string>('');
  const [password, setPassword] = useState<string>('123456'); // Default password
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Search local state
  const [searchCedula, setSearchCedula] = useState<string>('');

  // Edit courses modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editSelectedCourses, setEditSelectedCourses] = useState<string[]>([]);
  const [editError, setEditError] = useState<string>('');
  const [editSuccessMessage, setEditSuccessMessage] = useState<string>('');
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  // Load dashboard data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Sync selected courses once courses list loads
  useEffect(() => {
    if (courses && courses.length > 0 && selectedCourses.length === 0) {
      // Default to checking the first course
      setSelectedCourses([courses[0].id.toString()]);
    }
  }, [courses]);

  // Debounce search by cedula
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdminUsers(searchCedula);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchCedula]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAdminMetrics(),
        fetchAdminUsers(searchCedula),
        fetchCourses(),
        fetchCoursesList()
      ]);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenEditModal = async (student: any) => {
    setSelectedStudent(student);
    setEditSelectedCourses((student.enrolled_courses || []).map(String));
    setEditError('');
    setEditSuccessMessage('');
    setIsEditModalOpen(true);
    
    try {
      await fetchCoursesList();
    } catch (e) {
      console.error('Error fetching courses list:', e);
    }
  };

  const handleEditCheckboxChange = (courseId: number) => {
    const cidStr = courseId.toString();
    if (editSelectedCourses.includes(cidStr)) {
      setEditSelectedCourses(editSelectedCourses.filter(id => id !== cidStr));
    } else {
      setEditSelectedCourses([...editSelectedCourses, cidStr]);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccessMessage('');
    setEditSubmitting(true);

    try {
      await updateStudentCourses(selectedStudent.cedula, editSelectedCourses.map(Number));
      setEditSuccessMessage('¡Matrículas actualizadas con éxito!');
      
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSelectedStudent(null);
        setEditSuccessMessage('');
      }, 1500);
    } catch (err: any) {
      setEditError(err.message || 'Error al actualizar las matrículas.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCheckboxChange = (courseId: number) => {
    const cidStr = courseId.toString();
    if (selectedCourses.includes(cidStr)) {
      setSelectedCourses(selectedCourses.filter(id => id !== cidStr));
    } else {
      setSelectedCourses([...selectedCourses, cidStr]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    setSubmitting(true);

    const cleanNombre = nombre.trim();
    const cleanCedula = cedula.trim();

    // Local Validation
    if (!cleanNombre || !cleanCedula || !password) {
      setLocalError('Todos los campos son obligatorios.');
      setSubmitting(false);
      return;
    }

    // Cedula validation: numeric only
    if (!/^\d+$/.test(cleanCedula)) {
      setLocalError('La cédula debe contener únicamente números.');
      setSubmitting(false);
      return;
    }

    // Name validation: letters, accents and spaces only
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!nameRegex.test(cleanNombre)) {
      setLocalError('El nombre completo debe contener únicamente letras y espacios (se soportan acentos y ñ).');
      setSubmitting(false);
      return;
    }

    // Password strength check
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      setSubmitting(false);
      return;
    }

    // Courses selection check
    if (selectedCourses.length === 0) {
      setLocalError('Debe asignar al menos un curso al estudiante.');
      setSubmitting(false);
      return;
    }

    try {
      await createStudentUser({
        cedula: cleanCedula,
        nombre_completo: cleanNombre,
        password: password,
        cursos: selectedCourses.map(id => parseInt(id))
      });

      // Clear form
      setNombre('');
      setCedula('');
      setPassword('123456');
      if (courses && courses.length > 0) {
        setSelectedCourses([courses[0].id.toString()]);
      }
      setSuccessMessage('¡Estudiante creado y matriculado correctamente!');
      
      // Close modal after a brief delay
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage('');
      }, 1800);

    } catch (err: any) {
      setLocalError(err.message || 'Error al registrar al estudiante.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-serif isn-title-solemn" style={{ fontSize: '2.25rem', marginBottom: '6px' }}>
            Panel de Administrador
          </h1>
          <p style={{ color: 'var(--isn-charcoal)', fontSize: '1.05rem' }}>
            Supervisa el progreso de los estudiantes, gestiona matrículas y revisa métricas globales.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary"
            onClick={loadData}
            disabled={refreshing || contextLoading}
            style={{ height: '48px', padding: '0 16px' }}
            title="Recargar información"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span className="hide-mobile">Actualizar</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/admin/create-course')}
            style={{ height: '48px', background: 'var(--isn-success)', borderColor: 'var(--isn-success)', color: '#FFFFFF' }}
          >
            <Plus size={18} />
            <span>Añadir Nuevo Curso</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ height: '48px', background: 'var(--isn-blue)', color: '#FFFFFF' }}
          >
            <UserPlus size={18} />
            <span>Matricular Estudiante</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '36px'
      }}>
        {/* Card 1: Active Users */}
        <div className="glass-panel isn-border-blue-2" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(15, 44, 89, 0.08)',
            color: 'var(--isn-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--isn-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Estudiantes Activos</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--isn-blue)', marginTop: '2px', margin: 0 }}>
              {adminMetrics.usuarios_activos}
            </h3>
          </div>
        </div>

        {/* Card 2: Completed Courses */}
        <div className="glass-panel isn-border-blue-2" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(22, 163, 74, 0.08)',
            color: 'var(--isn-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--isn-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Cursos Completados</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--isn-success)', marginTop: '2px', margin: 0 }}>
              {adminMetrics.cursos_completados}
            </h3>
          </div>
        </div>

        {/* Card 3: Pending Courses */}
        <div className="glass-panel isn-border-blue-2" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(212, 175, 55, 0.08)',
            color: 'var(--isn-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--isn-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Cursos en Curso</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--isn-gold)', marginTop: '2px', margin: 0 }}>
              {adminMetrics.cursos_pendientes}
            </h3>
          </div>
        </div>
      </div>

      {/* Students List Table container */}
      <div className="glass-panel isn-border-blue-2" style={{ padding: '28px', overflow: 'hidden', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--isn-blue)', margin: 0 }}>
            Listado General de Estudiantes
          </h3>
          <span className="isn-badge-blue" style={{
            fontSize: '0.8rem',
            padding: '6px 12px',
            borderRadius: '8px',
            fontWeight: 700
          }}>
            {adminUsers.length} registros
          </span>
        </div>

        {/* Input Search por Cédula */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar por Cédula..."
            value={searchCedula}
            onChange={(e) => setSearchCedula(e.target.value)}
            className="isn-input-focus"
            style={{
              width: '100%',
              maxWidth: '360px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: 'var(--isn-charcoal)',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s'
            }}
          />
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="isn-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-glass)' }}>
                <th style={{ padding: '16px 12px', fontSize: '0.85rem' }}>Nombre Completo</th>
                <th style={{ padding: '16px 12px', fontSize: '0.85rem' }}>Número de Cédula</th>
                <th style={{ padding: '16px 12px', fontSize: '0.85rem' }}>Fecha de Registro</th>
                <th style={{ padding: '16px 12px', fontSize: '0.85rem', width: '220px' }}>Progreso del Curso</th>
                <th style={{ padding: '16px 12px', fontSize: '0.85rem', width: '150px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--isn-muted)', fontSize: '0.95rem' }}>
                    No hay estudiantes registrados.
                  </td>
                </tr>
              ) : (
                adminUsers.map((student: any) => (
                  <tr 
                    key={student.cedula}
                    style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background-color 0.15s' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '16px 12px', fontWeight: 600, fontSize: '0.95rem' }}>
                      {decodeMojibake(student.nombre_completo)}
                    </td>
                    <td style={{ padding: '16px 12px', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 600 }}>
                      {student.cedula}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '0.875rem' }}>
                      {student.fecha_registro}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="progress-container" style={{ flex: 1, height: '6px', background: '#E2E8F0' }}>
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${student.progreso_porcentaje}%`,
                              background: student.progreso_porcentaje === 100 ? 'var(--isn-success)' : 'var(--isn-blue)'
                            }} 
                          />
                        </div>
                        <span style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: 700, 
                          color: student.progreso_porcentaje === 100 ? 'var(--isn-success)' : 'var(--isn-charcoal)',
                          minWidth: '38px',
                          textAlign: 'right'
                        }}>
                          {student.progreso_porcentaje}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <button
                        onClick={() => handleOpenEditModal(student)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--isn-blue)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          padding: '6px 12px',
                          borderRadius: '6px',
                          transition: 'background-color 0.15s, color 0.15s'
                        }}
                        className="btn-edit-courses-hover"
                      >
                        <Edit size={14} />
                        <span>Editar Cursos</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matricula Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 25, 53, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-panel isn-border-gold-2 animate-scale-up" style={{
            width: '100%',
            maxWidth: '500px',
            background: '#FFFFFF',
            borderRadius: '20px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(7, 25, 53, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: '1px solid var(--border-glass)',
              background: '#FAFAFA'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={logoNormal} alt="ISN" style={{ width: '40px', height: 'auto' }} />
                <h3 className="font-serif" style={{ fontSize: '1.2rem', color: 'var(--isn-blue)', margin: 0 }}>
                  Matricular Nuevo Estudiante
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setLocalError('');
                  setSuccessMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--isn-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '50%'
                }}
                className="btn-secondary-hover"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              
              {/* Messages */}
              {localError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--isn-danger)',
                  fontSize: '0.875rem'
                }}>
                  <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                  <span>{localError}</span>
                </div>
              )}

              {successMessage && (
                <div style={{
                  background: 'rgba(22, 163, 74, 0.06)',
                  border: '1px solid rgba(22, 163, 74, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--isn-success)',
                  fontSize: '0.875rem'
                }}>
                  <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Name */}
              <div className="input-group">
                <label className="input-label" htmlFor="student-nombre">Nombre Completo</label>
                <input
                  className="input-field isn-input-focus"
                  type="text"
                  id="student-nombre"
                  placeholder="Ej. Andrés Nariño"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Cedula */}
              <div className="input-group">
                <label className="input-label" htmlFor="student-cedula">Cédula (Usuario)</label>
                <input
                  className="input-field isn-input-focus"
                  type="text"
                  id="student-cedula"
                  placeholder="Ej. 102938475"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <label className="input-label" htmlFor="student-password">Contraseña Temporal</label>
                <input
                  className="input-field isn-input-focus"
                  type="password"
                  id="student-password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Courses Checklist */}
              <div style={{ marginBottom: '28px' }}>
                <label className="input-label">Cursos a Matricular</label>
                <div style={{ 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  background: '#F8F9FA',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {courses.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--isn-muted)' }}>Cargando cursos...</p>
                  ) : (
                    courses.map((course: any) => (
                      <label 
                        key={course.id}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '10px', 
                          fontSize: '0.9rem', 
                          color: 'var(--isn-charcoal)',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{ marginTop: '4px', cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--isn-blue)' }}
                          checked={selectedCourses.includes(course.id.toString())}
                          onChange={() => handleCheckboxChange(course.id)}
                          disabled={submitting}
                        />
                        <div>
                          <span style={{ color: 'var(--isn-blue)' }}>{course.titulo}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--isn-muted)', fontWeight: 400, marginTop: '2px' }}>
                            {course.descripcion}
                          </span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setLocalError('');
                    setSuccessMessage('');
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, background: 'var(--isn-blue)', color: '#FFFFFF' }}
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Matricular'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Courses Modal */}
      {isEditModalOpen && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 25, 53, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-panel isn-border-gold-2 animate-scale-up" style={{
            width: '100%',
            maxWidth: '500px',
            background: '#FFFFFF',
            borderRadius: '20px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(7, 25, 53, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: '1px solid var(--border-glass)',
              background: '#FAFAFA'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={logoNormal} alt="ISN" style={{ width: '40px', height: 'auto' }} />
                <h3 className="font-serif" style={{ fontSize: '1.2rem', color: 'var(--isn-blue)', margin: 0 }}>
                  Gestionar Matrículas
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedStudent(null);
                  setEditError('');
                  setEditSuccessMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--isn-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '50%'
                }}
                className="btn-secondary-hover"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleEditSubmit} style={{ padding: '24px' }}>
              
              {/* Student Info Box */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--isn-muted)', fontWeight: 600 }}>Estudiante:</p>
                <h4 className="font-serif" style={{ margin: '4px 0 2px 0', fontSize: '1.1rem', color: 'var(--isn-blue)' }}>
                  {decodeMojibake(selectedStudent.nombre_completo)}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--isn-charcoal)', fontFamily: 'monospace' }}>
                  Cédula: {selectedStudent.cedula}
                </p>
              </div>

              {/* Messages */}
              {editError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--isn-danger)',
                  fontSize: '0.875rem'
                }}>
                  <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccessMessage && (
                <div style={{
                  background: 'rgba(22, 163, 74, 0.06)',
                  border: '1px solid rgba(22, 163, 74, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--isn-success)',
                  fontSize: '0.875rem'
                }}>
                  <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                  <span>{editSuccessMessage}</span>
                </div>
              )}

              {/* Courses Checklist */}
              <div style={{ marginBottom: '28px' }}>
                <label className="input-label">Cursos Asignados</label>
                <div style={{ 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  background: '#F8F9FA',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: '240px',
                  overflowY: 'auto'
                }}>
                  {(!coursesList || coursesList.length === 0) ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--isn-muted)' }}>Cargando cursos disponibles...</p>
                  ) : (
                    coursesList.map((course: any) => (
                      <label 
                        key={course.id}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '10px', 
                          fontSize: '0.9rem', 
                          color: 'var(--isn-charcoal)',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{ marginTop: '4px', cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--isn-blue)' }}
                          checked={editSelectedCourses.includes(course.id.toString())}
                          onChange={() => handleEditCheckboxChange(course.id)}
                          disabled={editSubmitting}
                        />
                        <div>
                          <span style={{ color: 'var(--isn-blue)' }}>{course.titulo}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedStudent(null);
                    setEditError('');
                    setEditSuccessMessage('');
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={editSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, background: 'var(--isn-blue)', color: '#FFFFFF' }}
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Simple Inline Keyframe Definitions for Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .table-row-hover:hover {
          background-color: #F8FAFC !important;
        }
        .btn-secondary-hover:hover {
          background-color: #F1F5F9;
        }
        .btn-edit-courses-hover:hover {
          background-color: rgba(15, 44, 89, 0.08) !important;
          color: var(--isn-blue) !important;
        }
        .animate-scale-up {
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      
    </div>
  );
};

export default AdminDashboard;
