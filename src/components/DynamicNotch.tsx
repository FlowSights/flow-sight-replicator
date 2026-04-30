import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

interface NavLink {
  label: string;
  href: string;
}

interface DynamicNotchProps {
  navLinks: NavLink[];
  logo: string;
}

export const DynamicNotch = ({ navLinks, logo }: DynamicNotchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);
      setIsCollapsed(scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* NOTCH DINÁMICO - MORPHIC GLASS */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{
          y: 0,
          width: isCollapsed ? "auto" : "100%",
          left: isCollapsed ? "50%" : "0",
          x: isCollapsed ? "-50%" : "0",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`fixed top-4 z-40 transition-all duration-300 ${
          isCollapsed ? "rounded-full" : "rounded-none"
        }`}
        style={{
          right: isCollapsed ? "auto" : "0",
        }}
      >
        <div
          className={`relative transition-all duration-300 ${
            isCollapsed
              ? "px-4 py-2 rounded-full bg-background/40 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/20"
              : "px-6 md:px-8 py-4 md:py-5 w-full bg-background/30 backdrop-blur-xl border-b border-white/5"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* LOGO - Visible siempre */}
            <Link
              to="/"
              className="flex items-center gap-2 font-display font-bold text-foreground text-lg md:text-xl hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <img
                src={logo}
                alt="FlowSights"
                className={`object-contain transition-all duration-300 ${
                  isCollapsed ? "w-6 h-6" : "w-8 h-8 md:w-10 md:h-10"
                }`}
              />
              {!isCollapsed && <span className="hidden sm:inline">FlowSights</span>}
            </Link>

            {/* DESKTOP NAV - Solo visible cuando no está colapsado */}
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:flex items-center gap-1"
              >
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                ))}
              </motion.div>
            )}

            {/* CONTROLES DERECHA */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <ThemeToggle />
              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg hover:bg-white/10 transition-all duration-300 ${
                  isCollapsed ? "lg:hidden" : ""
                }`}
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className={`text-foreground transition-all ${isCollapsed ? "w-5 h-5" : "w-6 h-6"}`} />
                ) : (
                  <Menu className={`text-foreground transition-all ${isCollapsed ? "w-5 h-5" : "w-6 h-6"}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* MENÚ DESPLEGABLE FULL-WIDTH (NOTCH) */}
      <AnimatePresence>
        {isOpen && !isCollapsed && (
          <>
            {/* BACKDROP CON BLUR */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/40 backdrop-blur-sm z-30"
            />

            {/* MENÚ DESPLEGABLE PREMIUM */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-20 md:top-24 left-0 right-0 z-30 bg-background/95 backdrop-blur-3xl border-b border-white/10"
            >
              <div className="container py-8 md:py-12">
                {/* GRID DE ENLACES - Responsivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={handleNavClick}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="group p-4 md:p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                          {link.label}
                        </span>
                        <svg
                          className="w-5 h-5 text-emerald-500/0 group-hover:text-emerald-500 transition-all duration-300 transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.a>
                  ))}
                </div>

                {/* DIVIDER */}
                <div className="my-8 md:my-10 border-t border-white/10" />

                {/* CALL-TO-ACTION EN MENÚ */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="#contacto"
                    onClick={handleNavClick}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-center hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
                  >
                    Solicitar diagnóstico
                  </a>
                  <a
                    href="https://wa.me/message/FVHDA5OZHN66P1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleNavClick}
                    className="flex-1 px-6 py-3 rounded-xl border border-emerald-500/50 text-emerald-500 font-semibold text-center hover:bg-emerald-500/10 transition-all duration-300"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MENÚ COLAPSADO (PÍLDORA) */}
      <AnimatePresence>
        {isOpen && isCollapsed && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/40 backdrop-blur-sm z-30"
            />

            {/* MENÚ COLAPSADO */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md bg-background/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl shadow-black/30"
            >
              <div className="p-6 md:p-8">
                {/* GRID DE ENLACES */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={handleNavClick}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-foreground hover:text-emerald-500 transition-all duration-300 text-center"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </div>

                {/* DIVIDER */}
                <div className="mb-6 border-t border-white/10" />

                {/* CALL-TO-ACTION */}
                <div className="flex flex-col gap-2">
                  <a
                    href="#contacto"
                    onClick={handleNavClick}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-center text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                  >
                    Diagnóstico
                  </a>
                  <a
                    href="https://wa.me/message/FVHDA5OZHN66P1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleNavClick}
                    className="px-4 py-2.5 rounded-lg border border-emerald-500/50 text-emerald-500 font-semibold text-center text-sm hover:bg-emerald-500/10 transition-all"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
