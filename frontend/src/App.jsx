import React, { useContext, useState, useEffect } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Dashboard from './components/Dashboard';
import CourseViewer from './components/CourseViewer';
import Exam from './components/Exam';
import Certificate from './components/Certificate';
import VerifyCertificate from './components/VerifyCertificate';
import logoHorizontal from './assets/logoHorizontal.png';
import { LogOut, Home, ShieldCheck, Award } from 'lucide-react';

const decodeMojibake = (str) => {
  if (!str) return str;
  try {
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    if (!decoded.includes('\uFFFD')) {
      return decoded;
    }
  } catch (e) {}

  const map = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã±': 'ñ', 'Ã‘': 'Ñ', 'Ã ': 'Á', 'Ã': 'É', 'Ã ': 'Í',
    'Ã“': 'Ó', 'Ãš': 'Ú', 'Ã¼': 'ü', 'Ãœ': 'Ü'
  };
  let result = str;
  for (const [mojibake, correct] of Object.entries(map)) {
    result = result.replaceAll(mojibake, correct);
  }
  return result;
};

function MainLayout() {
  const { user, currentView, setCurrentView, logout, progress } = useContext(AppContext);
  const [verifyCode, setVerifyCode] = useState('');

  // Handle URL hash changes for public verification link auto-routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#verify=')) {
        const code = hash.substring(8);
        setVerifyCode(code);
        setCurrentView('verify');
      } else if (hash === '#admin') {
        setCurrentView('admin_login');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setCurrentView]);

  // Route Guards & Protection
  useEffect(() => {
    if (currentView === 'admin_dashboard') {
      if (!user) {
        setCurrentView('admin_login');
      } else if (user.rol !== 'administrador') {
        setCurrentView('dashboard');
      }
    } else if (currentView === 'dashboard') {
      if (user && user.rol === 'administrador') {
        setCurrentView('admin_dashboard');
      }
    }
  }, [currentView, user, setCurrentView]);

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login />;
      case 'admin_login':
        return <AdminLogin />;
      case 'admin_dashboard':
        return <AdminDashboard />;
      case 'dashboard':
        return <Dashboard />;
      case 'course':
        return <CourseViewer />;
      case 'exam':
        return <Exam />;
      case 'certificate':
        return <Certificate />;
      case 'verify':
        return <VerifyCertificate initialCode={verifyCode} />;
      default:
        return <Login />;
    }
  };

  return (
    <div className="app-container">
      {/* Premium Navbar */}
      <nav className="glass-panel navbar" style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-glass)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
          onClick={() => setCurrentView(user ? (user.rol === 'administrador' ? 'admin_dashboard' : 'dashboard') : 'login')}
        >
          <img src={logoHorizontal} alt="AlimSafe" style={{ height: '38px', width: 'auto' }} />
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setCurrentView(user.rol === 'administrador' ? 'admin_dashboard' : 'dashboard')}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem', height: '38px' }}
            >
              <Home size={16} />
              <span className="hide-mobile">Panel</span>
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>{decodeMojibake(user.nombre_completo)}</span>
              {user.rol === 'administrador' ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Administrador</span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{progress.progreso_porcentaje}% Completado</span>
              )}
            </div>

            <button
              onClick={logout}
              className="btn btn-danger"
              style={{ padding: '8px 14px', fontSize: '0.85rem', height: '38px' }}
            >
              <LogOut size={16} />
              <span className="hide-mobile">Salir</span>
            </button>
          </div>
        ) : (
          currentView !== 'verify' && (
            <button
              onClick={() => setCurrentView('verify')}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', height: '38px' }}
            >
              <ShieldCheck size={16} />
              <span>Verificar Certificado</span>
            </button>
          )
        )}
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '40px' }}>
        {renderView()}
      </main>

      {/* Premium Footer */}
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
        <p>© 2026 AlimSafe. Todos los derechos reservados.</p>
        <p style={{ fontWeight: 500 }}>Acreditación y Certificación en Manipulación Higiénica de Alimentos.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
