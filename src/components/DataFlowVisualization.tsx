import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  glowColor: string;
}

export const DataFlowVisualization = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-15, 15]);

  useEffect(() => {
    const colors = [
      { base: "#10b981", glow: "rgba(16, 185, 129, 0.6)" },
      { base: "#34d399", glow: "rgba(52, 211, 153, 0.6)" },
      { base: "#059669", glow: "rgba(5, 150, 105, 0.6)" },
      { base: "#6ee7b7", glow: "rgba(110, 231, 183, 0.6)" },
      { base: "#064e3b", glow: "rgba(6, 78, 59, 0.4)" } // Color más oscuro para contraste en Light Mode
    ];
    
    const newParticles: Particle[] = Array.from({ length: 70 }, (_, i) => {
      const colorSet = colors[Math.floor(Math.random() * colors.length)];
      return {
        id: i,
        x: Math.random() * 140 - 70,
        y: Math.random() * 140 - 70,
        z: Math.random() * 240 - 120,
        size: Math.random() * 5 + 1.5,
        duration: Math.random() * 10 + 12,
        delay: Math.random() * 5,
        color: colorSet.base,
        glowColor: colorSet.glow,
      };
    });
    setParticles(newParticles);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full flex items-center justify-center perspective-2000 select-none bg-transparent"
    >
      {/* SOMBRA DE CONTACTO DINÁMICA (Suelo virtual) */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 w-48 h-8 bg-black/20 dark:bg-emerald-900/40 blur-3xl rounded-[100%] pointer-events-none"
      />

      {/* LEVITACIÓN GLOBAL */}
      <motion.div
        animate={{
          y: [0, -25, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* CONTENEDOR 3D PRINCIPAL */}
        <motion.div
          style={{ 
            rotateX, 
            rotateY,
            x: mousePos.x * 50,
            y: mousePos.y * 50,
          }}
          className="relative w-72 h-72 md:w-[480px] md:h-[480px] preserve-3d"
        >
          {/* NÚCLEO DE IA - CONTRASTE MEJORADO */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotateZ: [0, 10, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[32%] rounded-full bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-900 z-20 border border-emerald-200/30 shadow-[0_0_100px_rgba(16,185,129,0.4)] dark:shadow-[0_0_100px_rgba(16,185,129,0.6)]"
            style={{ transform: "translateZ(60px)" }}
          >
            {/* Reflejo especular */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.4),transparent_60%)]" />
            {/* Oclusión ambiental interna */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.3)] pointer-events-none" />
            {/* Aura adaptativa */}
            <div className="absolute -inset-20 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-[80px] pointer-events-none" />
          </motion.div>

          {/* ANILLOS ORBITALES */}
          {[0, 45, 90, 135].map((rotation, i) => (
            <motion.div
              key={i}
              animate={{ rotateZ: 360 }}
              transition={{ duration: 25 + i * 10, repeat: Infinity, ease: "linear" }}
              style={{ 
                rotateX: rotation, 
                rotateY: rotation / 4,
                transformStyle: "preserve-3d"
              }}
              className="absolute inset-0 rounded-full border-[1px] border-emerald-500/20 dark:border-emerald-500/15"
            >
              <motion.div 
                animate={{ 
                  scale: [0.8, 1.4, 0.8],
                  opacity: [0.4, 0.9, 0.4]
                }}
                transition={{ duration: 5, repeat: Infinity, delay: i }}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.8)]" 
                style={{ 
                  transform: "translateZ(30px)",
                  background: "radial-gradient(circle at 30% 30%, #ffffff, #10b981)"
                }}
              />
            </motion.div>
          ))}

          {/* NUBE DE PARTÍCULAS VOLUMÉTRICAS CON SOMBRAS */}
          {particles.map((p) => {
            const scale = (p.z + 150) / 200;
            const opacity = (p.z + 150) / 300;

            return (
              <motion.div
                key={p.id}
                animate={{
                  x: [p.x + "%", (p.x + 10) + "%", p.x + "%"],
                  y: [p.y + "%", (p.y - 10) + "%", p.y + "%"],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "easeInOut"
                }}
                className="absolute rounded-full"
                style={{
                  width: p.size * scale,
                  height: p.size * scale,
                  background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${p.color} 40%, rgba(0,0,0,0.5) 100%)`,
                  // Sombra proyectada por la partícula para dar profundidad en Light Mode
                  boxShadow: `0 ${p.size/2}px ${p.size}px rgba(0,0,0,0.15), 0 0 ${p.size * 2}px ${p.glowColor}`,
                  opacity: opacity * 0.85,
                  left: "50%",
                  top: "50%",
                  transform: `translateZ(${p.z}px)`,
                  willChange: "transform, opacity"
                }}
              />
            );
          })}

          {/* LÍNEAS DE CONEXIÓN */}
          <svg className="absolute inset-[-40%] w-[180%] h-[180%] pointer-events-none opacity-30">
            {particles.slice(0, 12).map((p, i) => (
              <motion.line
                key={i}
                x1="50%"
                y1="50%"
                x2={`${50 + p.x}%`}
                y2={`${50 + p.y}%`}
                stroke="url(#lineGradient)"
                strokeWidth="0.7"
                animate={{ 
                  opacity: [0.1, 0.4, 0.1],
                }}
                transition={{ duration: 7, repeat: Infinity, delay: i }}
                style={{ strokeDasharray: "3, 6" }}
              />
            ))}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>

      {/* ETIQUETA FLOTANTE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full border border-emerald-500/30 bg-white/40 dark:bg-emerald-500/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 relative" />
          </div>
          <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-emerald-600 dark:text-emerald-400">
            FlowSights Engine v2.2
          </span>
        </div>
      </motion.div>
    </div>
  );
};
