import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

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

  // Auto-redirect if token exists
  useEffect(() => {
    if (token) {
      // Decode user from JWT (simple payload extract)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          cedula: payload.cedula,
          nombre_completo: payload.nombre_completo,
          rol: payload.rol
        });
        setCurrentView('dashboard');
      } catch (e) {
        logout();
      }
    }
  }, [token]);

  // Load modules and progress when authenticated
  useEffect(() => {
    if (token && user) {
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
      setCurrentView('dashboard');
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
      API_BASE_URL
    }}>
      {children}
    </AppContext.Provider>
  );
};
