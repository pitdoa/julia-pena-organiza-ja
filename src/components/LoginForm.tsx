
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Languages, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

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
            title: t('auth.accountCreated'),
            description: t('auth.welcomeMessage'),
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
            title: t('auth.welcomeBack'),
            description: t('auth.loginSuccess'),
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
    <div className="min-h-screen flex">
      {/* Left Side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-start text-white p-12 pl-[15%]">
        <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold">{t('auth.title')}</h1>
            <p className="text-xl opacity-90 max-w-md">{t('auth.subtitle')}</p>
            <div className="pt-8">
              <p className="text-sm opacity-75">{t('auth.description')}</p>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-32 right-20 w-48 h-48 rounded-full bg-purple-300/20 blur-2xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-blue-300/20 blur-xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Header Controls */}
          <div className="flex justify-between items-center">
            <div className="lg:hidden">
              <h2 className="text-2xl font-bold text-foreground">{t('auth.title')}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
                className="h-9 px-3"
              >
                <Languages className="h-4 w-4 mr-1" />
                {language.toUpperCase()}
              </Button>
            </div>
          </div>

          {/* Login Card */}
          <Card className="p-8 border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {isSignUp ? t('auth.signup') : t('auth.login')}
                </h1>
                <p className="text-muted-foreground">
                  {isSignUp ? 'Crie sua conta para começar' : 'Entre na sua conta'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t('auth.email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="julia@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-background border-border focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t('auth.password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 bg-background border-border focus:border-primary pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all duration-200"
                >
                  {isLoading 
                    ? (isSignUp ? t('auth.creating') : t('auth.logging'))
                    : (isSignUp ? t('auth.signup') : t('auth.login'))
                  }
                </Button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
