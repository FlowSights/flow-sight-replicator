import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AppleLoader } from "@/components/AppleLoader";
import { logger, formatError } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const isAds = params.get('source') === 'ads' || window.location.href.includes('source=ads');
      const errorCode = params.get('error');
      const errorDescription = params.get('error_description');

      // 1. Detectar errores que vienen directamente en la URL (de Supabase Auth)
      if (errorCode) {
        logger.error("Auth Callback URL Error:", { code: errorCode, description: errorDescription }, "AuthCallback");
        toast({
          title: "Error de autenticación",
          description: errorDescription || "No se pudo completar el inicio de sesión con Google.",
          variant: "destructive"
        });
        navigate(isAds ? "/flowsight-ads" : "/auth", { replace: true });
        return;
      }

      try {
        logger.info("Procesando callback de autenticación...", { isAds }, "AuthCallback");
        
        // 2. Intentar obtener la sesión
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          const structuredError = formatError(error, "Error al recuperar la sesión");
          logger.error("Supabase getSession error:", structuredError, "AuthCallback");
          throw error;
        }

        if (session) {
          logger.info("Sesión recuperada exitosamente", { userId: session.user.id }, "AuthCallback");
          navigate(isAds ? "/flowsight-ads/dashboard" : "/", { replace: true });
        } else {
          logger.warn("No se encontró una sesión activa tras el callback", null, "AuthCallback");
          navigate(isAds ? "/flowsight-ads" : "/auth", { replace: true });
        }
      } catch (err: any) {
        logger.error("Excepción crítica en AuthCallback:", err, "AuthCallback");
        
        toast({
          title: "Error inesperado",
          description: "Ocurrió un problema al procesar tu inicio de sesión. Por favor intenta de nuevo.",
          variant: "destructive"
        });
        
        navigate(isAds ? "/flowsight-ads" : "/auth", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <AppleLoader onComplete={() => {}} />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Verificando credenciales...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
