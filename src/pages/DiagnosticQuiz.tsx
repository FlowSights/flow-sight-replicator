import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  MessageCircle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  AlertCircle,
  Clock,
  Users,
  DollarSign,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Question {
  tag: string;
  text: string;
  sub: string;
  opts: Array<{
    l: string;
    t: string;
    d: string;
    s: number;
    rev?: number;
  }>;
}

interface Profile {
  icon: React.ReactNode;
  title: string;
  sub: string;
  color: string;
}

const QUESTIONS: Question[] = [
  {
    tag: "Gestión de datos",
    text: "¿Cómo manejas los datos de tu negocio?",
    sub: "Piensa en ventas, inventario, costos y operaciones.",
    opts: [
      { l: "A", t: "Excel y hojas manuales", d: "Varios archivos actualizados a mano", s: 4 },
      { l: "B", t: "Sistema básico (POS/ERP)", d: "Software con reportes no siempre exactos", s: 3 },
      { l: "C", t: "Combinación de herramientas", d: "Excel + sistema + WhatsApp + quizás dashboard", s: 2 },
      { l: "D", t: "Datos unificados y confiables", d: "Una sola fuente de verdad que todos siguen", s: 1 },
    ],
  },
  {
    tag: "Calidad de reportes",
    text: "¿Con qué frecuencia encuentras errores en tus reportes?",
    sub: "Números que no cuadran, duplicados, datos faltantes.",
    opts: [
      { l: "A", t: "Muy seguido (varias veces/semana)", d: "Ya ni nos sorprende", s: 4 },
      { l: "B", t: "Frecuentemente (1–2 veces/semana)", d: "Siempre algo que corregir antes de decidir", s: 3 },
      { l: "C", t: "Ocasionalmente (1–2 veces/mes)", d: "Errores detectados pero no tan graves", s: 2 },
      { l: "D", t: "Raramente o nunca", d: "Datos consistentes y confiables", s: 1 },
    ],
  },
  {
    tag: "Equipo",
    text: "¿Cuántas personas trabajan con datos o reportes?",
    sub: "Incluye quienes los crean, revisan o toman decisiones.",
    opts: [
      { l: "A", t: "Solo yo o 1 persona", d: "Operación pequeña o muy centralizada", s: 1 },
      { l: "B", t: "2 a 5 personas", d: "Equipo pequeño con roles definidos", s: 2 },
      { l: "C", t: "6 a 15 personas", d: "Múltiples áreas usando los mismos datos", s: 3 },
      { l: "D", t: "Más de 15 personas", d: "Organización con operaciones complejas", s: 4 },
    ],
  },
  {
    tag: "Tiempo perdido",
    text: "¿Tu equipo pierde tiempo reconciliando datos?",
    sub: "Horas semanales dedicadas a limpiar antes de analizar.",
    opts: [
      { l: "A", t: "Menos de 2 hrs/semana", d: "El proceso es bastante fluido", s: 1 },
      { l: "B", t: "2 a 5 hrs/semana", d: "Algo de fricción pero manejable", s: 2 },
      { l: "C", t: "5 a 10 hrs/semana", d: "Gastamos tiempo valioso en trabajo manual", s: 3 },
      { l: "D", t: "Más de 10 hrs/semana", d: "Frena las decisiones de forma crítica", s: 4 },
    ],
  },
  {
    tag: "Ingresos",
    text: "¿Cuál es el ingreso mensual de tu empresa?",
    sub: "Para calcular el impacto económico real en tu caso.",
    opts: [
      { l: "A", t: "Menos de $10,000/mes", d: "Negocio en etapa temprana o pequeño", s: 1, rev: 8000 },
      { l: "B", t: "$10,000 – $50,000/mes", d: "Empresa en crecimiento", s: 2, rev: 30000 },
      { l: "C", t: "$50,000 – $200,000/mes", d: "Empresa mediana establecida", s: 3, rev: 125000 },
      { l: "D", t: "Más de $200,000/mes", d: "Operación grande o en expansión", s: 4, rev: 300000 },
    ],
  },
];

const PROFILES: Record<string, Profile> = {
  excellent: {
    icon: <CheckCircle2 className="w-8 h-8" />,
    title: "Buen punto de partida",
    sub: "Tu operación es relativamente sana, pero hay margen de optimización sin capturar.",
    color: "text-green-600",
  },
  good: {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Riesgo operativo moderado",
    sub: "Estás dejando dinero sobre la mesa. Tus datos impactan tus decisiones más de lo que crees.",
    color: "text-yellow-600",
  },
  warning: {
    icon: <AlertCircle className="w-8 h-8" />,
    title: "Fuga de capital activa",
    sub: "Tu operación pierde eficiencia y rentabilidad de forma silenciosa. Es momento de actuar.",
    color: "text-orange-600",
  },
  critical: {
    icon: <AlertCircle className="w-8 h-8" />,
    title: "Alerta operativa crítica",
    sub: "Cada semana sin actuar es dinero real que no recuperarás. El diagnóstico es urgente.",
    color: "text-red-600",
  },
};

