import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from './components/Toast';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Meals from './pages/Meals';
import Exercises from './pages/Exercises';
import Profile from './pages/Profile';
import Coach from './pages/Coach';
import Debug from './pages/Debug';
import Water from './pages/Water';

// Componentes
import Sidebar from './components/Sidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Sidebar />}
        <main className={`transition-all duration-300 ${isAuthenticated ? 'lg:ml-64' : ''}`}>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/meals" element={isAuthenticated ? <Meals /> : <Navigate to="/login" />} />
            <Route path="/exercises" element={isAuthenticated ? <Exercises /> : <Navigate to="/login" />} />
            <Route path="/water" element={isAuthenticated ? <Water /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/coach" element={isAuthenticated ? <Coach /> : <Navigate to="/login" />} />
            <Route path="/debug" element={<Debug />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
        
        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
