import React, { useContext, useEffect } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CreateCourseScreen from './components/CreateCourseScreen';
import Dashboard from './components/Dashboard';
import CourseViewer from './components/CourseViewer';
import Exam from './components/Exam';
import Certificate from './components/Certificate';
import VerifyCertificate from './components/VerifyCertificate';
import HomePage from './components/HomePage';
import logoHorizontal from './assets/logo instituto superior del norte.webp';
import { LogOut, Home, ShieldCheck, Award } from 'lucide-react';

import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';


function VerifyRouteWrapper() {
  const { code } = useParams();
  return <VerifyCertificate initialCode={code} />;
}

// Syncs the URL :courseId param into AppContext.activeCourseId.
// This is the ONLY place that reads the URL to update state (one-way: URL → state).
function CourseRouteWrapper({ children }) {
  const { courseId } = useParams();
  const { activeCourseId, setActiveCourseId } = useContext(AppContext);

  useEffect(() => {
    if (courseId) {
      const parsedId = parseInt(courseId);
      if (activeCourseId !== parsedId) {
        setActiveCourseId(parsedId);
      }
    }
  }, [courseId, activeCourseId, setActiveCourseId]);

  return children;
}

function MainLayout() {
  const { user, token, logout, progress } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL hash for public verification links and admin deep-link
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#verify=')) {
        const code = hash.substring(8);
        navigate(`/verify/${code}`);
      } else if (hash === '#admin') {
        navigate('/admin/login');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash.startsWith('#verify=')) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigate]);

  // FIX: Auth guard uses PRIMITIVE deps (user?.cedula, user?.rol) instead of
  // the full `user` object to avoid stale-closure re-runs on every render.
  // Also removed the currentView<->URL bidirectional sync effects entirely.
  // React Router (navigate()) is now the single source of truth for navigation.
  useEffect(() => {
    const publicPaths = ['/verify', '/'];
    const isPublicPath = location.pathname === '/' || publicPaths.some(path => path !== '/' && location.pathname.startsWith(path));

    if (!token && !isPublicPath && location.pathname !== '/admin/login' && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (token && user?.cedula) {
      if (user.rol === 'administrador') {
        if (location.pathname === '/login' || location.pathname === '/admin/login' || location.pathname === '/') {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        if (location.pathname === '/login' || location.pathname === '/admin/login' || location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [token, user?.cedula, user?.rol, location.pathname, navigate]);

  const isLandingPage = location.pathname === '/';

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--isn-bg-light)' }}>
      {/* Premium Navbar */}
      {!isLandingPage && (
        <nav className="glass-panel navbar" style={{ background: '#FFFFFF', borderBottom: '2px solid var(--isn-gold)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => {
              if (user) {
                navigate(user.rol === 'administrador' ? '/admin/dashboard' : '/dashboard');
              } else {
                navigate('/');
              }
            }}
          >
            <img src={logoHorizontal} alt="Instituto Superior del Norte" style={{ height: '38px', width: 'auto' }} />
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigate(user.rol === 'administrador' ? '/admin/dashboard' : '/dashboard')}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem', height: '38px' }}
              >
                <Home size={16} />
                <span className="hide-mobile">Panel</span>
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>{user.nombre_completo}</span>
                {user.rol === 'administrador' ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Administrador</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{progress.progreso_porcentaje}% Completado</span>
                )}
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn btn-danger"
                style={{ padding: '8px 14px', fontSize: '0.85rem', height: '38px' }}
              >
                <LogOut size={16} />
                <span className="hide-mobile">Salir</span>
              </button>
            </div>
          ) : (
            !location.pathname.startsWith('/verify') && (
              <button
                onClick={() => navigate('/verify')}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem', height: '38px' }}
              >
                <ShieldCheck size={16} />
                <span>Verificar Certificado</span>
              </button>
            )
          )}
        </nav>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: isLandingPage ? '0px' : '40px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/create-course" element={<CreateCourseScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:courseId" element={<CourseRouteWrapper><CourseViewer /></CourseRouteWrapper>} />
          <Route path="/course/:courseId/exam" element={<CourseRouteWrapper><Exam /></CourseRouteWrapper>} />
          <Route path="/certificate/:courseId" element={<CourseRouteWrapper><Certificate /></CourseRouteWrapper>} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/:code" element={<VerifyRouteWrapper />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Premium Footer */}
      {!isLandingPage && (
        <footer style={{
          marginTop: 'auto',
          padding: '24px 0',
          borderTop: '1px solid var(--border-glass)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <p>© 2026 Instituto Superior del Norte. Todos los derechos reservados.</p>
          <p style={{ fontWeight: 500 }}>Acreditación y Certificación del Instituto Superior del Norte.</p>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <MainLayout />
      </HashRouter>
    </AppProvider>
  );
}

export default App;
