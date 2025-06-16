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
import { BookOpen, CheckSquare, Sparkles, BookText, Calendar, StickyNote, Repeat, ClipboardList, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns'; // 1. Importar a função 'format'

const InfoCard = ({ icon, title, children, isLoading }: { icon: React.ReactNode, title: string, children: React.ReactNode, isLoading: boolean }) => (
    <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent className="flex-grow">
            {isLoading ? <Skeleton className="h-10 w-full" /> : <div className="text-sm font-semibold">{children}</div>}
        </CardContent>
    </Card>
);

interface DashboardProps { onLogout: () => void; }
type Module = 'home' | 'calendar' | 'notes' | 'habits' | 'actionPlan' | 'notebook' | 'juju';

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeModule, setActiveModule] = useState<Module>('home');
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    todayEvents: [] as { title: string, event_time: string | null }[],
    pendingHabits: [] as string[],
    randomMessage: null as { message: string } | null,
  });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const isSameUTCDate = (d1: Date, d2: Date): boolean => d1.getUTCFullYear() === d2.getUTCFullYear() && d1.getUTCMonth() === d2.getUTCMonth() && d1.getUTCDate() === d2.getUTCDate();

  useEffect(() => {
    const fetchDashboardData = async () => {
        setIsDataLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsDataLoading(false); return; }

        // 2. AQUI ESTÁ A CORREÇÃO
        const todayISO = format(new Date(), 'yyyy-MM-dd');
        
        const [eventsResult, habitsResult, randomMsgResult, todayConvosResult] = await Promise.all([
            supabase.from('calendar_events').select('title, event_time').eq('user_id', user.id).eq('event_date', todayISO).order('event_time'),
            supabase.from('kanban_tasks').select('title, completed_at').eq('user_id', user.id).eq('repeats', true),
            supabase.rpc('get_random_juju_message'),
            supabase.from('juju_conversations').select('message, response').eq('user_id', user.id).gte('created_at', `${todayISO}T00:00:00.000Z`).lte('created_at', `${todayISO}T23:59:59.999Z`).order('created_at', { ascending: true })
        ]);

        const pendingHabitsList = habitsResult.data?.filter(h => !h.completed_at || !isSameUTCDate(new Date(h.completed_at), new Date())).map(h => h.title) || [];
        setDashboardData({ todayEvents: eventsResult.data || [], pendingHabits: pendingHabitsList, randomMessage: randomMsgResult.data ? randomMsgResult.data[0] : null });

        if (todayConvosResult.data) {
            const liveHistory = todayConvosResult.data.flatMap(d => { try { const p = JSON.parse(d.message); return [{isUser:true,text:p.text,imageUrl:p.imageUrl},{isUser:false,text:d.response}]} catch { return [{isUser:true,text:d.message},{isUser:false,text:d.response}]}});
            setLiveMessages(liveHistory);
        }
        setIsDataLoading(false);
    };
    if (activeModule === 'home') { fetchDashboardData(); }
  }, [activeModule]);
  
  const handleLiveSend = async (messageText: string, imageFile?: File) => {
    if ((!messageText.trim() && !imageFile) || isLoading) return;
    const userMessage: Message = { isUser: true, text: messageText };
    setLiveMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    let publicUrl: string | undefined = undefined;
    try {
      if (imageFile) {
        const sanitizedFileName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${Date.now()}_${sanitizedFileName}`;
        const { error: uploadError } = await supabase.storage.from('jujuimages').upload(fileName, imageFile);
        if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from('jujuimages').getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
        setLiveMessages(prev => prev.map(msg => msg === userMessage ? { ...msg, imageUrl: publicUrl } : msg));
      }
      const { data, error } = await supabase.functions.invoke('juju-ai', { body: { message: messageText, imageUrl: publicUrl } });
      if (error || data.error) throw new Error(error?.message || data.error);
      const correctedText = data.response.replace(/([.?!])\s{2,}/g, '$1 ');
      const aiResponse: Message = { isUser: false, text: correctedText };
      setLiveMessages(prev => [...prev, aiResponse]);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const messageToSave = JSON.stringify({ text: messageText, imageUrl: publicUrl });
        await supabase.from('juju_conversations').insert({ message: messageToSave, response: data.response, user_id: user.id });
      }
    } catch (e: any) {
      toast({ title: "Erro ao falar com a Juju", description: e.message, variant: "destructive" });
      setLiveMessages(prev => prev.filter(msg => msg !== userMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const modules = [
    { id: 'calendar', name: "Calendário", icon: Calendar, color: "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400" },
    { id: 'notes', name: "Notas", icon: StickyNote, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400" },
    { id: 'habits', name: "Hábitos", icon: Repeat, color: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400" },
    { id: 'actionPlan', name: "Plano de Ação", icon: ClipboardList, color: "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" },
    { id: 'notebook', name: "Caderno", icon: BookText, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" },
    { id: 'juju', name: "Histórico Juju", icon: Sparkles, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400" },
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
            <div className="space-y-1"><h1 className="text-2xl md:text-3xl font-bold text-foreground">Seja bem-vinda, Meu Amor! ✨</h1><p className="text-muted-foreground">Aqui está um resumo dinâmico para te ajudar hoje.</p></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InfoCard icon={<Calendar className="h-4 w-4 text-muted-foreground" />} title="Compromissos de Hoje" isLoading={isDataLoading}>
                {dashboardData.todayEvents.length > 0 ? (
                    <ul className="space-y-2">{dashboardData.todayEvents.map((event, index) => (
                        <li key={index} className="flex items-center">
                            <span>{event.title}</span>
                            {event.event_time && <span className="ml-2 text-primary font-semibold">{`às ${event.event_time.substring(0, 5)}`}</span>}
                        </li>
                    ))}</ul>
                ) : "Nenhum compromisso hoje."}
              </InfoCard>
              <InfoCard icon={<CheckSquare className="h-4 w-4 text-muted-foreground" />} title="Hábitos Pendentes" isLoading={isDataLoading}>
                {dashboardData.pendingHabits.length > 0 ? dashboardData.pendingHabits.join(', ') : "Todos os hábitos completos! 🎉"}
              </InfoCard>
              <InfoCard icon={<Sparkles className="h-4 w-4 text-muted-foreground" />} title="Mensagem da Juju" isLoading={isDataLoading}>
                <span className="italic">"{dashboardData.randomMessage?.message || 'Tenha um ótimo dia!'}"</span>
              </InfoCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-1 h-[500px] flex flex-col"><div className="p-4 border-b"><h3 className="font-semibold">Juju 💖</h3></div><ChatInterface messages={liveMessages} onSendMessage={handleLiveSend} isLoading={isLoading} /></Card>
                <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 gap-6">{modules.map((module) => (<Card key={module.id} className="group p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveModule(module.id)}><div className={`p-3 rounded-full ${module.color} mb-3`}><module.icon className="h-6 w-6" /></div><h3 className="text-md font-semibold">{module.name}</h3></Card>))}</div>
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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4"><SidebarTrigger className="-ml-1" /><div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Feito com todo amor para você, Meu Amor!</span>{activeModule !== 'home' && (<><span>/</span><span className="text-foreground">{modules.find(m => m.id === activeModule)?.name || 'Home'}</span></>)}</div></header>
          <main className="flex-1 p-6">{renderModule()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;