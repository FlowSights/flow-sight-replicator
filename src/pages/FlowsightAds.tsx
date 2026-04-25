import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Download,
  Share2,
  Globe,
  MessageSquare,
  CheckCircle2,
  Copy,
  Smartphone,
  Layout,
  Type,
  Image as ImageIcon,
  Wand2,
  Loader,
} from "lucide-react";
import { Facebook } from "@/components/icons/Facebook";
import { Instagram } from "@/components/icons/Instagram";
import { LinkedIn } from "@/components/icons/LinkedIn";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import SEO from "@/components/SEO";
import { toast } from "@/hooks/use-toast";

type Platform = "meta" | "google" | "tiktok" | "linkedin";

interface AdCampaign {
  platform: Platform;
  objective: string;
  targetAudience: string;
  productName: string;
  tone: string;
}

interface GeneratedAd {
  id: string;
  headline: string;
  body: string;
  cta: string;
  description?: string;
  imageUrl?: string;
  imagePrompt?: string;
  isGeneratingImage?: boolean;
}

const PLATFORMS = [
  { id: "meta" as Platform, name: "Meta (FB/IG)", icon: <Facebook className="w-5 h-5" />, color: "text-blue-600" },
  { id: "google" as Platform, name: "Google Ads", icon: <Globe className="w-5 h-5" />, color: "text-red-500" },
  { id: "tiktok" as Platform, name: "TikTok", icon: <Smartphone className="w-5 h-5" />, color: "text-black dark:text-white" },
  { id: "linkedin" as Platform, name: "LinkedIn", icon: <LinkedIn className="w-5 h-5" />, color: "text-blue-700" },
];

