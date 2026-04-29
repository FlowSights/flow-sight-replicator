import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AppleStyleLoadingScreenProps {
  isVisible: boolean;
  currentStep: number;
  totalSteps?: number;
}

const loadingMessages = [
  { title: 'Analizando tu negocio', subtitle: 'Comprendiendo tu modelo y audiencia' },
  { title: 'Generando estrategia', subtitle: 'Creando copys optimizados con IA' },
  { title: 'Optimizando anuncios', subtitle: 'Adaptando para cada plataforma' },
  { title: 'Finalizando', subtitle: 'Preparando tu Campaign Kit Premium' },
];

export const AppleStyleLoadingScreen: React.FC<AppleStyleLoadingScreenProps> = ({
  isVisible,
  currentStep,
  totalSteps = 4,
}) => {
  const [displayedMessage, setDisplayedMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    if (currentStep < loadingMessages.length) {
      setDisplayedMessage(loadingMessages[currentStep]);
    }
  }, [currentStep]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 z-50 flex flex-col items-center justify-center"
    >
      {/* Contenedor Principal */}
      <div className="flex flex-col items-center gap-8 max-w-md mx-auto px-6">
        {/* Icono Animado */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={32} />
          </div>
          {/* Anillo de carga */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-2 border-transparent border-t-green-400 border-r-blue-600 rounded-full"
          />
        </motion.div>

        {/* Texto Principal */}
        <motion.div
          key={`msg-${currentStep}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {displayedMessage.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {displayedMessage.subtitle}
          </p>
        </motion.div>

        {/* Barra de Progreso */}
        <div className="w-full max-w-xs">
          <div className="h-1 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-green-400 to-blue-600 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
            {currentStep + 1} de {totalSteps}
          </p>
        </div>

        {/* Puntos de Progreso */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i <= currentStep ? 1 : 0.8,
                opacity: i <= currentStep ? 1 : 0.3,
              }}
              transition={{ duration: 0.3 }}
              className={`w-2 h-2 rounded-full ${
                i <= currentStep
                  ? 'bg-gradient-to-r from-green-400 to-blue-600'
                  : 'bg-gray-400 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Mensaje Inspirador */}
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4"
        >
          Tu Campaign Kit Premium está casi listo...
        </motion.p>
      </div>
    </motion.div>
  );
};
