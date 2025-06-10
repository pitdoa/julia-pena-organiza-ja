
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import CalendarModule from './modules/CalendarModule';
import NotesModule from './modules/NotesModule';
import HabitsModule from './modules/HabitsModule';
import ActionPlanModule from './modules/ActionPlanModule';
import NotebookModule from './modules/NotebookModule';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardProps {
  onLogout: () => void;
}

type Module = 'home' | 'calendar' | 'notes' | 'habits' | 'actionPlan' | 'notebook';

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeModule, setActiveModule] = useState<Module>('home');
  const { t } = useLanguage();

  const modules = [
    { id: 'calendar' as Module, name: t('modules.calendar'), description: t('modules.calendar.desc') },
    { id: 'notes' as Module, name: t('modules.notes'), description: t('modules.notes.desc') },
    { id: 'habits' as Module, name: t('modules.habits'), description: t('modules.habits.desc') },
    { id: 'actionPlan' as Module, name: t('modules.actionPlan'), description: t('modules.actionPlan.desc') },
    { id: 'notebook' as Module, name: t('modules.notebook'), description: t('modules.notebook.desc') },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'calendar':
        return <CalendarModule onBack={() => setActiveModule('home')} />;
      case 'notes':
        return <NotesModule onBack={() => setActiveModule('home')} />;
      case 'habits':
        return <HabitsModule onBack={() => setActiveModule('home')} />;
      case 'actionPlan':
        return <ActionPlanModule onBack={() => setActiveModule('home')} />;
      case 'notebook':
        return <NotebookModule onBack={() => setActiveModule('home')} />;
      default:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-bold mb-4">
                JP
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {t('dashboard.welcome')}
              </h1>
              <p className="text-xl text-muted-foreground max-w-md mx-auto">
                {t('dashboard.ready')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {modules.map((module, index) => (
                <Card
                  key={module.id}
                  className="group p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border bg-card/50 backdrop-blur-sm hover:bg-card/80"
                  onClick={() => setActiveModule(module.id)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
                      <span className="text-lg font-semibold">{module.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {t('dashboard.tipOfDay')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('dashboard.tip')}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          onLogout={onLogout}
        />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Julia Pena</span>
              {activeModule !== 'home' && (
                <>
                  <span>/</span>
                  <span className="text-foreground">
                    {modules.find(m => m.id === activeModule)?.name || 'Home'}
                  </span>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 p-6">
            {renderModule()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
