import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimplifiedROICalculatorProps {
  budget: number;
  onBudgetChange: (budget: number) => void;
}

export const SimplifiedROICalculator: React.FC<SimplifiedROICalculatorProps> = ({
  budget,
  onBudgetChange,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'meta' | 'google' | 'tiktok' | 'linkedin'>('meta');

  // Estimaciones simplificadas por plataforma
  const estimates = useMemo(() => {
    const baseMetrics = {
      meta: { reach: 15000, clicks: 450, cpc: 0.25, conversion: 0.05 },
      google: { reach: 8000, clicks: 600, cpc: 0.35, conversion: 0.08 },
      tiktok: { reach: 25000, clicks: 800, cpc: 0.15, conversion: 0.03 },
      linkedin: { reach: 5000, clicks: 250, cpc: 0.80, conversion: 0.12 },
    };

    const metrics = baseMetrics[selectedPlatform];
    const scaleFactor = budget / 100; // Escalar según presupuesto

    return {
      reach: Math.round(metrics.reach * scaleFactor),
      clicks: Math.round(metrics.clicks * scaleFactor),
      conversions: Math.round((metrics.clicks * scaleFactor * metrics.conversion) / 100),
      avgOrderValue: 150, // Valor promedio de orden
      estimatedRevenue: Math.round(
        (metrics.clicks * scaleFactor * metrics.conversion * 150) / 100
      ),
      roi: Math.round(
        (((metrics.clicks * scaleFactor * metrics.conversion * 150) / 100 - budget) / budget) * 100
      ),
    };
  }, [budget, selectedPlatform]);

  const platforms = [
    { id: 'meta', name: 'Meta', label: 'Facebook/Instagram' },
    { id: 'google', name: 'Google', label: 'Search Ads' },
    { id: 'tiktok', name: 'TikTok', label: 'TikTok Ads' },
    { id: 'linkedin', name: 'LinkedIn', label: 'LinkedIn Ads' },
  ];

  const platformColors: Record<string, string> = {
    meta: 'from-blue-500 to-blue-600',
    google: 'from-red-500 to-yellow-500',
    tiktok: 'from-gray-900 to-black',
    linkedin: 'from-blue-700 to-blue-500',
  };

  return (
    <div className="space-y-8">
      {/* Selector de Plataforma Premium */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Selecciona tu plataforma
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {platforms.map((platform) => (
            <motion.button
              key={platform.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlatform(platform.id as any)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                selectedPlatform === platform.id
                  ? `border-emerald-500 bg-gradient-to-br ${platformColors[platform.id]} text-white shadow-lg shadow-emerald-500/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
              }`}
            >
              <p className={`font-bold text-sm ${selectedPlatform === platform.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {platform.name}
              </p>
              <p className={`text-xs mt-1 ${selectedPlatform === platform.id ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                {platform.label}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Slider de Presupuesto Premium */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
            Tu inversión
          </label>
          <motion.span 
            key={budget}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-4xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"
          >
            ${budget.toLocaleString('es-ES')}
          </motion.span>
        </div>
        <input
          type="range"
          min="50"
          max="5000"
          step="50"
          value={budget}
          onChange={(e) => onBudgetChange(Number(e.target.value))}
          className="w-full h-3 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-emerald-500 shadow-lg"
        />
        <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mt-4">
          <span>$50</span>
          <span>$5,000</span>
        </div>
      </div>

      {/* Resultados Estimados Premium */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Lo que puedes esperar
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Personas Alcanzadas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                Alcance
              </p>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {estimates.reach.toLocaleString('es-ES')}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Personas verán tu anuncio
            </p>
          </motion.div>

          {/* Clics Esperados */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                Clics
              </p>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {estimates.clicks.toLocaleString('es-ES')}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Clics en tu anuncio
            </p>
          </motion.div>

          {/* Conversiones Estimadas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Clock className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                Conversiones
              </p>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {estimates.conversions}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Clientes potenciales
            </p>
          </motion.div>

          {/* Ingresos Estimados */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                Ingresos
              </p>
            </div>
            <p className="text-3xl font-black text-green-600 dark:text-green-400">
              ${estimates.estimatedRevenue.toLocaleString('es-ES')}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Ingresos estimados
            </p>
          </motion.div>
        </div>

        {/* ROI Premium */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-8 border-2 border-emerald-200 dark:border-emerald-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                Retorno de Inversión
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Por cada $1 que inviertes, esperas recuperar ${(1 + estimates.roi / 100).toFixed(2)}
              </p>
            </div>
            <motion.p
              key={estimates.roi}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`text-5xl font-black ${
                estimates.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {estimates.roi >= 0 ? '+' : ''}{estimates.roi}%
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Disclaimer Premium */}
      <p className="text-xs text-gray-600 dark:text-gray-400 text-center italic">
        Estas son estimaciones basadas en datos promedio. Los resultados reales pueden variar según tu industria, audiencia y creatividad del anuncio.
      </p>
    </div>
  );
};
