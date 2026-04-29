import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Rocket } from 'lucide-react';

interface PremiumLoadingScreenProps {
  isVisible: boolean;
  progress?: number;
}

export const PremiumLoadingScreen: React.FC<PremiumLoadingScreenProps> = ({ isVisible, progress = 0 }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'Analizando Mercado', subtitle: 'Identificando patrones de conversión', icon: Zap },
    { title: 'Generando Estrategia', subtitle: 'Diseñando tu Campaign Kit Premium', icon: ShieldCheck },
    { title: 'Optimizando Creativos', subtitle: 'Aplicando IA de alto rendimiento', icon: Sparkles },
    { title: 'Finalizando Dossier', subtitle: 'Preparando tu reporte de 15 páginas', icon: Rocket },
  ];

  useEffect(() => {
    if (isVisible) {
      // Sincronizar el paso visual con el progreso real si existe, o usar un intervalo
      if (progress > 0) {
        const calculatedStep = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
        setStep(calculatedStep);
      } else {
        const interval = setInterval(() => {
          setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 2500);
        return () => clearInterval(interval);
      }
    } else {
      setStep(0);
    }
  }, [isVisible, progress]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black p-6 text-center overflow-hidden"
        >
          {/* Immersive Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/4 -left-1/4 w-full h-full bg-emerald-500/10 rounded-full blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, -90, 0]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-blue-500/10 rounded-full blur-[120px]" 
            />
          </div>

          <div className="relative z-10 max-w-2xl w-full">
            {/* Animated Icon Container */}
            <motion.div
              key={step}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="mx-auto mb-12 flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]"
            >
              {React.createElement(steps[step].icon, { className: "h-12 w-12 text-emerald-400" })}
            </motion.div>

            {/* Text Content */}
            <div className="space-y-6 mb-16">
              <motion.h2 
                key={`title-${step}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl md:text-6xl font-black text-white tracking-tight"
              >
                {steps[step].title}
              </motion.h2>
              <motion.p 
                key={`subtitle-${step}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 0.6 }}
                className="text-xl text-gray-400 font-medium"
              >
                {steps[step].subtitle}
              </motion.p>
            </div>

            {/* Premium Progress Bar */}
            <div className="mx-auto max-w-md">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: progress > 0 ? `${progress}%` : `${((step + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>

              {/* Step Indicators */}
              <div className="mt-10 flex justify-center gap-4">
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: i === step ? 1.5 : 1,
                      opacity: i === step ? 1 : 0.2,
                      backgroundColor: i === step ? '#10b981' : '#ffffff'
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-1.5 w-1.5 rounded-full"
                  />
                ))}
              </div>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-20 text-xs font-black text-white/20 uppercase tracking-[0.6em]"
            >
              FlowSight Ads Premium AI Experience
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
