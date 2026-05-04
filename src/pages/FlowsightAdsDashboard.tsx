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
  FileDown, ZoomIn, Edit2, BookOpen, Share2, Lock, Unlock,
  Store, Coffee, Home, Copy, CheckCircle2, WandSparkles, Video, MessageSquareText, Megaphone, Settings2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MetaSettingsModal } from '@/components/MetaSettingsModal';
import { useTheme } from 'next-themes';
import { LocationInput } from '@/components/LocationInput';
import { motion, AnimatePresence } from 'framer-motion';
import { EditablePlatformPreview } from '@/components/EditablePlatformPreview';
import { VisualGuideLightbox } from '@/components/VisualGuideLightbox';
import { PremiumLoadingScreen } from '@/components/PremiumLoadingScreen';
import { downloadPremiumCampaignKit } from '@/lib/premiumCampaignKitGenerator';
import { PaymentModal } from '@/components/PaymentModal';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { generateAdsWithGeminiIntegration } from '@/lib/dashboardIntegration';
import { useToast } from '@/hooks/use-toast';
import { MockupLightbox } from '@/components/MockupLightbox';
import { logger } from '@/lib/logger';
import { PlatformIcon, platformThemes, platformNames } from '@/components/PlatformIcons';

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
  facebookUrl: string;
  promote: string;
  location: string;
  idealCustomer: string;
  budget: number;
  userImage: string | null;
}

type ImageMode = 'copyonly' | 'image' | 'carousel' | 'video';

const businessTypes = [
  { icon: Store, label: 'Ecommerce / Tienda online', keywords: ['tienda', 'ecommerce', 'online', 'shop', 'producto'] },
  { icon: Coffee, label: 'Cafetería / Gastronomía', keywords: ['cafe', 'café', 'cafeteria', 'cafetería', 'restaurante', 'comida', 'helado', 'heladería'] },
  { icon: ShieldCheck, label: 'Salud / Bienestar', keywords: ['salud', 'bienestar', 'clinica', 'clínica', 'spa', 'fitness', 'yoga'] },
  { icon: Home, label: 'Servicios al hogar', keywords: ['hogar', 'limpieza', 'reparacion', 'reparación', 'jardín', 'jardin', 'mantenimiento'] },
  { icon: Building2, label: 'B2B / Servicios profesionales', keywords: ['consultoria', 'consultoría', 'software', 'agencia', 'servicio profesional', 'b2b'] },
  { icon: BookOpen, label: 'Educación / Cursos', keywords: ['curso', 'educación', 'educacion', 'clase', 'academia', 'formación'] },
  { icon: Globe2, label: 'Turismo / Hospitalidad', keywords: ['hotel', 'turismo', 'viaje', 'hospedaje', 'hostal', 'tour'] },
  { icon: Store, label: 'Retail / Local', keywords: ['retail', 'local', 'boutique', 'tienda física', 'tienda fisica'] },
];

const MIN_BUDGET = 5;
const MAX_BUDGET = 2000;

const formatBudget = (value: number) => `$${value.toLocaleString('en-US')}`;

const getBudgetProjection = (budget: number) => {
  const normalizedBudget = Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, budget));
  const reachMin = Math.max(150, Math.round(normalizedBudget * 30));
  const reachMax = Math.max(250, Math.round(normalizedBudget * 50));
  const clicksMin = Math.max(6, Math.round(normalizedBudget * 1.2));
  const clicksMax = Math.max(10, Math.round(normalizedBudget * 2));
  const leadsMin = Math.max(1, Math.round(normalizedBudget * 0.1));
  const leadsMax = Math.max(2, Math.round(normalizedBudget * 0.25));

  return {
    reach: `${reachMin.toLocaleString('en-US')} – ${reachMax.toLocaleString('en-US')} personas`,
    clicks: `${clicksMin.toLocaleString('en-US')} – ${clicksMax.toLocaleString('en-US')} clicks`,
    leads: `${leadsMin.toLocaleString('en-US')} – ${leadsMax.toLocaleString('en-US')} clientes potenciales`,
  };
};

const getBudgetRecommendation = (budget: number) => {
  if (budget < 25) return 'Ideal para probar el mensaje con inversión mínima y aprender rápido.';
  if (budget < 100) return 'Buen punto de partida para validar demanda local sin alto riesgo.';
  if (budget < 300) return 'Base sólida para capturar señales y optimizar la campaña.';
  if (budget < 750) return 'Recomendado para acelerar aprendizaje y aumentar volumen de clientes.';
  return 'Escalado fuerte para maximizar visibilidad, pruebas y conversiones potenciales.';
};

const contentTypes = [
  { id: 'copyonly' as const, title: 'Solo copy', description: 'Texto listo para publicar', icon: FileText },
  { id: 'image' as const, title: 'Imagen', description: 'Una pieza visual principal', icon: ImageIcon },
  { id: 'carousel' as const, title: 'Carrusel', description: 'Varias piezas para explicar valor', icon: Layout },
  { id: 'video' as const, title: 'Video', description: 'Guion visual para formato corto', icon: Video },
];

const normalizeText = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const inferBusinessCategory = (businessName: string, promote: string, selectedType?: string | null) => {
  if (selectedType) return selectedType.split(' /')[0];
  const source = normalizeText(`${businessName} ${promote}`);
  const match = businessTypes.find((type) => type.keywords.some((keyword) => source.includes(normalizeText(keyword))));
  return match ? match.label.split(' /')[0] : 'negocio local';
};

