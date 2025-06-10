
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Plus, Pencil, Wallet } from 'lucide-react';
import CalendarModule from './modules/CalendarModule';
import NotesModule from './modules/NotesModule';
import HabitsModule from './modules/HabitsModule';
import ActionPlanModule from './modules/ActionPlanModule';
import NotebookModule from './modules/NotebookModule';

interface DashboardProps {
  onLogout: () => void;
}

type Module = 'home' | 'calendar' | 'notes' | 'habits' | 'actionPlan' | 'notebook';

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeModule, setActiveModule] = useState<Module>('home');

  const modules = [
    { id: 'calendar' as Module, name: 'Calendário', icon: Calendar, color: 'bg-purple-500', description: 'Organize suas datas importantes' },
    { id: 'notes' as Module, name: 'Notas', icon: Pencil, color: 'bg-purple-600', description: 'Anotações rápidas do dia a dia' },
    { id: 'habits' as Module, name: 'Hábitos', icon: Clock, color: 'bg-purple-700', description: 'Construa rotinas saudáveis' },
    { id: 'actionPlan' as Module, name: 'Plano de Ação', icon: Plus, color: 'bg-purple-800', description: 'Organize seus projetos e tarefas' },
    { id: 'notebook' as Module, name: 'Caderno', icon: Wallet, color: 'bg-purple-900', description: 'Seu espaço pessoal para escrever' },
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
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-purple-800 mb-4">
                Olá, Júlia! ✨
              </h1>
              <p className="text-lg text-purple-600 mb-8">
                Pronta para mais um dia produtivo?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <Card
                  key={module.id}
                  className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-purple-100 bg-white/50 backdrop-blur-sm"
                  onClick={() => setActiveModule(module.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`${module.color} p-4 rounded-full text-white`}>
                      <module.icon size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-purple-800">
                      {module.name}
                    </h3>
                    <p className="text-purple-600 text-sm">
                      {module.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Card className="p-6 bg-gradient-to-r from-purple-100 to-purple-50 border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  💡 Dica do Dia
                </h3>
                <p className="text-purple-700">
                  Comece seu dia organizando 3 tarefas prioritárias. Pequenos passos levam a grandes conquistas!
                </p>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-purple-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-bold text-purple-800 cursor-pointer"
              onClick={() => setActiveModule('home')}
            >
              Júlia Pena
            </h1>
            {activeModule !== 'home' && (
              <span className="text-purple-600">
                / {modules.find(m => m.id === activeModule)?.name}
              </span>
            )}
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderModule()}
      </main>
    </div>
  );
};

export default Dashboard;
