
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus, Trash2 } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  streak: number;
  lastCompleted: string | null;
  createdAt: string;
}

interface HabitsModuleProps {
  onBack: () => void;
}

const HabitsModule = ({ onBack }: HabitsModuleProps) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedHabits = localStorage.getItem('julia_habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  const saveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    localStorage.setItem('julia_habits', JSON.stringify(updatedHabits));
  };

  const addHabit = () => {
    if (!newHabitName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do hábito",
        variant: "destructive",
      });
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      streak: 0,
      lastCompleted: null,
      createdAt: new Date().toISOString()
    };

    const updatedHabits = [...habits, habit];
    saveHabits(updatedHabits);

    setNewHabitName('');
    setIsDialogOpen(false);

    toast({
      title: "Hábito criado!",
      description: "Agora é só manter a consistência ✨",
    });
  };

  const completeHabit = (id: string) => {
    const today = new Date().toDateString();
    
    const updatedHabits = habits.map(habit => {
      if (habit.id === id) {
        const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null;
        
        if (lastCompleted === today) {
          // Já foi completado hoje
          return habit;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = lastCompleted === yesterday.toDateString();
        
        return {
          ...habit,
          streak: wasYesterday || habit.streak === 0 ? habit.streak + 1 : 1,
          lastCompleted: new Date().toISOString()
        };
      }
      return habit;
    });

    saveHabits(updatedHabits);

    toast({
      title: "Parabéns! 🎉",
      description: "Hábito completado hoje",
    });
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== id);
    saveHabits(updatedHabits);
    
    toast({
      title: "Hábito removido",
      description: "O hábito foi excluído",
    });
  };

  const isCompletedToday = (habit: Habit) => {
    if (!habit.lastCompleted) return false;
    const today = new Date().toDateString();
    const lastCompleted = new Date(habit.lastCompleted).toDateString();
    return lastCompleted === today;
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 21) return '🔥';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '💪';
    if (streak >= 3) return '🌟';
    return '💙';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">
            ← Voltar
          </Button>
          <div className="flex items-center space-x-2 text-purple-800">
            <Clock size={24} />
            <h2 className="text-2xl font-bold">Hábitos</h2>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus size={16} className="mr-2" />
              Novo Hábito
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-purple-800">Criar Novo Hábito</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Ex: Estudar 30 minutos"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="border-purple-200 focus:border-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              />
              <Button onClick={addHabit} className="w-full bg-purple-600 hover:bg-purple-700">
                Criar Hábito
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {habits.length === 0 ? (
        <Card className="p-12 text-center border-purple-100">
          <p className="text-purple-600 text-lg">
            Seus hábitos aparecerão aqui 🌱
          </p>
          <p className="text-purple-500 text-sm mt-2">
            Crie seu primeiro hábito para começar a construir uma rotina!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <Card key={habit.id} className="p-6 border-purple-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-purple-800 truncate pr-2">{habit.name}</h3>
                <Button
                  onClick={() => deleteHabit(habit.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 p-1 h-8 w-8"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl mb-2">{getStreakEmoji(habit.streak)}</div>
                <div className="text-2xl font-bold text-purple-800">{habit.streak}</div>
                <div className="text-sm text-purple-600">dias consecutivos</div>
              </div>

              <Button
                onClick={() => completeHabit(habit.id)}
                disabled={isCompletedToday(habit)}
                className={`w-full ${
                  isCompletedToday(habit)
                    ? 'bg-green-500 hover:bg-green-500 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isCompletedToday(habit) ? '✓ Completado Hoje' : 'Marcar como Feito'}
              </Button>

              {habit.lastCompleted && (
                <div className="text-xs text-purple-500 text-center mt-2">
                  Último: {new Date(habit.lastCompleted).toLocaleDateString('pt-BR')}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {habits.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-purple-100 to-purple-50 border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">
            💡 Dica para Manter Hábitos
          </h3>
          <p className="text-purple-700 text-sm">
            A consistência é mais importante que a perfeição. Mesmo que você falhe um dia, 
            continue no próximo. Cada dia é uma nova oportunidade! 🌟
          </p>
        </Card>
      )}
    </div>
  );
};

export default HabitsModule;
