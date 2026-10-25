import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SuperMasterPanel from './pages/SuperMasterPanel';
import MasterDashboard from './pages/MasterDashboard';
import VentasTerminal from './pages/VentasTerminal';
import Cobranza from './pages/Cobranza';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública por defecto (Inicio de sesión) */}
        <Route path="/" element={<Login />} />
        
        {/* Rutas del Super Master */}
        <Route path="/super-master" element={<SuperMasterPanel />} />
        
        {/* Rutas del Master */}
        <Route path="/dashboard" element={<MasterDashboard />} />
        
        {/* Rutas de Operaciones (Vendedores y Master) */}
        <Route path="/terminal" element={<VentasTerminal />} />
        <Route path="/cobranza" element={<Cobranza />} />

        {/* Redirección de seguridad para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;