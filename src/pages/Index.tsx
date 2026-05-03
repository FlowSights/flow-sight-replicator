import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, ArrowDown, ArrowUp, Play, Check, CheckCircle2, Sparkles, Database, LineChart,
  Workflow, BarChart3, Activity, Factory, Truck, Hotel, UtensilsCrossed,
  Stethoscope, ShoppingBag, HardHat, Plus, Mail, ShieldCheck, Zap, Eye,
  TrendingUp, Clock, DollarSign, Menu, MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Instagram } from "@/components/icons/Instagram";
import { LinkedIn } from "@/components/icons/LinkedIn";
import heroDashboard from "@/assets/hero-dashboard.png";
import logo from "@/assets/logo.png";

import stevenPhoto from "@/assets/team-steven.jpg";
import marcosPhoto from "@/assets/team-marcos.png";
import oscarPhoto from "@/assets/team-oscar.png";
import { useState } from "react";
import { useScrolled } from "@/hooks/useScrolled";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useCountUp } from "@/hooks/useCountUp";
import { ToolsMarquee } from "@/components/ToolsMarquee";
import SEO from "@/components/SEO";

import { ExplodedLaptop } from "@/components/ExplodedLaptop";
import { FloatingDashboard } from "@/components/FloatingDashboard";
import { InstagramFeed } from "@/components/InstagramFeed";
import { Showcase } from "@/components/Showcase";
import { DynamicNotch } from "@/components/DynamicNotch";
import { PremiumHero } from "@/components/PremiumHero";
import { PremiumCard } from "@/components/PremiumCard";
import { DataFlowVisualization } from "@/components/DataFlowVisualization";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WHATSAPP_URL = "https://wa.me/message/FVHDA5OZHN66P1";
const EMAIL_URL = "mailto:contacto@flowsights.it.com";
const INSTAGRAM_URL = "https://www.instagram.com/flowsights_cr/";

type HeroStat = { value: number; suffix: string; prefix?: string; label: string; decimals?: number };

const AnimatedStat = ({ stat, className = "font-display text-3xl font-bold text-gradient" }: { stat: HeroStat; className?: string }) => {
  const { value, ref } = useCountUp(stat.value, 1800, stat.decimals ?? 0);
  const formatted = (stat.decimals ?? 0) > 0 ? value.toFixed(stat.decimals) : Math.round(value).toString();
  return (
    <div>
      <div className={className}>
        <span ref={ref}>{stat.prefix ?? ""}{formatted}{stat.suffix}</span>
      </div>
      {stat.label ? <div className="text-sm text-muted-foreground mt-1">{stat.label}</div> : null}
    </div>
  );
};

