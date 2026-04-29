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
    { id: 'meta', name: 'Meta (Facebook/Instagram)', emoji: '📘' },
    { id: 'google', name: 'Google Ads', emoji: '🔍' },
    { id: 'tiktok', name: 'TikTok Ads', emoji: '🎵' },
    { id: 'linkedin', name: 'LinkedIn Ads', emoji: '💼' },
  ];

  return (
    <div className="space-y-6">
      {/* Selector de Plataforma */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
          ¿Dónde quieres anunciar?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id as any)}
              className={`p-3 rounded-lg border-2 transition ${
                selectedPlatform === platform.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <p className="text-lg mb-1">{platform.emoji}</p>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {platform.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Slider de Presupuesto */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold text-gray-900 dark:text-white">
            Tu inversión
          </label>
          <span className="text-2xl font-bold text-green-600">${budget}</span>
        </div>
        <input
          type="range"
          min="50"
          max="5000"
          step="50"
          value={budget}
          onChange={(e) => onBudgetChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>$50</span>
          <span>$5,000</span>
        </div>
      </div>

      {/* Resultados Estimados */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Lo que puedes esperar
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Personas Alcanzadas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center"
          >
            <Users className="mx-auto text-blue-500 mb-2" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {estimates.reach.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Personas verán tu anuncio
            </p>
          </motion.div>

          {/* Clics Esperados */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center"
          >
            <TrendingUp className="mx-auto text-purple-500 mb-2" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {estimates.clicks.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Clics en tu anuncio
            </p>
          </motion.div>

          {/* Conversiones Estimadas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center"
          >
            <Clock className="mx-auto text-orange-500 mb-2" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {estimates.conversions}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Clientes potenciales
            </p>
          </motion.div>

          {/* Ingresos Estimados */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center"
          >
            <DollarSign className="mx-auto text-green-500 mb-2" size={24} />
            <p className="text-2xl font-bold text-green-600">
              ${estimates.estimatedRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Ingresos estimados
            </p>
          </motion.div>
        </div>

        {/* ROI */}
        <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-300 font-medium">Retorno de Inversión (ROI)</p>
            <motion.p
              key={estimates.roi}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`text-3xl font-bold ${
                estimates.roi >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {estimates.roi >= 0 ? '+' : ''}{estimates.roi}%
            </motion.p>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Por cada $1 que inviertes, esperas recuperar ${(1 + estimates.roi / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Estas son estimaciones basadas en datos promedio. Los resultados reales pueden variar según
        tu industria, audiencia y creatividad del anuncio.
      </p>
    </div>
  );
};
