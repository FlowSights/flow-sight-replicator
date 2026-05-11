import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { ArrowLeft, Loader2, Mail, Lock, User as UserIcon, BarChart3 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { z } from "zod";
import { logger, formatError } from "@/lib/logger";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(100),
  email: z.string().trim().email("Correo inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Correo inválido").max(255),
  password: z.string().min(1, "Contraseña requerida").max(72),
});

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/flowsight-ads/dashboard";
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, redirectTo, navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ name, email, password });
        if (!parsed.success) {
          toast({ title: "Datos inválidos", description: parsed.error.errors[0].message, variant: "destructive" });
          setLoading(false);
          return;
        }
        
        logger.info("Iniciando registro por email", { email: parsed.data.email }, "Auth");
        
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin + redirectTo,
            data: { full_name: parsed.data.name },
          },
        });
        
        if (error) {
          const structured = formatError(error);
          logger.error("Error en registro Supabase", structured, "Auth");
          throw error;
        }
        
        toast({ title: "¡Cuenta creada!", description: "Revisa tu correo para confirmar tu cuenta y luego inicia sesión." });
        setMode("signin");
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast({ title: "Datos inválidos", description: parsed.error.errors[0].message, variant: "destructive" });
          setLoading(false);
          return;
        }
        
        logger.info("Iniciando sesión por email", { email: parsed.data.email }, "Auth");
        
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        
        if (error) {
          const structured = formatError(error);
          logger.error("Error en login Supabase", structured, "Auth");
          throw error;
        }
      }
    } catch (err: any) {
      const msg = err?.message || "Error desconocido";
      toast({ title: "No pudimos completar la acción", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      logger.info("Iniciando OAuth con Google", { origin: window.location.origin }, "Auth");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) {
        const structured = formatError(error);
        logger.error("Error al iniciar OAuth con Google", structured, "Auth");
        throw error;
      }
    } catch (err: any) {
      const msg = err?.message || "Error al conectar con Google";
      toast({ title: "Error de autenticación", description: msg, variant: "destructive" });
    }
  };

  return (
    <>
      <SEO 
        title="Iniciar Sesión" 
        description="Accede a tu cuenta de FlowSights para gestionar tus proyectos de inteligencia operativa y limpieza de datos."
        url="/auth"
        noindex={true}
      />
      <div className="min-h-screen bg-[#020202] text-white selection:bg-emerald-500/30 font-sans relative overflow-hidden">
        {/* Background Video & Glows */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[#020605]">
          <video 
            src="/videos/login-bg.mp4" 
            autoPlay 
            muted 
            loop 
            playsInline
            onCanPlay={(e) => { e.currentTarget.style.opacity = '0.4'; }}
            className="w-full h-full object-cover opacity-0 transition-opacity duration-[2000ms] ease-out"
          />
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Accent Glows */}
          <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-emerald-500/[0.04] blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-cyan-500/[0.03] blur-[120px] rounded-full" />
        </div>

        <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-2xl">
          <nav className="container max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
            <Link 
              to="/" 
              className="flex items-center gap-2.5 font-black text-sm tracking-widest uppercase hover:opacity-80 transition-all text-gray-400"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la web principal
            </Link>
            <ThemeToggle />
          </nav>
        </header>

      <section className="flex items-center justify-center min-h-screen px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[480px]"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <BarChart3 className="w-7 h-7 text-black" />
              </div>
              <span className="text-3xl font-black tracking-tighter">Flowsight <span className="text-emerald-500">Ads</span></span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Lanza tus campañas en todas las plataformas con IA</p>
          </div>

          <div className="p-10 rounded-[40px] bg-[#0A0A0A]/80 border border-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-3xl">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-[200px] bg-gradient-to-t from-emerald-500/[0.02] to-transparent pointer-events-none" />
            
            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/5 mb-10">
              <button 
                type="button"
                onClick={() => setMode("signin")} 
                className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all ${mode === "signin" ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25' : 'text-gray-500 hover:text-white'}`}
              >
                Entrar
              </button>
              <button 
                type="button"
                onClick={() => setMode("signup")} 
                className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all ${mode === "signup" ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25' : 'text-gray-500 hover:text-white'}`}
              >
                Unirse
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              <form onSubmit={handleEmail} className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Nombre</label>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="h-16 pl-14 bg-white/[0.03] border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all text-base font-bold placeholder:text-gray-700 text-white" 
                        placeholder="Tu nombre completo" 
                        required 
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="h-16 pl-14 bg-white/[0.03] border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all text-base font-bold placeholder:text-gray-700 text-white" 
                      placeholder="nombre@empresa.com" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="h-16 pl-14 bg-white/[0.03] border-white/[0.06] rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all text-base font-bold placeholder:text-gray-700 text-white" 
                      placeholder="Mínimo 6 caracteres" 
                      required 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-xl shadow-emerald-500/20 mt-2" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : (mode === "signin" ? "Iniciar Sesión" : "Crear Cuenta")}
                </Button>
              </form>

              <div className="relative py-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.05]"></div></div>
                <span className="relative px-4 bg-[#0A0A0A]/80 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">O continuar con</span>
              </div>

              <Button 
                type="button" 
                className="w-full h-16 bg-black hover:bg-white/[0.04] border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-base"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 12 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
    </>
  );
};
export default Auth;
