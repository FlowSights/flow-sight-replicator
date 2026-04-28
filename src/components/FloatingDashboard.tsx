import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2, Zap, BarChart3 } from 'lucide-react';

export const FloatingDashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 20;
      const y = (e.clientY - rect.top - rect.height / 2) / 20;
      
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animación de pulso para el glow
  const pulseVariants = {
    animate: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  // Animación de flotación para las capas
  const floatVariants = (delay: number) => ({
    animate: {
      y: [0, -20, 0],
      rotateZ: [0, 5, -5, 0],
      transition: { duration: 6 + delay, repeat: Infinity, ease: 'easeInOut' }
    }
  });

  // Animación de rotación suave
  const rotateVariants = {
    animate: {
      rotateY: [0, 360],
      transition: { duration: 20, repeat: Infinity, ease: 'linear' }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] flex items-center justify-center perspective"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow de fondo pulsante */}
      <motion.div
        variants={pulseVariants}
        animate="animate"
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20 rounded-full blur-3xl"
        style={{ filter: 'blur(80px)' }}
      />

      {/* Contenedor 3D */}
      <motion.div
        style={{
          rotateX: mousePosition.y,
          rotateY: mousePosition.x,
          transformPerspective: '1000px'
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
        className="relative w-full max-w-2xl"
      >
        {/* Capa Base - Glow central */}
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-blue-400/30 rounded-3xl blur-2xl"
        />

        {/* Capa Principal - Dashboard Central */}
        <motion.div
          variants={floatVariants(0)}
          animate="animate"
          className="relative bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-2xl"
          style={{
            boxShadow: isHovered 
              ? '0 0 40px rgba(16, 185, 129, 0.3), 0 0 80px rgba(59, 130, 246, 0.2)' 
              : '0 0 20px rgba(16, 185, 129, 0.1)'
          }}
        >
          {/* Header del Dashboard */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-white/80">FlowSights Analytics</span>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
              <div className="w-2 h-2 rounded-full bg-blue-400/50" />
              <div className="w-2 h-2 rounded-full bg-purple-400/50" />
            </div>
          </div>

          {/* Gráfico de rendimiento */}
          <div className="mb-6">
            <div className="flex items-end justify-between h-24 gap-2">
              {[40, 60, 45, 75, 55, 90, 70, 85].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-white/50 mt-2">
              <span>Lun</span>
              <span>Mié</span>
              <span>Vie</span>
              <span>Dom</span>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="text-xs text-white/60 mb-1">CTR</div>
              <div className="text-lg font-bold text-emerald-400">4.2%</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="text-xs text-white/60 mb-1">Conversiones</div>
              <div className="text-lg font-bold text-blue-400">1,234</div>
            </div>
          </div>
        </motion.div>

        {/* Capa Satélite 1 - Ad Optimized (Arriba Izquierda) */}
        <motion.div
          variants={floatVariants(1)}
          animate="animate"
          className="absolute -top-8 -left-12 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl"
          style={{
            boxShadow: isHovered 
              ? '0 0 30px rgba(16, 185, 129, 0.2)' 
              : '0 0 15px rgba(16, 185, 129, 0.05)'
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-semibold text-white/80">Optimizado</div>
              <div className="text-xs text-white/50">Ads listos</div>
            </div>
          </div>
        </motion.div>

        {/* Capa Satélite 2 - ROI Metrics (Arriba Derecha) */}
        <motion.div
          variants={floatVariants(2)}
          animate="animate"
          className="absolute -top-6 -right-8 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl"
          style={{
            boxShadow: isHovered 
              ? '0 0 30px rgba(59, 130, 246, 0.2)' 
              : '0 0 15px rgba(59, 130, 246, 0.05)'
          }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-xs font-semibold text-white/80">ROI</div>
              <div className="text-xs text-blue-300 font-bold">+450%</div>
            </div>
          </div>
        </motion.div>

        {/* Capa Satélite 3 - Performance (Abajo Izquierda) */}
        <motion.div
          variants={floatVariants(1.5)}
          animate="animate"
          className="absolute -bottom-8 -left-6 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl"
          style={{
            boxShadow: isHovered 
              ? '0 0 30px rgba(168, 85, 247, 0.2)' 
              : '0 0 15px rgba(168, 85, 247, 0.05)'
          }}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-xs font-semibold text-white/80">Rendimiento</div>
              <div className="text-xs text-purple-300 font-bold">Excelente</div>
            </div>
          </div>
        </motion.div>

        {/* Capa Satélite 4 - Power (Abajo Derecha) */}
        <motion.div
          variants={floatVariants(2.5)}
          animate="animate"
          className="absolute -bottom-6 -right-6 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl"
          style={{
            boxShadow: isHovered 
              ? '0 0 30px rgba(234, 179, 8, 0.2)' 
              : '0 0 15px rgba(234, 179, 8, 0.05)'
          }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-xs font-semibold text-white/80">Potencia IA</div>
              <div className="text-xs text-yellow-300 font-bold">Activa</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Partículas de fondo (opcional) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
            animate={{
              x: [Math.random() * 100 - 50, Math.random() * 200 - 100],
              y: [Math.random() * 100 - 50, Math.random() * 200 - 100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};
