
import React, { createContext, useContext, useState } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Auth
    'auth.title': 'Júlia Pena',
    'auth.subtitle': 'Seja Bem-Vinda meu amor! Seu sistema de organização pessoal feito por Kauan',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.login': 'Entrar',
    'auth.signup': 'Criar Conta',
    'auth.creating': 'Criando conta...',
    'auth.logging': 'Entrando...',
    'auth.hasAccount': 'Já tem conta? Faça login',
    'auth.noAccount': 'Não tem conta? Crie uma',
    'auth.description': 'Sistema personalizado para organização e estudos',
    'auth.welcomeBack': 'Bem-vinda de volta, Júlia!',
    'auth.accountCreated': 'Conta criada com sucesso!',
    'auth.welcomeMessage': 'Bem-vinda ao seu sistema de organização pessoal ✨',
    'auth.loginSuccess': 'Login realizado com sucesso ✨',
    
    // Dashboard
    'dashboard.welcome': 'Olá, Júlia! ✨',
    'dashboard.ready': 'Pronta para mais um dia produtivo?',
    'dashboard.tipOfDay': '💡 Dica do Dia',
    'dashboard.tip': 'Comece seu dia organizando 3 tarefas prioritárias. Pequenos passos levam a grandes conquistas!',
    'dashboard.logout': 'Sair',
    
    // Modules
    'modules.calendar': 'Calendário',
    'modules.calendar.desc': 'Organize suas datas importantes',
    'modules.notes': 'Notas',
    'modules.notes.desc': 'Anotações rápidas do dia a dia',
    'modules.habits': 'Hábitos',
    'modules.habits.desc': 'Construa rotinas saudáveis',
    'modules.actionPlan': 'Plano de Ação',
    'modules.actionPlan.desc': 'Organize seus projetos e tarefas',
    'modules.notebook': 'Caderno',
    'modules.notebook.desc': 'Seu espaço pessoal para escrever',
    
    // Common
    'common.loading': 'Carregando...',
    'common.back': 'Voltar',
  },
  en: {
    // Auth
    'auth.title': 'Julia Pena',
    'auth.subtitle': 'Your personal organization system',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login': 'Sign In',
    'auth.signup': 'Create Account',
    'auth.creating': 'Creating account...',
    'auth.logging': 'Signing in...',
    'auth.hasAccount': 'Already have an account? Sign in',
    'auth.noAccount': 'Don\'t have an account? Create one',
    'auth.description': 'Custom system for organization and studies',
    'auth.welcomeBack': 'Welcome back, Julia!',
    'auth.accountCreated': 'Account created successfully!',
    'auth.welcomeMessage': 'Welcome to your personal organization system ✨',
    'auth.loginSuccess': 'Login successful ✨',
    
    // Dashboard
    'dashboard.welcome': 'Hello, Julia! ✨',
    'dashboard.ready': 'Ready for another productive day?',
    'dashboard.tipOfDay': '💡 Tip of the Day',
    'dashboard.tip': 'Start your day by organizing 3 priority tasks. Small steps lead to great achievements!',
    'dashboard.logout': 'Sign Out',
    
    // Modules
    'modules.calendar': 'Calendar',
    'modules.calendar.desc': 'Organize your important dates',
    'modules.notes': 'Notes',
    'modules.notes.desc': 'Quick daily notes',
    'modules.habits': 'Habits',
    'modules.habits.desc': 'Build healthy routines',
    'modules.actionPlan': 'Action Plan',
    'modules.actionPlan.desc': 'Organize your projects and tasks',
    'modules.notebook': 'Notebook',
    'modules.notebook.desc': 'Your personal writing space',
    
    // Common
    'common.loading': 'Loading...',
    'common.back': 'Back',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['pt']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
