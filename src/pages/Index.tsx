
import { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticated = localStorage.getItem('julia_authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('julia_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('julia_authenticated');
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
};

export default Index;
