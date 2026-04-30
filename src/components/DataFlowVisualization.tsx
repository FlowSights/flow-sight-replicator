import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface Electron {
  id: number;
  orbitId: number;
  speed: number;
  delay: number;
  color: string;
}

export const DataFlowVisualization = () => {
  const [electrons, setElectrons] = useState<Electron[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-15, 15]);

  useEffect(() => {
    const colors = ["#10b981", "#34d399", "#ffffff"];
    // Creamos electrones específicos para las órbitas
    const newElectrons: Electron[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      orbitId: i % 4, // Distribuidos en las 4 órbitas
      speed: 15 + Math.random() * 10,
      delay: Math.random() * -20,
      color: colors[i % colors.length],
    }));
    setElectrons(newElectrons);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const orbits = [
    { rx: 0, ry: 0, rz: 0 },
    { rx: 45, ry: 45, rz: 0 },
    { rx: -45, ry: 45, rz: 0 },
    { rx: 90, ry: 0, rz: 0 }
  ];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full flex items-center justify-center perspective-2000 select-none bg-transparent"
    >
      {/* SOMBRA DE CONTACTO */}
      <div className="absolute bottom-5 w-64 h-12 bg-emerald-900/10 dark:bg-emerald-900/30 blur-[60px] rounded-[100%] pointer-events-none" />

      {/* LEVITACIÓN GLOBAL */}
      <motion.div
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
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
          className="relative w-80 h-80 md:w-[480px] md:h-[480px] preserve-3d"
        >
          {/* NÚCLEO CENTRAL */}
          <div className="absolute inset-[35%] rounded-full z-20 border-2 border-emerald-400/30 shadow-[0_0_80px_rgba(16,185,129,0.4)]"
            style={{ 
              transform: "translateZ(40px)",
              background: "radial-gradient(circle at 30% 30%, #ffffff 0%, #10b981 40%, #064e3b 100%)"
            }}
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.3),transparent_60%)]" />
          </div>

          {/* ÓRBITAS COMO RAÍLES TÉCNICOS */}
          {orbits.map((orbit, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border-[3px] border-emerald-500/40 dark:border-emerald-500/20 preserve-3d"
              style={{ 
                transform: `rotateX(${orbit.rx}deg) rotateY(${orbit.ry}deg) rotateZ(${orbit.rz}deg)` 
              }}
            >
              {/* ELECTRONES ANCLADOS A LA ÓRBITA */}
              {electrons.filter(e => e.orbitId === i).map((electron) => (
                <motion.div
                  key={electron.id}
                  animate={{ rotateZ: [0, 360] }}
                  transition={{ 
                    duration: electron.speed, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: electron.delay 
                  }}
                  className="absolute inset-0 preserve-3d"
                >
                  {/* Partícula limpia sin halo */}
                  <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ 
                      transform: `rotateX(${-orbit.rx}deg) rotateY(${-orbit.ry}deg)`, // Billboarding
                      background: `radial-gradient(circle at 30% 30%, #ffffff, ${electron.color})`,
                      border: "1px solid rgba(255,255,255,0.4)"
                    }}
                  />
                </motion.div>
              ))}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ETIQUETA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 px-8 py-2 rounded-full border border-emerald-500/30 bg-white/50 dark:bg-emerald-950/30 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-emerald-700 dark:text-emerald-300">
            FlowSights Engine v3.0
          </span>
        </div>
      </motion.div>
    </div>
  );
};
