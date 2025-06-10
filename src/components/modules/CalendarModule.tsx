// Em: src/components/modules/CalendarModule.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react'; // Ícone de calendário e de loading
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Usando o tipo gerado pelo Supabase para garantir consistência
type CalendarEvent = Tables<'calendar_events'>;

interface CalendarModuleProps {
  onBack: () => void;
}

const CalendarModule = ({ onBack }: CalendarModuleProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: ''
  });
  const { toast } = useToast();

  // Busca os eventos do Supabase quando o componente carrega
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        setEvents(data || []);
      } catch (error: any) {
        toast({ title: "Erro ao carregar eventos", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Adiciona um novo evento no Supabase
  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast({ title: "Campos obrigatórios", description: "Preencha o título e a data.", variant: "destructive" });
      return;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data: newEventData, error } = await supabase
        .from('calendar_events')
        .insert({
            user_id: user.id,
            title: newEvent.title,
            description: newEvent.description || null,
            event_date: newEvent.date,
            event_time: newEvent.time || null
        })
        .select()
        .single();
      
        if (error) throw error;

        setEvents(prev => [...prev, newEventData]);
        setNewEvent({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '' });
        setIsDialogOpen(false);
        toast({ title: "Evento adicionado!", description: "Seu compromisso foi salvo no Supabase." });

    } catch (error: any) {
        toast({ title: "Erro ao adicionar evento", description: error.message, variant: "destructive" });
    }
  };

  // Deleta um evento do Supabase
  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast({ title: "Evento removido", description: "O compromisso foi excluído do banco de dados." });
    } catch (error: any) {
        toast({ title: "Erro ao remover evento", description: error.message, variant: "destructive" });
    }
  };

  const todayEvents = events.filter(event => event.event_date === selectedDate);
  const upcomingEvents = events
    .filter(event => new Date(event.event_date) >= new Date(new Date().toISOString().split('T')[0]))
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">
            ← Voltar
          </Button>
          <div className="flex items-center space-x-2 text-purple-800">
            <CalendarIcon size={24} />
            <h2 className="text-2xl font-bold">Calendário</h2>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus size={16} className="mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-purple-800">Adicionar Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Título do evento" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} className="border-purple-200 focus:border-purple-500" />
              <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className="border-purple-200 focus:border-purple-500" />
              <Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} className="border-purple-200 focus:border-purple-500" />
              <Textarea placeholder="Descrição (opcional)" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} className="border-purple-200 focus:border-purple-500" />
              <Button onClick={addEvent} className="w-full bg-purple-600 hover:bg-purple-700">Adicionar Evento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Selecionar Data</h3>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-purple-200 focus:border-purple-500" />
          </Card>

          <Card className="p-6 border-purple-100 min-h-[200px]">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              Eventos de {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
            </h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-purple-500" /></div>
            ) : todayEvents.length === 0 ? (
              <p className="text-purple-600 text-center py-8">Nenhum evento para esta data 📅</p>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-purple-800">{event.title}</h4>
                      {event.event_time && <p className="text-sm text-purple-600">⏰ {event.event_time}</p>}
                      {event.description && <p className="text-sm text-purple-700 mt-1">{event.description}</p>}
                    </div>
                    <Button onClick={() => deleteEvent(event.id)} variant="outline" size="icon" className="text-red-600 hover:bg-red-50 h-8 w-8"><Trash2 size={16} /></Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-6 border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Próximos Eventos</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-purple-500" /></div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-purple-600 text-center py-4">Nenhum evento futuro 🗓️</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 text-sm">{event.title}</h4>
                    <p className="text-xs text-purple-600">
                      📅 {new Date(event.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      {event.event_time && ` às ${event.event_time}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarModule;