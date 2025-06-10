
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LoginForm from '../components/LoginForm';
import Dashboard from '../components/Dashboard';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        {!isAuthenticated ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <Dashboard onLogout={handleLogout} />
        )}
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default Index;
