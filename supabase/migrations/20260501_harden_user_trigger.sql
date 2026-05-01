-- Hardening del trigger handle_new_user para evitar errores 500 en Auth
-- Este script mejora la robustez del trigger al manejar nulos y errores de inserción

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_name TEXT;
BEGIN
    -- Fallback para el nombre si no viene en los metadatos
    default_name := COALESCE(
        NEW.raw_user_meta_data ->> 'full_name', 
        NEW.raw_user_meta_data ->> 'name', 
        split_part(NEW.email, '@', 1),
        'Usuario FlowSights'
    );

    -- Inserción con manejo de errores para no bloquear el proceso de Auth
    BEGIN
        INSERT INTO public.profiles (id, email, display_name, avatar_url)
        VALUES (
            NEW.id,
            NEW.email,
            default_name,
            NEW.raw_user_meta_data ->> 'avatar_url'
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
            updated_at = now();
    EXCEPTION WHEN OTHERS THEN
        -- Loguear el error internamente si es posible o simplemente ignorar para no romper el login
        -- En Supabase, los errores en triggers AFTER INSERT en auth.users causan error 500 en el API de Auth
        RAISE WARNING 'Error en handle_new_user para id %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$;
