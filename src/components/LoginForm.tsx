
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: () => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Fixed credentials
    if (email === 'juliapena002@gmail.com' && password === 'juliapena123') {
      setTimeout(() => {
        onLogin();
        toast({
          title: "Bem-vinda, Júlia!",
          description: "Login realizado com sucesso ✨",
        });
        setIsLoading(false);
      }, 1000);
    } else {
      setTimeout(() => {
        toast({
          title: "Credenciais inválidas",
          description: "Verifique seu email e senha",
          variant: "destructive",
        });
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">Júlia Pena</h1>
          <p className="text-purple-600">Seu sistema de organização pessoal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="juliapena002@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-700">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-purple-600">
          <p>Sistema personalizado para organização e estudos</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
