
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoginFormProps {
  onLogin: () => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Criar perfil da usuária
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                user_id: data.user.id,
                email: data.user.email,
                full_name: 'Júlia Pena',
              }
            ]);

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
          }

          toast({
            title: "Conta criada com sucesso!",
            description: "Bem-vinda ao seu sistema de organização pessoal ✨",
          });
          onLogin();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Verificar se existe perfil, se não existir, criar
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (!profile && !profileError) {
            await supabase
              .from('profiles')
              .insert([
                {
                  user_id: data.user.id,
                  email: data.user.email,
                  full_name: 'Júlia Pena',
                }
              ]);
          }

          toast({
            title: "Bem-vinda de volta, Júlia!",
            description: "Login realizado com sucesso ✨",
          });
          onLogin();
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro na autenticação",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              placeholder="seu@email.com"
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
            {isLoading ? (isSignUp ? 'Criando conta...' : 'Entrando...') : (isSignUp ? 'Criar Conta' : 'Entrar')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-600 hover:text-purple-700 text-sm"
          >
            {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Crie uma'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-purple-600">
          <p>Sistema personalizado para organização e estudos</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
