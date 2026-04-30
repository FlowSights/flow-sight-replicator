import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

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

        // Obtener la sesión del usuario
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setHasPaid(false);
          setIsLoading(false);
          return;
        }

        // Lógica de Cuenta Master para el Creador (múltiples cuentas autorizadas)
        const MASTER_EMAILS = ['spineda2014.123@gmail.com', 'spinedaram2000@gmail.com'];
        if (MASTER_EMAILS.includes(session.user.email || '')) {
          setHasPaid(true);
          setIsLoading(false);
          return;
        }

        // Buscar un pago completado para este usuario
        const { data: payments, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error al verificar estado de pago:', error);
          setHasPaid(false);
          return;
        }

        if (payments && payments.length > 0) {
          setHasPaid(true);
          setPaymentRecord(payments[0]);
        } else {
          setHasPaid(false);
        }
      } catch (err) {
        console.error('Error en usePaymentStatus:', err);
        setHasPaid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();

    // Verificar también si hay parámetro ?payment=success en la URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      // Esperar un poco para que Stripe actualice el estado en la BD
      const timer = setTimeout(() => {
        checkPaymentStatus();
        // Limpiar el parámetro de la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return { hasPaid, isLoading, paymentRecord };
};
