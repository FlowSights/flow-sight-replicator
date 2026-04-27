import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Sparkles, Mail, Lock, User, Phone, MapPin, ArrowRight, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from "@/hooks/use-toast";

const FlowsightAdsLanding: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        setMessageType('success');
        setMessage('Inicio de sesión exitoso. Redirigiendo...');
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        });
        setTimeout(() => navigate('/flowsight-ads/dashboard'), 1000);
      } else {
        setMessageType('error');
        setMessage('Error inesperado: No se pudo crear la sesión.');
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      toast({
        variant: "destructive",
        title: "Error de acceso",
        description: error.message || "No se pudo iniciar sesión.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/flowsight-ads/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al iniciar sesión con Google');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (registerData.password !== registerData.confirmPassword) {
      setMessageType('error');
      setMessage('Las contraseñas no coinciden');
      return;
    }
    if (registerData.password.length < 6) {
      setMessageType('error');
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/flowsight-ads/dashboard`,
          data: {
            full_name: registerData.fullName,
            phone: registerData.phone,
            address: registerData.address,
          },
        },
      });
      
      if (error) throw error;

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: registerData.email,
        password: registerData.password,
      });

      if (!signInError && signInData.session) {
        setMessageType('success');
        setMessage('¡Registro exitoso! Accediendo a la plataforma...');
        toast({
          title: "¡Bienvenido a Flowsight Ads!",
          description: "Tu cuenta ha sido creada y configurada.",
        });
        setTimeout(() => navigate('/flowsight-ads/dashboard'), 1000);
      } else {
        setMessageType('success');
        setMessage('¡Registro exitoso! Por favor revisa tu correo para confirmar tu cuenta.');
        toast({
          title: "Confirma tu correo",
          description: "Te hemos enviado un enlace de confirmación.",
        });
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al registrarse');
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error.message || "No se pudo crear la cuenta.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/flowsight-ads/dashboard`,
      });
      if (error) throw error;
      setMessageType('success');
      setMessage('Se ha enviado un correo para restablecer tu contraseña.');
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada.",
      });
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900 flex flex-col items-center justify-center p-4 relative transition-colors">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/30 rounded-full"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Volver a la web principal
        </Button>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md mt-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Flowsight Ads
            </h1>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Lanza tus campañas en todas las plataformas con IA</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Crea, previsualiza y publica anuncios optimizados</p>
        </div>

        <div className="flex justify-center items-center gap-8 mb-8">
          <div className="flex flex-col items-center gap-1">
            <img src="/logos/meta-icon.png" alt="Meta" className="w-8 h-8 object-contain" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Meta</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <img src="/logos/google-ads-icon.png" alt="Google Ads" className="w-8 h-8 object-contain" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Google Ads</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-8 h-8 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">TikTok</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-8 h-8 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">LinkedIn</span>
          </div>
        </div>

        <div className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-800">
          {!isResetMode ? (
            <>
              <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button 
                  onClick={() => { setIsLogin(true); setMessage(''); }}
                  className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${isLogin ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setMessage(''); }}
                  className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${!isLogin ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Registrarse
                </button>
              </div>

              {message && (
                <div className={`p-3 rounded-lg mb-6 text-sm font-medium ${messageType === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                  {message}
                </div>
              )}

              {isLogin ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="tu@empresa.com" 
                        className="pl-10" 
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        className="pl-10 pr-10" 
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-emerald-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                  <div className="text-center">
                    <button type="button" onClick={() => setIsResetMode(true)} className="text-sm text-emerald-600 hover:underline">¿Olvidaste tu contraseña?</button>
                  </div>
                  
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t dark:border-gray-800"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-2 text-gray-500">O continuar con</span></div>
                  </div>

                  <Button type="button" variant="outline" className="w-full py-6 flex items-center justify-center gap-2" onClick={handleLoginWithGoogle}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar con Google
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input id="reg-name" placeholder="Juan Pérez" className="pl-10" value={registerData.fullName} onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input id="reg-email" type="email" placeholder="tu@empresa.com" className="pl-10" value={registerData.email} onChange={(e) => setRegisterData({...registerData, email: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input id="reg-phone" placeholder="+54 9 11 1234-5678" className="pl-10" value={registerData.phone} onChange={(e) => setRegisterData({...registerData, phone: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-address">Dirección / Empresa</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input id="reg-address" placeholder="Ciudad, País" className="pl-10" value={registerData.address} onChange={(e) => setRegisterData({...registerData, address: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input id="reg-password" type={showPassword ? "text" : "password"} className="pl-10 pr-10" value={registerData.password} onChange={(e) => setRegisterData({...registerData, password: e.target.value})} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-emerald-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1"><Info className="w-3 h-3" /> Mínimo 6 caracteres</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input id="reg-confirm" type={showConfirmPassword ? "text" : "password"} className="pl-10 pr-10" value={registerData.confirmPassword} onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})} required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-emerald-600">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6" disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <h2 className="text-xl font-bold mb-4 text-emerald-900 dark:text-emerald-100">Restablecer Contraseña</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
              
              {message && (
                <div className={`p-3 rounded-lg mb-6 text-sm font-medium ${messageType === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    id="reset-email" 
                    type="email" 
                    placeholder="tu@empresa.com" 
                    className="pl-10" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Enlace'}
              </Button>
              <button type="button" onClick={() => setIsResetMode(false)} className="w-full text-sm text-gray-500 hover:text-emerald-600 mt-4">Volver al inicio de sesión</button>
            </form>
          )}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">IA Integrada</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">4 Plataformas</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Gratis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowsightAdsLanding;
