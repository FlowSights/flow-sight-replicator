import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, ArrowDown, ArrowUp, Play, Check, Sparkles, Database, LineChart,
  Workflow, BarChart3, Activity, Factory, Truck, Hotel, UtensilsCrossed,
  Stethoscope, ShoppingBag, HardHat, Plus, Mail, ShieldCheck, Zap, Eye,
  TrendingUp, Clock, DollarSign, Menu, MessageCircle,
} from "lucide-react";
import { Instagram } from "@/components/icons/Instagram";
import heroDashboard from "@/assets/hero-dashboard.png";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useCountUp } from "@/hooks/useCountUp";
import { ToolsMarquee } from "@/components/ToolsMarquee";
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

  const navLinks = [
    { label: "Cómo funciona", href: "#proceso" },
    { label: "Servicios", href: "#servicios" },
    { label: "Industrias", href: "#industrias" },
    { label: "Quiénes somos", href: "#equipo" },
    { label: "Contacto", href: "#contacto" },
  ];

  const problems = [
    { title: "Datos duplicados", desc: "Registros repetidos que distorsionan tus reportes y generan decisiones incorrectas." },
    { title: "Inventarios incorrectos", desc: "Discrepancias entre el sistema y la realidad que generan sobre-stock o faltantes." },
    { title: "Procesos ineficientes", desc: "Flujos de trabajo con cuellos de botella que ralentizan la operación y elevan costos." },
    { title: "Costos innecesarios", desc: "Gastos ocultos que no se detectan porque los datos están desorganizados o incompletos." },
    { title: "Falta de visibilidad", desc: "Sin reportes claros, los gerentes toman decisiones a ciegas o con información desactualizada." },
    { title: "Decisiones sin datos", desc: "Estrategias basadas en intuición en lugar de métricas reales que respalden cada acción." },
  ];

  const steps = [
    { n: "01", title: "Recibimos tus datos", desc: "Nos compartes tus archivos, bases de datos o sistemas actuales. Trabajamos con Excel, CSV, ERP, sistemas POS y más. El proceso es seguro y confidencial." },
    { n: "02", title: "Limpiamos y validamos la información", desc: "Nuestro equipo identifica y corrige duplicados, errores, inconsistencias y datos faltantes. Entregamos datos limpios y confiables." },
    { n: "03", title: "Analizamos patrones y problemas", desc: "Aplicamos análisis estadístico y modelos operativos para detectar cuellos de botella, costos ocultos y oportunidades de mejora en tu negocio." },
    { n: "04", title: "Entregamos recomendaciones accionables", desc: "Recibes un informe claro con insights priorizados, dashboards visuales y un plan de acción concreto para implementar mejoras de inmediato." },
  ];

  const services = [
    { icon: Database, tag: "Limpieza de Datos", title: "Data Cleaning", desc: "Identificamos y corregimos datos duplicados, inconsistentes o incompletos en tus sistemas. Garantizamos que tu información sea precisa y confiable para la toma de decisiones.", items: ["Deduplicación", "Validación de formatos", "Normalización", "Auditoría de calidad"], popular: false },
    { icon: LineChart, tag: "Insights Operativos", title: "Operational Insights", desc: "Analizamos tus datos operativos para descubrir patrones ocultos, ineficiencias y oportunidades de mejora que impactan directamente en tu rentabilidad.", items: ["Análisis de tendencias", "Detección de anomalías", "KPIs operativos", "Alertas inteligentes"], popular: true },
    { icon: Workflow, tag: "Optimización de Procesos", title: "Process Optimization", desc: "Mapeamos y rediseñamos tus flujos de trabajo para eliminar cuellos de botella, reducir tiempos y maximizar la eficiencia operativa de tu empresa.", items: ["Mapeo de procesos", "Análisis de cuellos de botella", "Automatización", "Mejora continua"] },
    { icon: BarChart3, tag: "Creación de Dashboards", title: "Dashboard Creation", desc: "Diseñamos y construimos dashboards visuales personalizados que te permiten monitorear en tiempo real los indicadores más importantes de tu negocio.", items: ["Visualizaciones interactivas", "Reportes automáticos", "Acceso multiplataforma", "Actualización en tiempo real"] },
    { icon: Activity, tag: "Monitoreo de Desempeño", title: "Performance Monitoring", desc: "Implementamos sistemas de seguimiento continuo para que puedas detectar desviaciones y tomar acciones correctivas antes de que los problemas escalen.", items: ["Monitoreo 24/7", "Alertas en tiempo real", "Reportes periódicos", "Benchmarking"] },
  ];

  const results = [
    { icon: DollarSign, value: "-30%", label: "costos promedio", title: "Reducción de costos", desc: "Identifica y elimina gastos innecesarios detectados en tus datos operativos." },
    { icon: TrendingUp, value: "+2x", label: "eficiencia operativa", title: "Mayor productividad", desc: "Procesos optimizados que permiten a tu equipo hacer más con los mismos recursos." },
    { icon: ShieldCheck, value: "95%", label: "precisión de datos", title: "Menos errores", desc: "Datos limpios y validados que eliminan decisiones basadas en información incorrecta." },
    { icon: Eye, value: "360°", label: "visibilidad total", title: "Mejor control operativo", desc: "Dashboards en tiempo real para monitorear cada área de tu negocio." },
    { icon: Clock, value: "10x", label: "más rápido", title: "Decisiones más rápidas", desc: "Accede a insights claros cuando los necesitas, sin esperar reportes manuales." },
    { icon: Sparkles, value: "+40%", label: "rentabilidad", title: "Mayor rentabilidad", desc: "El resultado final: un negocio más eficiente, con menores costos y mayores márgenes." },
  ];

  const industries = [
    { icon: Factory, title: "Manufactura", desc: "Control de producción, inventarios y calidad. Detectamos ineficiencias en líneas de producción y reducimos desperdicios.", tags: ["Control de inventario", "Eficiencia de línea", "Calidad de producto"] },
    { icon: Truck, title: "Logística", desc: "Optimización de rutas, tiempos de entrega y gestión de flota. Reducimos costos de transporte y mejoramos la puntualidad.", tags: ["Optimización de rutas", "Gestión de flota", "Tiempos de entrega"] },
    { icon: Hotel, title: "Hoteles", desc: "Análisis de ocupación, costos operativos y satisfacción del huésped. Maximizamos la rentabilidad por habitación.", tags: ["Análisis de ocupación", "Costos operativos", "Experiencia del huésped"] },
    { icon: UtensilsCrossed, title: "Restaurantes", desc: "Control de mermas, análisis de menú y eficiencia de cocina. Reducimos desperdicios y optimizamos el costo por plato.", tags: ["Control de mermas", "Análisis de menú", "Eficiencia de cocina"] },
    { icon: Stethoscope, title: "Clínicas", desc: "Gestión de citas, inventario médico y eficiencia operativa. Mejoramos la experiencia del paciente y reducimos tiempos de espera.", tags: ["Gestión de citas", "Inventario médico", "Tiempos de espera"] },
    { icon: ShoppingBag, title: "Retail", desc: "Análisis de ventas, rotación de inventario y comportamiento del cliente. Optimizamos el surtido y reducimos el sobre-stock.", tags: ["Análisis de ventas", "Rotación de inventario", "Comportamiento del cliente"] },
    { icon: HardHat, title: "Construcción", desc: "Control de materiales, avance de obra y costos de proyecto. Detectamos desviaciones presupuestales antes de que escalen.", tags: ["Control de materiales", "Avance de obra", "Control presupuestal"] },
  ];

  const testimonials = [
    { quote: "FlowSights nos ayudó a identificar que teníamos un 18% de duplicados en nuestra base de clientes. Después de la limpieza, nuestros reportes son mucho más precisos y ahorramos tiempo en cada cierre mensual.", initials: "CM", name: "Carlos Mendoza", role: "Director de Operaciones · Grupo Logístico Norte", sector: "Logística" },
    { quote: "Teníamos datos de ocupación dispersos en tres sistemas diferentes. FlowSights los unificó y nos entregó un dashboard que ahora usamos todos los días para tomar decisiones de pricing.", initials: "AR", name: "Ana Rodríguez", role: "Gerente General · Hotel Palmas Reales", sector: "Hotelería" },
    { quote: "Detectaron un problema en nuestro inventario que nos estaba costando ₡120.000.000 (colones) al mes en sobre-stock. En 3 semanas ya teníamos el proceso corregido y los datos en orden.", initials: "RF", name: "Roberto Fuentes", role: "CEO · Manufactura Fuentes S.A.", sector: "Manufactura" },
  ];

  const team = [
    { initials: "MG", name: "Marcos García", role: "Ingeniero Industrial", desc: "Amplio conocimiento en optimización de procesos", tags: ["Optimización de procesos", "Análisis operativo", "Eficiencia"] },
    { initials: "SP", name: "Steven Pineda", role: "AI Data Analyst Junior · International Operations", desc: "AI Data Analyst Junior y Customer Experience & Sales Professional con más de 5 años de experiencia en múltiples industrias.", tags: ["AI Data Analyst Junior", "Experiencia del cliente", "Operaciones internacionales"] },
    { initials: "OZ", name: "Oscar Zapata", role: "Especialista en Control de Inventarios", desc: "Especialista en control de inventarios, manejo de operaciones y ventas", tags: ["Control de inventarios", "Manejo de operaciones", "Ventas"] },
  ];

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: form,
      });
      if (error) throw error;
      toast({ title: "¡Solicitud enviada!", description: "Te contactaremos en menos de 24 horas." });
      setForm({ name: "", email: "", company: "", message: "" });
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
      {/* NAVBAR */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <nav className="container flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl md:text-2xl hover:opacity-90 transition-opacity">
            <img src={logo} alt="FlowSights logo" width={48} height={48} className="w-12 h-12 object-contain" />
            <span>FlowSights</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Menu className="w-4 h-4" />
                  <span className="hidden sm:inline">Menú</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl">
                {navLinks.map((l) => (
                  <DropdownMenuItem key={l.href} asChild>
                    <a href={l.href} className="cursor-pointer">{l.label}</a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="hero" size="sm" asChild className="hidden sm:inline-flex">
              <a href="#contacto">Diagnóstico gratuito</a>
            </Button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="container relative grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8 animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              Plataforma de Inteligencia Operativa
            </span>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05]">
              Convierte tus datos en{" "}
              <span className="text-gradient">decisiones inteligentes</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed">
              En FlowSights ayudamos a empresas a limpiar sus datos, optimizar procesos y detectar oportunidades ocultas en sus operaciones.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Limpieza de datos", "Insights operativos", "Dashboards en tiempo real"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 text-sm">
                  <Check className="w-4 h-4 text-primary" /> {t}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <a href="#contacto">Solicitar diagnóstico gratuito <ArrowRight className="ml-1" /></a>
              </Button>
              <Button size="lg" asChild className="bg-[#25D366] hover:bg-[#20bd5a] text-white">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-1" /> WhatsApp
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href={EMAIL_URL}><Mail className="mr-1" /> Contáctanos</a>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/60 max-w-lg">
              {([
                { value: 30, suffix: "%", label: "Reducción de costos" },
                { value: 2, suffix: "x", label: "Mayor productividad" },
                { value: 95, suffix: "%", label: "Precisión de datos" },
              ] as HeroStat[]).map((s) => (
                <AnimatedStat key={s.label} stat={s} />
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full" />
            <img
              src={heroDashboard}
              alt="FlowSights Dashboard — Análisis operativo en tiempo real"
              width={1280}
              height={960}
              className="relative w-full h-auto animate-float"
            />
            <Card className="absolute top-8 left-0 md:-left-6 glass-card p-4 flex items-center gap-3 shadow-elevated animate-float" style={{ animationDelay: "1s" }}>
              <span className="w-10 h-10 rounded-full bg-primary/20 grid place-items-center text-primary"><ArrowDown className="w-5 h-5" /></span>
              <div>
                <div className="text-xs text-muted-foreground">Costos operativos</div>
                <div className="font-semibold text-primary">-24% este mes</div>
              </div>
            </Card>
            <Card className="absolute bottom-8 right-0 md:-right-4 glass-card p-4 flex items-center gap-3 shadow-elevated animate-float" style={{ animationDelay: "2s" }}>
              <span className="w-10 h-10 rounded-full bg-accent/20 grid place-items-center text-accent"><ArrowUp className="w-5 h-5" /></span>
              <div>
                <div className="text-xs text-muted-foreground">Eficiencia</div>
                <div className="font-semibold text-accent">+18% productividad</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* TOOLS MARQUEE */}
      <ToolsMarquee />


      <section className="py-24 relative">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">El problema</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
              Tus datos pueden estar <span className="text-gradient">costándote dinero</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              La mayoría de las empresas operan con datos desorganizados sin saberlo. Cada error en tus datos es una oportunidad perdida o un costo evitable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((p, i) => {
              const c = pickAccent(i);
              return (
                <Card key={p.title} className={`p-6 glass-card transition-all hover:-translate-y-1 group ${c.border}`}>
                  <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} grid place-items-center mb-4 transition-colors`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </Card>
              );
            })}
          </div>

          <Card className="mt-10 p-8 md:p-10 glass-card border-primary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-br from-primary/10 to-accent/5">
            <div>
              <h3 className="font-display text-2xl font-bold">¿Cuánto te están costando tus datos sucios?</h3>
              <p className="text-muted-foreground mt-2">Las empresas pierden en promedio el 15-25% de sus ingresos por problemas de calidad de datos.</p>
            </div>
            <Button variant="hero" size="lg" asChild>
              <a href="#contacto">Descúbrelo gratis <ArrowRight className="ml-1" /></a>
            </Button>
          </Card>
        </div>
      </section>

      {/* PROCESS */}
      <section id="proceso" className="py-24 bg-card/30 border-y border-border/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">El proceso</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
              Así funciona <span className="text-gradient">FlowSights</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Un proceso claro y estructurado para transformar tus datos en ventajas competitivas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const c = pickAccent(i);
              return (
                <Card key={s.n} className={`p-6 glass-card relative overflow-hidden group transition-all ${c.border}`}>
                  <div className={`text-xs font-semibold tracking-widest mb-3 ${c.text}`}>PASO {s.n}</div>
                  <div className={`font-display text-7xl font-bold absolute -right-2 -top-2 transition-colors opacity-10 group-hover:opacity-25 ${c.text}`}>
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 relative">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed relative">{s.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicios" className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Lo que hacemos</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
              Nuestros <span className="text-gradient">servicios</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Soluciones integrales para transformar tus datos en ventajas competitivas reales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => {
              const Icon = s.icon;
              const c = pickAccent(i + 1);
              return (
                <Card key={s.title} className={`p-7 glass-card hover:-translate-y-1 transition-all relative ${s.popular ? "border-primary/60 shadow-glow" : c.border}`}>
                  {s.popular && (
                    <span className="absolute -top-3 right-6 bg-gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Más popular
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} grid place-items-center mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${c.text}`}>{s.tag}</div>
                  <h3 className="font-display text-2xl font-bold mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.desc}</p>
                  <ul className="space-y-2 mb-2">
                    {s.items.map((it) => (
                      <li key={it} className="flex items-center gap-2 text-sm">
                        <Check className={`w-4 h-4 shrink-0 ${c.text}`} /> {it}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="py-24 bg-card/30 border-y border-border/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Resultados reales</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
              Resultados que puedes <span className="text-gradient">esperar</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Nuestros clientes ven mejoras medibles desde las primeras semanas de trabajo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((r, i) => {
              const Icon = r.icon;
              const c = pickAccent(i);
              const stat = parseStat(r.value);
              return (
                <Card key={r.title} className={`p-7 glass-card transition-all ${c.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    <AnimatedStat
                      stat={{ ...stat, label: "" }}
                      className={`font-display text-5xl font-bold ${c.text}`}
                    />
                    <span className={`w-11 h-11 rounded-xl ${c.bg} ${c.text} grid place-items-center`}>
                      <Icon className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{r.label}</div>
                  <h3 className="font-semibold text-lg mb-2">{r.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                </Card>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-semibold">
              <Sparkles className="w-4 h-4" /> +150 empresas optimizadas
            </span>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section id="industrias" className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Sectores</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
              Industrias que <span className="text-gradient">ayudamos</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Experiencia comprobada en múltiples sectores, adaptando nuestras soluciones a los desafíos específicos de cada industria.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              const c = pickAccent(i);
              return (
                <Card key={ind.title} className={`p-6 glass-card hover:-translate-y-1 transition-all ${c.border}`}>
                  <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.text} grid place-items-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{ind.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{ind.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {ind.tags.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </Card>
              );
            })}
            <Card className="p-6 glass-card border-dashed border-primary/40 flex flex-col justify-center items-start bg-primary/5">
              <div className="w-11 h-11 rounded-xl bg-primary/20 text-primary grid place-items-center mb-4">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">¿Tu industria no está aquí?</h3>
              <p className="text-sm text-muted-foreground mb-4">Trabajamos con cualquier empresa que maneje datos operativos. Contáctanos para una consulta personalizada.</p>
              <a href="#contacto" className="text-primary text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                Contáctanos <ArrowRight className="w-4 h-4" />
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-card/30 border-y border-border/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Clientes</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
              Lo que dicen nuestros <span className="text-gradient">clientes</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Empresas reales que transformaron sus operaciones con FlowSights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-7 glass-card hover:border-primary/40 transition-all flex flex-col">
                <div className="text-primary text-4xl font-display leading-none mb-3">"</div>
                <p className="text-foreground/90 leading-relaxed flex-1">{t.quote}</p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/60">
                  <div className="w-11 h-11 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold text-sm">
                    {t.initials}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">{t.sector}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="equipo" className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Nuestro Equipo</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
              Quiénes <span className="text-gradient">Somos</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Somos un equipo apasionado por transformar datos en decisiones inteligentes. Creada en Costa Rica, FlowSights nace de la experiencia y visión de profesionales comprometidos con la excelencia operativa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {team.map((m) => (
              <Card key={m.name} className="p-7 glass-card text-center hover:border-primary/50 transition-all">
                <div className="w-20 h-20 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold text-xl mx-auto mb-4 shadow-glow">
                  {m.initials}
                </div>
                <h3 className="font-display text-xl font-bold">{m.name}</h3>
                <div className="text-primary text-sm font-medium mt-1">{m.role}</div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{m.desc}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {m.tags.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-muted-foreground">{t}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-10 glass-card text-center max-w-3xl mx-auto bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
            <h3 className="font-display text-2xl font-bold mb-3">Nuestra Misión</h3>
            <p className="text-muted-foreground leading-relaxed">
              Empoderamos a empresas de todos los tamaños para que tomen decisiones basadas en datos confiables. Creemos que la calidad de los datos es la base de la excelencia operativa, y nuestro compromiso es transformar la complejidad en claridad.
            </p>
          </Card>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacto" className="py-24 bg-card/30 border-t border-border/50">
        <div className="container grid lg:grid-cols-2 gap-12">
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Empieza hoy</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
              Descubre lo que tus datos están <span className="text-gradient">diciendo</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Solicita tu diagnóstico gratuito y en 48 horas te diremos exactamente qué oportunidades de mejora existen en tu operación.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Diagnóstico inicial completamente gratuito",
                "Respuesta en menos de 24 horas",
                "Sin compromiso ni contratos",
                "Consulta personalizada para tu industria",
              ].map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary grid place-items-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>

            <a href="mailto:contacto@flowsights.it.com" className="inline-flex items-center gap-2 mt-8 text-primary font-medium hover:underline">
              <Mail className="w-4 h-4" /> contacto@flowsights.it.com
            </a>
          </div>

          <Card className="p-8 glass-card shadow-elevated">
            <h3 className="font-display text-2xl font-bold">Solicitar diagnóstico gratuito</h3>
            <p className="text-sm text-muted-foreground mt-2">Completa el formulario y te contactamos en menos de 24 horas.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">Nombre completo *</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" placeholder="Tu nombre" />
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" placeholder="tu@empresa.com" />
              </div>
              <div>
                <Label htmlFor="company">Empresa *</Label>
                <Input id="company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1.5" placeholder="Nombre de tu empresa" />
              </div>
              <div>
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5" placeholder="Cuéntanos brevemente tu situación..." />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Enviando..." : <>Solicitar diagnóstico gratuito <ArrowRight className="ml-1" /></>}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Al enviar este formulario aceptas nuestra <Link to="/privacidad" className="text-primary hover:underline">política de privacidad</Link>.
              </p>
            </form>
          </Card>
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
              Transformamos datos empresariales en decisiones inteligentes. Limpieza de datos, insights operativos y optimización de procesos para empresas en crecimiento.
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
