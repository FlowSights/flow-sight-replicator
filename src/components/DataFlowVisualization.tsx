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
      { base: "#10b981", glow: "rgba(16, 185, 129, 0.9)" },
      { base: "#34d399", glow: "rgba(52, 211, 153, 0.9)" },
      { base: "#059669", glow: "rgba(5, 150, 105, 0.9)" },
      { base: "#ffffff", glow: "rgba(255, 255, 255, 0.8)" }
    ];
    
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => {
      const colorSet = colors[i % colors.length];
      return {
        id: i,
        x: Math.random() * 140 - 70,
        y: Math.random() * 140 - 70,
        z: Math.random() * 240 - 120,
        size: 6, // Tamaño constante
        duration: Math.random() * 8 + 10,
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
      {/* SOMBRA DE CONTACTO */}
      <div className="absolute bottom-5 w-64 h-12 bg-emerald-900/20 dark:bg-emerald-900/40 blur-[50px] rounded-[100%] pointer-events-none" />

      {/* LEVITACIÓN GLOBAL */}
      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* CONTENEDOR 3D PRINCIPAL */}
        <motion.div
          style={{ 
            rotateX, 
            rotateY,
            x: mousePos.x * 60,
            y: mousePos.y * 60,
          }}
          className="relative w-80 h-80 md:w-[500px] md:h-[500px] preserve-3d"
        >
          {/* NÚCLEO DE IA */}
          <motion.div
            animate={{ rotateZ: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[32%] rounded-full z-20 border-2 border-emerald-300/40 shadow-[0_0_100px_rgba(16,185,129,0.6)]"
            style={{ 
              transform: "translateZ(80px)",
              background: "radial-gradient(circle at 30% 30%, #ffffff 0%, #10b981 30%, #064e3b 100%)"
            }}
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.4),transparent_60%)]" />
            <div className="absolute -inset-20 rounded-full bg-emerald-500/20 blur-[80px] pointer-events-none" />
          </motion.div>

          {/* ANILLOS ORBITALES REFORZADOS */}
          {[0, 45, 90, 135].map((rotation, i) => (
            <motion.div
              key={i}
              animate={{ rotateZ: 360 }}
              transition={{ duration: 25 + i * 10, repeat: Infinity, ease: "linear" }}
              style={{ 
                rotateX: rotation, 
                rotateY: rotation / 3,
                transformStyle: "preserve-3d"
              }}
              className="absolute inset-0 rounded-full border-[3px] border-emerald-500/50 dark:border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {/* ELECTRÓN TIPO DESTELLO - CON BILLBOARDING */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center" 
                style={{ 
                  transform: `translateZ(40px) rotateX(${-rotation}deg) rotateY(${-rotation/3}deg)`,
                  // El billboarding se logra contrarrestando la rotación del padre
                }}
              >
                {/* Núcleo del destello */}
                <div className="w-2.5 h-2.5 bg-white rounded-full z-10 shadow-[0_0_15px_#fff]" />
                {/* Aura de fuego/energía */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.6, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    background: "radial-gradient(circle, #34d399 0%, rgba(16, 185, 129, 0) 70%)",
                    filter: "blur(2px)"
                  }}
                />
                {/* Resplandor exterior potente */}
                <div className="absolute -inset-4 rounded-full bg-emerald-500/40 blur-md animate-pulse" />
              </div>
            </motion.div>
          ))}

          {/* NUBE DE PARTÍCULAS TIPO DESTELLO - CON BILLBOARDING */}
          {particles.map((p) => {
            const opacity = (p.z + 150) / 300;

            return (
              <motion.div
                key={p.id}
                animate={{
                  x: [p.x + "%", (p.x + 12) + "%", p.x + "%"],
                  y: [p.y + "%", (p.y - 12) + "%", p.y + "%"],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "easeInOut"
                }}
                className="absolute flex items-center justify-center"
                style={{
                  width: p.size,
                  height: p.size,
                  left: "50%",
                  top: "50%",
                  // Billboarding: contrarrestamos la rotación del contenedor principal
                  transform: `translateZ(${p.z}px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))`,
                  willChange: "transform, opacity",
                  opacity: opacity * 0.95
                }}
              >
                {/* Núcleo de la partícula */}
                <div 
                  className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" 
                  style={{ backgroundColor: p.color === "#ffffff" ? "#fff" : p.color }}
                />
                {/* Aura de la partícula */}
                <div 
                  className="absolute -inset-3 rounded-full blur-[4px]"
                  style={{ background: `radial-gradient(circle, ${p.glowColor} 0%, transparent 80%)` }}
                />
              </motion.div>
            );
          })}

          {/* LÍNEAS DE CONEXIÓN */}
          <svg className="absolute inset-[-50%] w-[200%] h-[200%] pointer-events-none opacity-50">
            {particles.slice(0, 15).map((p, i) => (
              <motion.line
                key={i}
                x1="50%"
                y1="50%"
                x2={`${50 + p.x}%`}
                y2={`${50 + p.y}%`}
                stroke="url(#lineGradient)"
                strokeWidth="1.5"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, delay: i }}
                style={{ strokeDasharray: "5, 10" }}
              />
            ))}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>

      {/* ETIQUETA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full border-2 border-emerald-500/50 bg-white/70 dark:bg-emerald-950/50 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
          </div>
          <span className="text-[12px] font-black tracking-[0.5em] uppercase text-emerald-800 dark:text-emerald-200">
            FlowSights Engine v2.5
          </span>
        </div>
      </motion.div>
    </div>
  );
};
