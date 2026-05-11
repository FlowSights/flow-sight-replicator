import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DataFlowVisualization } from "./DataFlowVisualization";
import { useRef } from "react";

interface PremiumHeroProps {
  onContactClick?: () => void;
}

export const PremiumHero = ({ onContactClick }: PremiumHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Scale down and fade out the text as user scrolls down
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  
  // Scale up the background visual
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* INITIAL BLACK REVEAL OVERLAY */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0 z-50 bg-black pointer-events-none"
      />

      {/* IMMERSIVE BACKGROUND VISUAL */}
      <motion.div 
        style={{ scale: bgScale }}
        className="absolute inset-0 z-0 flex items-center justify-center opacity-100"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          className="absolute inset-0 bg-[#020605]"
        >
          <video 
            src="/videos/demo.mp4" 
            autoPlay 
            muted 
            loop 
            playsInline
            onCanPlay={(e) => { e.currentTarget.style.opacity = '1'; }}
            className="w-full h-full object-cover opacity-0 transition-opacity duration-[2000ms] ease-out"
          />
        </motion.div>
        {/* Very subtle dark gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
      </motion.div>

      {/* FOREGROUND TEXT */}
      <motion.div 
        style={{ opacity: textOpacity, scale: textScale }}
        className="container relative z-10 pt-20"
      >
        <div className="flex flex-col items-center text-center max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <Link
              to="/flowsight-ads"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white/80 text-xs font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Conoce Flowsight Ads
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-7xl md:text-9xl lg:text-[140px] font-black tracking-[-0.01em] leading-[0.95] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 py-4"
          >
            <span className="sr-only">FlowSights: Inteligencia Operativa y Datos para PyMEs. </span>
            Decisiones que <br />
            <span className="italic">
              multiplican ganancias.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-xl md:text-3xl text-white/50 max-w-3xl font-medium tracking-tight"
          >
            Inteligencia Operativa. Control total. <br className="hidden md:block"/>
            Sin adivinanzas.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 mt-12"
          >
            <Button
              size="lg"
              className="px-10 py-7 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 transition-all duration-300 text-lg font-bold tracking-tight shadow-none"
              asChild
            >
              <a href="#contacto" onClick={onContactClick}>
                Diagnóstico gratuito
              </a>
            </Button>
            <Button
              size="lg"
              className="px-10 py-7 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 transition-all duration-300 text-lg font-bold tracking-tight shadow-none"
              asChild
            >
              <a href="https://wa.me/message/FVHDA5OZHN66P1" target="_blank" rel="noopener noreferrer">
                Hablemos por WhatsApp
              </a>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
