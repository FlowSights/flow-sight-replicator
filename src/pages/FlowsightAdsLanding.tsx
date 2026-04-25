import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Sparkles, Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FlowsightAdsLanding: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const navigate = useNavigate();

  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      setMessageType('success');
      setMessage('Inicio de sesión exitoso. Redirigiendo...');
      setTimeout(() => navigate('/flowsight-ads/dashboard'), 1500);
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // Validar que todos los campos estén completos
      if (!registerData.email || !registerData.password || !registerData.fullName || !registerData.phone || !registerData.address) {
        throw new Error('Por favor completa todos los campos');
      }

      // Registrar el usuario con auto-confirmación
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

      // Auto-confirmar el usuario (esto requiere que tengas habilitado en Supabase)
      // Para esto, necesitas habilitar "Auto confirm users" en Supabase
      // Si no está habilitado, el usuario recibirá un email de confirmación

      setMessageType('success');
      setMessage('¡Registro exitoso! Redirigiendo al dashboard...');
      
      // Esperar un momento y luego redirigir
      setTimeout(() => {
        navigate('/flowsight-ads/dashboard');
      }, 1500);
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex flex-col items-center justify-center p-4 relative">
      {/* Back to Landing Button */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 rounded-full"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Volver a la web principal
        </Button>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Flowsight Ads
            </h1>
          </div>
          <p className="text-gray-700 font-medium mb-2">
            Lanza tus campañas en todas las plataformas con IA
          </p>
          <p className="text-sm text-gray-600">
            Crea, previsualiza y publica anuncios optimizados
          </p>
        </div>

        {/* Platform logos */}
        <div className="flex justify-center items-center gap-6 mb-8 opacity-80">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Meta" className="h-8 w-8 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Ads_logo.svg" alt="Google Ads" className="h-8 w-8 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" alt="TikTok" className="h-8 w-16 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg" alt="LinkedIn" className="h-8 w-8 object-contain" />
        </div>

        {/* Main card */}
        <div className="glass-card backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg font-medium text-sm ${
                messageType === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  Correo Electrónico
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="login-password" className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Contraseña
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              <div className="text-center pt-4">
                <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="register-name" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Nombre Completo
                </Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="register-email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  Correo Electrónico
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="register-phone" className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Número de Teléfono
                </Label>
                <Input
                  id="register-phone"
                  type="tel"
                  placeholder="+506 1234 5678"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="register-address" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Dirección
                </Label>
                <Input
                  id="register-address"
                  type="text"
                  placeholder="Tu dirección completa"
                  value={registerData.address}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="register-password" className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Contraseña
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </Button>

              <p className="text-xs text-gray-600 text-center pt-2">
                Al registrarte, aceptas nuestros términos de servicio
              </p>
            </form>
          )}

          {/* Footer text */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>

        {/* Benefits section */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">IA Integrada</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">4 Plataformas</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Gratis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowsightAdsLanding;
