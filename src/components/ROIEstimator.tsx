import React, { useMemo } from 'react';
import { TrendingUp, Clock, Zap, Target, CheckCircle2, ArrowRight, BarChart3, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ROIEstimatorProps {
  budget: number;
  platform: 'google' | 'meta' | 'tiktok' | 'linkedin';
}

// Datos por plataforma: métricas base sin FlowSights vs. con FlowSights
const PLATFORM_INFO: Record<
  string,
  {
    label: string;
    emoji: string;
    avgCPC: number;
    avgConversionRate: number;
    avgOrderValue: number;
    // Mejoras estimadas que aporta FlowSights Ads
    cpcReduction: number;       // % de reducción de CPC gracias a copy optimizado
    conversionBoost: number;    // % de aumento en conversiones gracias a creativos IA
    timeSavedHours: number;     // Horas ahorradas por mes en gestión manual
    benefitLabel: string;       // Beneficio principal de la plataforma
  }
> = {
  google: {
    label: 'Google Ads',
    emoji: '🔍',
    avgCPC: 1.5,
    avgConversionRate: 0.03,
    avgOrderValue: 50,
    cpcReduction: 0.22,
    conversionBoost: 0.35,
    timeSavedHours: 8,
    benefitLabel: 'Palabras clave optimizadas por IA',
  },
  meta: {
    label: 'Meta (Facebook/Instagram)',
    emoji: '👥',
    avgCPC: 0.8,
    avgConversionRate: 0.025,
    avgOrderValue: 45,
    cpcReduction: 0.18,
    conversionBoost: 0.40,
    timeSavedHours: 10,
    benefitLabel: 'Creativos visuales generados en segundos',
  },
  tiktok: {
    label: 'TikTok Ads',
    emoji: '🎵',
    avgCPC: 0.5,
    avgConversionRate: 0.02,
    avgOrderValue: 35,
    cpcReduction: 0.15,
    conversionBoost: 0.45,
    timeSavedHours: 7,
    benefitLabel: 'Copy viral adaptado al formato TikTok',
  },
  linkedin: {
    label: 'LinkedIn Ads',
    emoji: '💼',
    avgCPC: 2.5,
    avgConversionRate: 0.04,
    avgOrderValue: 100,
    cpcReduction: 0.20,
    conversionBoost: 0.30,
    timeSavedHours: 9,
    benefitLabel: 'Segmentación profesional inteligente',
  },
};

// Valor estimado por hora de trabajo ahorrada (USD)
const HOURLY_VALUE_USD = 25;

export const ROIEstimator: React.FC<ROIEstimatorProps> = ({ budget, platform }) => {
  const info = PLATFORM_INFO[platform];

  const calc = useMemo(() => {
    // --- Sin FlowSights Ads ---
    const clicksWithout = budget / info.avgCPC;
    const conversionsWithout = clicksWithout * info.avgConversionRate;
    const revenueWithout = conversionsWithout * info.avgOrderValue;

    // --- Con FlowSights Ads ---
    const effectiveCPC = info.avgCPC * (1 - info.cpcReduction);
    const clicksWith = budget / effectiveCPC;
    const conversionRateWith = info.avgConversionRate * (1 + info.conversionBoost);
    const conversionsWith = clicksWith * conversionRateWith;
    const revenueWith = conversionsWith * info.avgOrderValue;

    // --- Diferencias ---
    const extraRevenue = revenueWith - revenueWithout;
    const timeSavedValue = info.timeSavedHours * HOURLY_VALUE_USD;
    const totalBenefit = extraRevenue + timeSavedValue;
    const extraClicks = Math.round(clicksWith - clicksWithout);
    const extraConversions = Math.round(conversionsWith - conversionsWithout);

    return {
      revenueWithout: Math.round(revenueWithout),
      revenueWith: Math.round(revenueWith),
      extraRevenue: Math.round(extraRevenue),
      timeSavedValue: Math.round(timeSavedValue),
      totalBenefit: Math.round(totalBenefit),
      extraClicks,
      extraConversions,
      clicksWith: Math.round(clicksWith),
      conversionsWith: Math.round(conversionsWith),
      timeSavedHours: info.timeSavedHours,
      cpcReductionPct: Math.round(info.cpcReduction * 100),
      conversionBoostPct: Math.round(info.conversionBoost * 100),
    };
  }, [budget, info]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="p-6 border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-transparent backdrop-blur-sm overflow-hidden relative group hover:border-emerald-500/30 transition-all rounded-3xl">
        {/* Glow decorativo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{info.emoji}</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Beneficio con FlowSights</p>
                <p className="text-base font-black text-gray-900 dark:text-white">{info.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ganancia extra</p>
              <p className="text-2xl font-black text-emerald-500">+${calc.totalBenefit.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">USD / mes estimado</p>
            </div>
          </div>

          {/* Comparativa: Sin vs. Con FlowSights */}
          <div className="grid grid-cols-2 gap-3">
            {/* Sin FlowSights */}
            <div className="p-4 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sin FlowSights</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Clics</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{Math.round(budget / info.avgCPC).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Conversiones</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{Math.round((budget / info.avgCPC) * info.avgConversionRate)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 dark:border-white/10 pt-1.5 mt-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Ingresos est.</span>
                  <span className="font-black text-gray-800 dark:text-white">${calc.revenueWithout.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Con FlowSights */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Con FlowSights</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Clics</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {calc.clicksWith.toLocaleString()}
                    <span className="text-[10px] text-emerald-500 ml-1">+{calc.cpcReductionPct}%</span>
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Conversiones</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {calc.conversionsWith.toLocaleString()}
                    <span className="text-[10px] text-emerald-500 ml-1">+{calc.conversionBoostPct}%</span>
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-emerald-500/20 pt-1.5 mt-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Ingresos est.</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">${calc.revenueWith.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Beneficios adicionales */}
          <div className="space-y-2">
            {[
              {
                icon: TrendingUp,
                color: 'text-emerald-500',
                label: 'Ingresos adicionales',
                value: `+$${calc.extraRevenue.toLocaleString()} USD`,
                desc: `Gracias a ${calc.cpcReductionPct}% menos CPC y ${calc.conversionBoostPct}% más conversiones`,
              },
              {
                icon: Clock,
                color: 'text-blue-500',
                label: 'Tiempo ahorrado',
                value: `${calc.timeSavedHours}h / mes`,
                desc: `Equivale a $${calc.timeSavedValue} USD en trabajo manual`,
              },
              {
                icon: Zap,
                color: 'text-yellow-500',
                label: 'Ventaja clave',
                value: info.benefitLabel,
                desc: 'Generado automáticamente por IA en segundos',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
              >
                <div className={`mt-0.5 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.label}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">{item.value}</p>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 dark:border-white/5">
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              💡 Estimaciones basadas en promedios de la industria. Los resultados reales pueden variar según producto, audiencia y mercado.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
