import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3 as BarChartIcon, 
  Layout as LayoutIcon, 
  Activity as ActivityIcon, 
  Brain as BrainIcon,
  ArrowRight as ArrowRightIcon,
  X,
  CheckCircle2,
  TrendingUp,
  Clock,
  Target
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import showcase1 from "@/assets/showcase-1.png";
import showcase2 from "@/assets/showcase-2.webp";
import showcase3 from "@/assets/showcase-3.png";
import showcase4 from "@/assets/showcase-4.png";

const showcaseItems = [
  {
    id: "ventas",
    title: "Dashboard de Ventas e Ingresos",
    shortDesc: "Visualización en tiempo real de ingresos mensuales, estado de ventas y rendimiento por categoría.",
    fullDesc: "Este dashboard centraliza datos de múltiples fuentes de venta para ofrecer una visión 360° del rendimiento comercial. Permite a los gerentes identificar qué categorías están impulsando el crecimiento y cuáles requieren intervención inmediata, reduciendo el tiempo de reacción ante cambios en el mercado.",
    image: showcase1,
    tags: ["Power BI", "Ventas", "Análisis Mensual"],
    icon: BarChartIcon,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    benefits: [
      "Identificación de productos estrella y mermas",
      "Seguimiento de objetivos de ventas en tiempo real",
      "Análisis de comportamiento estacional por región",
      "Optimización de inventario basada en demanda real"
    ],
    kpis: ["+15% Margen Bruto", "-20% Tiempo de Reporte", "98% Precisión de Datos"]
  },
  {
    id: "operaciones",
    title: "Monitor de Operaciones en Tiempo Real",
    shortDesc: "Control total de la planta: potencia de salida, eficiencia energética y ahorro de CO2.",
    fullDesc: "Una solución de IoT y análisis de datos diseñada para plantas industriales y de energía. El sistema monitorea variables críticas cada segundo, aplicando algoritmos predictivos para evitar paradas no programadas y optimizar el consumo energético, impactando directamente en la rentabilidad y sostenibilidad.",
    image: showcase2,
    tags: ["Operaciones", "Energía", "IoT"],
    icon: LayoutIcon,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    benefits: [
      "Alertas tempranas de fallos en maquinaria",
      "Cálculo automático de huella de carbono",
      "Optimización de picos de consumo eléctrico",
      "Visualización remota desde cualquier dispositivo"
    ],
    kpis: ["3.25 MW Potencia Estable", "82.5% Rendimiento Óptimo", "25.8 Ton CO2 Ahorradas"]
  },
  {
    id: "retail",
    title: "Panel de Gestión para Retail",
    shortDesc: "Control operativo para cadenas de supermercados con detección automática de insights.",
    fullDesc: "Implementado para grandes cadenas como Supermercados La Colonia, este panel automatiza la auditoría de datos operativos. Detecta automáticamente duplicados en inventario, errores de facturación y cuellos de botella logísticos, transformando la gestión reactiva en una estrategia proactiva basada en hechos.",
    image: showcase3,
    tags: ["Retail", "Logística", "Insights IA"],
    icon: ActivityIcon,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    benefits: [
      "Detección de duplicados en stock (ahorro 18%)",
      "Visibilidad total de la cadena de suministro",
      "Monitoreo de precisión de datos operativos",
      "Plan de acción priorizado por impacto financiero"
    ],
    kpis: ["-28% Costos Logísticos", "94% Precisión de Datos", "2h Tiempo de Reporte"]
  },
  {
    id: "talento",
    title: "Mapa de Habilidades y Talento",
    shortDesc: "Análisis estratégico de capital humano e identificación de brechas de habilidades.",
    fullDesc: "Este dashboard de analítica de personas permite a las organizaciones prepararse para el futuro del trabajo. Analiza la transferibilidad de habilidades entre sectores y proyecta el riesgo de obsolescencia frente a la IA, permitiendo diseñar planes de reskilling y upskilling con un retorno de inversión claro.",
    image: showcase4,
    tags: ["RRHH", "Estrategia", "Talento"],
    icon: BrainIcon,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    benefits: [
      "Mapeo de habilidades críticas vs. emergentes",
      "Análisis de riesgo de automatización por rol",
      "Optimización de presupuestos de capacitación",
      "Identificación de talento interno para nuevos roles"
    ],
    kpis: ["97% Demanda IA/ML", "85% Análisis Avanzado", "70% Liderazgo & Colab."]
  }
];

export const Showcase = () => {
  const [selectedItem, setSelectedItem] = useState<typeof showcaseItems[0] | null>(null);

  return (
    <section id="showcase" className="py-24 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -z-10" />

      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary uppercase tracking-wider"
          >
            Showcase
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold mt-3"
          >
            Qué hacemos y <span className="text-gradient">cómo lo hacemos</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mt-4 text-lg"
          >
            Transformamos datos complejos en herramientas visuales simples que impulsan decisiones estratégicas. Haz clic en cualquier proyecto para ver los detalles.
          </motion.p>
        </div>

        <div className="grid gap-12">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                onClick={() => setSelectedItem(item)}
                className={`overflow-hidden glass-card border-border/50 hover:border-primary/40 transition-all duration-500 group cursor-pointer shadow-sm hover:shadow-elevated`}
              >
                <div className={`grid lg:grid-cols-2 gap-0`}>
                  <div className={`p-8 md:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className={`w-12 h-12 rounded-lg ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-secondary/50 text-xs font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                      {item.shortDesc}
                    </p>

                    <div className="flex items-center gap-2 text-primary font-semibold group/link">
                      Ver detalles del proyecto 
                      <ArrowRightIcon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className={`relative aspect-video lg:aspect-auto overflow-hidden ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DETAILED MODAL */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto glass-card border-primary/20 p-0 gap-0">
          {selectedItem && (
            <div className="flex flex-col">
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.title}
                  className="w-full h-full object-cover object-top"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 bg-background/50 backdrop-blur-md hover:bg-background/80 rounded-full z-50"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${selectedItem.bg} ${selectedItem.color} flex items-center justify-center`}>
                        <selectedItem.icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="border-primary/30 text-primary text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <DialogTitle className="font-display text-3xl md:text-4xl font-bold">
                      {selectedItem.title}
                    </DialogTitle>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {selectedItem.kpis.map((kpi, i) => (
                      <div key={i} className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-2 text-center">
                        <div className="text-primary font-bold text-lg">{kpi.split(' ')[0]}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {kpi.split(' ').slice(1).join(' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" /> Sobre el proyecto
                    </h4>
                    <DialogDescription className="text-muted-foreground text-lg leading-relaxed">
                      {selectedItem.fullDesc}
                    </DialogDescription>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Beneficios clave
                      </h4>
                      <ul className="space-y-3">
                        {selectedItem.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                      <Button variant="hero" className="w-full" onClick={() => {
                        setSelectedItem(null);
                        window.location.href = "#contacto";
                      }}>
                        Quiero algo similar <ArrowRightIcon className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
