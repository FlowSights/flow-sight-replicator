import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";
import { z } from "zod";

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
  const redirectTo = params.get("redirect") || "/blog";
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, redirectTo, navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + redirectTo,
      },
    });
    if (error) {
      toast({ title: "Error con Google", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

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
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin + redirectTo,
            data: { full_name: parsed.data.name },
          },
        });
        if (error) throw error;
        toast({ title: "¡Cuenta creada!", description: "Revisa tu correo para confirmar tu cuenta y luego inicia sesión." });
        setMode("signin");
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast({ title: "Datos inválidos", description: parsed.error.errors[0].message, variant: "destructive" });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast({ title: "No pudimos completar la acción", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <nav className="container flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl md:text-2xl">
            <img src={logo} alt="FlowSights logo" width={48} height={48} className="w-12 h-12 object-contain" />
            <span>FlowSights</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/blog"><ArrowLeft className="w-4 h-4 mr-1" /> Blog</Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="pt-32 pb-16 min-h-screen flex items-center">
        <div className="container max-w-md">
          <Card className="p-8 glass-card">
            <h1 className="font-display text-3xl font-bold text-center">
              {mode === "signin" ? "Inicia sesión" : "Crea tu cuenta"}
            </h1>
            <p className="text-muted-foreground text-center text-sm mt-2">
              {mode === "signin"
                ? "Accede al blog completo y participa en la conversación."
                : "Lectura ilimitada del blog y acceso a comentarios."}
            </p>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-6 h-11"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">o con tu correo</span>
              </div>
            </div>

            <form onSubmit={handleEmail} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <div className="relative mt-1">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" placeholder="Tu nombre" required />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="email">Correo</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="tu@empresa.com" required />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="Mínimo 6 caracteres" required />
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === "signin" ? "Entrar" : "Crear cuenta")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === "signin" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-medium hover:underline">
                {mode === "signin" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Auth;