// Em: src/components/Dashboard.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import CalendarModule from './modules/CalendarModule';
import NotesModule from './modules/NotesModule';
import HabitsModule from './modules/HabitsModule';
import ActionPlanModule from './modules/ActionPlanModule';
import NotebookModule from './modules/NotebookModule';
import JujuModule from './modules/JujuModule';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChatInterface, Message } from './modules/aichat/ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookText, Calendar, CheckCircle, ClipboardList, Repeat, BookOpen, Sparkles, StickyNote, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardProps { onLogout: () => void; }
type Module = 'home' | 'calendar' | 'notes' | 'habits' | 'actionPlan' | 'notebook' | 'juju';

const StatCard = ({ icon, title, value, footer, isLoading }: { icon: React.ReactNode, title: string, value: string | number, footer: string, isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
            <p className="text-xs text-muted-foreground">{footer}</p>
        </CardContent>
    </Card>
);

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeModule, setActiveModule] = useState<Module>('home');
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({ habitsCompleted: 0, totalHabits: 6, activeTasks: 0, currentBook: null as { title: string } | null });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchDashboardData = async () => {
        setIsStatsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsStatsLoading(false); return; }

        const today = new Date().toISOString().split('T')[0];
        
        // CORREÇÃO 1: Lógica de Hábitos
        const { data: habits } = await supabase.from('daily_habits').select('tomou_creatina,leu_biblia,tomou_whey,treinou,rezou,estudou').eq('user_id', user.id).eq('date', today).maybeSingle();
        let completedHabits = 0;
        if (habits) {
            completedHabits = Object.values(habits).filter(value => value === true).length;
        }

        // CORREÇÃO 2: Lógica de Tarefas
        const { count: tasksCount } = await supabase.from('kanban_tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['começou', 'em_processo']);

        // CORREÇÃO 3: Lógica de Leitura
        const { data: book } = await supabase.from('reading_list').select('title').eq('user_id', user.id).eq('status', 'lendo').limit(1).maybeSingle();

        setDashboardStats({ habitsCompleted, totalHabits: 6, activeTasks: tasksCount || 0, currentBook: book });
        setIsStatsLoading(false);
    };

    if (activeModule === 'home') {
        fetchDashboardData();
    }
  }, [activeModule]);

  const handleLiveSend = async (messageText: string) => { /* ... sua função handleLiveSend existente ... */ };

  const modules = [
    { id: 'calendar' as Module, name: "Calendário", icon: Calendar, color: "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400" },
    { id: 'notes' as Module, name: "Notas", icon: StickyNote, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400" },
    { id: 'habits' as Module, name: "Hábitos", icon: Repeat, color: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" },
    { id: 'actionPlan' as Module, name: "Plano de Ação", icon: ClipboardList, color: "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" },
    { id: 'notebook' as Module, name: "Caderno", icon: BookText, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" },
    { id: 'juju' as Module, name: "Histórico Juju", icon: Sparkles, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400" },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'calendar': return <CalendarModule onBack={() => setActiveModule('home')} />;
      case 'notes': return <NotesModule onBack={() => setActiveModule('home')} />;
      case 'habits': return <HabitsModule onBack={() => setActiveModule('home')} />;
      case 'actionPlan': return <ActionPlanModule onBack={() => setActiveModule('home')} />;
      case 'notebook': return <NotebookModule onBack={() => setActiveModule('home')} />;
      case 'juju': return <JujuModule onBack={() => setActiveModule('home')} />;
      default:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bom dia, Júlia! ✨</h1>
              <p className="text-muted-foreground">Aqui está um resumo do seu progresso hoje.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} title="Hábitos de Hoje" value={`${dashboardStats.habitsCompleted} de ${dashboardStats.totalHabits}`} footer="Continue assim!" isLoading={isStatsLoading} />
              <StatCard icon={<Target className="h-4 w-4 text-muted-foreground" />} title="Tarefas Ativas" value={dashboardStats.activeTasks} footer="Foco nos objetivos!" isLoading={isStatsLoading} />
              <StatCard icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} title="Leitura Atual" value={dashboardStats.currentBook?.title || "Nenhuma"} footer="Um capítulo por dia." isLoading={isStatsLoading} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-1 h-[500px] flex flex-col"><div className="p-4 border-b"><h3 className="font-semibold">Converse com a Juju</h3></div><ChatInterface messages={liveMessages} onSendMessage={handleLiveSend} isLoading={isLoading} /></Card>
                
                {/* MELHORIA VISUAL: Módulos com ícones */}
                <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modules.map((module) => (
                    <Card key={module.id} className="group p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveModule(module.id)}>
                      <div className={`p-3 rounded-full ${module.color} mb-3`}>
                        <module.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-md font-semibold">{module.name}</h3>
                    </Card>
                  ))}
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeModule={activeModule} onModuleChange={setActiveModule} onLogout={onLogout} />
        <SidebarInset className="flex-1 relative">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4"><SidebarTrigger className="-ml-1" /><div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Julia Pena</span>{activeModule !== 'home' && (<><span>/</span><span className="text-foreground">{modules.find(m => m.id === activeModule)?.name || 'Home'}</span></>)}</div></header>
          <main className="flex-1 p-6">{renderModule()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;