const WHATSAPP_URL = "https://wa.me/message/FVHDA5OZHN66P1";
const EMAIL_URL = "mailto:contacto@flowsights.it.com";

export default function DiagnosticQuiz() {
  const [stage, setStage] = useState<"intro" | "quiz" | "email" | "results">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmailInput] = useState("");
  const [results, setResults] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleStartQuiz = () => {
    setStage("quiz");
  };

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setStage("email");
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] ?? null);
    }
  };

  const handleSubmitEmail = async () => {
    if (!name.trim() || !email.trim() || submitting) return;
    setSubmitting(true);

    // Compute results first so we can email them
    let total = 0;
    answers.forEach((a, q) => (total += QUESTIONS[q].opts[a].s));
    const riskPct = Math.round((total / (QUESTIONS.length * 4)) * 100);
    const health = 100 - riskPct;
    const rev = QUESTIONS[4].opts[answers[4]].rev || 30000;
    const leak = riskPct <= 30 ? 0.04 : riskPct <= 50 ? 0.09 : riskPct <= 70 ? 0.16 : 0.23;
    const mo = Math.round(rev * leak);
    const yr = mo * 12;

    let profile: Profile;
    if (health >= 75) profile = PROFILES.excellent;
    else if (health >= 50) profile = PROFILES.good;
    else if (health >= 30) profile = PROFILES.warning;
    else profile = PROFILES.critical;

    try {
      const { error } = await supabase.functions.invoke("send-diagnostic-email", {
        body: {
          name: name.trim(),
          email: email.trim(),
          health,
          riskPct,
          profileTitle: profile.title,
          profileSub: profile.sub,
          monthlyLeak: mo,
          yearlyLeak: yr,
          findings: [
            answers[0] >= 2 && { t: "Fragmentación de datos crítica", d: "Datos en múltiples sistemas sin sincronización." },
            answers[3] >= 2 && { t: "Costo de trabajo manual elevado", d: "Horas semanales en tareas que deberían ser automáticas." },
            answers[1] >= 2 && { t: "Reportes no confiables", d: "Decisiones tomadas sobre bases falsas." },
            answers[2] >= 2 && { t: "Visión desalineada entre áreas", d: "Equipos trabajando con datos distintos." },
            riskPct > 50 && { t: "Oportunidades sin capturar", d: "Entre 10% y 23% del ingreso se pierde en ineficiencias." },
          ].filter(Boolean),
          answers: QUESTIONS.map((q, i) => ({
            question: q.text,
            answer: q.opts[answers[i]].t,
          })),
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Failed to send diagnostic email", err);
      toast({
        title: "No se pudo enviar la notificación",
        description: "Mostraremos tus resultados igualmente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      showResults(name);
    }
  };

  const showResults = (userName: string) => {
    let total = 0;
    answers.forEach((a, q) => (total += QUESTIONS[q].opts[a].s));
    const riskPct = Math.round((total / (QUESTIONS.length * 4)) * 100);
    const health = 100 - riskPct;
    const rev = QUESTIONS[4].opts[answers[4]].rev || 30000;
    const leak = riskPct <= 30 ? 0.04 : riskPct <= 50 ? 0.09 : riskPct <= 70 ? 0.16 : 0.23;
    const mo = Math.round(rev * leak);
    const yr = mo * 12;

    let profile: Profile;
    if (health >= 75) profile = PROFILES.excellent;
    else if (health >= 50) profile = PROFILES.good;
    else if (health >= 30) profile = PROFILES.warning;
    else profile = PROFILES.critical;

    const findings = [
      {
        c: answers[0] >= 2,
        icon: <BarChart3 className="w-5 h-5" />,
        t: "Fragmentación de datos crítica",
        d: "Tus datos viven en múltiples sistemas sin sincronización. Cada área opera con su propia verdad.",
      },
      {
        c: answers[3] >= 2,
        icon: <Clock className="w-5 h-5" />,
        t: "Costo de trabajo manual elevado",
        d: "Tu equipo dedica horas semanales a tareas que deberían ser automáticas.",
      },
      {
        c: answers[1] >= 2,
        icon: <TrendingUp className="w-5 h-5" />,
        t: "Reportes no confiables",
        d: "Cuando los reportes tienen errores frecuentes, las decisiones se toman sobre bases falsas.",
      },
      {
        c: answers[2] >= 2,
        icon: <Users className="w-5 h-5" />,
        t: "Visión desalineada entre áreas",
        d: "Con múltiples personas usando datos distintos, los equipos no trabajan hacia el mismo objetivo.",
      },
      {
        c: riskPct > 50,
        icon: <DollarSign className="w-5 h-5" />,
        t: "Oportunidades sin capturar",
        d: "Entre el 10% y 23% del ingreso se pierde en ineficiencias.",
      },
    ].filter((f) => f.c);

    setResults({
      name: userName,
      health,
      riskPct,
      profile,
      mo,
      yr,
      findings: findings.slice(0, 3),
    });
    setStage("results");
  };

  const handleRestart = () => {
    setStage("intro");
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setName("");
    setEmailInput("");
    setResults(null);
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];

  // Decorative background elements
  const DecorativeBackground = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Grid background pattern */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Floating dashboard icons - positioned absolutely */}
      <motion.div
        className="absolute top-20 right-10 text-primary/10"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <BarChart3 className="w-32 h-32" />
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-5 text-accent/10"
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <PieChart className="w-40 h-40" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 right-1/4 text-primary/5"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <Activity className="w-48 h-48" />
      </motion.div>

      {/* Gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <DecorativeBackground />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <nav className="container flex items-center justify-between h-20">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display font-bold text-xl md:text-2xl hover:opacity-90 transition-opacity"
          >
            <img src={logo} alt="FlowSights logo" width={48} height={48} className="w-12 h-12 object-contain" />
            <span>FlowSights</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-1" /> Volver
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24 min-h-screen flex items-center justify-center relative z-10">
        <div className="container max-w-2xl">
          {/* Intro Stage */}
          {stage === "intro" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center space-y-6 animate-fade-up">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                  Análisis Gratuito
                </span>

                <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05]">
                  Descubre cuánto dinero <span className="text-gradient">pierdes cada mes</span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Responde 5 preguntas simples sobre tu operación y obtén un análisis personalizado de las fugas de capital ocultas en tu negocio.
                </p>

                <div className="space-y-3 pt-4">
                  {[
                    { icon: <Clock className="h-5 w-5" />, text: "Toma menos de 3 minutos" },
                    { icon: <BarChart3 className="h-5 w-5" />, text: "Resultado inmediato y personalizado" },
                    { icon: <Shield className="h-5 w-5" />, text: "100% confidencial, sin compromisos" },
                  ].map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <div className="text-primary flex-shrink-0">{benefit.icon}</div>
                      <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-6"
                >
                  <Button onClick={handleStartQuiz} size="lg" variant="hero" className="w-full md:w-auto">
                    Comenzar diagnóstico <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Quiz Stage */}
          {stage === "quiz" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    {currentQuestion + 1} / {QUESTIONS.length}
                  </span>
                </div>
              </div>

              <Card className="glass-card p-8 md:p-12 backdrop-blur-2xl border-border/60 bg-card/80 shadow-xl">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Question Tag */}
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-6">
                    <span className="text-xs font-semibold uppercase tracking-wide">{question.tag}</span>
                  </span>

                  {/* Question Text */}
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-foreground">
                    {question.text}
                  </h2>

                  <p className="text-muted-foreground mb-8">{question.sub}</p>

                  {/* Options */}
                  <div className="space-y-3 mb-8">
                    {question.opts.map((opt, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleSelectOption(idx)}
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all backdrop-blur-sm ${
                          selectedOption === idx
                            ? "border-primary bg-primary/12 shadow-lg shadow-primary/20"
                            : "border-border/40 bg-card/60 hover:border-primary/50 hover:bg-primary/8 hover:shadow-md"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm transition-all ${
                            selectedOption === idx
                              ? "bg-gradient-primary text-primary-foreground shadow-lg"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {opt.l}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground text-sm">{opt.t}</div>
                          <div className="text-xs text-muted-foreground mt-1">{opt.d}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3">
                    {currentQuestion > 0 && (
                      <Button onClick={handleBack} variant="outline" className="flex-1">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      disabled={selectedOption === null}
                      variant="hero"
                      className="flex-1"
                    >
                      {currentQuestion === QUESTIONS.length - 1 ? "Ver resultados" : "Siguiente"}{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          )}

          {/* Email Capture Stage */}
          {stage === "email" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card p-8 md:p-12 text-center backdrop-blur-2xl border-border/60 bg-card/80 shadow-xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm">
                    <span className="text-xs font-semibold uppercase tracking-wide">Tu resultado</span>
                  </span>

                  <h2 className="font-display text-4xl font-bold text-foreground">Tu diagnóstico está listo</h2>

                  <p className="text-muted-foreground">Completa tus datos para recibir tu análisis personalizado</p>

                  <div className="space-y-4 pt-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide">
                        Nombre
                      </label>
                      <input
                        type="text"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary/40 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm transition-all"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="tu@empresa.com"
                        value={email}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary/40 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm transition-all"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      onClick={handleSubmitEmail}
                      disabled={!name.trim() || !email.trim() || submitting}
                      size="lg"
                      variant="hero"
                      className="w-full"
                    >
                      {submitting ? "Enviando..." : "Ver mi diagnóstico"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="text-xs text-muted-foreground flex items-center justify-center gap-2"
                  >
                    <Shield className="w-3 h-3" /> Sin spam. Solo tu reporte personalizado y seguimiento de FlowSights.
                  </motion.p>
                </motion.div>
              </Card>
            </motion.div>
          )}

          {/* Results Stage */}
          {stage === "results" && results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm">
                    <span className="text-xs font-semibold uppercase tracking-wide">Tu resultado</span>
                  </span>
                </div>

                {/* Health Ring */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center"
                >
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 148 148" className="w-full h-full">
                      <circle cx="74" cy="74" r="64" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2" />
                      <motion.circle
                        cx="74"
                        cy="74"
                        r="64"
                        fill="none"
                        stroke="url(#gradientRing)"
                        strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 64}`}
                        initial={{ strokeDashoffset: `${2 * Math.PI * 64}` }}
                        animate={{ strokeDashoffset: `${2 * Math.PI * 64 * (1 - results.health / 100)}` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradientRing" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--accent))" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        className="text-4xl font-display font-bold text-gradient"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        {results.health}%
                      </motion.div>
                      <div className="text-xs text-muted-foreground">salud operativa</div>
                    </div>
                  </div>
                </motion.div>

                {/* Profile */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className={`flex justify-center mb-3 ${results.profile.color}`}>
                    {results.profile.icon}
                  </div>
                  <h2 className="font-display text-3xl font-bold mb-2">{results.profile.title}</h2>
                  <p className="text-muted-foreground">{results.profile.sub}</p>
                </motion.div>

                {/* Cost Block */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="glass-card p-8 text-center border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur-xl shadow-lg">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Fuga de capital estimada
                    </div>
                    <div className="text-4xl font-display font-bold text-gradient mb-2">
                      ${results.mo.toLocaleString()}
                      <span className="text-lg font-semibold text-muted-foreground">/mes</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ≈ ${results.yr.toLocaleString()} al año en costos ocultos
                    </div>
                  </Card>
                </motion.div>

                {/* Findings */}
                <div className="space-y-3">
                  {results.findings.map((f: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex gap-4 p-4 rounded-lg bg-secondary/40 border border-border/40 backdrop-blur-sm hover:bg-secondary/50 transition-all"
                    >
                      <div className="text-primary flex-shrink-0 mt-0.5">{f.icon}</div>
                      <div className="text-left">
                        <div className="font-semibold text-foreground text-sm">{f.t}</div>
                        <div className="text-xs text-muted-foreground mt-1">{f.d}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Card className="glass-card p-8 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur-xl shadow-lg">
                    <h3 className="font-display text-2xl font-bold mb-3 text-center">
                      Recupera ese dinero <span className="text-gradient">este mes</span>
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center">
                      Nuestro diagnóstico gratuito identifica exactamente dónde se van tus recursos y te entrega un plan
                      de acción concreto.
                    </p>

                    <div className="space-y-3 mb-6">
                      <Button
                        onClick={() => window.open(WHATSAPP_URL, "_blank")}
                        size="lg"
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" /> Contactar por WhatsApp
                      </Button>
                      <Button
                        onClick={() => window.open(EMAIL_URL, "_blank")}
                        size="lg"
                        variant="outline"
                        className="w-full font-semibold"
                      >
                        <Mail className="mr-2 h-4 w-4" /> Enviar por Email
                      </Button>
                    </div>

                    <div className="space-y-2 text-left bg-card/50 rounded-lg p-4 backdrop-blur-sm">
                      {[
                        { icon: <CheckCircle2 className="w-4 h-4" />, text: "Sin costo ni compromiso" },
                        { icon: <Clock className="w-4 h-4" />, text: "Resultado en 48 hrs" },
                        { icon: <Shield className="w-4 h-4" />, text: "100% confidencial" },
                      ].map((benefit, i) => (
                        <div key={i} className="flex gap-2 text-xs items-center">
                          <span className="text-primary flex-shrink-0">{benefit.icon}</span>
                          <span className="text-foreground">{benefit.text}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <Button onClick={handleRestart} variant="outline" className="w-full font-semibold">
                    Reiniciar diagnóstico
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
