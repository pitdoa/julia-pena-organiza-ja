
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Trash2 } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
}

interface CalendarModuleProps {
  onBack: () => void;
}

const CalendarModule = ({ onBack }: CalendarModuleProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedEvents = localStorage.getItem('julia_calendar_events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  const saveEvents = (updatedEvents: CalendarEvent[]) => {
    setEvents(updatedEvents);
    localStorage.setItem('julia_calendar_events', JSON.stringify(updatedEvents));
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e a data do evento",
        variant: "destructive",
      });
      return;
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      ...newEvent
    };

    const updatedEvents = [...events, event];
    saveEvents(updatedEvents);

    setNewEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: ''
    });
    setIsDialogOpen(false);

    toast({
      title: "Evento adicionado!",
      description: "Seu compromisso foi salvo com sucesso ✨",
    });
  };

  const deleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    saveEvents(updatedEvents);
    toast({
      title: "Evento removido",
      description: "O compromisso foi excluído",
    });
  };

  const todayEvents = events.filter(event => event.date === selectedDate);
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">
            ← Voltar
          </Button>
          <div className="flex items-center space-x-2 text-purple-800">
            <Calendar size={24} />
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
              <Input
                placeholder="Título do evento"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                className="border-purple-200 focus:border-purple-500"
              />
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                className="border-purple-200 focus:border-purple-500"
              />
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                className="border-purple-200 focus:border-purple-500"
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                className="border-purple-200 focus:border-purple-500"
              />
              <Button onClick={addEvent} className="w-full bg-purple-600 hover:bg-purple-700">
                Adicionar Evento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Selecionar Data</h3>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-purple-200 focus:border-purple-500"
            />
          </Card>

          <Card className="p-6 border-purple-100 mt-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              Eventos de {new Date(selectedDate).toLocaleDateString('pt-BR')}
            </h3>
            {todayEvents.length === 0 ? (
              <p className="text-purple-600 text-center py-8">
                Nenhum evento para esta data 📅
              </p>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-purple-800">{event.title}</h4>
                      {event.time && <p className="text-sm text-purple-600">⏰ {event.time}</p>}
                      {event.description && <p className="text-sm text-purple-700 mt-1">{event.description}</p>}
                    </div>
                    <Button
                      onClick={() => deleteEvent(event.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-6 border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Próximos Eventos</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-purple-600 text-center py-4">
                Nenhum evento futuro 🗓️
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 text-sm">{event.title}</h4>
                    <p className="text-xs text-purple-600">
                      📅 {new Date(event.date).toLocaleDateString('pt-BR')}
                      {event.time && ` às ${event.time}`}
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
