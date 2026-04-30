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
}

export const DataFlowVisualization = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  useEffect(() => {
    const colors = ["#10b981", "#34d399", "#059669"];
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      z: Math.random() * 100 - 50,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 5 + 7,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
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
      className="relative w-full h-full flex items-center justify-center perspective-1000 select-none bg-transparent"
    >
      {/* CONTENEDOR 3D PRINCIPAL - SIN FONDOS SÓLIDOS */}
      <motion.div
        style={{ 
          rotateX, 
          rotateY,
          x: mousePos.x * 30,
          y: mousePos.y * 30,
        }}
        className="relative w-72 h-72 md:w-[400px] md:h-[400px] preserve-3d"
      >
        {/* NÚCLEO DE IA - REFINADO Y TRANSLÚCIDO */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-1/4 rounded-full bg-gradient-to-br from-emerald-400/40 via-emerald-600/30 to-emerald-900/40 backdrop-blur-sm z-20 border border-emerald-500/20"
        >
          {/* Brillo interno suave */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
          
          {/* Aura de resplandor sutil */}
          <div className="absolute -inset-10 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        </motion.div>

        {/* ANILLOS ORBITALES 3D - MÁS FINOS */}
        {[0, 60, 120].map((rotation, i) => (
          <motion.div
            key={i}
            animate={{ rotateZ: 360 }}
            transition={{ duration: 20 + i * 8, repeat: Infinity, ease: "linear" }}
            style={{ rotateX: rotation, rotateY: rotation / 3 }}
            className="absolute inset-0 rounded-full border border-emerald-500/10 preserve-3d"
          >
            <motion.div 
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: i }}
              className="absolute top-0 left-1/2 w-2 h-2 bg-emerald-400/60 rounded-full blur-[1px]" 
            />
          </motion.div>
        ))}

        {/* NUBE DE PARTÍCULAS DE DATOS - MÁS SUTILES */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              x: [p.x + "%", (p.x + 5) + "%", p.x + "%"],
              y: [p.y + "%", (p.y - 5) + "%", p.y + "%"],
              z: [p.z, p.z + 30, p.z],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: 0.4,
              left: "50%",
              top: "50%",
            }}
          />
        ))}

        {/* LÍNEAS DE CONEXIÓN NEURALES - MUY TENUES */}
        <svg className="absolute inset-[-20%] w-[140%] h-[140%] pointer-events-none opacity-10">
          {particles.slice(0, 6).map((p, i) => (
            <motion.line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${50 + p.x}%`}
              y2={`${50 + p.y}%`}
              stroke="currentColor"
              className="text-emerald-500"
              strokeWidth="0.5"
              animate={{ opacity: [0.05, 0.2, 0.05] }}
              transition={{ duration: 6, repeat: Infinity, delay: i }}
              style={{ strokeDasharray: "4, 4" }}
            />
          ))}
        </svg>
      </motion.div>

      {/* ETIQUETA FLOTANTE PREMIUM - MÁS DISCRETA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-emerald-500/60">
            Neural Engine
          </span>
        </div>
      </motion.div>
    </div>
  );
};
