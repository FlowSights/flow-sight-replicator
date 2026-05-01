import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, Sparkles, LogOut, Zap, Target, 
  Image as ImageIcon, BarChart3, Upload, X, 
  Check, Download, ExternalLink, Maximize2, 
  ChevronLeft, ChevronRight, MapPin, Users, 
  TrendingUp, ShieldCheck, Star, Rocket,
  Globe, MousePointer2, Layout, FileText,
  Lightbulb, Info, ArrowRight, MapPin as MapPinIcon,
  Upload as UploadIcon, X as XIcon, Sparkles as SparklesIcon,
  RefreshCw, Search, Activity, Eye, MousePointer, Camera,
  Moon, Sun, Building2, Link2, Globe2, CreditCard,
  FileDown, ZoomIn, Edit2, BookOpen, Share2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { LocationInput } from '@/components/LocationInput';
import { motion, AnimatePresence } from 'framer-motion';
import { EditablePlatformPreview } from '@/components/EditablePlatformPreview';
import { VisualGuideLightbox } from '@/components/VisualGuideLightbox';
import { useCountUp } from '@/hooks/useCountUp';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { useInactivityTimeoutStrict } from '@/hooks/useInactivityTimeoutStrict';
import { PremiumLoadingScreen } from '@/components/PremiumLoadingScreen';
import { downloadPremiumCampaignKit } from '@/lib/premiumCampaignKitGenerator';
import { PaymentModal } from '@/components/PaymentModal';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { generateAdsWithGeminiIntegration } from '@/lib/dashboardIntegration';
import { useToast } from '@/hooks/use-toast';
import { MockupLightbox } from '@/components/MockupLightbox';
import { logger, formatError } from '@/lib/logger';

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

interface GeneratedAd {
  headline: string;
  description: string;
  cta: string;
  imageUrl: string;
  platform: 'google' | 'meta' | 'tiktok' | 'linkedin';
  type: 'Offer' | 'Emotional' | 'Urgency';
  score: number;
  platformUrl: string;
  businessName?: string;
  websiteUrl?: string;
  reasoning?: string;
}

interface CampaignConfig {
  businessName: string;
  websiteUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  promote: string;
  location: string;
  idealCustomer: string;
  budget: number;
  userImage: string | null;
}

const FlowsightAdsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isGuideLightboxOpen, setIsGuideLightboxOpen] = useState(false);
  const [mockupLightboxOpen, setMockupLightboxOpen] = useState(false);
  const [currentMockupAdIndex, setCurrentMockupAdIndex] = useState(0);

  const { hasPaid } = usePaymentStatus();

  const [config, setConfig] = useState<CampaignConfig>({
    businessName: '',
    websiteUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    promote: '',
    location: '',
    idealCustomer: '',
    budget: 100,
    userImage: null,
  });

  const [selectedPlatform, setSelectedPlatform] = useState<"google" | "meta" | "tiktok" | "linkedin">("meta");

  const handleLogout = async () => {
    try {
      logger.info("Cerrando sesión (Dashboard Ads)", null, "Dashboard");
      await supabase.auth.signOut();
      navigate('/flowsight-ads');
    } catch (err) {
      logger.error("Error al cerrar sesión", err, "Dashboard");
    }
  };

  const handleInactivityTimeout = useCallback(async () => {
    logger.warn("Inactividad detectada, cerrando sesión", null, "Dashboard");
    setShowInactivityModal(true);
    await supabase.auth.signOut();
  }, []);

  useInactivityTimeout(handleInactivityTimeout, 10 * 60 * 1000);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.error("Error al verificar sesión en Dashboard", formatError(error), "Dashboard");
          navigate('/flowsight-ads');
          return;
        }
        if (!session) {
          logger.warn("No hay sesión activa en Dashboard, redirigiendo", null, "Dashboard");
          navigate('/flowsight-ads');
          return;
        }
        logger.info("Dashboard cargado con sesión activa", { userId: session.user.id }, "Dashboard");
      } catch (err) {
        logger.error("Excepción al verificar sesión", err, "Dashboard");
        navigate('/flowsight-ads');
      }
    };
    checkUser();
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig({ ...config, userImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    logger.info("Iniciando generación de anuncios con IA", { config }, "Dashboard");

    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      const ads = await generateAdsWithGeminiIntegration(config, (stepNum) => {
        logger.debug("Progreso de generación", { step: stepNum }, "Dashboard");
      });
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setGeneratedAds(ads);
        setShowResults(true);
        setIsLoading(false);
        logger.info("Generación completada exitosamente", { count: ads.length }, "Dashboard");
        toast({
          title: '✨ Estrategia Maestra Lista',
          description: 'Tu campaña ha sido optimizada por nuestra IA de alto rendimiento.',
        });
      }, 500);

    } catch (error: any) {
      const structured = formatError(error, "Error al generar anuncios con IA");
      logger.error("Error crítico en generación de anuncios", structured, "Dashboard");
      setIsLoading(false);
      toast({
        title: 'Error al generar anuncios',
        description: error.message || 'Por favor, intenta de nuevo',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadMasterKit = () => {
    if (hasPaid) {
      downloadPremiumCampaignKit({
        businessName: config.businessName,
        businessDescription: config.promote,
        targetAudience: config.idealCustomer,
        websiteUrl: config.websiteUrl,
        ads: generatedAds,
      });
      toast({
        title: '✅ Full Campaign Kit Descargado',
        description: 'Tu paquete estratégico completo está listo.',
      });
    } else {
      setShowPaymentModal(true);
    }
  };

  const getPlatformStyle = (platform: string) => {
    const styles: Record<string, any> = {
      meta: {
        gradient: "from-blue-600 to-blue-800",
        bg: "bg-blue-600/10",
        border: "border-blue-600/30",
        accent: "bg-blue-600",
        text: "text-blue-600",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
        name: "Meta (Facebook/Instagram)"
      },
      google: {
        gradient: "from-red-500 via-yellow-500 to-blue-500",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        accent: "bg-red-500",
        text: "text-red-600",
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_'G'_logo.svg",
        name: "Google Ads"
      },
      tiktok: {
        gradient: "from-gray-900 to-black",
        bg: "bg-gray-900/10",
        border: "border-gray-900/30",
        accent: "bg-black",
        text: "text-gray-900",
        logo: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
        name: "TikTok Ads"
      },
      linkedin: {
        gradient: "from-blue-700 to-blue-900",
        bg: "bg-blue-700/10",
        border: "border-blue-700/30",
        accent: "bg-blue-700",
        text: "text-blue-700",
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
        name: "LinkedIn Ads"
      }
    };
    return styles[platform] || styles.meta;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-sans">
      <PremiumLoadingScreen isVisible={isLoading} progress={loadingProgress} />
      
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-black/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight">Flowsight <span className="text-emerald-500">Ads</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleLogout} className="text-gray-400 hover:text-white font-bold gap-2">
              <LogOut className="w-4 h-4" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Crea tu campaña <span className="text-emerald-500">maestra</span></h2>
                <p className="text-gray-400 text-lg font-medium">Cuéntanos sobre tu negocio y nuestra IA diseñará una estrategia de alto rendimiento.</p>
              </div>

              <div className="space-y-8">
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Nombre del Negocio</label>
                      <Input placeholder="Ej: Café Miel Gourmet" className="py-7 bg-white/5 border-white/10 rounded-2xl text-lg font-bold" value={config.businessName} onChange={(e) => setConfig({ ...config, businessName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Sitio Web / Landing Page</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input placeholder="https://tudominio.com" className="pl-12 py-7 bg-white/5 border-white/10 rounded-2xl text-lg font-bold" value={config.websiteUrl} onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })} />
                      </div>
                    </div>
                    <Button onClick={() => setStep(2)} disabled={!config.businessName} className="w-full py-8 text-xl font-black bg-emerald-500 hover:bg-emerald-600 rounded-2xl transition-all shadow-xl shadow-emerald-500/20">Continuar <ArrowRight className="ml-2 w-6 h-6" /></Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-emerald-500">¿Qué quieres promover?</label>
                      <Textarea placeholder="Ej: Nuestra nueva membresía anual con 20% de descuento y acceso a todas las clases..." className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl text-lg font-bold py-4" value={config.promote} onChange={(e) => setConfig({ ...config, promote: e.target.value })} />
                    </div>
                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 py-8 rounded-2xl font-bold">Atrás</Button>
                      <Button onClick={() => setStep(3)} disabled={!config.promote} className="flex-[2] py-8 text-xl font-black bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20">Siguiente <ArrowRight className="ml-2 w-6 h-6" /></Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Ubicación Objetivo</label>
                      <LocationInput value={config.location} onChange={(val) => setConfig({ ...config, location: val })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Cliente Ideal</label>
                      <Input placeholder="Ej: Dueños de negocios, 25-45 años, interesados en tecnología..." className="py-7 bg-white/5 border-white/10 rounded-2xl text-lg font-bold" value={config.idealCustomer} onChange={(e) => setConfig({ ...config, idealCustomer: e.target.value })} />
                    </div>
                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 py-8 rounded-2xl font-bold">Atrás</Button>
                      <Button onClick={() => setStep(4)} disabled={!config.location || !config.idealCustomer} className="flex-[2] py-8 text-xl font-black bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20">Último paso <ArrowRight className="ml-2 w-6 h-6" /></Button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 bg-white/5 p-8 rounded-[32px] border border-white/5">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Presupuesto Diario (USD)</label>
                        <span className="text-3xl font-black text-white">${config.budget}</span>
                      </div>
                      <Slider value={[config.budget]} min={5} max={500} step={5} onValueChange={(val) => setConfig({ ...config, budget: val[0] })} className="py-4" />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Imagen de Referencia (Opcional)</label>
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                        {config.userImage ? (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                            <img src={config.userImage} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <RefreshCw className="w-8 h-8 text-white animate-spin-slow" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="p-6 bg-white/5 rounded-3xl group-hover:scale-110 transition-transform">
                              <Upload className="w-10 h-10 text-emerald-500" />
                            </div>
                            <p className="font-bold text-gray-400">Sube una imagen de tu producto o servicio</p>
                          </>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 py-8 rounded-2xl font-bold">Atrás</Button>
                      <Button onClick={handleGenerate} className="flex-[2] py-8 text-xl font-black bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20 group">Generar Campaña Maestra <Zap className="ml-2 w-6 h-6 group-hover:animate-pulse" /></Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              {/* Header de Resultados */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-4xl font-black tracking-tight">Tu Estrategia <span className="text-emerald-500">Maestra</span></h2>
                  <p className="text-lg text-gray-400 font-medium">Análisis y activos optimizados por IA de alto rendimiento.</p>
                </div>
                <Button variant="outline" onClick={() => setShowResults(false)} className="rounded-2xl font-bold px-6 py-6 border-white/10 hover:bg-white/5">
                  <RefreshCw className="w-4 h-4 mr-2" /> Editar datos
                </Button>
              </div>

              {/* Contenedor Principal de Entrega */}
              <div className="bg-[#0A0A0A] rounded-[40px] border border-white/5 p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                {/* Glow de fondo dinámico */}
                <div className={`absolute -top-24 -right-24 w-96 h-96 blur-[120px] rounded-full opacity-20 transition-all duration-700 ${getPlatformStyle(selectedPlatform).bg}`} />
                
                {/* Selector de Plataformas Estilo Reference */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 relative z-10">
                  {(['google', 'meta', 'tiktok', 'linkedin'] as const).map((platform) => {
                    const style = getPlatformStyle(platform);
                    const isSelected = selectedPlatform === platform;
                    return (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`p-6 rounded-3xl flex items-center gap-4 transition-all border-2 group ${
                          isSelected 
                            ? `bg-gradient-to-br ${style.gradient} border-white/20 shadow-2xl scale-[1.02]` 
                            : 'bg-white/5 border-transparent hover:bg-white/10 grayscale hover:grayscale-0'
                        }`}
                      >
                        <div className="w-10 h-10 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
                          <img src={style.logo} alt={platform} className="w-full h-full object-contain" />
                        </div>
                        <div className="text-left">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>Plataforma</p>
                          <p className={`font-black text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>{style.name.split(' ')[0]}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Grid de Mockup y Estrategia */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                  {/* Lado Izquierdo: Mockup */}
                  <div className="space-y-6">
                    {generatedAds.filter(ad => ad.platform === selectedPlatform).slice(0, 1).map((ad, i) => (
                      <motion.div key={`${ad.platform}-${i}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
                        <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Card className="overflow-hidden border-white/10 bg-black/40 rounded-[32px] shadow-2xl backdrop-blur-sm relative">
                          <div className="p-4">
                            <EditablePlatformPreview
                              ad={ad}
                              platform={ad.platform}
                              onUpdate={(updatedAd) => {
                                const newAds = [...generatedAds];
                                const idx = newAds.findIndex(a => a.platform === ad.platform && a.type === ad.type);
                                if (idx !== -1) {
                                  newAds[idx] = { ...newAds[idx], ...updatedAd };
                                  setGeneratedAds(newAds);
                                }
                              }}
                            />
                          </div>
                        </Card>
                        <div className="mt-6 flex justify-center gap-4">
                          <Button variant="ghost" size="sm" onClick={() => { setCurrentMockupAdIndex(generatedAds.indexOf(ad)); setMockupLightboxOpen(true); }} className="rounded-full bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest px-6">
                            <Maximize2 className="w-3 h-3 mr-2" /> Zoom Mockup
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Lado Derecho: Estrategia y Botones */}
                  <div className="space-y-10">
                    {generatedAds.filter(ad => ad.platform === selectedPlatform).slice(0, 1).map((ad) => (
                      <div key={ad.type} className="space-y-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-emerald-500 text-black font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em]">{ad.type}</Badge>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-black text-yellow-500">{ad.score}/100</span>
                            </div>
                          </div>
                          <h3 className="text-4xl font-black tracking-tight leading-tight">Estrategia de <span className={getPlatformStyle(selectedPlatform).text}>{getPlatformStyle(selectedPlatform).name.split(' ')[0]} Ads</span></h3>
                          <p className="text-lg text-gray-400 font-medium leading-relaxed">Tono optimizado específicamente para tu audiencia en esta plataforma.</p>
                        </div>

                        {/* Botones de Acción Estilo Reference */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Button onClick={() => setIsGuideLightboxOpen(true)} variant="outline" className="py-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 border-white/10 bg-white/5 hover:bg-white/10">
                            <BookOpen className="w-5 h-5" /> Guía Visual
                          </Button>
                          <Button onClick={handleDownloadMasterKit} className="py-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 bg-emerald-500 hover:bg-emerald-600 text-black shadow-xl shadow-emerald-500/20">
                            <Download className="w-5 h-5" /> Descargar Kit
                          </Button>
                          <Button 
                            onClick={() => {
                              const urls: Record<string, string> = {
                                meta: 'https://adsmanager.facebook.com',
                                google: 'https://ads.google.com',
                                tiktok: 'https://ads.tiktok.com',
                                linkedin: 'https://www.linkedin.com/campaignmanager'
                              };
                              window.open(urls[selectedPlatform], '_blank');
                            }}
                            className="sm:col-span-2 py-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 bg-white/5 hover:bg-white/10 border border-white/10"
                          >
                            <Share2 className="w-5 h-5" /> Publicar en {getPlatformStyle(selectedPlatform).name.split(' ')[0]} Ads
                          </Button>
                        </div>

                        {/* Nota del Copy Estilo Reference */}
                        <div className="p-8 rounded-[32px] bg-yellow-500/5 border border-yellow-500/10 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                            <Lightbulb className="text-yellow-500 w-12 h-12" />
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Razonamiento IA</span>
                          </div>
                          <p className="text-sm text-gray-300 font-medium leading-relaxed relative z-10">{ad.reasoning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
      <VisualGuideLightbox isOpen={isGuideLightboxOpen} onClose={() => setIsGuideLightboxOpen(false)} platform={selectedPlatform} />
      <MockupLightbox 
        isOpen={mockupLightboxOpen} 
        onClose={() => setMockupLightboxOpen(false)}
        ads={generatedAds}
        currentIndex={currentMockupAdIndex}
        onPrevious={() => setCurrentMockupAdIndex(prev => Math.max(0, prev - 1))}
        onNext={() => setCurrentMockupAdIndex(prev => Math.min(generatedAds.length - 1, prev + 1))}
        platform={selectedPlatform}
        businessName={config.businessName}
        hasPaid={hasPaid}
        onPaymentRequired={() => setShowPaymentModal(true)}
      />
    </div>
  );
};

export default FlowsightAdsDashboard;
