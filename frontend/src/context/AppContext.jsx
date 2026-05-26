import React, { createContext, useState, useEffect } from 'react';

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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentView, setCurrentView] = useState('login');
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({ progreso_porcentaje: 0, modulos_completados: [] });
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [examStatus, setExamStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Admin Panel states
  const [adminMetrics, setAdminMetrics] = useState({ usuarios_activos: 0, cursos_completados: 0, cursos_pendientes: 0 });
  const [adminUsers, setAdminUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  // Auto-redirect if token exists
  useEffect(() => {
    if (token) {
      // Decode user from JWT (simple payload extract)
      try {
        const payload = decodeJWTPayload(token);
        if (payload) {
          setUser({
            cedula: payload.cedula,
            nombre_completo: payload.nombre_completo,
            rol: payload.rol
          });
          if (payload.rol === 'administrador') {
            setCurrentView('admin_dashboard');
          } else {
            setCurrentView('dashboard');
          }
        } else {
          logout();
        }
      } catch (e) {
        logout();
      }
    }
  }, [token]);

  // Load modules and progress when authenticated
  useEffect(() => {
    if (token && user && user.rol === 'estudiante') {
      fetchCourseContent();
      fetchProgress();
      fetchExamStatus();
    }
  }, [token, user]);

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
    setError(null);
    setCurrentView('login');
  };

  const fetchCourseContent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/course/content`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (err) {
      console.error('Error fetching course content:', err);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/course/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const fetchExamStatus = async () => {
    // We can deduce exam status from a backend call, but we can also use our API endpoint if needed.
    // Let's implement an endpoint check or do it during submit.
    // For KISS, we can submit and get status, or fetch progress which could include exam details,
    // or let's query a user's cert if they approved.
    try {
      // In the backend, we verify if a cert is generated
      const response = await fetch(`${API_BASE_URL}/certificate/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // If response is 200, the student approved. If 400, they haven't yet or failed.
      if (response.status === 200) {
        setExamStatus({ aprobado: true });
      } else {
        setExamStatus(null);
      }
    } catch (err) {
      console.error('Error checking exam status:', err);
    }
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
        body: JSON.stringify({ respuestas })
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
      const response = await fetch(`${API_BASE_URL}/certificate/download`, {
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
      a.download = `Certificado_Manipulacion_Alimentos_${user.cedula}.pdf`;
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

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
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
      fetchAdminMetrics,
      fetchAdminUsers,
      fetchCourses,
      createStudentUser,
      API_BASE_URL
    }}>
      {children}
    </AppContext.Provider>
  );
};
