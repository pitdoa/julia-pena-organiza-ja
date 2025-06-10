
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Plus, Trash2 } from 'lucide-react';

interface NotebookEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category: 'personal' | 'study' | 'thoughts' | 'goals';
}

interface NotebookModuleProps {
  onBack: () => void;
}

const NotebookModule = ({ onBack }: NotebookModuleProps) => {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<NotebookEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    category: 'personal' as NotebookEntry['category']
  });
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'Todas', emoji: '📚' },
    { id: 'personal', name: 'Pessoal', emoji: '💭' },
    { id: 'study', name: 'Estudos', emoji: '📖' },
    { id: 'thoughts', name: 'Reflexões', emoji: '🌙' },
    { id: 'goals', name: 'Objetivos', emoji: '🎯' }
  ];

  useEffect(() => {
    const savedEntries = localStorage.getItem('julia_notebook');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const saveEntries = (updatedEntries: NotebookEntry[]) => {
    setEntries(updatedEntries);
    localStorage.setItem('julia_notebook', JSON.stringify(updatedEntries));
  };

  const addEntry = () => {
    if (!newEntry.title || !newEntry.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e o conteúdo",
        variant: "destructive",
      });
      return;
    }

    const entry: NotebookEntry = {
      id: Date.now().toString(),
      title: newEntry.title,
      content: newEntry.content,
      category: newEntry.category,
      createdAt: new Date().toISOString()
    };

    const updatedEntries = [entry, ...entries];
    saveEntries(updatedEntries);

    setNewEntry({ title: '', content: '', category: 'personal' });
    setIsDialogOpen(false);

    toast({
      title: "Entrada criada!",
      description: "Sua anotação foi salva no caderno ✨",
    });
  };

  const updateEntry = () => {
    if (!editingEntry || !newEntry.title || !newEntry.content) return;

    const updatedEntries = entries.map(entry =>
      entry.id === editingEntry.id
        ? { ...entry, title: newEntry.title, content: newEntry.content, category: newEntry.category }
        : entry
    );

    saveEntries(updatedEntries);
    setEditingEntry(null);
    setNewEntry({ title: '', content: '', category: 'personal' });
    setIsDialogOpen(false);

    toast({
      title: "Entrada atualizada!",
      description: "Suas alterações foram salvas",
    });
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
    toast({
      title: "Entrada removida",
      description: "A anotação foi excluída do caderno",
    });
  };

  const openEditDialog = (entry: NotebookEntry) => {
    setEditingEntry(entry);
    setNewEntry({ title: entry.title, content: entry.content, category: entry.category });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingEntry(null);
    setNewEntry({ title: '', content: '', category: 'personal' });
    setIsDialogOpen(true);
  };

  const filteredEntries = selectedCategory === 'all' 
    ? entries 
    : entries.filter(entry => entry.category === selectedCategory);

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.id === category) || categories[1];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="border-purple-300 text-purple-700">
            ← Voltar
          </Button>
          <div className="flex items-center space-x-2 text-purple-800">
            <Wallet size={24} />
            <h2 className="text-2xl font-bold">Caderno</h2>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus size={16} className="mr-2" />
              Nova Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-purple-800">
                {editingEntry ? 'Editar Entrada' : 'Nova Entrada no Caderno'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Título da entrada"
                value={newEntry.title}
                onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                className="border-purple-200 focus:border-purple-500"
              />
              
              <div>
                <label className="text-sm font-medium text-purple-700 mb-2 block">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(1).map((category) => (
                    <Button
                      key={category.id}
                      type="button"
                      variant={newEntry.category === category.id ? "default" : "outline"}
                      onClick={() => setNewEntry({...newEntry, category: category.id as NotebookEntry['category']})}
                      className={`justify-start ${
                        newEntry.category === category.id 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      <span className="mr-2">{category.emoji}</span>
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Escreva seus pensamentos, ideias, reflexões..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                className="border-purple-200 focus:border-purple-500 min-h-40"
              />
              
              <Button 
                onClick={editingEntry ? updateEntry : addEntry} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {editingEntry ? 'Atualizar Entrada' : 'Salvar no Caderno'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 border-purple-100">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`${
                selectedCategory === category.id 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'border-purple-200 text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span className="mr-1">{category.emoji}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </Card>

      {filteredEntries.length === 0 ? (
        <Card className="p-12 text-center border-purple-100">
          <p className="text-purple-600 text-lg">
            {selectedCategory === 'all' 
              ? 'Seu caderno está esperando por você 📝' 
              : `Nenhuma entrada em ${getCategoryInfo(selectedCategory).name} ainda`}
          </p>
          <p className="text-purple-500 text-sm mt-2">
            Comece escrevendo seus pensamentos e ideias!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-6 border-purple-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span>{getCategoryInfo(entry.category).emoji}</span>
                  <h3 className="font-semibold text-purple-800">{entry.title}</h3>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => openEditDialog(entry)}
                    variant="outline"
                    size="sm"
                    className="text-purple-600 hover:bg-purple-50"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => deleteEntry(entry.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              
              <p className="text-purple-700 text-sm mb-3 whitespace-pre-wrap">
                {entry.content}
              </p>
              
              <div className="flex justify-between items-center text-xs text-purple-500">
                <span>{getCategoryInfo(entry.category).name}</span>
                <span>{new Date(entry.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotebookModule;
