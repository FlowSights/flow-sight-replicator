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
import { logger, formatError } from '@/lib/logger';

const ADS_AUTH_INTENT_KEY = "flowsight_ads_auth_intent";

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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.error("Error al verificar sesión inicial", formatError(error), "AdsLanding");
          return;
        }
        if (session) {
          logger.info("Sesión activa detectada, redirigiendo al dashboard", { userId: session.user.id }, "AdsLanding");
          navigate('/flowsight-ads/dashboard');
        }
      } catch (err) {
        logger.error("Excepción al verificar sesión inicial", err, "AdsLanding");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      logger.info("Iniciando sesión con contraseña (Ads)", { email: loginData.email }, "AdsLanding");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (error) {
        const structured = formatError(error);
        logger.error("Error en login con contraseña (Ads)", structured, "AdsLanding");
        throw error;
      }
      if (data.session) {
        logger.info("Login exitoso (Ads)", { userId: data.user.id }, "AdsLanding");
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
      logger.info("Iniciando OAuth con Google (Ads)", { origin: window.location.origin }, "AdsLanding");
      sessionStorage.setItem(ADS_AUTH_INTENT_KEY, "true");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin + '/auth/callback?source=ads',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) {
        const structured = formatError(error);
        logger.error("Error al iniciar OAuth con Google (Ads)", structured, "AdsLanding");
        throw error;
      }
    } catch (error: any) {
      sessionStorage.removeItem(ADS_AUTH_INTENT_KEY);
      setMessageType('error');
      setMessage(error.message || 'Error al iniciar sesión con Google');
      logger.error("Excepción en handleLoginWithGoogle (Ads)", error, "AdsLanding");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      logger.info("Iniciando registro de nuevo usuario (Ads)", { email: registerData.email }, "AdsLanding");
      const { error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.fullName.trim(),
            phone: registerData.phone.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?source=ads`,
        },
      });
      
      if (error) {
        const structured = formatError(error);
        logger.error("Error en registro (Ads)", structured, "AdsLanding");
        throw error;
      }
      
      setMessageType('success');
      setMessage('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
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

      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-500 selection:bg-emerald-500/30 relative overflow-hidden">
        {/* Cinematic Background - Enhanced Dynamism */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Background Video */}
          <video 
            src="/videos/login-bg.mp4" 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-black/40" />

          {/* Main Aurora Blobs */}
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-emerald-500 blur-[140px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              x: [0, -80, 0],
              y: [0, -100, 0],
              scale: [1.2, 1, 1.2],
              opacity: [0.08, 0.12, 0.08],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-15%] right-[-5%] w-[800px] h-[800px] bg-cyan-500 blur-[120px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              scale: [0.8, 1.1, 0.8],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-emerald-400 blur-[100px] rounded-full" 
          />

          {/* Dynamic Light Streaks */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,hsl(var(--background))_100%)] opacity-40" />
        </div>

        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/40 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Volver
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[460px]"
          >
            {/* Logo Section */}
            <div className="text-center mb-10">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-5"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[22px] shadow-[0_15px_40px_rgba(16,185,129,0.3)] flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/10 group-hover:scale-110 transition-transform duration-700" />
                  <Sparkles className="w-9 h-9 text-black relative z-10" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">
                    Flowsight <span className="text-emerald-500 italic">Ads</span>
                  </h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Intelligence Scale</p>
                </div>
              </motion.div>
            </div>

            {/* Auth Card - Premium Glassmorphism */}
            <div className="rounded-[40px] border border-white/[0.12] bg-black/20 backdrop-blur-[32px] p-8 md:p-10 relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
              {/* Inner subtle glow to simulate glass edge */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

              {/* Tab Switcher */}
              <div className="flex gap-1 p-1 bg-black/40 rounded-[20px] border border-white/10 mb-10 relative z-10">
                <button 
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3.5 rounded-[16px] font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${isLogin ? 'bg-emerald-500 text-black shadow-[0_5px_15px_rgba(16,185,129,0.3)]' : 'text-white/50 hover:text-white'}`}
                >
                  Entrar
                </button>
                <button 
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3.5 rounded-[16px] font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${!isLogin ? 'bg-emerald-500 text-black shadow-[0_5px_15px_rgba(16,185,129,0.3)]' : 'text-white/50 hover:text-white'}`}
                >
                  Unirse
                </button>
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`p-4 rounded-xl mb-6 text-xs font-bold relative z-10 backdrop-blur-md ${messageType === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}
                >
                  {message}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.form 
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleLogin} 
                    className="space-y-6 relative z-10"
                  >
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 ml-1">Email Empresarial</Label>
                      <div className="relative group/input">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-emerald-400 transition-colors" />
                        <Input 
                          type="email" 
                          placeholder="nombre@empresa.com" 
                          className="h-16 pl-14 bg-white/[0.03] border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm font-bold text-white placeholder:text-white/30 backdrop-blur-md" 
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Contraseña</Label>
                        <button type="button" className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-emerald-400 transition-colors">Olvidé mi clave</button>
                      </div>
                      <div className="relative group/input">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-emerald-400 transition-colors" />
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          className="h-16 pl-14 pr-14 bg-white/[0.03] border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm font-bold text-white placeholder:text-white/30 backdrop-blur-md" 
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-emerald-400 transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black rounded-2xl shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all uppercase tracking-[0.2em]" 
                      disabled={loading}
                    >
                      {loading ? 'Accediendo...' : 'Iniciar Sesión'}
                    </Button>
                    
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                      <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]"><span className="bg-[#0f1211] px-4 text-white/50 backdrop-blur-md rounded-full py-1">O accede con</span></div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-16 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest transition-all backdrop-blur-md" 
                      onClick={handleLoginWithGoogle}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 12 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google Account
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form 
                    key="register"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onSubmit={handleRegister} 
                    className="space-y-4 relative z-10"
                  >
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 ml-1">Nombre Completo</Label>
                      <div className="relative group/input">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-emerald-400 transition-colors" />
                        <Input 
                          placeholder="Tu nombre" 
                          className="h-16 pl-14 bg-white/[0.03] border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm font-bold text-white placeholder:text-white/30 backdrop-blur-md" 
                          value={registerData.fullName}
                          onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 ml-1">Email</Label>
                      <div className="relative group/input">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-emerald-400 transition-colors" />
                        <Input 
                          type="email" 
                          placeholder="email@empresa.com" 
                          className="h-16 pl-14 bg-white/[0.03] border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm font-bold text-white placeholder:text-white/30 backdrop-blur-md" 
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 ml-1">Contraseña</Label>
                        <div className="relative group/input">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <Input 
                            type="password" 
                            className="h-16 pl-14 bg-white/[0.03] border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm font-bold text-white" 
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 ml-1">Confirmar</Label>
                        <div className="relative group/input">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <Input 
                            type="password" 
                            className="h-16 pl-14 bg-white/[0.03] border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm font-bold text-white" 
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black rounded-2xl shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all uppercase tracking-[0.2em] mt-2" 
                      disabled={loading}
                    >
                      {loading ? 'Iniciando...' : 'Crear Cuenta'}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
              
              <div className="mt-8 pt-8 border-t border-border text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Secure Enterprise Advertising Platform
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <footer className="py-6 px-6 text-center">
          <div className="flex justify-center gap-6">
            <button className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Privacidad</button>
            <button className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Términos</button>
            <button className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Soporte</button>
          </div>
        </footer>
      </div>



    </>
  );
};

export default FlowsightAdsLanding;
