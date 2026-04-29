import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  CreditCard,
  Loader2
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
  campaignName?: string;
  amount?: number;
  currency?: string;
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  campaignId = 'flowsights-ads-kit',
  campaignName = 'Campaign Kit',
  amount = 4999,
  currency = 'USD',
}) => {
  const { initiateCheckout, loading } = useStripeCheckout();

  const handlePayment = async () => {
    await initiateCheckout({
      campaignId,
      amount,
      currency,
      successUrl: `${window.location.origin}/flowsight-ads/dashboard?payment=success&campaignId=${campaignId}`,
      cancelUrl: `${window.location.origin}/flowsight-ads/dashboard?payment=cancelled`,
    });
  };

  // Validar que la moneda sea válida, por defecto USD
  const validCurrency = currency && /^[A-Z]{3}$/.test(currency) ? currency : 'USD';
  
  let formattedAmount = '';
  try {
    formattedAmount = (amount / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: validCurrency,
    });
  } catch (error) {
    // Fallback si hay error
    formattedAmount = `$${(amount / 100).toFixed(2)}`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden p-0">
        {/* Línea de acento superior esmeralda */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
        
        <div className="p-8 space-y-6">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Zap className="w-8 h-8" />
              </div>
            </div>
            <DialogTitle className="text-3xl font-black text-center text-white tracking-tight">
              Desbloquea tu <span className="text-emerald-500">Campaign Kit</span>
            </DialogTitle>
            <DialogDescription className="text-center text-lg text-gray-400 mt-2 leading-relaxed">
              Estás a un paso de obtener todo el material profesional para tu campaña de <span className="font-bold text-white">{campaignName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
              <h4 className="font-bold text-white flex items-center gap-2 text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> ¿Qué incluye este kit?
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  Descarga de PDF Premium con todos los anuncios
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  Guía visual paso a paso para publicar
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  Acceso directo a las plataformas de Ads
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  Métricas de ROI proyectadas personalizadas
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-gray-400 font-medium">Total a pagar:</span>
              <span className="text-3xl font-black text-emerald-500 tracking-tighter">{formattedAmount}</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-4">
            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-8 text-xl font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/10 transition-all active:scale-[0.98] gap-3 border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  Proceder al Pago
                </>
              )}
            </Button>
            <div className="flex flex-col items-center gap-2">
              <p className="text-center text-[10px] uppercase tracking-widest text-gray-500 flex items-center justify-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" /> Pago seguro procesado por Stripe
              </p>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
