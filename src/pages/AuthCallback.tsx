import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AppleLoader } from "@/components/AppleLoader";
import { logger, formatError } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

const ADS_AUTH_INTENT_KEY = "flowsight_ads_auth_intent";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const storedAdsIntent = sessionStorage.getItem(ADS_AUTH_INTENT_KEY) === "true";
      const isAds = searchParams.get("source") === "ads" || hashParams.get("source") === "ads" || storedAdsIntent;
      const errorCode = searchParams.get("error") || hashParams.get("error");
      const errorDescription = searchParams.get("error_description") || hashParams.get("error_description");
      const code = searchParams.get("code");

      // 1. Detectar errores que vienen directamente en la URL (de Supabase Auth)
      if (errorCode) {
        logger.error("Auth Callback URL Error:", { code: errorCode, description: errorDescription }, "AuthCallback");
        sessionStorage.removeItem(ADS_AUTH_INTENT_KEY);
        toast({
          title: "Error de autenticación",
          description: errorDescription || "No se pudo completar el inicio de sesión con Google.",
          variant: "destructive"
        });
        navigate(isAds ? "/flowsight-ads" : "/auth", { replace: true });
        return;
      }

      try {
        logger.info("Procesando callback de autenticación...", { isAds, hasCode: Boolean(code) }, "AuthCallback");

        // 2. En flujo PKCE, intercambiar explícitamente el código evita redirecciones prematuras
        // cuando la sesión todavía no está disponible en localStorage.
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            const structuredError = formatError(exchangeError, "Error al intercambiar código de autenticación");
            logger.error("Supabase exchangeCodeForSession error:", structuredError, "AuthCallback");
            throw exchangeError;
          }
        }

        // 3. Recuperar sesión con pequeños reintentos para evitar carreras después de OAuth.
        let session = null;
        let sessionError = null;
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const { data, error } = await supabase.auth.getSession();
          session = data.session;
          sessionError = error;
          if (session || error) break;
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        if (sessionError) {
          const structuredError = formatError(sessionError, "Error al recuperar la sesión");
          logger.error("Supabase getSession error:", structuredError, "AuthCallback");
          throw sessionError;
        }

        if (session) {
          sessionStorage.removeItem(ADS_AUTH_INTENT_KEY);
          logger.info("Sesión recuperada exitosamente", { userId: session.user.id, isAds }, "AuthCallback");
          navigate(isAds ? "/flowsight-ads/dashboard" : "/", { replace: true });
        } else {
          logger.warn("No se encontró una sesión activa tras el callback", { isAds }, "AuthCallback");
          navigate(isAds ? "/flowsight-ads" : "/auth", { replace: true });
        }
      } catch (err: any) {
        logger.error("Excepción crítica en AuthCallback:", err, "AuthCallback");
        sessionStorage.removeItem(ADS_AUTH_INTENT_KEY);

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
