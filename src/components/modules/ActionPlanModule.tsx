
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface ActionPlan {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  createdAt: string;
}

interface ActionPlanModuleProps {
  onBack: () => void;
}

const ActionPlanModule = ({ onBack }: ActionPlanModuleProps) => {
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    tasks: ['']
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedPlans = localStorage.getItem('julia_action_plans');
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    }
  }, []);

  const savePlans = (updatedPlans: ActionPlan[]) => {
    setPlans(updatedPlans);
    localStorage.setItem('julia_action_plans', JSON.stringify(updatedPlans));
  };

  const addTaskField = () => {
    setNewPlan({
      ...newPlan,
      tasks: [...newPlan.tasks, '']
    });
  };

  const updateTask = (index: number, value: string) => {
    const updatedTasks = [...newPlan.tasks];
    updatedTasks[index] = value;
    setNewPlan({
      ...newPlan,
      tasks: updatedTasks
    });
  };

  const removeTask = (index: number) => {
    const updatedTasks = newPlan.tasks.filter((_, i) => i !== index);
    setNewPlan({
      ...newPlan,
      tasks: updatedTasks.length > 0 ? updatedTasks : ['']
    });
  };

  const createPlan = () => {
    if (!newPlan.title || newPlan.tasks.every(task => !task.trim())) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e pelo menos uma tarefa",
        variant: "destructive",
      });
      return;
    }

    const plan: ActionPlan = {
      id: Date.now().toString(),
      title: newPlan.title,
      description: newPlan.description,
      tasks: newPlan.tasks
        .filter(task => task.trim())
        .map(task => ({
          id: Date.now().toString() + Math.random(),
          title: task.trim(),
          completed: false
        })),
      createdAt: new Date().toISOString()
    };

    const updatedPlans = [plan, ...plans];
    savePlans(updatedPlans);

    setNewPlan({ title: '', description: '', tasks: [''] });
    setIsDialogOpen(false);

    toast({
      title: "Plano criado!",
      description: "Seu plano de ação foi salvo com sucesso ✨",
    });
  };

  const toggleTask = (planId: string, taskId: string) => {
    const updatedPlans = plans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          tasks: plan.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return plan;
    });

    savePlans(updatedPlans);
  };

  const deletePlan = (id: string) => {
    const updatedPlans = plans.filter(plan => plan.id !== id);
    savePlans(updatedPlans);
    setSelectedPlan(null);
    
    toast({
      title: "Plano removido",
      description: "O plano de ação foi excluído",
    });
  };

  const getProgress = (plan: ActionPlan) => {
    if (plan.tasks.length === 0) return 0;
    const completed = plan.tasks.filter(task => task.completed).length;
    return Math.round((completed / plan.tasks.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">
            ← Voltar
          </Button>
          <div className="flex items-center space-x-2 text-purple-800">
            <Plus size={24} />
            <h2 className="text-2xl font-bold">Planos de Ação</h2>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus size={16} className="mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-purple-800">Criar Plano de Ação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Título do plano"
                value={newPlan.title}
                onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                className="border-purple-200 focus:border-purple-500"
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newPlan.description}
                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                className="border-purple-200 focus:border-purple-500"
              />
              
              <div>
                <h4 className="font-medium text-purple-800 mb-2">Tarefas</h4>
                {newPlan.tasks.map((task, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder={`Tarefa ${index + 1}`}
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                      className="border-purple-200 focus:border-purple-500"
                    />
                    {newPlan.tasks.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeTask(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addTaskField}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  + Adicionar Tarefa
                </Button>
              </div>

              <Button onClick={createPlan} className="w-full bg-purple-600 hover:bg-purple-700">
                Criar Plano
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4 border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-4">Seus Planos</h3>
            {plans.length === 0 ? (
              <p className="text-purple-600 text-center py-4">
                Nenhum plano criado ainda 📋
              </p>
            ) : (
              <div className="space-y-2">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPlan?.id === plan.id
                        ? 'bg-purple-100 border-2 border-purple-300'
                        : 'bg-purple-50 hover:bg-purple-100'
                    }`}
                  >
                    <h4 className="font-medium text-purple-800 text-sm truncate">{plan.title}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-purple-600">
                        {plan.tasks.length} tarefas
                      </span>
                      <span className="text-xs text-purple-600">
                        {getProgress(plan)}% ✓
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedPlan ? (
            <Card className="p-6 border-purple-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-purple-800">{selectedPlan.title}</h3>
                  {selectedPlan.description && (
                    <p className="text-purple-600 mt-2">{selectedPlan.description}</p>
                  )}
                </div>
                <Button
                  onClick={() => deletePlan(selectedPlan.id)}
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-purple-700">Progresso</span>
                  <span className="text-sm text-purple-600">{getProgress(selectedPlan)}%</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgress(selectedPlan)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-purple-800">Tarefas</h4>
                {selectedPlan.tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(selectedPlan.id, task.id)}
                      className="border-purple-300"
                    />
                    <span className={`flex-1 ${task.completed ? 'line-through text-purple-500' : 'text-purple-800'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center border-purple-100">
              <p className="text-purple-600 text-lg">
                Selecione um plano para visualizar as tarefas 📋
              </p>
              <p className="text-purple-500 text-sm mt-2">
                Ou crie seu primeiro plano de ação!
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionPlanModule;
