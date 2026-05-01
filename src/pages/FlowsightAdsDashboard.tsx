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
  FileDown, ZoomIn, Edit2
} from 'lucide-react';
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

  useEffect(() => {
    if (generatedAds.length > 0 && currentMockupAdIndex < generatedAds.length) {
      setSelectedPlatform(generatedAds[currentMockupAdIndex].platform);
    }
  }, [currentMockupAdIndex, generatedAds]);
  const { hasPaid } = usePaymentStatus();

  useInactivityTimeoutStrict(() => {
    setShowInactivityModal(true);
  });

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

  const suggestions = [
    { label: "Membresía de Gimnasio", icon: "💪" },
    { label: "Consultoría de Negocios", icon: "📈" },
    { label: "Restaurante Gourmet", icon: "🍳" },
    { label: "Tienda de Ropa Online", icon: "👕" },
    { label: "Servicios de Limpieza", icon: "✨" },
    { label: "Agencia de Viajes", icon: "✈️" }
  ];

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
      logger.info("Descargando Master Kit", { userId: user?.id }, "Dashboard");
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
      logger.info("Intento de descarga sin pago", null, "Dashboard");
      setShowPaymentModal(true);
    }
  };

  const getPlatformStyle = (platform: string) => {
    const styles: Record<string, any> = {
      meta: {
        gradient: "from-blue-600/20 to-blue-400/20",
        border: "border-blue-500/30",
        accent: "bg-blue-600",
        text: "text-blue-500",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
        name: "Meta (Facebook/Instagram)"
      },
      google: {
        gradient: "from-blue-500/10 via-red-500/10 to-yellow-500/10",
        border: "border-blue-500/30",
        accent: "bg-blue-500",
        text: "text-blue-600",
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\'G\'_logo.svg",
        name: "Google Ads"
      },
      tiktok: {
        gradient: "from-black/40 to-pink-500/20",
        border: "border-pink-500/30",
        accent: "bg-black",
        text: "text-pink-500",
        logo: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
        name: "TikTok Ads"
      },
      linkedin: {
        gradient: "from-blue-800/20 to-blue-600/20",
        border: "border-blue-700/30",
        accent: "bg-blue-800",
        text: "text-blue-700",
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
        name: "LinkedIn Ads"
      }
    };
    return styles[platform] || styles.meta;
  };

  // Re-instanciar el usuario para el logger si es necesario
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors selection:bg-emerald-500/30">
      <AnimatePresence>
        {isLoading && (
          <PremiumLoadingScreen isVisible={isLoading} progress={loadingProgress} />
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-black/60 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black font-display tracking-tight text-gray-900 dark:text-white">
              Flowsight <span className="text-emerald-500">Ads</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-all">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Button variant="ghost" onClick={handleLogout} className="font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 transition-all rounded-xl">
              <LogOut className="w-5 h-5 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <div className="max-w-2xl mx-auto">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      Bienvenido a la <span className="text-emerald-500">nueva era</span> de la publicidad digital
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Empecemos por lo básico. ¿Cómo se llama tu negocio y dónde podemos encontrarlo en línea?</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-sm font-black uppercase tracking-widest text-gray-400">Nombre de tu Negocio</label>
                      <Input
                        placeholder="Ej: Flowsight"
                        value={config.businessName}
                        onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                        className="py-8 px-6 text-xl rounded-3xl bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-black uppercase tracking-widest text-gray-400">URL de tu Sitio Web</label>
                      <Input
                        placeholder="https://flowsight.com"
                        value={config.websiteUrl}
                        onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                        className="py-8 px-6 text-xl rounded-3xl bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-black uppercase tracking-widest text-gray-400">URL de tu Instagram (Opcional)</label>
                      <Input
                        placeholder="https://instagram.com/flowsight"
                        value={config.instagramUrl}
                        onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
                        className="py-8 px-6 text-xl rounded-3xl bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-black uppercase tracking-widest text-gray-400">URL de tu LinkedIn (Opcional)</label>
                      <Input
                        placeholder="https://linkedin.com/company/flowsight"
                        value={config.linkedinUrl}
                        onChange={(e) => setConfig({ ...config, linkedinUrl: e.target.value })}
                        className="py-8 px-6 text-xl rounded-3xl bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 focus:ring-emerald-500"
                      />
                    </div>

                    <Button
                      onClick={() => setStep(2)} 
                      disabled={!config.businessName}
                      className="w-full py-10 text-xl font-black bg-gray-900 dark:bg-white text-white dark:text-black rounded-3xl hover:scale-[1.02] transition-all"
                    >
                      Continuar <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      ¿Qué quieres <span className="text-emerald-500">promover?</span>
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Describe tu producto, servicio o la oferta especial que tienes en mente.</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-sm font-black uppercase tracking-widest text-gray-400">¿Qué quieres promover?</label>
                      <Textarea
                        placeholder="Ej: Un nuevo gimnasio con clases de spinning y yoga para principiantes."
                        value={config.promote}
                        onChange={(e) => setConfig({ ...config, promote: e.target.value })}
                        className="py-8 px-6 text-xl rounded-3xl bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 focus:ring-emerald-500"
                        rows={5}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-black uppercase tracking-widest text-gray-400">¿Dónde quieres promoverlo? (Opcional)</label>
                      <LocationInput
                        value={config.location}
                        onChange={(location) => setConfig({ ...config, location })}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 py-8 rounded-2xl font-bold">Atrás</Button>
                      <Button 
                        onClick={() => setStep(3)} 
                        disabled={!config.promote}
                        className="flex-[2] py-8 text-lg font-black bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Siguiente paso
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      Tu <span className="text-emerald-500">audiencia ideal</span>
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400">¿A quién quieres llegar? Define a tu cliente perfecto.</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-sm font-black uppercase tracking-widest text-gray-400">Describe a tu cliente ideal</label>
                      <Textarea
                        placeholder="Ej: Personas de 25-45 años interesadas en fitness, bienestar y que viven en la zona metropolitana."
                        value={config.idealCustomer}
                        onChange={(e) => setConfig({ ...config, idealCustomer: e.target.value })}
                        className="py-8 px-6 text-xl rounded-3xl bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 focus:ring-emerald-500"
                        rows={5}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-black uppercase tracking-widest text-gray-400">Presupuesto Diario (USD)</label>
                        <span className="text-2xl font-black text-emerald-500">${config.budget}</span>
                      </div>
                      <Slider
                        value={[config.budget]}
                        onValueChange={(val) => setConfig({ ...config, budget: val[0] })}
                        max={1000}
                        step={10}
                        className="py-4"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 py-8 rounded-2xl font-bold">Atrás</Button>
                      <Button 
                        onClick={() => setStep(4)} 
                        disabled={!config.idealCustomer}
                        className="flex-[2] py-8 text-lg font-black bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Casi listo
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      El toque <span className="text-emerald-500">final</span>
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Sube una imagen de tu producto o servicio para que nuestra IA pueda analizarla.</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-sm font-black uppercase tracking-widest text-gray-400">Imagen de Campaña</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`group relative h-64 border-2 border-dashed rounded-[32px] transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 ${config.userImage ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5' : 'border-gray-200 dark:border-white/10 hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        {config.userImage ? (
                          <>
                            <img src={config.userImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                            <div className="relative z-10 flex flex-col items-center gap-2">
                              <div className="p-4 bg-emerald-500 rounded-2xl shadow-xl">
                                <Check className="w-8 h-8 text-white" />
                              </div>
                              <span className="font-black text-emerald-600 dark:text-emerald-400">Imagen lista para analizar</span>
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setConfig({ ...config, userImage: null }); }} className="mt-2 text-red-500 hover:text-red-600 font-bold">Eliminar</Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-6 bg-gray-100 dark:bg-white/5 rounded-3xl group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                              <Upload className="w-10 h-10" />
                            </div>
                            <div className="text-center">
                              <p className="font-black text-gray-900 dark:text-white">Haz clic para subir imagen</p>
                              <p className="text-sm text-gray-500">PNG, JPG o WEBP (Máx. 5MB)</p>
                            </div>
                          </>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 py-8 rounded-2xl font-bold">Atrás</Button>
                      <Button 
                        onClick={handleGenerate} 
                        className="flex-[2] py-8 text-xl font-black bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 group"
                      >
                        Generar Campaña Maestra <Zap className="ml-2 w-6 h-6 group-hover:animate-pulse" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Tu Estrategia <span className="text-emerald-500">Maestra</span></h2>
                  <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Hemos optimizado tu campaña para máximo rendimiento en cada plataforma.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowResults(false)} className="rounded-2xl font-bold px-6 py-6 border-gray-200 dark:border-white/10">Editar datos</Button>
                  <Button onClick={handleDownloadMasterKit} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-6 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] gap-2">
                    <Download className="w-5 h-5" /> Descargar Kit Maestro
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Platform Selector */}
                <div className="lg:col-span-3 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-2">Selecciona Plataforma</p>
                  {(['meta', 'google', 'tiktok', 'linkedin'] as const).map((platform) => {
                    const style = getPlatformStyle(platform);
                    const isSelected = selectedPlatform === platform;
                    return (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 ${isSelected ? `bg-white dark:bg-white/5 ${style.border} shadow-lg` : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        <img src={style.logo} alt={platform} className="w-8 h-8 object-contain" />
                        <span className={`font-black text-sm ${isSelected ? 'text-gray-900 dark:text-white' : ''}`}>{style.name.split(' ')[0]}</span>
                        {isSelected && <div className={`ml-auto w-2 h-2 rounded-full ${style.accent}`} />}
                      </button>
                    );
                  })}
                </div>

                {/* Main Preview Area */}
                <div className="lg:col-span-9 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {generatedAds.filter(ad => ad.platform === selectedPlatform).map((ad, i) => (
                      <motion.div
                        key={`${ad.platform}-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="overflow-hidden border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] rounded-[32px] shadow-xl group">
                          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">{ad.type}</Badge>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score IA:</span>
                              <span className="text-sm font-black text-emerald-500">{ad.score}%</span>
                            </div>
                          </div>
                          
                          <div className="p-2">
                            <EditablePlatformPreview
                              ad={ad}
                              platform={ad.platform}
                              onUpdate={(updatedAd) => {
                                const newAds = [...generatedAds];
                                const index = newAds.findIndex(a => a.platform === ad.platform && a.type === ad.type);
                                if (index !== -1) {
                                  newAds[index] = { ...newAds[index], ...updatedAd };
                                  setGeneratedAds(newAds);
                                }
                              }}
                            />
                          </div>

                          <div className="p-6 bg-gray-50/50 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                              <Lightbulb className="w-4 h-4 text-emerald-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Razonamiento IA</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{ad.reasoning}</p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
      <MockupLightbox 
        isOpen={mockupLightboxOpen} 
        onClose={() => setMockupLightboxOpen(false)}
        ads={generatedAds}
        currentIndex={currentMockupAdIndex}
        onIndexChange={setCurrentMockupAdIndex}
      />
    </div>
  );
};

export default FlowsightAdsDashboard;
