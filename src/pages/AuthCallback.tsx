import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AppleLoader } from "@/components/AppleLoader";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const handleAuthCallback = async () => {
      try {
        // Extraer parámetros tanto de la búsqueda como del hash (por si acaso)
        const params = new URLSearchParams(window.location.search);
        let source = params.get('source');
        
        if (!source && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          source = hashParams.get('source');
        }

        // Pequeña pausa para asegurar que Supabase procese el token del hash
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!isMounted) return;

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          if (source === 'ads') {
            navigate("/flowsight-ads/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } else {
          // Si no hay sesión, intentamos ver si hay un error en la URL
          const errorCode = params.get('error_code');
          if (errorCode) {
            console.error("Error de autenticación de Supabase:", errorCode);
          }
          
          const fallbackRoute = source === 'ads' ? "/flowsight-ads" : "/auth";
          navigate(fallbackRoute, { replace: true });
        }
      } catch (error) {
        console.error("Error crítico en AuthCallback:", error);
        if (isMounted) {
          navigate("/auth?error=callback_exception", { replace: true });
        }
      }
    };

    handleAuthCallback();
    return () => { isMounted = false; };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <AppleLoader onComplete={() => {}} />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Sincronizando tu cuenta...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
