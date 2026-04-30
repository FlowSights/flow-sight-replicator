import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  index?: number;
  glassEffect?: "light" | "medium" | "strong";
}

export const PremiumCard = ({
  children,
  className = "",
  hoverEffect = true,
  index = 0,
  glassEffect = "medium",
}: PremiumCardProps) => {
  const glassEffectClasses = {
    light: "backdrop-blur-md bg-white/5 dark:bg-white/3 border border-white/20 dark:border-white/10 shadow-sm",
    medium: "backdrop-blur-xl bg-white/8 dark:bg-white/5 border border-white/25 dark:border-white/15 shadow-lg shadow-black/10 dark:shadow-black/30",
    strong: "backdrop-blur-2xl bg-white/12 dark:bg-white/8 border border-white/30 dark:border-white/20 shadow-2xl shadow-black/20 dark:shadow-black/40",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={
        hoverEffect
          ? {
              y: -12,
              boxShadow: "0 30px 80px -20px rgba(16, 185, 129, 0.25)",
            }
          : undefined
      }
      className={`
        relative rounded-2xl transition-all duration-300 group
        ${glassEffectClasses[glassEffect]}
        ${hoverEffect ? "cursor-pointer hover:shadow-emerald-500/20" : ""}
        ${className}
      `}
    >
      {/* EFECTO DE BORDE GRADIENTE AL HOVER */}
      {hoverEffect && (
        <>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300 pointer-events-none" />
        </>
      )}

      {/* CONTENIDO */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