// Función para generar imágenes placeholder con gradientes
const generatePlaceholderImage = (seed: number): string => {
  const colors = [
    ["#158f75", "#42d9a4"],
    ["#2563eb", "#60a5fa"],
    ["#7c3aed", "#a78bfa"],
    ["#dc2626", "#fca5a5"],
    ["#ea580c", "#fdba74"],
  ];
  const [color1, color2] = colors[seed % colors.length];
  
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#grad)"/>
      <circle cx="200" cy="150" r="120" fill="rgba(255,255,255,0.1)"/>
      <circle cx="1000" cy="500" r="150" fill="rgba(255,255,255,0.08)"/>
      <text x="600" y="315" font-size="48" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">
        Anuncio Generado
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function FlowsightAds() {
  const [stage, setStage] = useState<"setup" | "generating" | "results">("setup");
  const [campaign, setCampaign] = useState<AdCampaign>({
    platform: "meta",
    objective: "Ventas",
    targetAudience: "",
    productName: "",
    tone: "Profesional",
  });
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!campaign.productName || !campaign.targetAudience) {
      toast({
        title: "Campos incompletos",
        description: "Por favor describe tu producto y audiencia.",
        variant: "destructive",
      });
      return;
    }

    setStage("generating");
    
    // Simular generación de IA
    setTimeout(() => {
      const ads: GeneratedAd[] = [
        {
          id: "ad-1",
          headline: `Transforma tu negocio con ${campaign.productName}`,
          body: `¿Cansado de procesos lentos? ${campaign.productName} es la solución ideal para ${campaign.targetAudience}. Empieza hoy mismo a ver resultados reales.`,
          cta: "Más información",
          imageUrl: generatePlaceholderImage(1),
          imagePrompt: `Profesional moderno usando ${campaign.productName}, ambiente corporativo, colores modernos`,
        },
        {
          id: "ad-2",
          headline: `La herramienta que ${campaign.targetAudience} necesita`,
          body: `Descubre por qué cientos de empresas confían en ${campaign.productName} para optimizar sus operaciones. Resultados garantizados en menos de 30 días.`,
          cta: "Prueba gratuita",
          imageUrl: generatePlaceholderImage(2),
          imagePrompt: `Equipo exitoso celebrando resultados con ${campaign.productName}`,
        },
        {
          id: "ad-3",
          headline: `Optimiza tus resultados con ${campaign.productName}`,
          body: `Especialmente diseñado para ${campaign.targetAudience}. Toma el control de tus datos y escala tu negocio al siguiente nivel.`,
          cta: "Empezar ahora",
          imageUrl: generatePlaceholderImage(3),
          imagePrompt: `Dashboard con datos en tiempo real, crecimiento exponencial, ${campaign.productName}`,
        }
      ];
      setGeneratedAds(ads);
      setSelectedAdId(ads[0].id);
      setStage("results");
    }, 2500);
  };

  const generateImageForAd = (adId: string) => {
    setGeneratedAds(prev =>
      prev.map(ad =>
        ad.id === adId ? { ...ad, isGeneratingImage: true } : ad
      )
    );

    // Simular generación de imagen
    setTimeout(() => {
      setGeneratedAds(prev =>
        prev.map(ad => {
          if (ad.id === adId) {
            return {
              ...ad,
              imageUrl: generatePlaceholderImage(Math.random() * 5),
              isGeneratingImage: false,
            };
          }
          return ad;
        })
      );
      toast({
        title: "Imagen generada",
        description: "La imagen para este anuncio ha sido creada exitosamente.",
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El texto se ha copiado al portapapeles.",
    });
  };

  const downloadAd = (ad: GeneratedAd) => {
    const link = document.createElement("a");
    link.href = ad.imageUrl || "";
    link.download = `anuncio-${ad.id}.png`;
    link.click();
    toast({
      title: "Descargando",
      description: "Tu anuncio se está descargando.",
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEO title="Flowsight Ads - Generador de Anuncios con IA" description="Crea campañas y anuncios con imágenes generadas por IA listos para publicar." />
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-accent/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-background/40 border-b border-border/40">
        <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
          <img src={logo} alt="FlowSights Logo" className="h-8 w-auto" />
          <span className="font-display font-bold text-xl tracking-tight hidden sm:inline-block">
            FlowSights<span className="text-primary">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild className="hidden md:flex">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {stage === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>IA Publicitaria</span>
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  Crea anuncios de <span className="text-gradient">alto impacto</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Configura tu campaña en segundos y deja que nuestra IA genere textos e imágenes persuasivos listos para publicar.
                </p>
              </div>

              <Card className="glass-card p-6 md:p-8 shadow-xl border-border/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Layout className="w-4 h-4" /> Plataforma
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {PLATFORMS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setCampaign({ ...campaign, platform: p.id })}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              campaign.platform === p.id
                                ? "bg-primary/10 border-primary text-primary shadow-sm"
                                : "bg-secondary/40 border-border/40 text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            <span className={p.color}>{p.icon}</span>
                            <span className="text-sm font-medium">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Objetivo
                      </label>
                      <select 
                        value={campaign.objective}
                        onChange={(e) => setCampaign({...campaign, objective: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/40 border border-border/40 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      >
                        <option>Ventas</option>
                        <option>Generación de Leads</option>
                        <option>Tráfico Web</option>
                        <option>Reconocimiento de Marca</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Tono de voz
                      </label>
                      <select 
                        value={campaign.tone}
                        onChange={(e) => setCampaign({...campaign, tone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/40 border border-border/40 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      >
                        <option>Profesional</option>
                        <option>Persuasivo</option>
                        <option>Cercano / Amistoso</option>
                        <option>Urgente / Directo</option>
                        <option>Inspirador</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Type className="w-4 h-4" /> Producto o Servicio
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Dashboard de ventas automatizado"
                        value={campaign.productName}
                        onChange={(e) => setCampaign({ ...campaign, productName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/40 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Smartphone className="w-4 h-4" /> Audiencia Objetivo
                      </label>
                      <textarea
                        placeholder="Ej: Dueños de PyMEs que usan Excel y quieren ahorrar tiempo"
                        rows={4}
                        value={campaign.targetAudience}
                        onChange={(e) => setCampaign({ ...campaign, targetAudience: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/40 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                      />
                    </div>

                    <Button 
                      onClick={handleGenerate}
                      variant="hero" 
                      size="lg" 
                      className="w-full group h-14"
                    >
                      Generar anuncios con IA
                      <Sparkles className="ml-2 w-5 h-5 group-hover:animate-pulse" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {stage === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center py-20 space-y-8"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-display font-bold">La IA está trabajando...</h2>
                <p className="text-muted-foreground">Generando textos e imágenes persuasivos para tu campaña</p>
              </div>
            </motion.div>
          )}

          {stage === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-display font-bold">Tus anuncios listos</h2>
                  <p className="text-muted-foreground">Personalizados para {PLATFORMS.find(p => p.id === campaign.platform)?.name}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStage("setup")}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Editar campaña
                  </Button>
                  <Button variant="hero">
                    <Download className="mr-2 w-4 h-4" /> Descargar todo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel de anuncios */}
                <div className="lg:col-span-1 space-y-3">
                  {generatedAds.map((ad, i) => (
                    <motion.button
                      key={ad.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedAdId(ad.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedAdId === ad.id
                          ? "bg-primary/10 border-primary shadow-md"
                          : "bg-secondary/40 border-border/40 hover:border-primary/40"
                      }`}
                    >
                      <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Variante {i + 1}</div>
                      <div className="font-semibold text-sm line-clamp-2">{ad.headline}</div>
                    </motion.button>
                  ))}
                </div>

                {/* Vista previa del anuncio seleccionado */}
                {selectedAdId && generatedAds.find(ad => ad.id === selectedAdId) && (
                  <motion.div
                    key={selectedAdId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 space-y-4"
                  >
                    {(() => {
                      const ad = generatedAds.find(a => a.id === selectedAdId)!;
                      return (
                        <>
                          {/* Vista previa visual del anuncio */}
                          <Card className="glass-card overflow-hidden border-border/40 shadow-xl">
                            <div className="relative aspect-video bg-secondary/20 overflow-hidden group">
                              {ad.imageUrl ? (
                                <>
                                  <img
                                    src={ad.imageUrl}
                                    alt="Ad preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                    <h3 className="text-white font-display font-bold text-2xl mb-2">
                                      {ad.headline}
                                    </h3>
                                    <button className="inline-flex items-center justify-center px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold w-fit hover:bg-primary/90 transition-colors">
                                      {ad.cta}
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Loader className="w-8 h-8 text-primary animate-spin" />
                                </div>
                              )}
                            </div>
                          </Card>

                          {/* Controles de imagen */}
                          <div className="flex gap-3">
                            <Button
                              onClick={() => generateImageForAd(ad.id)}
                              disabled={ad.isGeneratingImage}
                              variant="outline"
                              className="flex-1"
                            >
                              {ad.isGeneratingImage ? (
                                <>
                                  <Loader className="mr-2 w-4 h-4 animate-spin" />
                                  Generando...
                                </>
                              ) : (
                                <>
                                  <Wand2 className="mr-2 w-4 h-4" />
                                  Regenerar imagen
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => downloadAd(ad)}
                              variant="outline"
                              className="flex-1"
                            >
                              <Download className="mr-2 w-4 h-4" />
                              Descargar
                            </Button>
                          </div>

                          {/* Detalles del anuncio */}
                          <Card className="glass-card p-6 border-border/40">
                            <div className="space-y-4">
                              <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                                  Titular
                                </label>
                                <div className="flex items-start gap-3">
                                  <p className="flex-1 font-semibold text-foreground">{ad.headline}</p>
                                  <button
                                    onClick={() => copyToClipboard(ad.headline)}
                                    className="p-2 hover:bg-secondary/40 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                                  Cuerpo del anuncio
                                </label>
                                <div className="flex items-start gap-3">
                                  <p className="flex-1 text-sm text-muted-foreground leading-relaxed">{ad.body}</p>
                                  <button
                                    onClick={() => copyToClipboard(ad.body)}
                                    className="p-2 hover:bg-secondary/40 rounded-lg transition-colors text-muted-foreground hover:text-primary flex-shrink-0"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                                  Llamada a la acción
                                </label>
                                <div className="flex items-center gap-3">
                                  <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                                    {ad.cta}
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(ad.cta)}
                                    className="p-2 hover:bg-secondary/40 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {ad.imagePrompt && (
                                <div>
                                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                                    Prompt de imagen
                                  </label>
                                  <p className="text-xs text-muted-foreground italic">{ad.imagePrompt}</p>
                                </div>
                              )}
                            </div>
                          </Card>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </div>

              <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur-xl text-center space-y-4">
                <h3 className="text-2xl font-display font-bold">¿Necesitas ayuda con la publicación?</h3>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Nuestros expertos pueden ayudarte a configurar el administrador de anuncios y optimizar tu presupuesto para obtener el mejor ROI.
                </p>
                <Button variant="hero" size="lg" className="mt-2">
                  Agendar asesoría gratuita <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="py-10 border-t border-border/40 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} FlowSights. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
