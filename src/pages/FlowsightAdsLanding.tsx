import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles, Mail, Lock, User, Phone, MapPin, ArrowRight, Eye, EyeOff, Info, Zap, Target, Rocket, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { AppleLoader } from '@/components/AppleLoader';

const FlowsightAdsLanding: React.FC = () => {
  const [showLoader, setShowLoader] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    address: '',
  });
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/flowsight-ads/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (error) throw error;
      if (data.session) {
        navigate('/flowsight-ads/dashboard');
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al iniciar sesión con Google');
    }
  };



  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones de seguridad
    if (!registerData.fullName.trim() || registerData.fullName.length < 2) {
      setMessageType('error');
      setMessage('El nombre debe tener al menos 2 caracteres');
      return;
    }
    
    if (registerData.password.length < 8) {
      setMessageType('error');
      setMessage('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (!/[A-Z]/.test(registerData.password) || !/[0-9]/.test(registerData.password)) {
      setMessageType('error');
      setMessage('La contraseña debe contener mayúsculas y números');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setMessageType('error');
      setMessage('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.fullName.trim(),
            phone: registerData.phone.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMessageType('success');
      setMessage('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
      // Limpiar formulario
      setRegisterData({ email: '', password: '', confirmPassword: '', fullName: '', phone: '', address: '' });
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showLoader && (
          <AppleLoader onComplete={() => setShowLoader(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col transition-colors selection:bg-emerald-500/30">
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-black/60 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-all"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Volver a la web principal
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none hidden dark:block" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none hidden dark:block" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl shadow-emerald-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-black font-display tracking-tight text-gray-900 dark:text-white">
                Flowsight <span className="text-emerald-500">Ads</span>
              </h1>
            </motion.div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Lanza tus campañas en todas las plataformas con IA</p>
          </div>

          <Card className="border-gray-100 dark:border-white/5 shadow-2xl rounded-[32px] backdrop-blur-3xl bg-white/80 dark:bg-white/[0.02] p-8 overflow-hidden">
            <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all ${isLogin ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Entrar
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all ${!isLogin ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Unirse
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-2xl mb-6 text-sm font-bold ${messageType === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {message}
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      type="email" 
                      placeholder="nombre@empresa.com" 
                      className="pl-12 py-6 rounded-xl border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 focus:ring-emerald-500" 
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      className="pl-12 pr-12 py-6 rounded-xl border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 focus:ring-emerald-500" 
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-8 text-lg font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]" disabled={loading}>
                  {loading ? 'Accediendo...' : 'Iniciar Sesión'}
                </Button>
                
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t dark:border-white/5"></span></div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white dark:bg-[#0a0a0a] px-4 text-gray-400">O continuar con</span></div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button type="button" variant="outline" className="py-7 rounded-2xl border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center gap-2 font-bold" onClick={handleLoginWithGoogle}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 12 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar con Google
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Nombre Completo</Label>
                  <Input 
                    className="py-6 rounded-xl border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5" 
                    placeholder="Tu nombre"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Email</Label>
                  <Input 
                    type="email" 
                    className="py-6 rounded-xl border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5" 
                    placeholder="nombre@empresa.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Contraseña</Label>
                  <Input 
                    type="password" 
                    className="py-6 rounded-xl border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5" 
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Confirmar Contraseña</Label>
                  <Input 
                    type="password" 
                    className="py-6 rounded-xl border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5" 
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-8 text-lg font-black rounded-2xl shadow-xl shadow-emerald-500/20" disabled={loading}>
                  {loading ? 'Creando cuenta...' : 'Registrarse'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default FlowsightAdsLanding;
