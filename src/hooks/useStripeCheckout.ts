import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { logger, formatError } from '@/lib/logger';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutOptions {
  campaignId: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initiateCheckout = async (options: CheckoutOptions) => {
    setLoading(true);
    setError(null);
    logger.info("Iniciando proceso de checkout Stripe", { options }, "StripeHook");

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error("Error al obtener sesión para checkout", formatError(sessionError), "StripeHook");
        throw sessionError;
      }

      if (!session) {
        logger.warn("Intento de checkout sin sesión activa", null, "StripeHook");
        throw new Error('Debes iniciar sesión para realizar un pago');
      }

      // 1. Llamar a la Edge Function
      logger.info("Invocando Edge Function create-checkout-session...", { userId: session.user.id }, "StripeHook");
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          ...options,
          userId: session.user.id,
        }
      });

      if (functionError) {
        const structured = formatError(functionError);
        logger.error("Error en Edge Function create-checkout-session", structured, "StripeHook");
        throw functionError;
      }

      if (!data?.sessionId) {
        logger.error("Respuesta de Edge Function sin sessionId", data, "StripeHook");
        throw new Error('No se pudo crear la sesión de Stripe');
      }

      // 2. Registrar el pago pendiente
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(options.campaignId);
      
      logger.info("Registrando pago pendiente en base de datos", { sessionId: data.sessionId }, "StripeHook");
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: session.user.id,
          campaign_id: isUuid ? options.campaignId : null,
          stripe_session_id: data.sessionId,
          amount_cents: options.amount,
          currency: options.currency,
          status: 'pending',
          metadata: { platform_hint: options.campaignId }
        });

      if (paymentError) {
        const structured = formatError(paymentError);
        logger.error("Error al insertar registro de pago", structured, "StripeHook");
        throw paymentError;
      }

      // 3. Redirigir a Stripe
      if (data.url) {
        logger.info("Redirigiendo a URL de Stripe Checkout", { url: data.url }, "StripeHook");
        window.location.href = data.url;
      } else {
        logger.warn("No se recibió URL de redirección, usando fallback de sessionId", null, "StripeHook");
        const stripe = await stripePromise;
        if (!stripe) throw new Error('No se pudo cargar Stripe');
        window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar el pago';
      logger.error("Excepción en initiateCheckout", err, "StripeHook");
      setError(errorMessage);
      toast({
        title: "Error al iniciar el pago",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { initiateCheckout, loading, error };
};
