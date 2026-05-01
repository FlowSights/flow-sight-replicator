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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isGuideLightboxOpen, setIsGuideLightboxOpen] = useState(false);
  const [mockupLightboxOpen, setMockupLightboxOpen] = useState(false);
  const { hasPaid } = usePaymentStatus();
  
  useInactivityTimeoutStrict(() => {
    setShowInactivityModal(true);
  });

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

  const suggestions = [
    { label: "Membresía de Gimnasio", icon: "💪" },
    { label: "Consultoría de Negocios", icon: "📈" },
    { label: "Restaurante Gourmet", icon: "🍳" },
    { label: "Tienda de Ropa Online", icon: "👕" },
    { label: "Servicios de Limpieza", icon: "✨" },
    { label: "Agencia de Viajes", icon: "✈️" }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/flowsight-ads');
  };

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

    try {
      // Simular progreso para la pantalla de carga
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      const ads = await generateAdsWithGeminiIntegration(config, () => {});
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setGeneratedAds(ads);
        setShowResults(true);
        setIsLoading(false);
        toast({
          title: '✨ Estrategia Maestra Lista',
          description: 'Tu campaña ha sido optimizada por nuestra IA de alto rendimiento.',
        });
      }, 500);

    } catch (error: any) {
      console.error('Error generando anuncios:', error);
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
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\"G\"_logo.svg",
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
              <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="space-y-4">
                  <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    Cuéntanos de <span className="text-emerald-500">tu negocio</span>
                  </h2>
                  <p className="text-xl text-gray-500 dark:text-gray-400">La IA necesita entender tu esencia para crear una estrategia ganadora.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Nombre del Negocio</label>
                    <Input 
                      placeholder="Ej: FlowSights AI" 
                      value={config.businessName}
                      onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                      className="py-8 px-6 text-xl rounded-3xl bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Presencia Digital (Opcional)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-6 rounded-3xl border-2 transition-all ${config.websiteUrl ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5'}`}>
                        <Globe2 className={`w-6 h-6 mb-4 ${config.websiteUrl ? 'text-emerald-500' : 'text-gray-400'}`} />
                        <Input 
                          placeholder="Sitio Web" 
                          value={config.websiteUrl}
                          onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                          className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold"
                        />
                      </div>
                      <div className={`p-6 rounded-3xl border-2 transition-all ${config.instagramUrl ? 'border-pink-500 bg-pink-500/5' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5'}`}>
                        <Camera className={`w-6 h-6 mb-4 ${config.instagramUrl ? 'text-pink-500' : 'text-gray-400'}`} />
                        <Input 
                          placeholder="Instagram" 
                          value={config.instagramUrl}
                          onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
                          className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold"
                        />
                      </div>
                      <div className={`p-6 rounded-3xl border-2 transition-all ${config.facebookUrl ? 'border-blue-600 bg-blue-600/5' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5'}`}>
                        <Users className={`w-6 h-6 mb-4 ${config.facebookUrl ? 'text-blue-600' : 'text-gray-400'}`} />
                        <Input 
                          placeholder="LinkedIn" 
                          value={config.facebookUrl}
                          onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })}
                          className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold"
                        />
                      </div>
                    </div>
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
                  <Textarea 
                    placeholder="Ej: Estamos lanzando un nuevo curso de IA para emprendedores con un 50% de descuento por tiempo limitado..." 
                    value={config.promote}
                    onChange={(e) => setConfig({ ...config, promote: e.target.value })}
                    className="min-h-[200px] p-8 text-xl rounded-[40px] bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 focus:ring-emerald-500"
                  />

                  <div className="flex flex-wrap gap-3">
                    {suggestions.map((s) => (
                      <button 
                        key={s.label}
                        onClick={() => setConfig({ ...config, promote: s.label })}
                        className="px-6 py-3 rounded-full bg-gray-100 dark:bg-white/5 text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 py-10 text-xl font-bold rounded-3xl">Atrás</Button>
                    <Button 
                      onClick={() => setStep(3)} 
                      disabled={!config.promote}
                      className="flex-[2] py-10 text-xl font-black bg-gray-900 dark:bg-white text-white dark:text-black rounded-3xl"
                    >
                      Siguiente <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="space-y-4">
                  <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    ¿Dónde está <span className="text-emerald-500">tu audiencia?</span>
                  </h2>
                  <p className="text-xl text-gray-500 dark:text-gray-400">Define la ubicación geográfica y el perfil de tu cliente ideal.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Ubicación</label>
                    <LocationInput 
                      value={config.location}
                      onChange={(val) => setConfig({ ...config, location: val })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Cliente Ideal</label>
                    <Input 
                      placeholder="Ej: Dueños de negocios, 25-45 años, interesados en tecnología..." 
                      value={config.idealCustomer}
                      onChange={(e) => setConfig({ ...config, idealCustomer: e.target.value })}
                      className="py-8 px-6 text-xl rounded-3xl bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 py-10 text-xl font-bold rounded-3xl">Atrás</Button>
                    <Button 
                      onClick={() => setStep(4)} 
                      disabled={!config.location || !config.idealCustomer}
                      className="flex-[2] py-10 text-xl font-black bg-gray-900 dark:bg-white text-white dark:text-black rounded-3xl"
                    >
                      Siguiente <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="space-y-4">
                  <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    Imagen de <span className="text-emerald-500">Campaña</span>
                  </h2>
                  <p className="text-xl text-gray-500 dark:text-gray-400">Sube una imagen de tu producto o deja que nuestra IA use una profesional de stock.</p>
                </div>

                <div className="space-y-8">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative aspect-video rounded-[40px] border-4 border-dashed border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all group overflow-hidden"
                  >
                    {config.userImage ? (
                      <>
                        <img src={config.userImage} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <RefreshCw className="w-12 h-12 text-white animate-spin-slow" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-6 rounded-full bg-white dark:bg-white/10 shadow-xl mb-4 group-hover:scale-110 transition-all">
                          <Upload className="w-10 h-10 text-emerald-500" />
                        </div>
                        <p className="text-xl font-black text-gray-900 dark:text-white">Subir Imagen Propia</p>
                        <p className="text-gray-500 mt-2">O haz clic para cambiar</p>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 py-10 text-xl font-bold rounded-3xl">Atrás</Button>
                    <Button 
                      onClick={() => setStep(5)} 
                      className="flex-[2] py-10 text-xl font-black bg-gray-900 dark:bg-white text-white dark:text-black rounded-3xl"
                    >
                      {config.userImage ? 'Usar mi imagen' : 'Usar imagen de IA'} <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="space-y-4">
                  <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    Presupuesto <span className="text-emerald-500">Diario</span>
                  </h2>
                  <p className="text-xl text-gray-500 dark:text-gray-400">Ajusta tu inversión para ver el alcance potencial de tu campaña.</p>
                </div>

                <div className="space-y-12">
                  <div className="p-12 rounded-[48px] bg-gray-900 text-white space-y-8 shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <TrendingUp className="w-32 h-32" />
                    </div>
                    <div className="space-y-2 relative z-10">
                      <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs">Inversión Recomendada</p>
                      <h3 className="text-7xl font-black">${config.budget}<span className="text-2xl text-gray-500 ml-2">USD / día</span></h3>
                    </div>
                    <Slider 
                      value={[config.budget]} 
                      min={10} 
                      max={1000} 
                      step={10} 
                      onValueChange={([val]) => setConfig({ ...config, budget: val })}
                      className="py-4"
                    />
                    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                      <AnimatedStat stat={{ value: config.budget * 12, suffix: "", prefix: "+", label: "Alcance Estimado" }} />
                      <AnimatedStat stat={{ value: config.budget * 0.8, suffix: "", prefix: "+", label: "Clicks Potenciales" }} />
                      <AnimatedStat stat={{ value: Math.floor(config.budget / 15), suffix: "", prefix: "+", label: "Conversiones IA" }} />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(4)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                    <motion.div className="flex-[2]" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={handleGenerate}
                        className="w-full py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <Rocket className="w-6 h-6 mr-3" /> Generar Campaña IA
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-20">
            
            {/* 1. GRID PRINCIPAL: RESULTADOS VISUALES */}
            <div className="max-w-6xl mx-auto space-y-10">
              
              {/* Pestañas Premium Grandes con Logos Oficiales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['google', 'meta', 'tiktok', 'linkedin'] as const).map((platform) => {
                  const isActive = selectedPlatform === platform;
                  const style = getPlatformStyle(platform);
                  return (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`relative flex items-center gap-4 p-6 rounded-[32px] transition-all duration-500 border-2 ${
                        isActive 
                        ? `bg-white dark:bg-white/5 border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02]` 
                        : 'bg-gray-50 dark:bg-white/5 border-transparent grayscale opacity-40 hover:grayscale-0 hover:opacity-100'
                      }`}
                    >
                      <div className="w-12 h-12 flex-shrink-0">
                        <img src={style.logo} alt={platform} className="w-full h-full object-contain" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Plataforma</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{style.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Grid de Entrega Dinámica */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedPlatform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`relative p-1 rounded-[48px] border-2 transition-colors duration-700 ${getPlatformStyle(selectedPlatform).border} bg-gradient-to-br ${getPlatformStyle(selectedPlatform).gradient}`}
                >
                  <div className="bg-white dark:bg-[#050505]/90 backdrop-blur-3xl rounded-[46px] p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                      
                      {/* Mockup con Botones de Acción */}
                      <div className="space-y-6">
                        <div className="relative group rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/40 p-6">
                          <EditablePlatformPreview
                            platform={selectedPlatform}
                            headline={generatedAds.find(a => a.platform === selectedPlatform)?.headline || ''}
                            description={generatedAds.find(a => a.platform === selectedPlatform)?.description || ''}
                            cta={generatedAds.find(a => a.platform === selectedPlatform)?.cta || ''}
                            imageUrl={config.userImage || ''}
                            businessName={config.businessName}
                          />
                          <div className="absolute top-8 right-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="icon" variant="secondary" onClick={() => setMockupLightboxOpen(true)} className="rounded-full shadow-xl">
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="rounded-full shadow-xl">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Estrategia y Botones */}
                      <div className="space-y-10">
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest">Offer</div>
                            <div className="flex items-center gap-1 text-yellow-500 font-black text-xs">
                              <Sparkles className="w-3 h-3" /> 94/100
                            </div>
                          </div>
                          <h4 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">
                            Estrategia de <span className={getPlatformStyle(selectedPlatform).text}>{getPlatformStyle(selectedPlatform).name}</span>
                          </h4>
                          <div className="space-y-4">
                            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                              {selectedPlatform === 'meta' && "Tono visual y emocional diseñado específicamente para captar la atención en el feed de Instagram y Facebook, optimizando el CTR mediante segmentación psicográfica."}
                              {selectedPlatform === 'google' && "Estrategia basada en intención de búsqueda directa, con copys optimizados para el Quality Score y máxima relevancia en la red de búsqueda."}
                              {selectedPlatform === 'tiktok' && "Contenido nativo de alto impacto visual diseñado para el algoritmo 'For You', fomentando la interacción y el descubrimiento viral."}
                              {selectedPlatform === 'linkedin' && "Tono formal y profesional diseñado específicamente para dueños de negocio y emprendedores que buscan networking de alto nivel."}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Button 
                              variant="outline"
                              onClick={() => setIsGuideLightboxOpen(true)}
                              className="py-8 rounded-2xl border-gray-200 dark:border-white/10 font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                              <Eye className="w-4 h-4 mr-2" /> Guía Visual
                            </Button>
                            <Button 
                              onClick={() => {
                                if (hasPaid) {
                                  downloadPremiumCampaignKit({
                                    businessName: config.businessName,
                                    businessDescription: config.promote,
                                    targetAudience: config.idealCustomer,
                                    websiteUrl: config.websiteUrl,
                                    ads: generatedAds.filter(a => a.platform === selectedPlatform),
                                  });
                                } else {
                                  setShowPaymentModal(true);
                                }
                              }}
                              className="py-8 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl transition-all"
                            >
                              <Download className="w-4 h-4 mr-2" /> Descargar Kit
                            </Button>
                          </div>
                          <Button 
                            variant="outline"
                            className="w-full py-8 rounded-2xl border-emerald-500/30 text-emerald-500 font-black uppercase tracking-widest text-xs hover:bg-emerald-500/5"
                          >
                            <Rocket className="w-4 h-4 mr-2" /> Lanza en {getPlatformStyle(selectedPlatform).name}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 2. FULL CAMPAIGN KIT: ENTREGA MAESTRA */}
            <div className="max-w-6xl mx-auto">
              <div className="relative p-1 rounded-[48px] bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20 border border-white/10">
                <div className="bg-white dark:bg-[#050505]/80 backdrop-blur-3xl rounded-[46px] p-12 text-center space-y-8">
                  <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-black uppercase tracking-widest">
                    Entrega Final de Alto Valor
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                      Campaña <span className="text-emerald-500">Optimizada</span>
                    </h2>
                    <p className="text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                      Tu Estrategia Premium está Lista. Descarga el paquete completo con todos los activos generados.
                    </p>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={handleDownloadMasterKit}
                      className="py-12 px-16 text-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-[32px] shadow-2xl shadow-emerald-500/40 group"
                    >
                      <FileDown className="w-8 h-8 mr-4 group-hover:animate-bounce" /> Descargar Full Campaign Kit
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </main>

      <VisualGuideLightbox isOpen={isGuideLightboxOpen} onClose={() => setIsGuideLightboxOpen(false)} />
      <MockupLightbox 
        isOpen={mockupLightboxOpen} 
        onClose={() => setMockupLightboxOpen(false)} 
        platform={selectedPlatform}
        ad={generatedAds.find(a => a.platform === selectedPlatform) || {
          headline: '',
          description: '',
          cta: '',
          imageUrl: config.userImage || '',
          platform: selectedPlatform,
          type: 'Offer',
          score: 94,
          platformUrl: ''
        }}
        businessName={config.businessName}
      />
      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
      
      <AnimatePresence>
        {showInactivityModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#0a0a0a] p-12 rounded-[48px] max-w-lg w-full text-center space-y-8 border border-white/10">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-12 h-12 text-red-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white">Sesión Expirada</h2>
                <p className="text-xl text-gray-500">Por seguridad, hemos cerrado tu sesión debido a inactividad prolongada.</p>
              </div>
              <Button onClick={() => navigate('/flowsight-ads')} className="w-full py-8 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl">
                Volver a Entrar
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlowsightAdsDashboard;
