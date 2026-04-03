import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import TestPage from './pages/Test';
import EvaluationSession from './pages/EvaluationSession';

// Admin imports
import AdminGate from './pages/admin/AdminGate';
import Dashboard from './pages/admin/Dashboard';
import RuleEditor from './pages/admin/RuleEditor';
import TokenManager from './pages/admin/TokenManager';

import './index.css';

function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <Header />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

function IsolatedLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas con Cabecera y Navegación Normal */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<TestPage />} />
          
          {/* Admin Routes with PIN Gate */}
          <Route path="/admin" element={<AdminGate />}>
            <Route index element={<Dashboard />} />
            <Route path="rules" element={<RuleEditor />} />
            <Route path="tokens" element={<TokenManager />} />
          </Route>
        </Route>

        {/* Ruta AISLADA: Sin acceso al Dashboard ni botón Atrás */}
        <Route element={<IsolatedLayout />}>
          <Route path="/e/:token" element={<EvaluationSession />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
