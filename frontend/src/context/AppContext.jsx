import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AppContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

const decodeJWTPayload = (token) => {
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

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Lazy init: decode user from stored token once, synchronously.
  // This avoids the setUser(newObject) effect that causes re-render loops.
  const [user, setUser] = useState(() => {
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

  // currentView is kept for backward compatibility with components that
  // still reference it, but navigation is driven by React Router (navigate()).
  const [currentView, setCurrentView] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const payload = decodeJWTPayload(savedToken);
      if (payload) {
        return payload.rol === 'administrador' ? 'admin_dashboard' : 'dashboard';
      }
    }
    return 'login';
  });

  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({ progreso_porcentaje: 0, modulos_completados: [] });
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [examStatus, setExamStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic Course and Module states
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);

  // Admin Panel states
  const [adminMetrics, setAdminMetrics] = useState({ usuarios_activos: 0, cursos_completados: 0, cursos_pendientes: 0 });
  const [adminUsers, setAdminUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [coursesList, setCoursesList] = useState([]);

  // FIX: useCallback stabilizes fetchStudentCourses reference.
  // This prevents it from being a new function on every render.
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
  }, [token]); // token is a primitive (string | null) — safe as dep

  const fetchCourseContent = useCallback(async (courseId) => {
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

  const fetchProgress = useCallback(async (courseId) => {
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

  const fetchExamStatus = useCallback(async (courseId) => {
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

  // FIX: Use PRIMITIVE deps (user?.cedula, user?.rol) instead of the full
  // `user` object. Objects are compared by reference — a new object with the
  // same data still triggers the effect, causing the infinite loop.
  // NOTE: The redundant JWT-decode useEffect([token]) has been REMOVED.
  // user is initialized synchronously via lazy useState above.
  useEffect(() => {
    if (token && user?.cedula && user?.rol === 'estudiante') {
      fetchStudentCourses();
    }
  }, [token, user?.cedula, user?.rol, fetchStudentCourses]);

  // FIX: Same primitive-deps fix for course data loading.
  useEffect(() => {
    if (token && user?.cedula && user?.rol === 'estudiante' && activeCourseId) {
      fetchCourseContent(activeCourseId);
      fetchProgress(activeCourseId);
      fetchExamStatus(activeCourseId);
    }
  }, [token, user?.cedula, user?.rol, activeCourseId, fetchCourseContent, fetchProgress, fetchExamStatus]);

  const login = async (cedula, password) => {
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
    } catch (err) {
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

  const completeModule = async (moduloId) => {
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
        // Refresh student courses list to reflect updated progress percentage on dashboard
        await fetchStudentCourses();
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const submitExam = async (respuestas) => {
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

      // Update local exam status state
      if (data.aprobado) {
        setExamStatus({ aprobado: true, score: data.puntaje, intentos: data.intentos });
      } else {
        setExamStatus({ aprobado: false, score: data.puntaje, intentos: data.intentos });
      }
      // Reload enrolled courses to update progress/certificates
      await fetchStudentCourses();
      return data;
    } catch (err) {
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
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
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

  const fetchAdminUsers = async (cedula = '') => {
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

  const createStudentUser = async (studentData) => {
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
      // Reload metrics and users list dynamically
      await fetchAdminMetrics();
      await fetchAdminUsers();
      return data;
    } catch (err) {
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

  const updateStudentCourses = async (cedula, courseIds) => {
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
    } catch (err) {
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
