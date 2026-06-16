import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

export const AppContext = createContext<any>(null);

const API_BASE_URL = 'http://localhost:5000/api';

const decodeJWTPayload = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT payload:', e);
    return null;
  }
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);

  // Lazy init: decode user from stored token once, synchronously.
  const [user, setUser] = useState<any>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const payload = decodeJWTPayload(savedToken);
      if (payload) {
        return {
          cedula: payload.cedula,
          nombre_completo: payload.nombre_completo,
          rol: payload.rol
        };
      }
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<string>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const payload = decodeJWTPayload(savedToken);
      if (payload) {
        return payload.rol === 'administrador' ? 'admin_dashboard' : 'dashboard';
      }
    }
    return 'login';
  });

  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({ progreso_porcentaje: 0, modulos_completados: [] });
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [examStatus, setExamStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Course and Module states
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [studentCourses, setStudentCourses] = useState<any[]>([]);

  // Admin Panel states
  const [adminMetrics, setAdminMetrics] = useState<any>({ usuarios_activos: 0, cursos_completados: 0, cursos_pendientes: 0 });
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);

  const fetchStudentCourses = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/student/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudentCourses(data);
        // Only auto-set activeCourseId if it hasn't been set yet
        setActiveCourseId(prev => (data.length > 0 && !prev) ? data[0].id : prev);
      }
    } catch (err) {
      console.error('Error fetching student courses:', err);
    }
  }, [token]);

  const fetchCourseContent = useCallback(async (courseId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/course/content?courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (err) {
      console.error('Error fetching course content:', err);
    }
  }, [token]);

  const fetchProgress = useCallback(async (courseId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/course/progress?courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  }, [token]);

  const fetchExamStatus = useCallback(async (courseId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/certificate/detail?courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExamStatus({ aprobado: true, score: data.calificacion_obtenida, intentos: data.intentos || 1 });
      } else {
        setExamStatus(null);
      }
    } catch (err) {
      console.error('Error checking exam status:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token && user?.cedula && user?.rol === 'estudiante') {
      fetchStudentCourses();
    }
  }, [token, user?.cedula, user?.rol, fetchStudentCourses]);

  useEffect(() => {
    if (token && user?.cedula && user?.rol === 'estudiante' && activeCourseId) {
      fetchCourseContent(activeCourseId);
      fetchProgress(activeCourseId);
      fetchExamStatus(activeCourseId);
    }
  }, [token, user?.cedula, user?.rol, activeCourseId, fetchCourseContent, fetchProgress, fetchExamStatus]);

  const login = async (cedula: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.user.rol === 'administrador') {
        setCurrentView('admin_dashboard');
      } else {
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setModules([]);
    setProgress({ progreso_porcentaje: 0, modulos_completados: [] });
    setActiveModuleId(null);
    setExamStatus(null);
    setAdminMetrics({ usuarios_activos: 0, cursos_completados: 0, cursos_pendientes: 0 });
    setAdminUsers([]);
    setCourses([]);
    setStudentCourses([]);
    setActiveCourseId(null);
    setError(null);
    setCurrentView('login');
  };

  const completeModule = async (moduloId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/course/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ modulo_id: moduloId })
      });
      if (response.ok) {
        const data = await response.json();
        setProgress({
          progreso_porcentaje: data.progreso_porcentaje,
          modulos_completados: data.modulos_completados
        });
        await fetchStudentCourses();
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const submitExam = async (respuestas: Record<number, string>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/exam/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ respuestas, courseId: activeCourseId })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar examen');
      }

      if (data.aprobado) {
        setExamStatus({ aprobado: true, score: data.puntaje, intentos: data.intentos });
      } else {
        setExamStatus({ aprobado: false, score: data.puntaje, intentos: data.intentos });
      }
      await fetchStudentCourses();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/certificate/download?courseId=${activeCourseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo descargar el certificado');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const currentCourse = studentCourses.find(c => c.id === activeCourseId);
      const filename = currentCourse
        ? `Certificado_${currentCourse.titulo.replace(/\s+/g, '_')}_${user.cedula}.pdf`
        : `Certificado_${user.cedula}.pdf`;
      a.target = '_blank';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchAdminMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminMetrics(data);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    }
  };

  const fetchAdminUsers = async (cedula: string = '') => {
    try {
      const url = cedula
        ? `${API_BASE_URL}/admin/users?cedula=${cedula}`
        : `${API_BASE_URL}/admin/users`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const createStudentUser = async (studentData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear estudiante');
      }
      await fetchAdminMetrics();
      await fetchAdminUsers();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCoursesList(data);
        return data;
      }
    } catch (err) {
      console.error('Error fetching courses list:', err);
    }
  };

  const updateStudentCourses = async (cedula: string, courseIds: number[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${cedula}/courses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cursos: courseIds })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar cursos del estudiante');
      }
      await fetchAdminMetrics();
      await fetchAdminUsers();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      currentView,
      setCurrentView,
      modules,
      progress,
      activeModuleId,
      setActiveModuleId,
      examStatus,
      setExamStatus,
      activeCourseId,
      setActiveCourseId,
      studentCourses,
      setStudentCourses,
      fetchStudentCourses,
      loading,
      error,
      login,
      logout,
      completeModule,
      submitExam,
      downloadCertificate,
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
      API_BASE_URL
    }}>
      {children}
    </AppContext.Provider>
  );
};
