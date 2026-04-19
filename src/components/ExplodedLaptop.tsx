import { motion, type Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";

export const ExplodedLaptop = () => {
  // Animation variants for a clean, professional entry
  const laptopVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1] // Professional ease-out
      }
    }
  };

  const cardLeftVariants: Variants = {
    hidden: { opacity: 0, x: -100, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { 
        delay: 0.8,
        duration: 0.8,
        type: "spring",
        stiffness: 50,
        damping: 15
      }
    }
  };

  const cardRightVariants: Variants = {
    hidden: { opacity: 0, x: 100, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { 
        delay: 1,
        duration: 0.8,
        type: "spring",
        stiffness: 50,
        damping: 15
      }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video flex items-center justify-center py-10 overflow-visible">
      {/* Main Laptop Container */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Subtle Base Shadow */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.1, scale: 1.1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-0 w-3/4 h-10 bg-black/40 blur-[60px] rounded-[100%]"
        />

        {/* The Laptop Image - Clean and Professional */}
        <motion.div
          variants={laptopVariants}
          className="relative z-10 w-[85%] h-auto"
        >
          <motion.img 
            src={heroDashboard} 
            alt="FlowSights Intelligence" 
            className="w-full h-auto drop-shadow-2xl rounded-lg"
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>

        {/* Floating Data Cards - They "dock" into place */}
        <motion.div
          variants={cardLeftVariants}
          className="absolute z-20 top-[15%] left-[-5%] md:left-[5%]"
        >
          <Card className="glass-card p-4 flex items-center gap-3 shadow-xl border-primary/30 backdrop-blur-xl bg-white/10">
            <div className="w-10 h-10 rounded-full bg-primary/20 grid place-items-center text-primary">
              <ArrowDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-primary font-bold uppercase tracking-widest">Costos</div>
              <div className="text-xl font-black text-primary">-24%</div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={cardRightVariants}
          className="absolute z-20 bottom-[20%] right-[-5%] md:right-[5%]"
        >
          <Card className="glass-card p-4 flex items-center gap-3 shadow-xl border-accent/30 backdrop-blur-xl bg-white/10">
            <div className="w-10 h-10 rounded-full bg-accent/20 grid place-items-center text-accent">
              <ArrowUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-accent font-bold uppercase tracking-widest">Eficiencia</div>
              <div className="text-xl font-black text-accent">+18%</div>
            </div>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
};
