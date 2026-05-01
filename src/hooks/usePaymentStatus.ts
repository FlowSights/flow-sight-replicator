import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { logger, formatError } from '@/lib/logger';

interface PaymentRecord {
  id: string;
  user_id: string;
  campaign_id: string | null;
  stripe_session_id: string;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
  metadata: Record<string, any>;
}

export const usePaymentStatus = () => {
  const [hasPaid, setHasPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setIsLoading(true);
        logger.info("Verificando estado de pago...", null, "PaymentHook");

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logger.error("Error al obtener sesión en PaymentHook", formatError(sessionError), "PaymentHook");
          setHasPaid(false);
          setIsLoading(false);
          return;
        }

        if (!session) {
          logger.info("No hay sesión activa, usuario sin pago", null, "PaymentHook");
          setHasPaid(false);
          setIsLoading(false);
          return;
        }

        // Lógica de Cuenta Master
        const MASTER_EMAILS = ['spineda2014.123@gmail.com', 'spinedaram2000@gmail.com'];
        if (MASTER_EMAILS.includes(session.user.email || '')) {
          logger.info("Usuario master detectado, acceso concedido", { email: session.user.email }, "PaymentHook");
          setHasPaid(true);
          setIsLoading(false);
          return;
        }

        // Hardening: Manejo seguro de la respuesta de la base de datos
        const { data: payments, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1);

        if (error) {
          logger.error("Error al consultar tabla de pagos", formatError(error), "PaymentHook");
          setHasPaid(false);
          return;
        }

        // Uso de optional chaining y nullish coalescing
        const activePayment = payments?.[0] ?? null;

        if (activePayment) {
          logger.info("Pago verificado exitosamente", { paymentId: activePayment.id }, "PaymentHook");
          setHasPaid(true);
          setPaymentRecord(activePayment);
        } else {
          logger.info("No se encontraron pagos completados para el usuario", { userId: session.user.id }, "PaymentHook");
          setHasPaid(false);
        }
      } catch (err) {
        logger.error("Excepción crítica en usePaymentStatus", err, "PaymentHook");
        setHasPaid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      logger.info("Retorno de pago exitoso detectado en URL", null, "PaymentHook");
      const timer = setTimeout(() => {
        checkPaymentStatus();
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return { hasPaid, isLoading, paymentRecord };
};
