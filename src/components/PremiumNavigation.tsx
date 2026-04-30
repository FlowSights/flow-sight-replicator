import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

interface NavLink {
  label: string;
  href: string;
}

interface PremiumNavigationProps {
  navLinks: NavLink[];
  logo: string;
}

export const PremiumNavigation = ({ navLinks, logo }: PremiumNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
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
      {/* NAVBAR PRINCIPAL */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-foreground text-lg md:text-xl hover:opacity-80 transition-opacity">
            <img src={logo} alt="FlowSights" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            <span className="hidden sm:inline">FlowSights</span>
          </Link>

          {/* DESKTOP NAV - Oculto en móvil */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-primary/10"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CONTROLES DERECHA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* MENÚ DESPLEGABLE FULL-WIDTH (NOTCH) */}
      <AnimatePresence>
        {isOpen && (
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

            {/* MENÚ DESPLEGABLE */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-16 md:top-20 left-0 right-0 z-30 bg-background/95 backdrop-blur-2xl border-b border-border/50"
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
                      className="group p-4 md:p-6 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/60 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {link.label}
                        </span>
                        <svg
                          className="w-5 h-5 text-primary/0 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1"
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
                <div className="my-8 md:my-10 border-t border-border/50" />

                {/* CALL-TO-ACTION EN MENÚ */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="#contacto"
                    onClick={handleNavClick}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-center hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                  >
                    Solicitar diagnóstico
                  </a>
                  <a
                    href="https://wa.me/message/FVHDA5OZHN66P1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleNavClick}
                    className="flex-1 px-6 py-3 rounded-xl border border-primary/50 text-primary font-semibold text-center hover:bg-primary/10 transition-all duration-300"
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
