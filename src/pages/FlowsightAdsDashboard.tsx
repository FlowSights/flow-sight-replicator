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
  MapPin as MapPinIconLucide, Upload as UploadIconLucide, X as XIconLucide, Sparkles as SparklesIconLucide,
  BookOpen, PlayCircle, MousePointerClick, Moon, Sun,
  Building2, Link2, Globe2, CreditCard,
  Globe as GoogleIcon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Edit2 } from 'lucide-react';
import { LocationInput } from '@/components/LocationInput';
import { ROIEstimator } from '@/components/ROIEstimator';
import { motion, AnimatePresence } from 'framer-motion';
import { MetaPreview, TikTokPreview, LinkedInPreview, GoogleAdsPreview } from '@/components/PlatformPreviewsNative';
import { VisualGuideLightbox } from '@/components/VisualGuideLightbox';
import jsPDF from 'jspdf';
import { useCountUp } from '@/hooks/useCountUp';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { useInactivityTimeoutStrict } from '@/hooks/useInactivityTimeoutStrict';
import { MockupLightbox } from '@/components/MockupLightbox';
import { AppleStyleLoadingScreen } from '@/components/AppleStyleLoadingScreen';
import { SimplifiedROICalculator } from '@/components/SimplifiedROICalculator';
import { BentoGridPremium } from '@/components/BentoGridPremium';
import { PremiumReadyToLaunch } from '@/components/PremiumReadyToLaunch';
import { PremiumLoadingScreen } from '@/components/PremiumLoadingScreen';
import { downloadPremiumCampaignKit } from '@/lib/premiumCampaignKitGenerator';
import { downloadMasterPackage } from '@/lib/masterAssetsExporter';
import { SmartLocationSelector } from '@/components/SmartLocationSelector';
import { ClientDashboard } from '@/components/ClientDashboard';
import { PaymentModal } from '@/components/PaymentModal';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { generateAdsWithGeminiIntegration } from '@/lib/dashboardIntegration';
import { downloadPremiumPDF } from '@/lib/premiumPDFExporter';
import { downloadAssetsPackage } from '@/lib/assetsExporter';
import { EditablePlatformPreview } from '@/components/EditablePlatformPreview';
import { DynamicROIEstimator } from '@/components/DynamicROIEstimator';
import { PremiumResultsDashboard } from '@/components/PremiumResultsDashboard';
import { AdsResultsShowcase } from '@/components/AdsResultsShowcase';
import { downloadPremiumPDFV2 } from '@/lib/premiumPDFExporterV2';
import { useToast } from '@/hooks/use-toast';

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
  facebookUrl: string;
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
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAdForLightbox, setSelectedAdForLightbox] = useState<GeneratedAd | null>(null);
  const [metricsVisible, setMetricsVisible] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCampaignForPayment, setSelectedCampaignForPayment] = useState<string | null>(null);
  const [mockupLightboxOpen, setMockupLightboxOpen] = useState(false);
  const [mockupLightboxIndex, setMockupLightboxIndex] = useState(0);
  const [showClientDashboard, setShowClientDashboard] = useState(false);
  const { hasPaid, isLoading: isPaymentLoading } = usePaymentStatus();
  
  // Inactividad estricta: cierra sesión después de 3 minutos
  useInactivityTimeoutStrict(() => {
    setShowInactivityModal(true);
  });

  const [activeGuidePlatform, setActiveGuidePlatform] = useState<string | null>(null);
  const [isGuideLightboxOpen, setIsGuideLightboxOpen] = useState(false);
  const [guideLightboxPlatform, setGuideLightboxPlatform] = useState<'meta' | 'google' | 'tiktok' | 'linkedin'>('meta');
  
  const [config, setConfig] = useState<CampaignConfig>({
    businessName: '',
    websiteUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    promote: '',
    location: '',
    idealCustomer: '',
    budget: 100,
    userImage: null,
  });

  const [selectedPlatform, setSelectedPlatform] = useState<'google' | 'meta' | 'tiktok' | 'linkedin'>('meta');
  const [syncKey, setSyncKey] = useState(0);

  // Forzar sincronización cuando selectedPlatform cambia
  useEffect(() => {
    setSyncKey(prev => prev + 1);
  }, [selectedPlatform]);

  const suggestions = [
    { label: "Membresía de Gimnasio", icon: "💪" },
    { label: "Consultoría de Negocios", icon: "📈" },
    { label: "Restaurante Gourmet", icon: "🍳" },
    { label: "Tienda de Ropa Online", icon: "👕" },
    { label: "Servicios de Limpieza", icon: "✨" },
    { label: "Agencia de Viajes", icon: "✈️" }
  ];

  const loadingMessages = [
    'Analizando tu modelo de negocio...',
    'Consultando IA para generar copys únicos...',
    'Optimizando textos para máxima conversión...',
    'Estructurando tu Campaign Kit Premium...'
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/flowsight-ads');
  };

  // Cerrar sesión por inactividad (10 minutos)
  const handleInactivityTimeout = useCallback(async () => {
    setShowInactivityModal(true);
    await supabase.auth.signOut();
  }, []);

  useInactivityTimeout(handleInactivityTimeout, 10 * 60 * 1000);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/flowsight-ads');
        return;
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && hasPaid) {
      toast({
        title: '✅ ¡Pago Exitoso!',
        description: 'Tu acceso premium ha sido activado. Ahora puedes descargar tus kits y publicar directamente.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [hasPaid, toast]);

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
    setLoadingStep(0);

    try {
      const generatedAds = await generateAdsWithGeminiIntegration(config, (step) => {
        setLoadingStep(step);
      });

      setGeneratedAds(generatedAds);
      setShowResults(true);
      setTimeout(() => setMetricsVisible(true), 500);

      toast({
        title: '✨ Anuncios Generados',
        description: `Se generaron ${generatedAds.length} anuncios con IA. ¡Listos para tu estrategia!`,
      });
    } catch (error: any) {
      console.error('Error generando anuncios:', error);
      toast({
        title: 'Error al generar anuncios',
        description: error.message || 'Por favor, intenta de nuevo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadMasterZip = () => {
    if (hasPaid) {
      downloadPremiumCampaignKit({
        businessName: config.businessName,
        businessDescription: config.promote,
        targetAudience: config.idealCustomer,
        websiteUrl: config.websiteUrl,
        ads: generatedAds,
      });
      toast({
        title: '✅ Paquete Maestro Descargado',
        description: 'Todos tus Campaign Kits están listos en un archivo unificado.',
      });
    } else {
      setShowPaymentModal(true);
    }
  };

  const platformStyles = {
    meta: {
      gradient: "from-blue-600/20 to-blue-400/20",
      border: "border-blue-500/30",
      accent: "bg-blue-600",
      text: "text-blue-500",
      icon: Globe2
    },
    google: {
      gradient: "from-red-500/10 via-yellow-500/10 to-blue-500/10",
      border: "border-yellow-500/30",
      accent: "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500",
      text: "text-yellow-600",
      icon: GoogleIcon
    },
    tiktok: {
      gradient: "from-black/40 to-pink-500/20",
      border: "border-pink-500/30",
      accent: "bg-pink-500",
      text: "text-pink-500",
      icon: PlayCircle
    },
    linkedin: {
      gradient: "from-blue-800/20 to-blue-600/20",
      border: "border-blue-700/30",
      accent: "bg-blue-800",
      text: "text-blue-700",
      icon: Users
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors selection:bg-emerald-500/30">
      <AnimatePresence>
        {isLoading && (
          <PremiumLoadingScreen step={loadingStep} messages={loadingMessages} />
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
            <Button variant="ghost" onClick={handleLogout} className="text-gray-500 hover:text-red-500 font-bold">
              <LogOut className="w-5 h-5 mr-2" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!showResults ? (
          <div className="max-w-3xl mx-auto">
            {step === 1 && (
              <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                    Fase 01: Tu Negocio
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    Cuéntanos sobre tu <span className="text-emerald-500">negocio</span>
                  </h1>
                  <p className="text-xl text-gray-500 dark:text-gray-400">La IA usará esta información para personalizar tus anuncios y mockups.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Nombre del negocio o empresa</label>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000" />
                    <Building2 className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500 w-7 h-7 z-10" />
                    <Input
                      value={config.businessName}
                      onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                      placeholder="Ej: FlowSights, Café Luna, Studio Fit..."
                      className="relative text-2xl py-10 pl-20 pr-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                      Presencia Digital <span className="ml-2 normal-case font-medium opacity-60">(Opcional)</span>
                    </label>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent mx-4" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`group relative p-1 rounded-[22px] transition-all duration-500 ${config.websiteUrl ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' : 'bg-transparent'}`}>
                      <div className="relative bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-2xl p-4 transition-all group-focus-within:shadow-2xl group-focus-within:shadow-emerald-500/10 group-focus-within:border-emerald-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg transition-colors ${config.websiteUrl ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                            <Globe2 className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sitio Web</span>
                        </div>
                        <Input
                          value={config.websiteUrl}
                          onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                          placeholder="tunegocio.com"
                          className="border-none bg-transparent p-0 h-auto text-sm shadow-none focus-visible:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium"
                        />
                      </div>
                    </div>

                    <div className={`group relative p-1 rounded-[22px] transition-all duration-500 ${config.instagramUrl ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20' : 'bg-transparent'}`}>
                      <div className="relative bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-2xl p-4 transition-all group-focus-within:shadow-2xl group-focus-within:shadow-pink-500/10 group-focus-within:border-pink-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg transition-colors ${config.instagramUrl ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                            <Camera className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Instagram</span>
                        </div>
                        <Input
                          value={config.instagramUrl}
                          onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
                          placeholder="@usuario"
                          className="border-none bg-transparent p-0 h-auto text-sm shadow-none focus-visible:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium"
                        />
                      </div>
                    </div>

                    <div className={`group relative p-1 rounded-[22px] transition-all duration-500 ${config.facebookUrl ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20' : 'bg-transparent'}`}>
                      <div className="relative bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-2xl p-4 transition-all group-focus-within:shadow-2xl group-focus-within:shadow-blue-500/10 group-focus-within:border-blue-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg transition-colors ${config.facebookUrl ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                            <Linkedin className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">LinkedIn</span>
                        </div>
                        <Input
                          value={config.facebookUrl}
                          onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })}
                          placeholder="linkedin.com/in/..."
                          className="border-none bg-transparent p-0 h-auto text-sm shadow-none focus-visible:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {(config.websiteUrl || config.instagramUrl || config.facebookUrl) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">
                          IA Optimizada: Analizando presencia digital para mayor precisión
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="button"
                  disabled={!config.businessName}
                  onClick={(e) => { e.preventDefault(); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 transition-all active:scale-[0.98]"
                >
                  Siguiente Paso
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                    Fase 02: Concepto
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    ¿Qué vamos a <span className="text-emerald-500">vender</span> hoy?
                  </h1>
                  <p className="text-xl text-gray-500 dark:text-gray-400">Describe tu producto o servicio en una frase potente.</p>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000" />
                    <SparklesIconLucide className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500 w-8 h-8 z-10" />
                    <Input 
                      value={config.promote}
                      onChange={(e) => setConfig({...config, promote: e.target.value})}
                      placeholder="Ej: Membresía anual de yoga con 20% de descuento..."
                      className="relative text-2xl py-10 pl-20 pr-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {suggestions.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => setConfig({...config, promote: s.label})}
                        className="px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  type="button"
                  disabled={!config.promote}
                  onClick={(e) => { e.preventDefault(); setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 transition-all active:scale-[0.98]"
                >
                  Siguiente Paso
                </Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                    Fase 03: Alcance
                  </div>
                  <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    ¿Dónde está tu <span className="text-emerald-500">audiencia</span>?
                  </h1>
                  <p className="text-xl text-gray-500 dark:text-gray-400">Define la ubicación geográfica de tu mercado ideal.</p>
                </div>

                <LocationInput
                  value={config.location}
                  onChange={(value) => setConfig({...config, location: value})}
                  placeholder="Escribe una ciudad o país..."
                />

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                  <Button 
                    disabled={!config.location}
                    onClick={() => { setStep(4); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                    Fase 04: Creatividad
                  </div>
                  <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    Personaliza tu <span className="text-emerald-500">impacto</span>
                  </h1>
                  <p className="text-xl text-gray-500 dark:text-gray-400">Describe a tu cliente y elige cómo quieres tus visuales.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Textarea 
                      value={config.idealCustomer}
                      onChange={(e) => setConfig({...config, idealCustomer: e.target.value})}
                      placeholder="Ej: Dueños de negocios que buscan escalar, familias jóvenes interesadas en salud..."
                      className="text-xl py-8 px-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
                    />
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Familias jóvenes",
                        "Dueños de negocio",
                        "Profesionales",
                        "Estudiantes",
                        "Emprendedores",
                        "Padres de familia"
                      ].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            const newValue = config.idealCustomer ? `${config.idealCustomer}, ${tag}` : tag;
                            setConfig({...config, idealCustomer: newValue});
                          }}
                          className="px-4 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium transition-all border border-emerald-500/20 hover:border-emerald-500/50"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all ${config.userImage ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-200 dark:border-white/10 hover:border-emerald-500/50'}`}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    {config.userImage ? (
                      <div className="flex items-center gap-4">
                        <img src={config.userImage} className="w-16 h-16 rounded-xl object-cover shadow-lg" alt="Preview" />
                        <div className="flex-1">
                          <p className="text-emerald-500 font-bold text-sm">¡Imagen cargada!</p>
                          <p className="text-xs text-gray-500">Click para cambiar</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setConfig({...config, userImage: null}); }} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                          <XIconLucide className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <UploadIconLucide className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="font-bold text-base dark:text-white">Sube la imagen de tu anuncio</p>
                        <p className="text-xs text-gray-400">JPG, PNG o WEBP · Recomendado 1200×630 px</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                  <Button 
                    disabled={!config.idealCustomer || !config.userImage}
                    onClick={() => { setStep(5); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                    Fase 05: Inversión
                  </div>
                  <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    ¿Cuál es tu <span className="text-emerald-500">presupuesto</span>?
                  </h1>
                  <p className="text-xl text-gray-500 dark:text-gray-400">Ajusta la inversión mensual para ver proyecciones.</p>
                </div>
                
                <div className="space-y-12 py-10 bg-white dark:bg-white/5 rounded-[40px] p-10 shadow-2xl">
                  <div className="text-center space-y-2">
                    <motion.span key={config.budget} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl font-black text-emerald-500 block">
                      ${config.budget}
                    </motion.span>
                    <span className="text-2xl font-bold text-gray-400 uppercase tracking-widest">USD / MES</span>
                  </div>
                  
                  <Slider value={[config.budget]} onValueChange={(val) => setConfig({...config, budget: val[0]})} max={5000} min={50} step={50} className="py-4" />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Alcance Est.</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{(config.budget * 15).toLocaleString('es-ES')}</p>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Clicks Est.</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{(config.budget * 0.8).toFixed(0)}</p>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Conversiones</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{(config.budget * 0.05).toFixed(0)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(4)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                  <Button 
                    onClick={handleGenerate}
                    className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40"
                  >
                    Generar Campaña IA
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
            {/* REDISEÑO TOTAL: ENTREGA DE ALTO VALOR */}
            <div className="max-w-5xl mx-auto space-y-12">
              
              {/* HERO: CAMPAÑA OPTIMIZADA - MASTER ZIP */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[40px] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000" />
                <Card className="relative overflow-hidden border-none bg-white dark:bg-[#0a0a0a] rounded-[40px] p-10 md:p-16 shadow-2xl">
                  <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <Sparkles className="w-64 h-64 text-emerald-500" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 text-center md:text-left max-w-xl">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-[0.2em]">
                        <Zap className="w-4 h-4" /> Entrega de Alto Valor
                      </div>
                      <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1]">
                        Campaña Optimizada <br />
                        <span className="text-emerald-500">Tu Estrategia Premium</span> <br />
                        está Lista
                      </h2>
                      <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
                        Hemos empaquetado tus 3 Campaign Kits estratégicos en un solo archivo maestro. Todo lo que necesitas para dominar el mercado.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      <Button 
                        onClick={handleDownloadMasterZip}
                        className="group relative h-32 w-32 md:h-48 md:w-48 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-500/40 transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2"
                      >
                        <Download className="w-10 h-10 md:w-14 md:h-14 animate-bounce" />
                        <span className="text-xs md:text-sm font-black uppercase tracking-widest">Descargar ZIP</span>
                      </Button>
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Archivos Verificados por IA
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* SELECTOR DE PLATAFORMA DINÁMICO (PÍLDORAS) */}
              <div className="flex flex-wrap justify-center gap-4">
                {(['meta', 'google', 'tiktok', 'linkedin'] as const).map((platform) => {
                  const isActive = selectedPlatform === platform;
                  const style = platformStyles[platform];
                  const Icon = style.icon;
                  
                  return (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`group relative flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all duration-500 ${
                        isActive 
                        ? `text-white shadow-2xl ${style.accent}` 
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                      {platform}
                    </button>
                  );
                })}
              </div>

              {/* GRID PRINCIPAL DE ENTREGA DINÁMICA */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedPlatform}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className={`relative p-1 rounded-[48px] border-2 transition-colors duration-700 ${platformStyles[selectedPlatform].border} bg-gradient-to-br ${platformStyles[selectedPlatform].gradient}`}
                >
                  <div className="bg-white dark:bg-[#050505]/80 backdrop-blur-3xl rounded-[46px] p-8 md:p-12 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                      
                      {/* Lado Izquierdo: Mockup y Guía Visual */}
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${platformStyles[selectedPlatform].accent} text-white`}>
                              {React.createElement(platformStyles[selectedPlatform].icon, { className: "w-5 h-5" })}
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Vista Previa IA</h3>
                          </div>
                          <Button 
                            variant="ghost" 
                            onClick={() => setIsGuideLightboxOpen(true)}
                            className="text-emerald-500 font-black text-xs uppercase tracking-widest hover:bg-emerald-500/10"
                          >
                            <Eye className="w-4 h-4 mr-2" /> Guía Visual
                          </Button>
                        </div>

                        <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/40 p-6">
                          <EditablePlatformPreview
                            platform={selectedPlatform}
                            headline={generatedAds.find(a => a.platform === selectedPlatform)?.headline || ''}
                            description={generatedAds.find(a => a.platform === selectedPlatform)?.description || ''}
                            cta={generatedAds.find(a => a.platform === selectedPlatform)?.cta || ''}
                            imageUrl={config.userImage || ''}
                            businessName={config.businessName}
                          />
                        </div>
                      </div>

                      {/* Lado Derecho: Estrategia y Botón Inteligente */}
                      <div className="space-y-10">
                        <div className="space-y-6">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                            Estrategia de Conversión
                          </div>
                          <h4 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">
                            Tu Campaña <span className={platformStyles[selectedPlatform].text}>{selectedPlatform}</span> está lista para escalar
                          </h4>
                          <div className="space-y-4">
                            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Copy Sugerido</p>
                              <p className="text-lg text-gray-700 dark:text-gray-300 font-medium italic">
                                "{generatedAds.find(a => a.platform === selectedPlatform)?.headline}"
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">CTR Estimado</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white">4.8%</p>
                              </div>
                              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Relevancia</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white">9.8/10</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 space-y-4">
                          <Button 
                            onClick={() => {
                              const ad = generatedAds.find(a => a.platform === selectedPlatform);
                              if (ad) window.open(ad.platformUrl, '_blank');
                            }}
                            className={`w-full py-10 text-xl font-black text-white rounded-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] ${platformStyles[selectedPlatform].accent}`}
                          >
                            <Rocket className="w-6 h-6 mr-3" /> Lanzar en {selectedPlatform}
                          </Button>
                          <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                            Acceso directo al administrador de anuncios
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* BOTÓN DE RETORNO */}
              <div className="flex justify-center pt-8">
                <Button 
                  variant="ghost" 
                  onClick={() => { setShowResults(false); setStep(1); }}
                  className="text-gray-400 hover:text-emerald-500 font-black uppercase tracking-widest text-xs"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Crear una nueva estrategia
                </Button>
              </div>

            </div>
          </motion.div>
        )}
      </main>

      {/* MODALES Y LIGHTBOXES */}
      <VisualGuideLightbox 
        isOpen={isGuideLightboxOpen} 
        onClose={() => setIsGuideLightboxOpen(false)} 
        platform={selectedPlatform} 
      />
      
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />

      <AnimatePresence>
        {showInactivityModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <Card className="w-full max-w-md p-8 text-center space-y-6 rounded-[32px] border-white/10 bg-gray-900">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-white">Sesión Expirada</h2>
              <p className="text-gray-400">Por tu seguridad, hemos cerrado la sesión tras 10 minutos de inactividad.</p>
              <Button onClick={() => navigate('/flowsight-ads')} className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl">Volver a Entrar</Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlowsightAdsDashboard;
