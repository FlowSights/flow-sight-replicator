import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Sparkles, Mail, Lock, User, Phone, MapPin, ArrowRight, Eye, EyeOff, Info, Chrome, Facebook as FacebookIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from "@/components/ui/use-toast";

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

  const handleLoginWithFacebook = async () => {
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/flowsight-ads/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al iniciar sesión con Facebook');
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

      // Intentar login automático después del registro
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
        // Si el auto-login falla, es probable que se requiera confirmación por email
        setMessageType('success');
        setMessage('¡Registro exitoso! Por favor revisa tu correo para confirmar tu cuenta y poder acceder.');
        toast({
          title: "Confirma tu correo",
          description: "Te hemos enviado un enlace de confirmación para activar tu cuenta.",
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
      setMessage('Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      });
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al enviar el correo de recuperación');
      toast({
        variant: "destructive",
        title: "Error de recuperación",
        description: error.message || "No se pudo enviar el correo.",
      });
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

        <div className="flex justify-center items-center gap-8 mb-8 opacity-90">
          <svg className="h-8 w-8 text-[#0668E1]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
          <svg className="h-8 w-8" viewBox="0 0 24 24"><path fill="#FBBC05" d="M17.64 15.2l-9-15.6c-.2-.4-.7-.6-1.1-.4l-6.1 3.5c-.4.2-.6.7-.4 1.1l9 15.6c.2.4.7.6 1.1.4l6.1-3.5c.3-.2.5-.7.3-1.1z"/><path fill="#4285F4" d="M23.6 19.1l-6.1-10.5c-.2-.4-.7-.6-1.1-.4l-6.1 3.5c-.4.2-.6.7-.4 1.1l6.1 10.5c.2.4.7.6 1.1.4l6.1-3.5c.4-.2.6-.7.4-1.1z"/><circle fill="#34A853" cx="14.4" cy="19.1" r="3.5"/></svg>
          <svg className="h-8 w-8 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
          <svg className="h-8 w-8 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </div>

        <div className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-800">
          {!isResetMode ? (
            <>
              <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button onClick={() => { setIsLogin(true); setMessage(''); }} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${isLogin ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Iniciar Sesión</button>
                <button onClick={() => { setIsLogin(false); setMessage(''); }} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${!isLogin ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Registrarse</button>
              </div>

              {message && (
                <div className={`mb-6 p-4 rounded-lg font-medium text-sm flex gap-2 items-start ${messageType === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {isLogin ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300"><Mail className="w-4 h-4 text-emerald-600" />Correo Electrónico</Label>
                    <Input id="login-email" type="email" placeholder="tu@empresa.com" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                  </div>
                  <div className="relative">
                    <Label htmlFor="login-password" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300"><Lock className="w-4 h-4 text-emerald-600" />Contraseña</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                  <Button type="submit" variant="hero" className="w-full mt-6" disabled={loading}>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</Button>
                  <div className="text-center pt-4">
                    <button type="button" onClick={() => setIsResetMode(true)} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">¿Olvidaste tu contraseña?</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="register-name" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300"><User className="w-4 h-4 text-emerald-600" />Nombre Completo</Label>
                      <Input id="register-name" type="text" placeholder="Tu nombre completo" value={registerData.fullName} onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })} required className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                    </div>
                    <div>
                      <Label htmlFor="register-email" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300"><Mail className="w-4 h-4 text-emerald-600" />Correo Electrónico</Label>
                      <Input id="register-email" type="email" placeholder="tu@empresa.com" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-phone" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300"><Phone className="w-4 h-4 text-emerald-600" />Teléfono</Label>
                        <Input id="register-phone" type="tel" placeholder="+506..." value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} required className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                      </div>
                      <div>
                        <Label htmlFor="register-address" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300"><MapPin className="w-4 h-4 text-emerald-600" />Dirección</Label>
                        <Input id="register-address" type="text" placeholder="Ciudad, País" value={registerData.address} onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })} required className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <Label htmlFor="register-password" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300"><Lock className="w-4 h-4 text-emerald-600" />Contraseña</Label>
                        <div className="relative">
                          <Input id="register-password" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                      </div>
                      <div className="relative">
                        <Label htmlFor="confirm-password" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300"><Lock className="w-4 h-4 text-emerald-600" />Confirmar Contraseña</Label>
                        <div className="relative">
                          <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Repite tu contraseña" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} required className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10" />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" /><p>La contraseña debe contener al menos 6 caracteres para asegurar tu cuenta.</p>
                  </div>
                  <Button type="submit" variant="hero" className="w-full mt-6" disabled={loading}>{loading ? 'Creando cuenta...' : 'Registrarse'}</Button>
                </form>
              )}
            </>
          ) : (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2"><Lock className="w-5 h-5" /> Recuperar Contraseña</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
              {message && (
                <div className={`mb-6 p-4 rounded-lg font-medium text-sm flex gap-2 items-start ${messageType === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                  <Info className="w-4 h-4 mt-0.5 shrink-0" /><span>{message}</span>
                </div>
              )}
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300"><Mail className="w-4 h-4 text-emerald-600" />Correo Electrónico</Label>
                  <Input id="reset-email" type="email" placeholder="tu@empresa.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                </div>
                <Button type="submit" variant="hero" className="w-full mt-6" disabled={loading}>{loading ? 'Enviando...' : 'Enviar enlace de recuperación'}</Button>
                <button type="button" onClick={() => { setIsResetMode(false); setMessage(''); }} className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-4 font-medium">Volver al inicio de sesión</button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2"><Sparkles className="w-5 h-5 text-emerald-600" /></div>
            <p className="text-[10px] font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider">IA Integrada</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2"><Sparkles className="w-5 h-5 text-emerald-600" /></div>
            <p className="text-[10px] font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider">4 Plataformas</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2"><Sparkles className="w-5 h-5 text-emerald-600" /></div>
            <p className="text-[10px] font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider">Gratis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowsightAdsLanding;