const inferCommunicationStyle = (promote: string) => {
  const source = normalizeText(promote);
  if (source.includes('premium') || source.includes('exclusivo') || source.includes('lujo')) return 'premium y aspiracional';
  if (source.includes('descuento') || source.includes('promo') || source.includes('oferta')) return 'directo y orientado a conversión';
  if (source.includes('artesanal') || source.includes('local') || source.includes('cercano')) return 'cercano y auténtico';
  return 'claro, confiable y enfocado en resultados';
};

const getSuggestedAudience = (category: string) => {
  const normalized = normalizeText(category);
  if (normalized.includes('cafeteria') || normalized.includes('gastronomia')) return 'personas cercanas con intención de compra local';
  if (normalized.includes('ecommerce')) return 'compradores digitales interesados en productos similares';
  if (normalized.includes('salud')) return 'clientes que buscan bienestar, confianza y resultados visibles';
  if (normalized.includes('educacion')) return 'personas que quieren aprender o mejorar una habilidad concreta';
  if (normalized.includes('servicios')) return 'hogares o negocios que necesitan una solución rápida y confiable';
  return 'clientes potenciales con interés real en tu oferta';
};

const getSuggestedObjective = (category: string) => {
  const normalized = normalizeText(category);
  if (normalized.includes('cafeteria') || normalized.includes('gastronomia')) return 'atraer visitas al local y aumentar pedidos recurrentes';
  if (normalized.includes('ecommerce')) return 'generar tráfico calificado y convertir visitas en compras';
  if (normalized.includes('servicios')) return 'conseguir solicitudes de contacto de clientes listos para comprar';
  return 'convertir atención en clientes reales para tu negocio';
};

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
  const [showPreview, setShowPreview] = useState(false);
  const [isMetaSettingsOpen, setIsMetaSettingsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isGuideLightboxOpen, setIsGuideLightboxOpen] = useState(false);
  const [mockupLightboxOpen, setMockupLightboxOpen] = useState(false);
  const [currentMockupAdIndex, setCurrentMockupAdIndex] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<"google" | "meta" | "tiktok" | "linkedin">("meta");

  const { hasPaid } = usePaymentStatus();
  const isInputFlowPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'input-flow';

  const [config, setConfig] = useState<CampaignConfig>({
    businessName: '',
    websiteUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    facebookUrl: '',
    promote: '',
    location: '',
    idealCustomer: '',
    budget: 100,
    userImage: null,
  });

  const [siteAnalyzing, setSiteAnalyzing] = useState(false);

  const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null);
  const [selectedAgeRange] = useState<string | null>(null);
  const [selectedGeographicReach] = useState<string | null>(null);
  const [additionalCustomerInfo] = useState('');
  const [imageMode, setImageMode] = useState<ImageMode>('copyonly');
  const [uploadedAssets, setUploadedAssets] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [promptCopied, setPromptCopied] = useState(false);

  const updateIdealCustomer = useCallback(() => {
    if (selectedBusinessType && selectedAgeRange && selectedGeographicReach) {
      let text = `${selectedBusinessType}, ${selectedAgeRange}, alcance ${selectedGeographicReach}`;
      if (additionalCustomerInfo.trim()) {
        text += ` — ${additionalCustomerInfo.trim()}`;
      }
      setConfig(prev => ({ ...prev, idealCustomer: text }));
    }
  }, [selectedBusinessType, selectedAgeRange, selectedGeographicReach, additionalCustomerInfo]);

  useEffect(() => {
    updateIdealCustomer();
  }, [selectedBusinessType, selectedAgeRange, selectedGeographicReach, additionalCustomerInfo, updateIdealCustomer]);

  const handleImageModeSelect = (mode: ImageMode) => {
    setImageMode(mode);
    setPromptCopied(false);
    if (mode === 'copyonly') {
      setUploadedAssets([]);
      setConfig(prev => ({ ...prev, userImage: null }));
    }
  };

  const fetchSiteMetadata = useCallback(async (url: string) => {
    if (!url || !url.startsWith('http')) return;
    try {
      setSiteAnalyzing(true);
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(3000)
      });
      const data = await response.json();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      const title = doc.querySelector('title')?.textContent?.trim() || '';
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
      if ((title || description) && !config.promote) {
        setConfig(prev => ({ ...prev, promote: [title, description].filter(Boolean).join(' — ').substring(0, 200) }));
      }
    } catch {
      // silencioso
    } finally {
      setSiteAnalyzing(false);
    }
  }, [config.promote]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/flowsight-ads');
    } catch (err) {
      logger.error("Error al cerrar sesión", err, "Dashboard");
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      if (isInputFlowPreview) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/flowsight-ads');
    };
    checkUser();
  }, [navigate, isInputFlowPreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    Promise.all(files.map((file) => new Promise<{ name: string; dataUrl: string; type: 'image' | 'video' }>((resolve) => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      reader.onload = (event) => resolve({ 
        name: file.name, 
        dataUrl: event.target?.result as string,
        type: isVideo ? 'video' : 'image'
      });
      reader.readAsDataURL(file);
    }))).then((newAssets) => {
      setUploadedAssets(prev => {
        // Si es carrusel, acumulamos. Si no, reemplazamos.
        const updated = imageMode === 'carousel' ? [...prev, ...newAssets] : newAssets;
        
        // Actualizar la imagen principal del config con el primer asset
        if (updated.length > 0) {
          setConfig(c => ({ ...c, userImage: updated[0].dataUrl }));
        }
        
        return updated;
      });
    });
  };

  const handleRemoveAsset = (name: string) => {
    setUploadedAssets(prev => {
      const updated = prev.filter(a => a.name !== name);
      // Si borramos el que era userImage, ponemos el siguiente disponible o null
      if (config.userImage === prev.find(a => a.name === name)?.dataUrl) {
        setConfig(c => ({ ...c, userImage: updated[0]?.dataUrl || null }));
      }
      return updated;
    });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => (prev >= 95 ? 95 : prev + 5));
      }, 300);

      const ads = await generateAdsWithGeminiIntegration(config);
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      setTimeout(async () => {
        setGeneratedAds(ads);
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            await supabase
              .from('campaign_generations')
              .upsert({
                user_id: session.user.id,
                business_name: config.businessName,
                generated_at: new Date().toISOString(),
                follow_up_sent: false,
              }, { onConflict: 'user_id' });
          }
        } catch {
          // silencioso
        }
        
        if (hasPaid) {
          setShowResults(true);
        } else {
          setShowPreview(true);
        }
        setIsLoading(false);
        toast({ title: 'Estrategia Maestra lista' });
      }, 500);
    } catch (error: any) {
      setIsLoading(false);
      toast({ title: 'Error al generar anuncios', variant: 'destructive' });
    }
  };

  // NOTA: Crear tabla en Supabase:
  // CREATE TABLE campaign_generations (
  //   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  //   user_id UUID REFERENCES auth.users(id),
  //   business_name TEXT,
  //   generated_at TIMESTAMPTZ DEFAULT NOW(),
  //   follow_up_sent BOOLEAN DEFAULT FALSE,
  //   UNIQUE(user_id)
  // );

  const handleDownloadMasterKit = () => {
    if (hasPaid) {
      const platformAds = generatedAds.filter(ad => ad.platform === selectedPlatform);
      downloadPremiumCampaignKit({
        businessName: config.businessName,
        businessDescription: config.promote,
        targetAudience: config.idealCustomer,
        websiteUrl: config.websiteUrl,
        ads: platformAds.length > 0 ? platformAds : generatedAds,
        platform: selectedPlatform,
      });
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePreviewPayment = () => {
    setShowPaymentModal(true);
  };

  const handlePreviewBasicView = () => {
    setShowPreview(false);
    setShowResults(true);
  };

  const calculateEstimatedScore = useCallback(() => {
    let score = 40;
    if (config.businessName.length > 3) score += 10;
    if (config.websiteUrl.length > 5) score += 10;
    if (config.promote.length > 20) score += 15;
    if (config.location.length > 3) score += 10;
    if (config.idealCustomer.length > 10) score += 10;
    if (config.budget >= 50) score += 5;
    if (config.userImage || imageMode === 'copyonly') score += 10;
    return Math.min(score, 100);
  }, [config.businessName, config.websiteUrl, config.promote, config.location, config.idealCustomer, config.budget, config.userImage, imageMode]);

  const estimatedScore = calculateEstimatedScore();

  const getScoreMessage = () => {
    if (estimatedScore < 60) return 'Completa más campos para mejorar tus resultados';
    if (estimatedScore < 80) return 'Buena base. Una imagen aumentaría el score';
    return 'Excelente. Tu campaña está lista para generar';
  };

  const getScoreColor = () => {
    if (estimatedScore < 60) return 'bg-red-500';
    if (estimatedScore < 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const loadingMessages = [
    { at: 0,  message: 'Analizando tu negocio y audiencia...' },
    { at: 20, message: 'Investigando las mejores estrategias para tu industria...' },
    { at: 40, message: 'Generando copy de alto impacto con IA...' },
    { at: 60, message: 'Optimizando para cada plataforma...' },
    { at: 75, message: 'Construyendo tus mockups y kits...' },
    { at: 90, message: 'Revisando el score de cada campaña...' },
    { at: 98, message: '¡Casi listo! Preparando tu estrategia...' },
  ];

  const educationalFacts = [
    'Los anuncios con copy específico por plataforma convierten 3x más',
    'El 70% del éxito de un ad depende del copy, no del visual',
    'Un ROAS de 3x significa que por cada $1 invertido, ganas $3',
    'Los anuncios en Meta funcionan mejor los martes y miércoles 9-11am',
    'El CTA más efectivo en Google Ads es "Obtén tu [resultado específico]"',
  ];

  const getCurrentLoadingMessage = () => {
    for (let i = loadingMessages.length - 1; i >= 0; i--) {
      if (loadingProgress >= loadingMessages[i].at) {
        return loadingMessages[i].message;
      }
    }
    return loadingMessages[0].message;
  };

  const [currentEducationalFactIndex, setCurrentEducationalFactIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentEducationalFactIndex(prev => (prev + 1) % educationalFacts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading, educationalFacts.length]);

  const currentTheme = platformThemes[selectedPlatform];
  const detectedBusinessLabel = inferBusinessCategory(config.businessName, config.promote, selectedBusinessType);
  const detectedTone = inferCommunicationStyle(config.promote);
  const suggestedAudience = getSuggestedAudience(detectedBusinessLabel);
  const suggestedObjective = getSuggestedObjective(detectedBusinessLabel);
  const selectedContentType = contentTypes.find((type) => type.id === imageMode) || contentTypes[0];
  const budgetProjection = getBudgetProjection(config.budget);
  const budgetRecommendation = getBudgetRecommendation(config.budget);
  const budgetSliderProgress = ((config.budget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;
  const generatedAiPrompt = [
    `Crea una pieza publicitaria para ${config.businessName || 'este negocio'} basada en esta oferta: ${config.promote || 'oferta principal del negocio'}.`,
    `Tipo de negocio detectado: ${detectedBusinessLabel}.`,
    `Tono sugerido: ${detectedTone}.`,
    `Objetivo de campaña: ${suggestedObjective}.`,
    `Audiencia: ${suggestedAudience}.`,
    `Formato solicitado: ${selectedContentType.title}.`,
    config.websiteUrl ? `Sitio web de referencia: ${config.websiteUrl}.` : '',
    config.instagramUrl ? `Instagram de referencia: ${config.instagramUrl}.` : '',
    config.facebookUrl ? `Facebook de referencia: ${config.facebookUrl}.` : '',
    'Entrega una propuesta visual clara, premium, sin texto excesivo sobre la imagen y alineada con una campaña orientada a conseguir clientes reales.'
  ].filter(Boolean).join('\n');

  const handleCopyAiPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedAiPrompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 1800);
    } catch {
      setPromptCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      <PremiumLoadingScreen 
        isVisible={isLoading} 
        progress={loadingProgress}
        currentMessage={getCurrentLoadingMessage()}
        educationalFact={educationalFacts[currentEducationalFactIndex]}
      />
      
      <MetaSettingsModal isOpen={isMetaSettingsOpen} onClose={() => setIsMetaSettingsOpen(false)} />

      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-black/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight">Flowsight <span className="text-emerald-500">Ads</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsMetaSettingsOpen(true)}
              variant="outline" 
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl px-4 py-2 h-auto text-[10px] font-black uppercase tracking-widest gap-2 hidden md:flex"
            >
              <Settings2 className="w-3 h-3 text-[#0668E1]" />
              Meta API
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-400 hover:text-white font-bold gap-2">
              <LogOut className="w-4 h-4" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {showPreview && !hasPaid ? (
            <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
              <div className="text-center mb-16 relative">
                <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black mb-4 tracking-tight">Tu campaña está <span className="text-emerald-500">lista</span></motion.h2>
                <p className="text-gray-400 text-lg font-medium">Hemos generado 4 estrategias optimizadas para tu negocio</p>
              </div>

              <div className="space-y-8">
                <div className="relative rounded-[48px] p-1" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), transparent, rgba(16,185,129,0.3))', boxShadow: '0 0 80px -20px rgba(16,185,129,0.5)' }}>
                  <div className="bg-[#0A0A0A] rounded-[46px] p-8 lg:p-14 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] blur-[150px] rounded-full opacity-20" style={{ background: 'rgb(16, 185, 129)' }} />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        {(['google', 'meta', 'tiktok', 'linkedin'] as const).map((platform) => (
                          <div key={platform} className="relative">
                            <div className="filter blur-md pointer-events-none select-none opacity-60 p-6 rounded-[24px] bg-white/5 border border-white/10 h-32 flex items-center justify-center">
                              <PlatformIcon platform={platform} size={24} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
                        <div className="p-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10">
                          <Lock className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="font-black text-white text-lg">Desbloquea tu estrategia</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePreviewPayment}
                    className="py-7 px-8 rounded-[24px] font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3 text-white transition-all duration-300 backdrop-blur-xl border border-emerald-500/50 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 hover:from-emerald-500/30 hover:to-emerald-500/20 group relative overflow-hidden"
                    style={{ boxShadow: '0 20px 50px -15px rgba(16,185,129,0.5)' }}
                  >
                    <Unlock className="w-4 h-4 relative z-10" /> Ver mi campaña — $49.99 USD
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePreviewBasicView}
                    className="py-7 px-8 rounded-[24px] font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3 text-gray-300 transition-all duration-300 backdrop-blur-xl border border-white/10 bg-white/5 hover:bg-white/10 group relative overflow-hidden"
                  >
                    <Eye className="w-4 h-4 relative z-10" /> Solo ver el copy básico
                  </motion.button>
                </div>
              </div>
            </motion.div>

          ) : !showResults ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-5xl mx-auto">
              <div className="text-center mb-12 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs font-black uppercase tracking-[0.18em] mb-6"
                >
                  <WandSparkles className="w-4 h-4" /> Estrategia guiada por IA
                </motion.div>
                <h2 className="text-4xl md:text-6xl font-black mb-5 tracking-tight leading-tight">
                  {step === 1 ? (
                    <>Atrae más clientes <span className="text-emerald-500">sin complicaciones</span></>
                  ) : (
                    <>Crea tu campaña <span className="text-emerald-500">maestra</span></>
                  )}
                </h2>
                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-3xl mx-auto">
                  {step === 1
                    ? 'Cuéntanos qué vendes o promocionas. Nosotros convertimos esa información en una estrategia clara para conseguir clientes reales.'
                    : 'Avanza paso a paso con una experiencia simple, visual y enfocada en resultados.'}
                </p>
                <div className="flex justify-center items-center gap-3 mt-8">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        s === step ? 'w-14 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]' : s < step ? 'w-7 bg-emerald-500/40' : 'w-7 bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-24 -left-20 w-72 h-72 bg-emerald-500/10 blur-[110px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -right-20 w-72 h-72 bg-teal-500/10 blur-[110px] rounded-full pointer-events-none" />

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }} className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 rounded-[40px] border border-white/10 bg-white/[0.045] backdrop-blur-3xl p-6 md:p-8 shadow-2xl shadow-black/30 overflow-hidden">
                      <div className="relative rounded-[32px] bg-gradient-to-br from-emerald-500/15 via-white/[0.04] to-transparent border border-white/10 p-7 flex flex-col justify-between min-h-[340px]">
                        <div>
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6">
                            <MessageSquareText className="w-6 h-6 text-emerald-400" />
                          </div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400 mb-4">Cuéntame tu negocio</p>
                          <h3 className="text-3xl font-black tracking-tight leading-tight mb-4">
                            {config.promote ? `Atrae clientes para ${detectedBusinessLabel}` : 'Empecemos por lo más importante'}
                          </h3>
                          <p className="text-gray-400 font-medium leading-relaxed">
                            No necesitas saber de anuncios. Describe tu producto, servicio o promoción y la interfaz empezará a construir una estrategia entendible.
                          </p>
                        </div>
                        <motion.div animate={{ opacity: config.promote ? 1 : 0.45, y: config.promote ? 0 : 8 }} className="mt-8 p-4 rounded-2xl bg-black/30 border border-white/10">
                          <p className="text-sm text-gray-300 font-bold">{config.promote ? `Entendido: vamos a convertir esto en una campaña para conseguir clientes.` : 'La IA reaccionará cuando empieces a escribir.'}</p>
                        </motion.div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-xs font-black uppercase tracking-widest text-emerald-500">¿Qué quieres promocionar?</label>
                          <Textarea
                            placeholder="Ej: Café artesanal, desayunos para llevar y promociones de temporada para clientes cercanos al local."
                            className="min-h-[210px] bg-white/5 border-white/10 rounded-[28px] text-xl font-bold p-6 focus-visible:ring-emerald-500/60 transition-all"
                            value={config.promote}
                            onChange={(e) => {
                              setConfig({ ...config, promote: e.target.value });
                              setPromptCopied(false);
                            }}
                          />
                        </div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: config.promote ? 1 : 0.55 }} className="grid sm:grid-cols-3 gap-3">
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <Target className="w-5 h-5 text-emerald-400 mb-3" />
                            <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Enfoque</p>
                            <p className="text-sm font-bold mt-1">Clientes reales</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <Users className="w-5 h-5 text-emerald-400 mb-3" />
                            <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Audiencia</p>
                            <p className="text-sm font-bold mt-1">Se detecta sola</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <TrendingUp className="w-5 h-5 text-emerald-400 mb-3" />
                            <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Meta</p>
                            <p className="text-sm font-bold mt-1">Más ventas</p>
                          </div>
                        </motion.div>

                        <Button onClick={() => setStep(2)} disabled={!config.promote.trim()} className="w-full py-8 text-xl font-black bg-emerald-500 hover:bg-emerald-600 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.01]">
                          Continuar <ArrowRight className="ml-2 w-6 h-6" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }} className="space-y-7 rounded-[40px] border border-white/10 bg-white/[0.045] backdrop-blur-3xl p-6 md:p-8 shadow-2xl shadow-black/30">
                      <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400 mb-3">Te entendí</p>
                          <h3 className="text-3xl md:text-4xl font-black tracking-tight">Completa el contexto básico</h3>
                          <p className="text-gray-400 font-medium mt-3 max-w-2xl">Usaremos tu web y redes como referencia para detectar estilo, tono y señales de confianza sin pedirte configuraciones técnicas.</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <SparklesIcon className="w-5 h-5 text-emerald-400" />
                            <div>
                              <p className="text-xs text-emerald-300 font-black uppercase tracking-widest">Detectado</p>
                              <p className="font-black text-white capitalize">{detectedBusinessLabel}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Nombre del negocio</label>
                          <Input placeholder="Ej: Café Sol" className="py-7 bg-white/5 border-white/10 rounded-2xl text-lg font-bold" value={config.businessName} onChange={(e) => setConfig({ ...config, businessName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Sitio web / landing page</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <Input placeholder="https://tudominio.com" className="pl-12 py-7 bg-white/5 border-white/10 rounded-2xl text-lg font-bold" value={config.websiteUrl} onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })} onBlur={() => fetchSiteMetadata(config.websiteUrl)} />
                            {siteAnalyzing && (
                              <motion.div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                                <span className="text-xs text-gray-400 font-bold">Analizando...</span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Instagram</label>
                          <div className="relative">
                            <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <Input placeholder="https://instagram.com/tu_negocio" className="pl-12 py-7 bg-white/5 border-white/10 rounded-2xl text-lg font-bold" value={config.instagramUrl} onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Facebook</label>
                          <div className="relative">
                            <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <Input placeholder="https://facebook.com/tu_negocio" className="pl-12 py-7 bg-white/5 border-white/10 rounded-2xl text-lg font-bold" value={config.facebookUrl} onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
                          <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Estilo detectado</p>
                          <p className="text-lg font-black capitalize">{detectedTone}</p>
                        </div>
                        <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
                          <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Uso de canales</p>
                          <p className="text-lg font-black">Web, Instagram y Facebook como referencia</p>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-2">
                        <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 py-8 rounded-2xl font-bold">Atrás</Button>
                        <Button onClick={() => setStep(3)} disabled={!config.businessName.trim()} className="flex-[2] py-8 text-xl font-black bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20">Ver estrategia <ArrowRight className="ml-2 w-6 h-6" /></Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }} className="space-y-7 rounded-[40px] border border-white/10 bg-white/[0.045] backdrop-blur-3xl p-6 md:p-8 shadow-2xl shadow-black/30">
                      <div className="text-center max-w-3xl mx-auto">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400 mb-3">Así vamos a conseguirte clientes</p>
                        <h3 className="text-3xl md:text-4xl font-black tracking-tight">Estrategia automática generada</h3>
                        <p className="text-gray-400 font-medium mt-3">Antes de pedirte presupuesto, te mostramos el razonamiento de campaña para que veas que entendimos el negocio.</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        {[
                          { title: 'Tipo de campaña sugerida', value: 'Captación de clientes con intención alta', icon: Megaphone },
                          { title: 'Público objetivo', value: suggestedAudience, icon: Users },
                          { title: 'Tono de comunicación', value: detectedTone, icon: MessageSquareText },
                          { title: 'Objetivo principal', value: suggestedObjective, icon: Target },
                        ].map((card, index) => {
                          const Icon = card.icon;
                          return (
                            <motion.div key={card.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="p-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] hover:border-emerald-500/35 hover:bg-emerald-500/[0.05] transition-all">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-5">
                                <Icon className="w-6 h-6 text-emerald-400" />
                              </div>
                              <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">{card.title}</p>
                              <p className="text-xl font-black leading-snug">{card.value}</p>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="p-5 rounded-[28px] bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                        <p className="text-gray-200 font-bold leading-relaxed">La campaña se enfocará en resultados concretos: atención, clicks y clientes potenciales. El presupuesto se elegirá en el siguiente paso con estimaciones claras.</p>
                      </div>

                      <div className="flex gap-4 pt-2">
                        <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 py-8 rounded-2xl font-bold">Atrás</Button>
                        <Button onClick={() => { setConfig({ ...config, idealCustomer: `${suggestedAudience} — ${suggestedObjective}` }); setStep(4); }} className="flex-[2] py-8 text-xl font-black bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20">Elegir inversión <ArrowRight className="ml-2 w-6 h-6" /></Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }} className="space-y-7 rounded-[40px] border border-white/10 bg-white/[0.045] backdrop-blur-3xl p-6 md:p-8 shadow-2xl shadow-black/30">
                      <div className="text-center max-w-3xl mx-auto">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400 mb-3">¿Cuánto quieres invertir?</p>
                        <h3 className="text-3xl md:text-4xl font-black tracking-tight">Presupuesto a tu medida</h3>
                        <p className="text-gray-400 font-medium mt-3">Tú decides el monto exacto. Puedes empezar con $5, probar con $10 o escalar hasta $2,000 según tu objetivo.</p>
                      </div>

                      <div className="rounded-[34px] border border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 via-white/[0.04] to-black/20 p-6 md:p-8 shadow-2xl shadow-emerald-500/10">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300 mb-3">Inversión diaria</p>
                            <motion.p key={config.budget} initial={{ scale: 0.96, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl md:text-7xl font-black tracking-tight text-emerald-300 drop-shadow-[0_0_28px_rgba(16,185,129,0.45)]">
                              {formatBudget(config.budget)}
                            </motion.p>
                          </div>
                          <div className="rounded-[24px] border border-white/10 bg-black/25 px-5 py-4 md:min-w-[260px]">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Recomendación</p>
                            <p className="font-bold text-gray-200 leading-relaxed">{budgetRecommendation}</p>
                          </div>
                        </div>

                        <div className="relative pt-3 pb-8">
                          <input
                            type="range"
                            min={MIN_BUDGET}
                            max={MAX_BUDGET}
                            step={5}
                            value={config.budget}
                            onChange={(e) => setConfig({ ...config, budget: Number(e.target.value) })}
                            className="w-full h-4 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-300 [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-[0_0_28px_rgba(16,185,129,0.9)] [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-300 [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-black"
                            style={{ background: `linear-gradient(90deg, #10b981 0%, #34d399 ${budgetSliderProgress}%, rgba(255,255,255,0.12) ${budgetSliderProgress}%, rgba(255,255,255,0.12) 100%)` }}
                          />
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-500 mt-4">
                            <span>$5</span>
                            <span>$500</span>
                            <span>$1,000</span>
                            <span>$2,000</span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
                            <p className="text-xs text-emerald-400 font-black uppercase tracking-widest mb-2">Alcance estimado</p>
                            <p className="text-lg font-black text-white">{budgetProjection.reach}</p>
                          </div>
                          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
                            <p className="text-xs text-emerald-400 font-black uppercase tracking-widest mb-2">Clicks estimados</p>
                            <p className="text-lg font-black text-white">{budgetProjection.clicks}</p>
                          </div>
                          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
                            <p className="text-xs text-emerald-400 font-black uppercase tracking-widest mb-2">Clientes potenciales</p>
                            <p className="text-lg font-black text-white">{budgetProjection.leads}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-2">
                        <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 py-8 rounded-2xl font-bold">Atrás</Button>
                        <Button onClick={() => setStep(5)} className="flex-[2] py-8 text-xl font-black bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20">Personalizar contenido <ArrowRight className="ml-2 w-6 h-6" /></Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }} className="space-y-8 rounded-[40px] border border-white/10 bg-white/[0.045] backdrop-blur-3xl p-6 md:p-8 shadow-2xl shadow-black/30">
                      <div className="text-center max-w-3xl mx-auto">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400 mb-3">Personaliza si quieres</p>
                        <h3 className="text-3xl md:text-4xl font-black tracking-tight">Contenido del anuncio</h3>
                        <p className="text-gray-400 font-medium mt-3">Puedes lanzar solo con copy o subir material visual. También dejamos listo un prompt optimizado para herramientas externas de IA.</p>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        {contentTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <motion.button
                              key={type.id}
                              whileHover={{ y: -4, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleImageModeSelect(type.id)}
                              className={`p-5 rounded-[26px] border-2 transition-all text-left ${imageMode === type.id ? 'bg-emerald-500/12 border-emerald-500/60 shadow-xl shadow-emerald-500/10' : 'bg-white/5 border-white/10 hover:border-emerald-500/30'}`}
                            >
                              <Icon className="w-7 h-7 text-emerald-400 mb-5" />
                              <p className="font-black text-white text-lg">{type.title}</p>
                              <p className="text-sm text-gray-400 mt-1 font-medium">{type.description}</p>
                            </motion.button>
                          );
                        })}
                      </div>

                      {imageMode !== 'copyonly' && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                          <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Sube tus archivos</label>
                          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group min-h-[220px]">
                            <div className="p-5 bg-white/5 rounded-3xl group-hover:scale-110 transition-transform">
                              <Upload className="w-10 h-10 text-emerald-500" />
                            </div>
                            <div className="text-center">
                              <p className="font-black text-white">Arrastra o selecciona tus archivos</p>
                              <p className="text-sm text-gray-400 font-medium mt-1">Puedes cargar múltiples imágenes para carrusel o referencias visuales.</p>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*,video/*" multiple className="hidden" />
                          </div>
                          {uploadedAssets.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {uploadedAssets.map((asset) => (
                                <div key={asset.name} className="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-video">
                                  {asset.type === 'video' ? (
                                    <video src={asset.dataUrl} className="w-full h-full object-cover" muted loop autoPlay />
                                  ) : (
                                    <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleRemoveAsset(asset.name); }}
                                      className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                      <X className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm">
                                    <p className="text-[10px] text-white font-bold truncate">{asset.name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      <div className="grid lg:grid-cols-[1fr_0.9fr] gap-5">
                        <div className="p-6 rounded-[30px] bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Prompt para IA externa</p>
                              <h4 className="text-2xl font-black">Listo para copiar</h4>
                            </div>
                            <Button variant="outline" onClick={handleCopyAiPrompt} className="rounded-2xl border-white/10 hover:bg-white/10 font-black gap-2">
                              {promptCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {promptCopied ? 'Copiado' : 'Copiar prompt'}
                            </Button>
                          </div>
                          <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed bg-black/30 border border-white/10 rounded-2xl p-5 font-sans max-h-64 overflow-auto">{generatedAiPrompt}</pre>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-6 rounded-[30px] bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Potencial de tu campaña</label>
                            <span className="text-3xl font-black text-white">{estimatedScore}/100</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <motion.div animate={{ width: `${estimatedScore}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className={`h-full ${getScoreColor()} transition-colors duration-300`} />
                          </div>
                          <p className="text-sm text-gray-400 font-medium">{getScoreMessage()}</p>
                          <div className="pt-4 space-y-3 text-sm text-gray-300 font-bold">
                            <p>Formato: {selectedContentType.title}</p>
                            <p>Presupuesto: {formatBudget(config.budget)}</p>
                            <p>Objetivo: {suggestedObjective}</p>
                          </div>
                        </motion.div>
                      </div>

                      <div className="flex gap-4 pt-2">
                        <Button variant="ghost" onClick={() => setStep(4)} className="flex-1 py-8 rounded-2xl font-bold">Atrás</Button>
                        <Button onClick={handleGenerate} className="flex-[2] py-8 text-xl font-black bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20 group">Generar Campaña Maestra <Zap className="ml-2 w-6 h-6 group-hover:animate-pulse" /></Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-4xl font-black tracking-tight">Tu Estrategia <span className="text-emerald-500">Premium</span></h2>
                  <p className="text-lg text-gray-400 font-medium">Análisis y activos optimizados para máxima conversión.</p>
                </div>
                <Button variant="outline" onClick={() => setShowResults(false)} className="rounded-2xl font-bold px-6 py-6 border-white/10 hover:bg-white/5">
                  <RefreshCw className="w-4 h-4 mr-2" /> Nueva Campaña
                </Button>
              </div>

              {/* PREMIUM DELIVERY CONTAINER */}
              <div 
                className="relative rounded-[48px] p-1 transition-all duration-700"
                style={{ 
                  background: `linear-gradient(135deg, ${currentTheme.border}, transparent, ${currentTheme.border})`,
                  boxShadow: `0 0 80px -20px ${currentTheme.glow}`
                }}
              >
                <div 
                  className="rounded-[46px] p-8 lg:p-14 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(15,15,15,0.98) 0%, rgba(10,10,10,1) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(40px)',
                  }}
                >
                  {/* Dynamic Background with Radial Gradients */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div 
                      className="absolute -top-40 -right-40 w-[600px] h-[600px] blur-[150px] rounded-full opacity-20 transition-all duration-1000"
                      style={{ background: currentTheme.primary }}
                    />
                    <div 
                      className="absolute -bottom-40 -left-40 w-[500px] h-[500px] blur-[150px] rounded-full opacity-15 transition-all duration-1000"
                      style={{ background: currentTheme.secondary || currentTheme.primary }}
                    />
                    {/* Grid Overlay */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" preserveAspectRatio="none">
                      <defs>
                        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    </svg>
                  </div>
                  
                  {/* Platform Selector Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 relative z-10">
                    {(['google', 'meta', 'tiktok', 'linkedin'] as const).map((platform) => {
                      const isSelected = selectedPlatform === platform;
                      const theme = platformThemes[platform];
                      return (
                        <motion.button
                          key={platform}
                          whileHover={{ y: -4, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPlatform(platform)}
                          className={`relative p-7 rounded-[32px] flex items-center gap-5 transition-all duration-500 group overflow-hidden ${
                            isSelected 
                              ? `bg-gradient-to-br ${theme.gradient} shadow-2xl` 
                              : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl flex-shrink-0 ${
                            isSelected ? 'bg-white scale-110' : 'bg-white/10 group-hover:bg-white/20'
                          }`}
                          style={{ aspectRatio: '1 / 1' }}
                          >
                            <PlatformIcon platform={platform} size={32} className="!w-8 !h-8" />
                          </div>
                          <div className="text-left">
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isSelected ? 'text-white/60' : 'text-gray-500'}`}>Plataforma</p>
                            <p className={`font-black text-base tracking-tight ${isSelected ? 'text-white' : 'text-gray-400'}`}>{platformNames[platform].split(' ')[0]}</p>
                          </div>
                          {isSelected && (
                            <motion.div layoutId="active-glow" className="absolute inset-0 bg-white/10 blur-xl pointer-events-none" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                    {/* Left: Interactive Mockup */}
                    <div className="space-y-8">
                      {generatedAds.filter(ad => ad.platform === selectedPlatform).slice(0, 1).map((ad, i) => (
                        <motion.div 
                          key={`${ad.platform}-${i}`} 
                          initial={{ opacity: 0, x: -20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          className="relative group"
                        >
                          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-sm rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div 
                            className="rounded-[40px] p-6 border relative"
                            style={{
                              background: 'linear-gradient(145deg, rgba(20,20,20,0.9), rgba(12,12,12,0.95))',
                              borderColor: 'rgba(255,255,255,0.07)',
                              boxShadow: '0 24px 64px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                              backdropFilter: 'blur(20px)',
                            }}
                          >
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
                              onExpand={() => { setCurrentMockupAdIndex(generatedAds.indexOf(ad)); setMockupLightboxOpen(true); }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Right: Strategy & Premium Buttons */}
                    <div className="space-y-12">
                      {generatedAds.filter(ad => ad.platform === selectedPlatform).slice(0, 1).map((ad) => (
                        <div key={ad.type} className="space-y-10">
                          <div className="space-y-6">
                            <div className="flex items-center gap-4">
                              <Badge className="bg-emerald-500 text-black font-black px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">{ad.type}</Badge>
                              <div className="flex items-center gap-2.5 px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-black text-yellow-500 tracking-wider">{ad.score}/100 SCORE</span>
                              </div>
                            </div>
                            <h3 className="text-5xl font-black tracking-tighter leading-[1.1]">Estrategia de{' '}
                              {selectedPlatform === 'google' ? (
                                <span className="bg-gradient-to-r from-[#4285F4] via-[#FBBC05] to-[#EA4335] bg-clip-text text-transparent">
                                  {platformNames[selectedPlatform]}
                                </span>
                              ) : (
                                <span className={currentTheme.text}>{platformNames[selectedPlatform]}</span>
                              )}
                            </h3>
                            <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-lg">Copy de alto impacto diseñado para romper el scroll y maximizar el CTR.</p>
                          </div>

                          {/* PREMIUM BUTTON SYSTEM - Morphoglass Hierarchy */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                            {/* Tertiary: Guía Visual - Premium Glass */}
                            <motion.button
                              whileHover={{ y: -3, scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setIsGuideLightboxOpen(true)}
                              className="py-6 px-6 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] backdrop-blur-md transition-all duration-300 text-gray-300 hover:text-white relative overflow-hidden group"
                              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)' }}
                            >
                              <span className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                              <BookOpen className="w-4 h-4 relative z-10" /> Guía Visual
                            </motion.button>
                            
                            {/* Secondary: Descargar Kit - Platform Gradient Premium */}
                            <motion.button
                              whileHover={{ y: -3, scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={handleDownloadMasterKit}
                              className={`py-6 px-6 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2.5 bg-gradient-to-br ${currentTheme.gradient} border border-white/20 hover:brightness-110 transition-all duration-300 text-white relative overflow-hidden`}
                              style={{ boxShadow: `0 4px 20px -4px ${currentTheme.glow}, inset 0 1px 0 rgba(255,255,255,0.2)` }}
                            >
                              <Download className="w-4 h-4 relative z-10" /> Descargar Kit
                            </motion.button>

                            {/* Primary: Publicar - Premium Morphoglass */}
                            <motion.button 
                              whileHover={{ y: -4, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const urls: Record<string, string> = {
                                  meta: 'https://adsmanager.facebook.com',
                                  google: 'https://ads.google.com',
                                  tiktok: 'https://ads.tiktok.com',
                                  linkedin: 'https://www.linkedin.com/campaignmanager'
                                };
                                window.open(urls[selectedPlatform], '_blank');
                              }}
                              className="sm:col-span-2 py-7 px-8 rounded-[24px] font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3 text-white transition-all duration-300 backdrop-blur-xl border border-white/[0.12] hover:border-white/[0.25] bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-white/[0.02] hover:from-white/[0.18] hover:via-white/[0.10] hover:to-white/[0.04] group relative overflow-hidden"
                              style={{ boxShadow: `0 20px 50px -15px ${currentTheme.glow}, 0 8px 20px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2)` }}
                            >
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 50%, ${currentTheme.glow}, transparent)` }} />
                              <Share2 className="w-4 h-4 relative z-10" /> Publicar en {platformNames[selectedPlatform]}
                            </motion.button>
                          </div>

                          {/* AI Reasoning - Yellow Note Style */}
                          <div className="p-10 rounded-[40px] bg-yellow-500/[0.03] border border-yellow-500/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
                              <Lightbulb className="text-yellow-500 w-20 h-20" />
                            </div>
                            <div className="flex items-center gap-3 mb-5">
                              <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-yellow-500/80">Análisis Estratégico</span>
                            </div>
                            <p className="text-base text-gray-300 font-medium leading-relaxed relative z-10 italic">"{ad.reasoning}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
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
      <MetaSettingsModal 
        isOpen={isMetaSettingsOpen} 
        onClose={() => setIsMetaSettingsOpen(false)} 
      />
    </div>
  );
};

export default FlowsightAdsDashboard;
