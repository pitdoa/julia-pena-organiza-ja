// Em: src/components/modules/JujuModule.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parseISO, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatInterface, Message } from './aichat/ChatInterface'; // Importando a interface
import { Sparkles, Trash2, PlusCircle } from 'lucide-react';

interface JujuModuleProps {
  onBack: () => void;
}

const JujuModule = ({ onBack }: JujuModuleProps) => {
  const [conversations, setConversations] = useState<Map<string, Message[]>>(new Map());
  const [activeDate, setActiveDate] = useState<string>(format(startOfToday(), 'yyyy-MM-dd'));
  const { toast } = useToast();

  const fetchHistory = async () => {
    // A lógica para buscar e agrupar o histórico fica aqui
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('juju_conversations').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    if (error) { toast({ title: 'Erro ao carregar histórico', variant: 'destructive' }); return; }
    
    const grouped = new Map<string, Message[]>();
    data.forEach(d => {
      const dateKey = format(parseISO(d.created_at), 'yyyy-MM-dd');
      const dayMessages = grouped.get(dateKey) || [];
      dayMessages.push({ isUser: true, text: d.message }, { isUser: false, text: d.response });
      grouped.set(dateKey, dayMessages);
    });
    setConversations(grouped);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async (dateToClear: string) => {
    // Lógica para limpar o histórico do dia selecionado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const startDate = new Date(dateToClear + 'T00:00:00.000Z');
    const endDate = new Date(dateToClear + 'T23:59:59.999Z');
    await supabase.from('juju_conversations').delete().eq('user_id', user.id).gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
    fetchHistory(); // Recarrega o histórico após a exclusão
    toast({ title: "Conversa do dia limpa!" });
  };
  
  const messagesToShow = conversations.get(activeDate) || [];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4"><div className="flex items-center space-x-4"><Button onClick={onBack} variant="outline">← Voltar</Button><div className="flex items-center space-x-2"><Sparkles size={24} className="text-purple-500" /><h2 className="text-2xl font-bold">Histórico da Juju</h2></div></div></div>
        <div className="flex-1 grid grid-cols-12 gap-4 h-full min-h-0">
            <div className="col-span-3 bg-muted/50 rounded-lg p-2 flex flex-col">
                <ScrollArea className="flex-1 mt-2"><h4 className="text-sm font-semibold text-muted-foreground px-2 mb-2">Histórico</h4><div className="space-y-1 pr-2">{Array.from(conversations.keys()).sort((a,b) => b.localeCompare(a)).map(dateKey => (<Button key={dateKey} variant={activeDate === dateKey ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveDate(dateKey)}>{format(parseISO(dateKey), "dd 'de' MMMM", { locale: ptBR })}</Button>))}</div></ScrollArea>
            </div>
            <div className="col-span-9 rounded-lg border flex flex-col">
                <div className="p-2 border-b flex justify-between items-center"><h3 className="font-semibold text-sm px-2">{`Relembrando: ${format(parseISO(activeDate), "PPP", { locale: ptBR })}`}</h3>{messagesToShow.length > 0 && (<AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 size={16} /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Limpar histórico deste dia?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleClearHistory(activeDate)} className="bg-destructive hover:bg-destructive/90">Sim, limpar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>)}</div>
                <ChatInterface messages={messagesToShow} onSendMessage={async ()=>{}} isLoading={false} isHistoryView={true} />
            </div>
        </div>
    </div>
  );
};

export default JujuModule;