import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const type = searchParams.get('type');
    
    // Si es una recuperación de contraseña explícita
    if (type === 'recovery') {
      setIsResetting(true);
      return;
    }
    
    // Si hay un access_token en el hash, es un callback de Supabase.
    // Si NO es de tipo recovery, es un login normal que cayó aquí.
    // Lo redirigimos al callback oficial para que se procese correctamente.
    if (window.location.hash && window.location.hash.includes('access_token')) {
      navigate('/auth/callback' + window.location.search + window.location.hash, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setMessageType('error');
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessageType('success');
      setMessage('¡Contraseña actualizada exitosamente! Redirigiendo...');
      setTimeout(() => navigate('/flowsight-ads'), 2000);
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!isResetting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">Enlace inválido o expirado</p>
          <Button asChild variant="hero" className="mt-4">
            <a href="/flowsight-ads">Volver al login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900 flex flex-col items-center justify-center p-4 relative transition-colors">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg inline-block mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Restablecer Contraseña
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Ingresa tu nueva contraseña</p>
        </div>

        <div className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-800">
          {message && (
            <div className={`mb-6 p-4 rounded-lg font-medium text-sm flex gap-2 items-start ${
              messageType === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}>
              {messageType === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <Lock className="w-4 h-4 mt-0.5 shrink-0" />}
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Label htmlFor="password" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
                <Lock className="w-4 h-4 text-emerald-600" />
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="relative">
              <Label htmlFor="confirm-password" className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
                <Lock className="w-4 h-4 text-emerald-600" />
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full mt-6" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </form>

          <div className="text-center mt-6">
            <a href="/flowsight-ads" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1">
              <ArrowRight className="w-4 h-4 rotate-180" /> Volver al login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
