import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, Zap, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

interface ROIEstimatorProps {
  budget: number;
  platform: 'google' | 'meta' | 'tiktok' | 'linkedin';
}

// Friendly platform labels and descriptions
const PLATFORM_INFO: Record<string, { label: string; emoji: string; description: string; avgCTR: number; avgCPC: number; avgConversionRate: number; avgOrderValue: number }> = {
  google: {
    label: 'Google Ads',
    emoji: '🔍',
    description: 'Personas buscando activamente lo que vendes',
    avgCTR: 0.04,
    avgCPC: 1.5,
    avgConversionRate: 0.03,
    avgOrderValue: 50
  },
  meta: {
    label: 'Meta (Facebook/Instagram)',
    emoji: '👥',
    description: 'Alcanza a tu audiencia mientras se relajan',
    avgCTR: 0.015,
    avgCPC: 0.8,
    avgConversionRate: 0.025,
    avgOrderValue: 45
  },
  tiktok: {
    label: 'TikTok',
    emoji: '🎵',
    description: 'Conecta con audiencias jóvenes y creativas',
    avgCTR: 0.025,
    avgCPC: 0.5,
    avgConversionRate: 0.02,
    avgOrderValue: 35
  },
  linkedin: {
    label: 'LinkedIn',
    emoji: '💼',
    description: 'Profesionales interesados en soluciones B2B',
    avgCTR: 0.018,
    avgCPC: 2.5,
    avgConversionRate: 0.04,
    avgOrderValue: 100
  }
};

export const ROIEstimator: React.FC<ROIEstimatorProps> = ({ budget, platform }) => {
  const [optimizationLevel, setOptimizationLevel] = useState(100);
  
  const info = PLATFORM_INFO[platform];
  
  const calculations = useMemo(() => {
    const clicks = (budget / info.avgCPC);
    const conversions = clicks * info.avgConversionRate * (optimizationLevel / 100);
    const revenue = conversions * info.avgOrderValue;
    const profit = revenue - budget;
    const roi = ((revenue - budget) / budget) * 100;
    
    return {
      clicks: Math.round(clicks),
      conversions: Math.round(conversions),
      revenue: Math.round(revenue),
      profit: Math.round(profit),
      roi: Math.round(roi),
      profitPerConversion: conversions > 0 ? Math.round((profit / conversions)) : 0
    };
  }, [budget, info, optimizationLevel]);

  const isPositiveProfit = calculations.profit >= 0;
  const profitColor = isPositiveProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const bgGradient = isPositiveProfit 
    ? 'from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5'
    : 'from-orange-500/10 to-orange-600/10 dark:from-orange-500/5 dark:to-orange-600/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className={`p-6 border border-white/10 dark:border-white/5 bg-gradient-to-br ${bgGradient} backdrop-blur-sm overflow-hidden relative group hover:border-emerald-500/20 transition-all`}>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{info.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Tu potencial con</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{info.label}</p>
                </div>
              </div>
              <div className={`text-right ${profitColor}`}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Ganancia Estimada</p>
                <p className="text-3xl font-black">{isPositiveProfit ? '+' : ''}<span>${Math.abs(calculations.profit).toLocaleString()}</span></p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">{info.description}</p>
          </div>

          {/* Optimization Slider */}
          <div className="mb-6 p-4 bg-white/5 dark:bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                ¿Qué tan bien optimizarás tu campaña?
              </label>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg">
                {optimizationLevel}%
              </span>
            </div>
            <Slider
              value={[optimizationLevel]}
              onValueChange={(value) => setOptimizationLevel(value[0])}
              min={50}
              max={150}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {optimizationLevel <= 80 && "Ajusta hacia arriba si vas a optimizar bien tu landing page y copywriting"}
              {optimizationLevel > 80 && optimizationLevel <= 120 && "¡Buen punto! Esto es realista para campañas bien ejecutadas"}
              {optimizationLevel > 120 && "Ambicioso, pero posible si tienes experiencia en conversiones"}
            </p>
          </div>

          {/* Key Metrics - Simplified */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { 
                label: 'Personas que verán tu anuncio', 
                value: calculations.clicks.toLocaleString(), 
                icon: Users,
                color: 'text-blue-500',
                hint: 'Clics'
              },
              { 
                label: 'Clientes potenciales', 
                value: calculations.conversions.toLocaleString(), 
                icon: Target,
                color: 'text-emerald-500',
                hint: 'Conversiones'
              },
              { 
                label: 'Dinero que entraría', 
                value: `$${calculations.revenue.toLocaleString()}`, 
                icon: TrendingUp,
                color: 'text-green-500',
                hint: 'Ingresos'
              },
              { 
                label: 'Ganancia por cliente', 
                value: `$${Math.max(0, calculations.profitPerConversion)}`, 
                icon: Zap,
                color: 'text-yellow-500',
                hint: 'Margen'
              }
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                className="p-3 bg-white/5 dark:bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-all group/metric"
              >
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">{metric.label}</p>
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white">{metric.value}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">{metric.hint}</p>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA or Note */}
          <div className="pt-3 border-t border-white/5">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Estos números se basan en promedios de la industria. Tu resultado real depende de tu producto, audiencia y creatividad.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
