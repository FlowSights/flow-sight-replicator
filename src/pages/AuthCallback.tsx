import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AppleLoader } from "@/components/AppleLoader";
import { logger, formatError } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

const ADS_AUTH_INTENT_KEY = "flowsight_ads_auth_intent";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const processed = useRef(false);
  const [navTarget, setNavTarget] = useState<string | null>(null);
  const [isAnimDone, setIsAnimDone] = useState(false);

  // Navegar solo cuando AMBOS (auth y animación) estén listos
  useEffect(() => {
    if (navTarget && isAnimDone) {
      logger.info("Navegación sincronizada ejecutada", { target: navTarget }, "AuthCallback");
      navigate(navTarget, { replace: true });
    }
  }, [navTarget, isAnimDone, navigate]);

  useEffect(() => {
    // Evitar que el callback se procese múltiples veces (causa errores de intercambio de código)
    if (processed.current) return;
    processed.current = true;

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
        setNavTarget(isAds ? "/flowsight-ads" : "/auth");
        return;
      }

      try {
        logger.info("Procesando callback de autenticación...", { isAds, hasCode: Boolean(code) }, "AuthCallback");

        // 2. En flujo PKCE, intercambiar explícitamente el código
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            const structuredError = formatError(exchangeError, "Error al intercambiar código de autenticación");
            logger.warn("Supabase exchangeCodeForSession warning:", structuredError, "AuthCallback");
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

        // 4. Si hay sesión, todo está bien.
        if (session) {
          sessionStorage.removeItem(ADS_AUTH_INTENT_KEY);
          logger.info("Sesión recuperada exitosamente", { userId: session.user.id, isAds }, "AuthCallback");
          setNavTarget(isAds ? "/flowsight-ads/dashboard" : "/");
          return;
        }

        // 5. Si hay un error, verificar si el usuario ya está autenticado (vía getUser)
        if (sessionError) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            sessionStorage.removeItem(ADS_AUTH_INTENT_KEY);
            logger.info("Usuario ya autenticado (recuperado via getUser)", { userId: user.id, isAds }, "AuthCallback");
            setNavTarget(isAds ? "/flowsight-ads/dashboard" : "/");
            return;
          }
          
          const structuredError = formatError(sessionError, "Error al recuperar la sesión");
          logger.error("Supabase getSession error fatal:", structuredError, "AuthCallback");
          throw sessionError;
        }

        // 6. Si no hay nada, redirigir a login
        logger.warn("No se encontró una sesión activa tras el callback", { isAds }, "AuthCallback");
        setNavTarget(isAds ? "/flowsight-ads" : "/auth");

      } catch (err: any) {
        logger.error("Excepción crítica en AuthCallback:", err, "AuthCallback");
        sessionStorage.removeItem(ADS_AUTH_INTENT_KEY);

        toast({
          title: "Error inesperado",
          description: "Ocurrió un problema al procesar tu inicio de sesión. Por favor intenta de nuevo.",
          variant: "destructive"
        });

        setNavTarget(isAds ? "/flowsight-ads" : "/auth");
      }
    };

    handleAuthCallback();
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="text-center space-y-4">
        <AppleLoader onComplete={() => setIsAnimDone(true)} />
        <div className="relative pt-32">
          <p className="text-emerald-500 font-display text-lg font-bold animate-pulse tracking-tight">
            {navTarget ? "¡Todo listo! Entrando..." : "Verificando credenciales..."}
          </p>
          <p className="text-white/30 text-xs mt-2 uppercase tracking-[0.2em] font-medium">
            Flowsight Intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