/** Parse strings like "-30%", "+2x", "95%", "360°", "10x", "+40%" into a HeroStat */
const parseStat = (raw: string): HeroStat => {
  const m = raw.match(/^([+-]?)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { value: 0, suffix: raw, label: "" };
  const [, sign, num, suffix] = m;
  return {
    value: parseFloat(num),
    prefix: sign === "+" ? "+" : sign === "-" ? "-" : "",
    suffix,
    decimals: num.includes(".") ? 1 : 0,
    label: "",
  };
};

// Rotating accent palette — semantic tokens defined in index.css
const accentPalette = [
  { text: "text-[hsl(var(--accent-violet))]", bg: "bg-[hsl(var(--accent-violet)/0.12)]", border: "hover:border-[hsl(var(--accent-violet)/0.6)]", ring: "[--c:var(--accent-violet)]" },
  { text: "text-[hsl(var(--accent-amber))]", bg: "bg-[hsl(var(--accent-amber)/0.12)]", border: "hover:border-[hsl(var(--accent-amber)/0.6)]", ring: "[--c:var(--accent-amber)]" },
  { text: "text-[hsl(var(--accent-rose))]", bg: "bg-[hsl(var(--accent-rose)/0.12)]", border: "hover:border-[hsl(var(--accent-rose)/0.6)]", ring: "[--c:var(--accent-rose)]" },
  { text: "text-[hsl(var(--accent-sky))]", bg: "bg-[hsl(var(--accent-sky)/0.12)]", border: "hover:border-[hsl(var(--accent-sky)/0.6)]", ring: "[--c:var(--accent-sky)]" },
  { text: "text-[hsl(var(--accent-lime))]", bg: "bg-[hsl(var(--accent-lime)/0.12)]", border: "hover:border-[hsl(var(--accent-lime)/0.6)]", ring: "[--c:var(--accent-lime)]" },
  { text: "text-[hsl(var(--accent-coral))]", bg: "bg-[hsl(var(--accent-coral)/0.12)]", border: "hover:border-[hsl(var(--accent-coral)/0.6)]", ring: "[--c:var(--accent-coral)]" },
];
const pickAccent = (i: number) => accentPalette[i % accentPalette.length];

const Index = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const scrolled = useScrolled(80);

  const navLinks = [
    { label: "Flowsight Ads", href: "/flowsight-ads" },
    { label: "Cómo funciona", href: "#proceso" },
    { label: "Showcase", href: "#showcase" },
    { label: "Servicios", href: "#servicios" },
    { label: "Industrias", href: "#industrias" },
    { label: "Quiénes somos", href: "#equipo" },
    { label: "FAQ", href: "#faq" },
    { label: "Blog", href: "/blog" },
    { label: "Contacto", href: "#contacto" },
    { label: "Diagnóstico gratuito", href: "/diagnostico" },
  ];

  const blogPreview = [
    { slug: "5-senales-datos-sucios", category: "Calidad de Datos", title: "5 señales de que tus datos están saboteando tus decisiones", excerpt: "Si cada reporte muestra un número distinto, estás perdiendo dinero sin saberlo. Aprende a detectarlo a tiempo.", readingTime: "4 min" },
    { slug: "como-empezar-dashboard-operativo", category: "Dashboards", title: "Cómo empezar con un dashboard operativo (sin morir en el intento)", excerpt: "Tu primer dashboard útil en menos de 2 semanas. 4 pasos prácticos, sin equipos técnicos ni software caro.", readingTime: "5 min" },
    { slug: "kpis-operativos-que-importan", category: "Operaciones", title: "Los 7 KPIs operativos que realmente importan en una PyME", excerpt: "Deja de medirlo todo. Estos 7 indicadores te dicen, cada semana, dónde está el dinero y dónde se está fugando.", readingTime: "6 min" },
  ];

  const problems = [
    { title: "Reportes que no cuadran", desc: "Cada área trae un número distinto y nadie sabe cuál es el correcto. Resultado: decisiones lentas y desconfianza." },
    { title: "Inventario que no coincide", desc: "Lo que dice el sistema no es lo que hay en bodega. Pierdes ventas por faltantes y dinero por exceso de stock." },
    { title: "Procesos que cuestan de más", desc: "Cuellos de botella invisibles ralentizan tu operación, atrasan entregas e inflan tus costos cada mes." },
    { title: "Fugas de dinero ocultas", desc: "Gastos que nadie revisa, mermas que no se registran y márgenes que se erosionan sin que te des cuenta." },
    { title: "Operación sin visibilidad", desc: "Te enteras de los problemas cuando ya son crisis. Sin alertas a tiempo, reaccionas tarde y pagas más caro." },
    { title: "Decisiones por intuición", desc: "Cuando los datos no son confiables, todos vuelven al instinto. Y el instinto no escala con tu negocio." },
  ];

  const steps = [
    { n: "01", title: "Conectamos tus datos", desc: "Trabajamos con lo que ya tienes: Excel, POS, ERP, WhatsApp, correos. Sin migraciones complejas y con total confidencialidad." },
    { n: "02", title: "Limpiamos lo que no sirve", desc: "Eliminamos duplicados, corregimos errores y unificamos formatos. Una única fuente de verdad en la que todos confían." },
    { n: "03", title: "Detectamos problemas y oportunidades", desc: "Encontramos fugas de dinero, cuellos de botella y tendencias que tu equipo no estaba viendo. Te mostramos dónde actuar primero." },
    { n: "04", title: "Te entregamos un plan accionable", desc: "Dashboards claros, alertas automáticas y un plan priorizado por impacto. Listo para implementar y medir resultados desde la primera semana." },
  ];

  const services = [
    { icon: Database, tag: "Datos Confiables", title: "Limpieza de Datos", desc: "Convertimos tu información dispersa y desordenada en una base limpia y confiable. Decisiones más rápidas y reportes en los que todos confían.", items: ["Eliminación de duplicados", "Estandarización de formatos", "Validación automática", "Auditoría de calidad"], popular: false },
    { icon: LineChart, tag: "Inteligencia Operativa", title: "Insights Operativos", desc: "Detectamos fugas de dinero, riesgos y oportunidades de crecimiento ocultos en tus operaciones, antes de que se conviertan en pérdidas.", items: ["Tendencias de ventas", "Alertas de anomalías", "KPIs accionables", "Avisos en tiempo real"], popular: true },
    { icon: Workflow, tag: "Procesos Más Rentables", title: "Optimización de Procesos", desc: "Identificamos los cuellos de botella que te cuestan tiempo y dinero. Rediseñamos tus flujos para producir y entregar más, con los mismos recursos.", items: ["Mapeo de procesos", "Eliminación de cuellos de botella", "Automatización de tareas", "Mejora continua"] },
    { icon: BarChart3, tag: "Visibilidad Total", title: "Dashboards a la Medida", desc: "Reportes visuales y simples que muestran lo que importa: ventas, márgenes, inventario y desempeño. Sin Excel, sin esperar al cierre de mes.", items: ["Visualizaciones simples", "Actualización en tiempo real", "Acceso desde cualquier dispositivo", "Reportes automáticos"] },
    { icon: Activity, tag: "Control Continuo", title: "Monitoreo de Desempeño", desc: "Te avisamos cuando algo se sale de lo normal: ventas que caen, costos que suben o procesos que fallan. Reaccionas a tiempo, no cuando ya es tarde.", items: ["Monitoreo 24/7", "Alertas inmediatas", "Reportes semanales", "Comparativos por periodo"] },
  ];

  const results = [
    { icon: DollarSign, value: "-30%", label: "menos costos operativos", title: "Reduce costos ocultos", desc: "Detectamos gastos y fugas que estaban pasando desapercibidos en tu operación." },
    { icon: TrendingUp, value: "+2x", label: "más productividad", title: "Haz más con lo mismo", desc: "Tu equipo deja de pelear con datos sucios y se enfoca en lo que sí mueve la aguja." },
    { icon: ShieldCheck, value: "95%", label: "precisión en tus reportes", title: "Cero decisiones a ciegas", desc: "Datos limpios y validados para que cada decisión esté respaldada por información real." },
    { icon: Eye, value: "360°", label: "visibilidad de tu operación", title: "Control total del negocio", desc: "Una vista clara de ventas, costos e inventario en un solo lugar, en tiempo real." },
    { icon: Clock, value: "10x", label: "decisiones más rápidas", title: "Responde antes que la competencia", desc: "Insights al instante, sin esperar a fin de mes ni depender de reportes manuales." },
    { icon: Sparkles, value: "+40%", label: "más rentabilidad", title: "Margen que se nota", desc: "Menos costos, más ventas y procesos más ágiles. Un negocio más rentable y más fácil de manejar." },
  ];

  const industries = [
    { icon: Factory, title: "Manufactura", desc: "Reduce desperdicios, controla la producción y detecta ineficiencias en tu línea antes de que afecten el margen.", tags: ["Control de inventario", "Eficiencia de línea", "Calidad de producto"] },
    { icon: Truck, title: "Logística", desc: "Entrega a tiempo, baja costos de transporte y aprovecha mejor cada vehículo de tu flota.", tags: ["Optimización de rutas", "Gestión de flota", "Tiempos de entrega"] },
    { icon: Hotel, title: "Hoteles", desc: "Aumenta la rentabilidad por habitación con análisis de ocupación, pricing inteligente y control de costos diarios.", tags: ["Análisis de ocupación", "Costos operativos", "Experiencia del huésped"] },
    { icon: UtensilsCrossed, title: "Restaurantes", desc: "Controla mermas, optimiza el costo por plato y descubre qué del menú realmente te deja dinero.", tags: ["Control de mermas", "Análisis de menú", "Eficiencia de cocina"] },
    { icon: Stethoscope, title: "Clínicas", desc: "Reduce tiempos de espera, controla el inventario médico y mejora la experiencia del paciente sin contratar más personal.", tags: ["Gestión de citas", "Inventario médico", "Tiempos de espera"] },
    { icon: ShoppingBag, title: "Retail", desc: "Vende más con menos stock: optimiza tu surtido, evita el sobre-inventario y entiende qué compra realmente tu cliente.", tags: ["Análisis de ventas", "Rotación de inventario", "Comportamiento del cliente"] },
    { icon: HardHat, title: "Construcción", desc: "Controla materiales y avance de obra. Detecta desviaciones presupuestales antes de que se conviertan en pérdidas.", tags: ["Control de materiales", "Avance de obra", "Control presupuestal"] },
  ];

  const testimonials = [
    { quote: "FlowSights nos ayudó a identificar que teníamos un 18% de duplicados en nuestra base de clientes. Después de la limpieza, nuestros reportes son mucho más precisos y ahorramos tiempo en cada cierre mensual.", initials: "CM", name: "Carlos Mendoza", role: "Director de Operaciones · Grupo Logístico Norte", sector: "Logística" },
    { quote: "Teníamos datos de ocupación dispersos en tres sistemas diferentes. FlowSights los unificó y nos entregó un dashboard que ahora usamos todos los días para tomar decisiones de pricing.", initials: "AR", name: "Ana Rodríguez", role: "Gerente General · Hotel Palmas Reales", sector: "Hotelería" },
    { quote: "Detectaron un problema en nuestro inventario que nos estaba costando ₡120.000.000 (colones) al mes en sobre-stock. En 3 semanas ya teníamos el proceso corregido y los datos en orden.", initials: "RF", name: "Roberto Fuentes", role: "CEO · Manufactura Fuentes S.A.", sector: "Manufactura" },
  ];

  const team = [
    { 
      initials: "SP", 
      name: "Steven Pineda", 
      role: "CEO", 
      originalRole: "AI Data Analyst Junior · International Operations",
      desc: "AI Data Analyst Junior y Customer Experience & Sales Professional con más de 5 años de experiencia en múltiples industrias.", 
      tags: ["AI Data Analyst Junior", "Experiencia del cliente", "Operaciones internacionales"], 
      photo: stevenPhoto,
      linkedin: "https://www.linkedin.com/in/spineda07"
    },
    { 
      initials: "MG", 
      name: "Marcos García", 
      role: "CO-FOUNDER", 
      originalRole: "Ingeniero Industrial",
      desc: "Amplio conocimiento en optimización de procesos", 
      tags: ["Optimización de procesos", "Análisis operativo", "Eficiencia"], 
      photo: marcosPhoto,
      linkedin: "https://www.linkedin.com/in/marco-garcía-8a45b72b2/"
    },
    { 
      initials: "OZ", 
      name: "Oscar Zapata", 
      role: "CO-FOUNDER", 
      originalRole: "Especialista en Control de Inventarios",
      desc: "Especialista en control de inventarios, manejo de operaciones y ventas", 
      tags: ["Control de inventarios", "Manejo de operaciones", "Ventas"], 
      photo: oscarPhoto,
      linkedin: "https://www.linkedin.com/in/oscar-zapata-5238a1333?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B%2FSnQd1QJSzyM9G4NefLjvw%3D%3D"
    }
  ];

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: form,
      });
      if (error) throw error;
      setForm({ name: "", email: "", company: "", message: "" });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast({
        title: "No se pudo enviar",
        description: "Ocurrió un error. Inténtalo de nuevo o escríbenos a contacto@flowsights.it.com",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SEO 
        title="Expertos en Inteligencia Operativa y Datos para PyMEs"
        description="Transformamos tus datos de Excel, POS y WhatsApp en decisiones que generan dinero. Limpieza de datos, dashboards y optimización de procesos."
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "FlowSights",
          "image": "https://storage.googleapis.com/gpt-engineer-file-uploads/7GdJHUgbeBP6D1AL2fFEaPtiTyj2/social-images/social-1776391379720-ChatGPT_Image_16_abr_2026,_19_47_07.webp",
          "@id": "https://flowsights.it.com",
          "url": "https://flowsights.it.com",
          "telephone": "",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "",
            "addressLocality": "San José",
            "addressCountry": "CR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 9.9281,
            "longitude": -84.0907
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday"
            ],
            "opens": "08:00",
            "closes": "18:00"
          },
          "sameAs": [
            "https://www.instagram.com/flowsights_cr/"
          ]
        })}
      </script>
      {/* NAVBAR — Dynamic Translucent Notch
           Strategy: the header is always fixed + full-width (left-0 right-0).
           We animate margin-inline to "eat" from both sides simultaneously,
           which creates the symmetric pill-collapse effect.
           border-radius transitions from 0 → 9999px to morph into a pill. */}
      <DynamicNotch navLinks={navLinks} logo={logo} />

      {/* PREMIUM HERO */}
      <PremiumHero />

      {/* TOOLS MARQUEE */}
      <ToolsMarquee />


      <section className="relative bg-black text-white">
        {/* Sticky Container */}
        <div className="container px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row relative">
            
            {/* Left Column (Sticky) */}
             <div className="lg:w-5/12 lg:sticky lg:top-0 h-auto lg:h-screen flex items-center pt-32 pb-16 lg:py-0">
               {/* Background Glow for Sticky Side */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
               
               <div className="max-w-xl relative z-10">
                 <motion.span 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   className="text-primary font-bold tracking-widest uppercase text-sm mb-6 block"
                 >
                   El Problema
                 </motion.span>
                 <motion.h2 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="font-display text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05]"
                 >
                   Tus datos te están <span className="text-primary">costando dinero.</span>
                 </motion.h2>
                 <motion.p 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.2 }}
                   className="mt-8 text-xl text-white/50 leading-relaxed font-medium"
                 >
                   La mayoría pierde entre 15% y 25% de sus ingresos por procesos ciegos. Si no lo puedes ver, no lo puedes arreglar.
                 </motion.p>
               </div>

               {/* Decorative Visual - Brighter and with a glow */}
               <div className="absolute bottom-10 left-0 right-0 hidden lg:flex justify-center pointer-events-none">
                 <motion.div
                   animate={{ 
                     y: [0, -15, 0],
                     opacity: [0.4, 0.8, 0.4]
                   }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                   className="relative"
                 >
                   <Activity className="w-64 h-64 text-white/30 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" strokeWidth={0.5} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                 </motion.div>
               </div>
             </div>

            {/* Right Column (Scrolling) */}
            <div className="lg:w-7/12 py-16 lg:py-32 lg:min-h-[200vh] flex flex-col justify-center">
              <div className="space-y-16 md:space-y-32">
                {problems.map((p, i) => (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative"
                  >
                    <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500">
                      <div className="flex items-start gap-8">
                        <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                          <span className="font-display font-bold text-2xl">0{i+1}</span>
                        </div>
                        <div>
                          <h3 className="font-display text-3xl md:text-5xl font-bold tracking-tighter text-white mb-4 group-hover:text-primary transition-colors duration-500">
                            {p.title}
                          </h3>
                          <p className="text-xl md:text-2xl text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors duration-500">
                            {p.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-32 border-t border-white/10 pt-16">
                <div className="p-12 md:p-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-12 relative overflow-hidden group">
                  {/* Subtle hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <div className="relative z-10">
                    <h3 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight">Detén la fuga.</h3>
                    <p className="text-white/50 mt-4 text-xl md:text-2xl font-medium">Descubre dónde pierdes dinero en 48 horas.</p>
                  </div>
                  <div className="relative z-10 shrink-0">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-10 py-8 text-xl font-bold tracking-tight shadow-[0_0_40px_rgba(255,255,255,0.2)]" asChild>
                      <a href="#contacto">Diagnóstico gratis</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="proceso" className="py-32 md:py-40 bg-card/30 border-y border-border/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">El proceso</span>
            <h2 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mt-4">
              Así funciona <span className="text-gradient">FlowSights</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Un proceso simple y probado: en pocas semanas pasas de datos desordenados a decisiones que mueven tu negocio.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((s, i) => {
              const c = pickAccent(i);
              return (
                <motion.div
                  key={s.n}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95, y: 20 },
                    visible: { opacity: 1, scale: 1, y: 0 }
                  }}
                >
                  <PremiumCard className={`p-6 glass-card h-full relative overflow-hidden group transition-all ${c.border}`}>
                    <div className={`text-xs font-semibold tracking-widest mb-3 ${c.text}`}>PASO {s.n}</div>
                    <div className={`font-display text-7xl font-bold absolute -right-2 -top-2 transition-colors opacity-10 group-hover:opacity-25 ${c.text}`}>
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 relative">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed relative">{s.desc}</p>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicios" className="py-32 md:py-48 bg-black relative">
        <div className="container max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl mb-32">
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter text-white">
              No vendemos software. <br />
              <span className="text-primary">Resolvemos problemas.</span>
            </h2>
            <p className="mt-8 text-xl md:text-2xl text-white/50 font-medium">
              Soluciones operativas diseñadas para detener pérdidas, acelerar decisiones y darte control absoluto.
            </p>
          </div>

          <div className="space-y-4">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.6 }}
                  className="group relative block overflow-hidden rounded-[2rem] bg-white/5 border border-white/10 p-8 md:p-16 hover:bg-white/10 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon className="w-48 h-48 md:w-64 md:h-64 text-white" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <Icon className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest text-primary">{s.tag}</span>
                        {s.popular && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-white text-black px-3 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-6">
                        {s.title}
                      </h3>
                      <p className="text-xl text-white/60 leading-relaxed font-medium">
                        {s.desc}
                      </p>
                    </div>

                    <div className="md:w-1/3">
                      <ul className="space-y-4">
                        {s.items.map((it) => (
                          <li key={it} className="flex items-start gap-4 text-white/80 font-medium">
                            <div className="mt-1 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="py-32 md:py-48 bg-black border-y border-white/5 relative overflow-hidden">
        {/* Subtle glowing orb in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none opacity-50" />

        <div className="container relative z-10">
          <div className="text-center mb-24 md:mb-40">
            <h2 className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-white">
              Resultados <br className="md:hidden" /> <span className="text-white/30">brutales.</span>
            </h2>
          </div>

          <div className="space-y-32 md:space-y-48">
            {results.map((r, i) => {
              const stat = parseStat(r.value);
              return (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col items-center text-center"
                >
                  <AnimatedStat
                    stat={{ ...stat, label: "" }}
                    className="font-display text-[100px] md:text-[200px] lg:text-[250px] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20"
                  />
                  <div className="mt-8 max-w-2xl">
                    <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 tracking-tight">{r.title}</h3>
                    <p className="text-lg md:text-2xl text-white/50 font-medium leading-relaxed">{r.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-48 text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-semibold backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-primary" /> 
              +150 empresas tomando mejores decisiones
            </span>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section id="industrias" className="py-32 md:py-40">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sectores</span>
            <h2 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mt-4">
              Industrias donde ya generamos <span className="text-gradient">resultados</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Conocemos los retos operativos de cada sector. Adaptamos cada solución a la realidad de tu negocio, no al revés.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              const c = pickAccent(i);
              return (
                <motion.div
                  key={ind.title}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <div className={`p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 h-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}>
                    <div className={`w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 text-foreground dark:text-white flex items-center justify-center mb-6`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground dark:text-white mb-3">{ind.title}</h3>
                    <p className="text-base text-muted-foreground dark:text-white/50 leading-relaxed mb-6">{ind.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {ind.tags.map((t) => (
                        <span key={t} className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-foreground/70 dark:text-white/70">{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
              }}
            >
              <div className="p-8 rounded-3xl border border-dashed border-black/20 dark:border-white/20 h-full flex flex-col justify-center items-start bg-transparent">
                <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 text-foreground dark:text-white flex items-center justify-center mb-6">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground dark:text-white mb-3">¿Tu industria no está aquí?</h3>
                <p className="text-base text-muted-foreground dark:text-white/50 mb-6">Si tu empresa maneja datos operativos, podemos ayudarte. Cuéntanos tu caso y te decimos cómo aportarte valor.</p>
                <a href="#contacto" className="text-primary text-sm font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                  Hablar con un experto <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 md:py-40 bg-card/30 border-y border-border/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Clientes</span>
            <h2 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mt-4">
              Empresas que ya están <span className="text-gradient">ganando con sus datos</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Casos reales de PyMEs que dejaron de adivinar y empezaron a decidir con información clara.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 }
                }}
              >
                <div className="p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 h-full flex flex-col group hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <div className="text-black/20 dark:text-white/20 text-6xl font-display leading-none mb-4 tracking-tighter">"</div>
                  <p className="text-foreground/80 dark:text-white/80 text-lg leading-relaxed flex-1 font-medium">{t.quote}</p>
                  <div className="flex items-center gap-4 mt-8 pt-8 border-t border-black/10 dark:border-white/10">
                    <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-foreground dark:text-white font-bold text-sm shrink-0">
                      {t.initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-foreground dark:text-white text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground dark:text-white/50">{t.role}</div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary">{t.sector}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TEAM */}
      <section id="equipo" className="py-32 md:py-40">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Nuestro Equipo</span>
            <h2 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mt-4">
              Quiénes <span className="text-gradient">Somos</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Un equipo costarricense con experiencia real en operaciones, ventas e inventarios. Hablamos tu idioma, no el de los técnicos: te ayudamos a tomar mejores decisiones, no a entender un software.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {team.map((m) => (
              <motion.div
                key={m.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <PremiumCard className="p-7 glass-card h-full text-center hover:border-primary/60 hover:-translate-y-1 hover:shadow-glow transition-all group relative overflow-hidden">
                  {m.linkedin && (
                    <a 
                      href={m.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`LinkedIn de ${m.name}`}
                    >
                      <LinkedIn className="w-5 h-5" />
                    </a>
                  )}
                  {m.photo ? (
                    <img
                      src={m.photo}
                      alt={`Foto de ${m.name}`}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-glow ring-2 ring-primary/40"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold text-xl mx-auto mb-4 shadow-glow">
                      {m.initials}
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <h3 className="font-display text-xl font-bold">{m.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {m.role}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs font-medium mt-2 italic">{m.originalRole}</div>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{m.desc}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {m.tags.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>

          <PremiumCard className="p-10 glass-card text-center max-w-3xl mx-auto bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
            <h3 className="font-display text-2xl font-bold mb-3">Nuestra Misión</h3>
            <p className="text-muted-foreground leading-relaxed">
              Que cada PyME pueda decidir con la misma claridad que una gran empresa. Convertimos datos dispersos en información simple y útil para que vendas más, gastes menos y mantengas el control de tu operación.
            </p>
          </PremiumCard>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section id="blog" className="py-32 md:py-40 border-t border-border/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Blog & Recursos</span>
            <h2 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mt-4">
              Aprende a operar con <span className="text-gradient">datos confiables</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Ideas prácticas para vender más, gastar menos y tomar mejores decisiones cada semana.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            className="grid gap-6 md:grid-cols-3"
          >
            {blogPreview.map((post, i) => {
              const a = pickAccent(i);
              return (
                <motion.div
                  key={post.slug}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <Link to={`/blog/${post.slug}`} className="group block h-full">
                    <PremiumCard className={`p-6 h-full glass-card border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${a.border}`}>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className={`px-2 py-0.5 rounded-full ${a.bg} ${a.text} font-medium`}>{post.category}</span>
                        <span>{post.readingTime}</span>
                      </div>
                      <h3 className="font-display text-lg font-bold leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{post.excerpt}</p>
                      <span className="inline-flex items-center gap-1 mt-5 text-primary text-sm font-medium">
                        Leer artículo <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </PremiumCard>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link to="/blog">Ver todos los artículos <ArrowRight className="ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 md:py-40 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Preguntas frecuentes</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
              Resolvemos tus <span className="text-gradient">dudas</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
              Lo más importante que necesitas saber antes de transformar tus datos en mejores decisiones.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="item-1" className="border border-gray-100 dark:border-white/5 rounded-2xl px-8 py-2 mb-4 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-white/[0.03] data-[state=open]:border-primary/30 transition-all duration-300">
                <AccordionTrigger className="hover:no-underline text-lg font-semibold">
                  ¿Cuánto tiempo tarda el diagnóstico gratuito?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Entre 24 y 48 horas. Revisamos tu operación, identificamos tus principales fugas de dinero y te entregamos un reporte con recomendaciones concretas para tu industria.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-gray-100 dark:border-white/5 rounded-2xl px-8 py-2 mb-4 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-white/[0.03] data-[state=open]:border-primary/30 transition-all duration-300">
                <AccordionTrigger className="hover:no-underline text-lg font-semibold">
                  ¿Qué información necesitan para empezar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Solo lo que ya tienes: ventas, inventarios o procesos. No pedimos información financiera sensible y todo se maneja bajo acuerdo de confidencialidad (NDA).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-gray-100 dark:border-white/5 rounded-2xl px-8 py-2 mb-4 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-white/[0.03] data-[state=open]:border-primary/30 transition-all duration-300">
                <AccordionTrigger className="hover:no-underline text-lg font-semibold">
                  ¿En qué se diferencia FlowSights de un software de BI?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Un software de BI solo te muestra gráficos. Nosotros te decimos qué hacer con ellos. Diseñamos soluciones específicas para PyMEs y empresas medianas, enfocadas en mejorar la operación, no solo en visualizar datos.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-gray-100 dark:border-white/5 rounded-2xl px-8 py-2 mb-4 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-white/[0.03] data-[state=open]:border-primary/30 transition-all duration-300">
                <AccordionTrigger className="hover:no-underline text-lg font-semibold">
                  ¿Necesito personal técnico para usar FlowSights?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  No. Diseñamos todo para que cualquier dueño, gerente o supervisor lo entienda en minutos. Incluye capacitación completa y soporte continuo, sin tecnicismos.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-gray-100 dark:border-white/5 rounded-2xl px-8 py-2 mb-4 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-white/[0.03] data-[state=open]:border-primary/30 transition-all duration-300">
                <AccordionTrigger className="hover:no-underline text-lg font-semibold">
                  ¿Cuánto cuesta?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  La inversión depende del tamaño de tu operación y de los sistemas que integremos. Por eso el diagnóstico es gratis: te damos una propuesta clara, transparente y sin sorpresas.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-gray-100 dark:border-white/5 rounded-2xl px-8 py-2 mb-4 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-white/[0.03] data-[state=open]:border-primary/30 transition-all duration-300">
                <AccordionTrigger className="hover:no-underline text-lg font-semibold">
                  ¿Y si no veo resultados?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Nos comprometemos con resultados medibles en 90 días. Si no ves el impacto esperado, seguimos trabajando contigo sin costo adicional hasta lograrlo.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">¿Tienes otra pregunta?</p>
            <a href="mailto:contacto@flowsights.it.com" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
              <Mail className="w-4 h-4" /> Contáctanos directamente
            </a>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <Showcase />

      {/* INSTAGRAM FEED */}
      <InstagramFeed />

      {/* CONTACT */}
      <section id="contacto" className="py-32 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 relative overflow-hidden">
        <div className="container grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              🚀 Empieza hoy
            </span>
            <h2 className="font-display text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              Descubre lo que tus datos están <span className="text-primary">diciendo</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-6 text-xl leading-relaxed">
              Solicita tu diagnóstico gratuito. En menos de 48 horas te mostramos dónde se está fugando dinero en tu operación y cómo recuperarlo.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Diagnóstico 100% gratuito y sin compromiso",
                "Respuesta en menos de 24 horas",
                "Recomendaciones específicas para tu industria",
                "Sin contratos largos ni letra pequeña",
              ].map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary grid place-items-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 mt-8">
              <div className="flex flex-col gap-2">
                <a href="mailto:contacto@flowsights.it.com" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                  <Mail className="w-4 h-4" /> contacto@flowsights.it.com
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button asChild variant="hero" size="lg" className="w-fit h-14 px-8 text-lg shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Contactar por WhatsApp
                  </a>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="w-fit border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
                  <Link to="/flowsight-ads-info" className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Flowsight Ads (IA)
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          <PremiumCard className="p-10 glass-card border-gray-100 dark:border-white/5 shadow-2xl relative overflow-hidden group">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-8 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-4 ring-primary/20">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">¡Solicitud enviada con éxito!</h3>
                <p className="text-muted-foreground max-w-sm mb-2">
                  Hemos recibido tu información correctamente.
                </p>
                <p className="text-foreground font-medium mb-8">
                  Te contactaremos en menos de <span className="text-primary">24 horas</span>.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitted(false)}
                  className="mt-2"
                >
                  Enviar otra solicitud
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl font-bold">Analiza mi negocio gratis</h3>
                <p className="text-sm text-muted-foreground mt-2">Cuéntanos un poco de tu empresa y te respondemos en menos de 24 horas.</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/5 focus:border-primary/50 transition-all duration-300" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/5 focus:border-primary/50 transition-all duration-300" placeholder="tu@empresa.com" />
                  </div>
                  <div>
                    <Label htmlFor="company">Empresa *</Label>
                    <Input id="company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-2 bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/5 focus:border-primary/50 transition-all duration-300" placeholder="Nombre de tu empresa" />
                  </div>
                  <div>
                    <Label htmlFor="message">¿Qué te gustaría mejorar?</Label>
                    <Textarea id="message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2 bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/5 focus:border-primary/50 transition-all duration-300" placeholder="Ej: Quiero entender por qué mis reportes no cuadran y reducir mermas de inventario." />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? "Enviando..." : <>Quiero mi diagnóstico gratis <ArrowRight className="ml-1" /></>}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Al enviar este formulario aceptas nuestra <Link to="/privacidad" className="text-primary hover:underline">política de privacidad</Link>.
                  </p>
                </form>
              </>
            )}
          </PremiumCard>
        </div>
      </section>

      {/* FOOTER EXPANDIDO */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="container py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 font-display font-bold text-foreground text-lg">
              <img src={logo} alt="FlowSights logo" width={32} height={32} className="w-8 h-8 object-contain" />
              FlowSights
            </div>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Ayudamos a PyMEs a vender más, gastar menos y tomar mejores decisiones con la información que ya tienen.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Servicios</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["Data Cleaning", "Operational Insights", "Process Optimization", "Dashboard Creation", "Performance Monitoring"].map((s) => (
                <li key={s}>
                  <a href="#servicios" className="hover:text-primary transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Industrias</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["Manufactura", "Logística", "Hoteles", "Restaurantes", "Clínicas", "Retail"].map((i) => (
                <li key={i}>
                  <a href="#industrias" className="hover:text-primary transition-colors">{i}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Contacto</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href="mailto:contacto@flowsights.it.com" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" /> contacto@flowsights.it.com
                </a>
              </li>
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Instagram className="w-4 h-4" /> @flowsights_cr
                </a>
              </li>
              <li>San José, Costa Rica</li>
              <li>
                <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/privacidad" className="hover:text-primary transition-colors">Política de privacidad</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50">
          <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} FlowSights. Todos los derechos reservados.</span>
            <div className="flex items-center gap-3">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 grid place-items-center rounded-full border border-border/60 hover:border-primary/50 hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 grid place-items-center rounded-full border border-border/60 hover:border-primary/50 hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href={EMAIL_URL} aria-label="Email" className="w-9 h-9 grid place-items-center rounded-full border border-border/60 hover:border-primary/50 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default Index;
