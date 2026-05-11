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
  Store, Coffee, Home, Copy, CheckCircle2, WandSparkles, Video, MessageSquareText, Megaphone,
  Scissors, Scale, Heart, PartyPopper
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { LocationInput } from '@/components/LocationInput';
import { motion, AnimatePresence } from 'framer-motion';
import { EditablePlatformPreview } from '@/components/EditablePlatformPreview';
import { VisualGuideLightbox } from '@/components/VisualGuideLightbox';
import { PremiumLoadingScreen } from '@/components/PremiumLoadingScreen';
import { ThemeToggle } from '@/components/ThemeToggle';
import { downloadPremiumCampaignKit } from '@/lib/premiumCampaignKitGenerator';
import { PaymentModal } from '@/components/PaymentModal';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { generateAdsWithGeminiIntegration } from '@/lib/dashboardIntegration';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MockupLightbox } from '@/components/MockupLightbox';
import { logger } from '@/lib/logger';
import { PlatformIcon, platformThemes, platformNames } from '@/components/PlatformIcons';

import { GeneratedAd } from '@/types/ads';
import { AIAgentBar } from '@/components/AIAgentBar';
import { toast } from 'sonner';

const TypewriterText = ({ text, isUpdating }: { text: string; isUpdating?: boolean }) => {
  const [displayedText, setDisplayedText] = useState(text);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isUpdating) {
      setIsTyping(true);
      setDisplayedText('');
      let index = 0;
      const interval = setInterval(() => {
        index++;
        setDisplayedText(text.substring(0, index));
        if (index >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 5);
      return () => clearInterval(interval);
    } else {
      setDisplayedText(text);
    }
  }, [isUpdating, text]);

  return (
    <span className={isTyping ? 'relative after:content-["|"] after:animate-pulse after:ml-1 after:text-emerald-500 font-medium' : 'font-medium'}>
      {displayedText}
    </span>
  );
};

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
  // Priorizar nichos específicos antes que categorías genéricas
  { icon: Activity, label: 'Dental / Odontología', keywords: ['dentista', 'odontologia', 'odontología', 'ortodoncia', 'diseño de sonrisa', 'brackets', 'implantes', 'dientes', 'limpieza dental', 'protesis', 'muela', 'blanqueamiento dental'] },
  { icon: Scissors, label: 'Barbería / Peluquería', keywords: ['barberia', 'barbería', 'barber', 'peluqueria', 'peluquería', 'corte de cabello', 'estilista', 'salon de belleza', 'barba', 'pelo', 'cabello', 'coloracion', 'balayage', 'alisado', 'tinte', 'peinado'] },
  { icon: SparklesIcon, label: 'Belleza / Estética / Uñas', keywords: ['spa', 'uñas', 'nails', 'manicura', 'pedicura', 'pestañas', 'cejas', 'estética', 'estetica', 'facial', 'masajes', 'skin care', 'depilacion', 'limpieza de cutis', 'microblading', 'lifting', 'botox', 'relleno labial'] },
  { icon: Store, label: 'Taquería / Mexicana', keywords: ['tacos', 'taqueria', 'taquería', 'mexicana', 'burritos', 'quesadillas', 'nachos', 'chile', 'guacamole'] },
  { icon: Store, label: 'Pizzería', keywords: ['pizzeria', 'pizzería', 'pizza', 'pizzas', 'calzone'] },
  { icon: Store, label: 'Hamburgesería / Fast Food', keywords: ['hamburguesa', 'burguer', 'burger', 'hamburguesas', 'papas fritas', 'fast food', 'comida rapida', 'hot dog', 'pancho'] },
  { icon: Coffee, label: 'Cafetería / Bakery', keywords: ['cafe', 'café', 'cafeteria', 'cafetería', 'bakery', 'panaderia', 'reposteria', 'helado', 'heladería', 'postres', 'desayunos', 'merienda', 'brunch', 'tostadas', 'pasteleria', 'tortas', 'dulces'] },
  { icon: Store, label: 'Restaurante / Gastronomía', keywords: ['restaurante', 'comida', 'gastronomia', 'parrillada', 'asado', 'sushi', 'pastas', 'asador', 'bodegon', 'comedor', 'bistro', 'food truck', 'cocina', 'platos', 'menu', 'gourmet'] },
  { icon: ShieldCheck, label: 'Médico / Clínica / Salud', keywords: ['medico', 'médico', 'doctor', 'clinica', 'clínica', 'hospital', 'pediatra', 'ginecologo', 'cardiologo', 'psicologo', 'terapia', 'salud', 'fisioterapia', 'kinesiologia', 'estética médica', 'cirugia', 'oftalmologo', 'nutricionista'] },
  { icon: Zap, label: 'Gimnasio / Fitness', keywords: ['gym', 'gimnasio', 'fitness', 'crossfit', 'entrenamiento', 'personal trainer', 'yoga', 'pilates', 'deporte', 'zumba', 'boxeo', 'artes marciales', 'musculacion', 'entrenador', 'clases de fitness'] },
  { icon: Building2, label: 'Inmobiliaria / Real Estate', keywords: ['inmobiliaria', 'bienes raices', 'propiedades', 'apartamento', 'casa', 'alquiler', 'venta de casas', 'terrenos', 'broker', 'desarrollo inmobiliario', 'duplex', 'loft', 'departamento'] },
  { icon: Scale, label: 'Legal / Abogados', keywords: ['abogado', 'legal', 'firma de abogados', 'bufete', 'leyes', 'notaria', 'asesoria legal', 'divorcios', 'penalista', 'civil', 'comercial', 'sucesiones', 'juicios'] },
  { icon: Home, label: 'Servicios al Hogar', keywords: ['limpieza', 'fumigacion', 'plomeria', 'electricista', 'pintura', 'reparacion', 'aire acondicionado', 'jardin', 'mantenimiento', 'mudanzas', 'fletes', 'gasista', 'cerrajero', 'albañil'] },
  { icon: Zap, label: 'Automotriz / Taller', keywords: ['repuestos', 'automotriz', 'taller', 'mecanico', 'autos', 'carros', 'llantas', 'baterias', 'frenos', 'mantenimiento preventivo', 'lavadero', 'car wash', 'mecanica', 'neumaticos'] },
  { icon: BookOpen, label: 'Educación / Cursos', keywords: ['curso', 'academia', 'escuela', 'clases', 'ingles', 'formacion', 'taller', 'seminario', 'colegio', 'universidad', 'clases particulares', 'mentoria', 'idiomas'] },
  { icon: Globe2, label: 'Turismo / Viajes', keywords: ['hotel', 'turismo', 'viaje', 'tour', 'agencia de viajes', 'hospedaje', 'boletos aereos', 'vacaciones', 'posada', 'hostel', 'cabañas', 'vuelos'] },
  { icon: Heart, label: 'Mascotas / Veterinaria', keywords: ['veterinaria', 'pet shop', 'perros', 'gatos', 'grooming', 'mascotas', 'entrenamiento canino', 'alimento para mascotas', 'paseador', 'adopcion'] },
  { icon: PartyPopper, label: 'Eventos / Bodas', keywords: ['eventos', 'bodas', 'catering', 'fiestas', 'decoracion', 'fotografia', 'dj', 'planner', 'quince años', 'animacion', 'alquiler de salones', 'catering'] },
  { icon: Building2, label: 'Corporativo / Agencia', keywords: ['consultoria', 'agencia', 'marketing', 'software', 'b2b', 'logistica', 'transporte', 'contabilidad', 'empresa', 'coworking', 'asesoria', 'desarrollo web'] },
  { icon: Store, label: 'Tienda Online / Venta', keywords: ['tienda', 'ecommerce', 'online', 'shop', 'producto', 'ventas', 'shopify', 'dropshipping', 'vender', 'regalos', 'ropa', 'accesorios'] },
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
  if (selectedType) return selectedType.split(' / ')[0];
  const source = normalizeText(`${businessName} ${promote}`);
  
  // Scoring system for more surgical precision
  const matches = businessTypes.map(type => {
    let score = 0;
    let matchedKeyword = '';
    
    type.keywords.forEach(kw => {
      const normalizedKw = normalizeText(kw);
      if (source.includes(normalizedKw)) {
        // Longer keywords give higher score (more specific)
        if (normalizedKw.length > score) {
          score = normalizedKw.length;
          matchedKeyword = kw;
        }
      }
    });

    return { type, score, matchedKeyword };
  }).filter(m => m.score > 0);

  if (matches.length > 0) {
    // Sort by score (length of keyword matched) descending
    const bestMatch = matches.sort((a, b) => b.score - a.score)[0];
    const labelParts = bestMatch.type.label.split(' / ');
    
    // Find the most specific part of the label that matches the input
    const specificPart = labelParts.find(part => 
      source.includes(normalizeText(part)) || normalizeText(part).includes(normalizeText(bestMatch.matchedKeyword))
    );
    
    return specificPart || labelParts[0];
  }
  
  return 'Negocio Local';
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

import { useGoogleAdsAuth } from '@/hooks/useGoogleAdsAuth';

const FlowsightAdsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast: uiToast } = useToast();
  const { session, loading: authLoading, signOut } = useAuth();
  const { isConnecting, isConnected, connectGoogleAds } = useGoogleAdsAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isGuideLightboxOpen, setIsGuideLightboxOpen] = useState(false);
  const [mockupLightboxOpen, setMockupLightboxOpen] = useState(false);
  const [currentMockupAdIndex, setCurrentMockupAdIndex] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<"google" | "meta" | "tiktok" | "linkedin">("meta");

  const { hasPaid: actualHasPaid } = usePaymentStatus();
  const isInputFlowPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === 'input-flow';
  const hasPaid = isInputFlowPreview ? true : actualHasPaid;

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
  const [strategyContext, setStrategyContext] = useState('');
  const [activePlatforms, setActivePlatforms] = useState<string[]>(['meta', 'google']);

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

  // Auth Protection & Inactivity Redirect
  useEffect(() => {
    if (!authLoading && !session && !isInputFlowPreview) {
      navigate('/flowsight-ads');
    }
  }, [session, authLoading, navigate, isInputFlowPreview]);

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
      await signOut();
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

  const processFiles = (files: File[]) => {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
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

      const ads = await generateAdsWithGeminiIntegration({
        ...config,
        imageUrls: imageMode === 'carousel' ? uploadedAssets.map(a => a.dataUrl) : undefined
      });
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      setTimeout(async () => {
        setGeneratedAds(ads);
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          // Eliminado insert a campaign_generations para evitar error 404
        } catch {
          // silencioso
        }
        
        setShowResults(true);
        setShowPreview(false);
        setIsLoading(false);
        uiToast({ title: 'Estrategia Maestra lista' });
      }, 500);
    } catch {
      setIsLoading(false);
      uiToast({ title: 'Error al generar anuncios', variant: 'destructive' });
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
      console.log(`Descargando Master Kit para ${selectedPlatform}. Variantes encontradas: ${platformAds.length}`);
      
      try {
        downloadPremiumCampaignKit({
          businessName: config.businessName,
          businessDescription: config.promote,
          targetAudience: config.idealCustomer,
          websiteUrl: config.websiteUrl,
          ads: platformAds.length > 0 ? platformAds : generatedAds,
          platform: selectedPlatform,
        });
        uiToast({ 
          title: 'Descarga iniciada', 
          description: `Tu kit con ${platformAds.length > 0 ? platformAds.length : 'todas'} las variantes para ${platformNames[selectedPlatform]} se está preparando.` 
        });
      } catch (err) {
        uiToast({ title: 'Error al generar PDF', variant: 'destructive' });
      }
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
  const strategyBase = `${suggestedAudience} — ${suggestedObjective}`;
  const strategyWithContext = strategyContext.trim()
    ? `${strategyBase}. Contexto adicional del negocio: ${strategyContext.trim()}`
    : strategyBase;
  const selectedContentType = contentTypes.find((type) => type.id === imageMode) || contentTypes[0];
  const budgetProjection = getBudgetProjection(config.budget);
  const budgetRecommendation = getBudgetRecommendation(config.budget);
  const budgetSliderProgress = ((config.budget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;
  const generatedAiPrompt = [
    `Crea una pieza publicitaria para ${config.businessName || 'este negocio'} basada en esta oferta: ${config.promote || 'oferta principal del negocio'}.`,
    `Tipo de negocio detectado: ${detectedBusinessLabel}.`,
    `Tono sugerido: ${detectedTone}.`,
    `Objetivo de campaña: ${suggestedObjective}.`,
    `Audiencia: ${strategyWithContext}.`,
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
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30 font-sans relative overflow-x-hidden transition-colors duration-500">
      {/* Cinematic Background - Consistent with Login */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020605]">
        {/* Background Video */}
        <video 
          src="/videos/login-bg.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline
          onCanPlay={(e) => { e.currentTarget.style.opacity = '1'; }}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-[2000ms] ease-out"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-emerald-500/[0.05] to-transparent opacity-50" />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/[0.08] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/[0.05] blur-[100px] rounded-full" />
      </div>

      <PremiumLoadingScreen 
        isVisible={isLoading} 
        progress={loadingProgress}
        currentMessage={getCurrentLoadingMessage()}
        educationalFact={educationalFacts[currentEducationalFactIndex]}
      />
      
      <header className="sticky top-0 z-50 backdrop-blur-3xl bg-background/60 border-b border-border/50 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-black dark:text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none text-foreground">Flowsight <span className="text-emerald-500">Ads</span></h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Inteligencia Operativa</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-foreground font-bold gap-2 hover:bg-muted px-4 h-10 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-6xl mx-auto">
              <div className="text-center mb-12 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-6"
                >
                  <WandSparkles className="w-4 h-4" /> Estrategia guiada por IA
                </motion.div>
                <h2 className="text-6xl md:text-[110px] font-black mb-10 tracking-tighter leading-[0.85] text-shadow-premium">
                  {step === 1 ? (
                    <>Crea tu campaña <br /><span className="text-emerald-500 italic">maestra.</span></>
                  ) : (
                    <>Estrategia <br /><span className="text-emerald-500 italic">Maestra</span></>
                  )}
                </h2>
                <p className="text-muted-foreground text-2xl md:text-3xl font-bold max-w-3xl mx-auto leading-tight tracking-tight">
                  {step === 1
                    ? 'Inteligencia Creativa. Simple. Bruta.'
                    : 'Avanza paso a paso con una experiencia diseñada para maximizar tu retorno de inversión.'}
                </p>
                <div className="flex justify-center items-center gap-4 mt-10">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-700 ${
                        s === step ? 'w-20 bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.7)]' : s < step ? 'w-10 bg-emerald-500/30' : 'w-10 bg-white/5'
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
                    <motion.div 
                      key="step1" 
                      initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.98, y: -10 }} 
                      className="grid lg:grid-cols-5 gap-8 glass-card rounded-[40px] p-6 md:p-8 relative transition-all duration-500">
                        <div className="lg:col-span-2 relative rounded-[28px] bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04] border border-emerald-500/10 p-8 flex flex-col justify-between min-h-[300px]">
                          <div>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-inner shadow-emerald-500/10">
                              <MessageSquareText className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500/80 mb-5">Cuéntame tu negocio</p>
                            <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.05] mb-5 text-foreground">
                              {config.promote ? (
                                <>Atraeremos <br />clientes para <span className="text-emerald-500">{detectedBusinessLabel}</span></>
                              ) : (
                                <>Define tu <br />oferta maestra</>
                              )}
                            </h3>
                            <p className="text-muted-foreground font-medium leading-relaxed text-lg max-w-[90%]">
                              Describe qué ofreces. La IA procesará tu idea en tiempo real y construirá una estrategia letal.
                            </p>
                          </div>
                          
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: config.promote ? 1 : 0.4 }}
                            className="mt-8 p-5 rounded-[24px] border border-border dark:border-white/[0.08] bg-muted/30 dark:bg-black/20"
                          >
                            <p className="text-sm text-foreground dark:text-gray-200 font-bold leading-snug">
                              {config.promote 
                                ? "Entendido: vamos a convertir esto en una campaña de alto impacto para conseguir resultados." 
                                : "Esperando detalles para estructurar tu estrategia maestra..."}
                            </p>
                          </motion.div>
                        </div>

                      <div className="lg:col-span-3 flex flex-col justify-between space-y-6 py-2">
                        <div className="space-y-4">
                          <p className="text-[12px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-500/80 ml-2">¿Qué quieres promocionar?</p>
                          <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-[32px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <Textarea
                              placeholder="Ej: Clínica dental de alta gama con servicios de ortodoncia invisible..."
                              className="relative min-h-[140px] bg-white/10 dark:bg-white/[0.03] border-2 border-white/20 dark:border-white/10 rounded-[28px] text-2xl md:text-3xl font-black p-8 focus-visible:ring-emerald-500/40 transition-all placeholder:text-foreground/20 text-foreground backdrop-blur-md leading-tight"
                              value={config.promote}
                              onChange={(e) => {
                                setConfig({ ...config, promote: e.target.value });
                                setPromptCopied(false);
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { icon: Target, label: 'Enfoque', val: 'Clientes reales', color: 'emerald' },
                            { icon: Users, label: 'Audiencia', val: 'Detectada', color: 'blue' },
                            { icon: TrendingUp, label: 'Meta', val: 'Conversión', color: 'purple' }
                          ].map((item, idx) => (
                            <div key={idx} className="p-5 rounded-[28px] bg-muted/20 dark:bg-white/[0.02] border border-border dark:border-white/[0.05] flex flex-col items-center text-center group hover:border-emerald-500/30 transition-all duration-300">
                              <item.icon className={`w-6 h-6 text-${item.color}-500 mb-3 group-hover:scale-110 transition-transform`} />
                              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">{item.label}</p>
                              <p className="text-xs font-black text-foreground">{item.val}</p>
                            </div>
                          ))}
                        </div>

                        <Button 
                          onClick={() => setStep(2)} 
                          disabled={!config.promote.trim()} 
                          className="h-20 px-12 rounded-[28px] bg-[#10b981] hover:bg-[#059669] text-black font-black text-xl gap-4 shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 relative group overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          Continuar al contexto <ArrowRight className="w-7 h-7" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2" 
                      initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.98, y: -10 }} 
                      transition={{ duration: 0.4, ease: "easeOut" }} 
                      className="space-y-8 glass-card rounded-[48px] p-8 md:p-10 shadow-2xl relative"
                    >
                      <div className="flex items-start justify-between gap-8 flex-col lg:flex-row">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 mb-3">02. Contexto de Marca</p>
                          <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight text-foreground">Define tu presencia</h3>
                          <p className="text-foreground/80 font-medium mt-4 max-w-xl text-lg">Usaremos tus redes y sitio web como señales de confianza para la IA. No necesitamos acceso, solo el enlace público.</p>
                        </div>
                        <div className="rounded-[32px] border border-emerald-500/20 bg-emerald-500/[0.05] p-6 min-w-[280px] backdrop-blur-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                              <SparklesIcon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-[10px] text-emerald-400/80 font-black uppercase tracking-widest">Negocio Detectado</p>
                              <p className="font-black text-white text-lg capitalize">{detectedBusinessLabel}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3 md:col-span-2 group">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 ml-2 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" /> Ubicación de impacto (Países, ciudades o barrios)
                          </label>
                          <div className="relative">
                            <LocationInput 
                              value={config.location} 
                              onChange={(val) => setConfig({ ...config, location: val })}
                              placeholder="Ej: Madrid, España o cobertura nacional"
                            />
                          </div>
                        </div>

                        <div className="space-y-3 group">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400 ml-2">Nombre comercial</label>
                          <Input 
                            placeholder="Ej: FlowSights AI" 
                            className="h-16 px-6 bg-white/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-cyan-500/30 rounded-2xl text-base font-bold transition-all backdrop-blur-md text-foreground placeholder:text-foreground/40" 
                            value={config.businessName} 
                            onChange={(e) => setConfig({ ...config, businessName: e.target.value })} 
                          />
                        </div>

                        <div className="space-y-3 group">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 ml-2">Sitio Web</label>
                          <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <Input 
                              placeholder="https://tuweb.com" 
                              className="h-16 pl-14 bg-white/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 rounded-2xl text-base font-bold transition-all backdrop-blur-md text-foreground placeholder:text-foreground/40" 
                              value={config.websiteUrl} 
                              onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })} 
                              onBlur={() => fetchSiteMetadata(config.websiteUrl)} 
                            />
                            {siteAnalyzing && (
                              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 group">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 ml-2">Instagram</label>
                          <div className="relative">
                            <Camera className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <Input 
                              placeholder="@tu_negocio" 
                              className="h-16 pl-14 bg-white/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-purple-500/30 rounded-2xl text-base font-bold transition-all backdrop-blur-md text-foreground placeholder:text-foreground/40" 
                              value={config.instagramUrl} 
                              onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })} 
                            />
                          </div>
                        </div>

                        <div className="space-y-3 group">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 ml-2">Facebook</label>
                          <div className="relative">
                            <Share2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <Input 
                              placeholder="facebook.com/tu_negocio" 
                              className="h-16 pl-14 bg-white/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-blue-500/30 rounded-2xl text-base font-bold transition-all backdrop-blur-md text-foreground placeholder:text-foreground/40" 
                              value={config.facebookUrl} 
                              onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6">
                        <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">Atrás</Button>
                        <Button 
                          onClick={() => setStep(3)} 
                          disabled={!config.businessName.trim()} 
                          className="flex-[2] h-16 text-lg font-black bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
                        >
                          Ver estrategia <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3" 
                      initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.98, y: -10 }} 
                      transition={{ duration: 0.4, ease: "easeOut" }} 
                      className="grid lg:grid-cols-5 gap-10 glass-card rounded-[40px] p-8 md:p-10 relative overflow-hidden transition-all duration-500"
                    >
                      <div className="absolute -top-32 left-0 w-[600px] h-[600px] bg-emerald-500/[0.08] blur-[180px] rounded-full pointer-events-none" />

                      <div className="lg:col-span-2 relative z-10 flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <WandSparkles className="w-4 h-4" /> 03. Plan Maestro
                          </div>
                          <h3 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] text-foreground">Ruta <br/><span className="text-emerald-500 italic">Estratégica</span></h3>
                          <p className="text-foreground/80 font-medium mt-6 text-xl leading-relaxed">Hemos diseñado la ruta óptima para tu negocio. Agrega contexto extra si hay algo clave que la IA deba considerar.</p>
                        </div>
                        
                        <div className="hidden lg:flex mt-8 items-center gap-4 text-emerald-500/50">
                          <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner shadow-emerald-500/10">
                            <TrendingUp className="w-8 h-8 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">IA Activa</p>
                            <p className="text-sm font-bold text-foreground">Estrategia en tiempo real</p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-3 flex flex-col justify-between space-y-8 relative z-10 py-2">
                        <div className="grid md:grid-cols-3 gap-4">
                          {[
                            { label: 'Tono', val: detectedTone, color: 'emerald' },
                            { label: 'Público', val: suggestedAudience, color: 'purple' },
                            { label: 'Meta', val: suggestedObjective, color: 'cyan' }
                          ].map((item, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, y: 15 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              transition={{ delay: idx * 0.1 }} 
                              className={`p-6 rounded-[28px] border border-${item.color}-500/20 bg-gradient-to-br from-${item.color}-500/[0.05] to-transparent bg-white/5 dark:bg-black/20 backdrop-blur-md hover:scale-[1.02] transition-all group`}
                            >
                              <p className={`text-[9px] font-black uppercase tracking-[0.2em] text-${item.color}-600 dark:text-${item.color}-400 mb-3 opacity-80 group-hover:opacity-100 transition-opacity`}>{item.label}</p>
                              <p className="text-lg font-black leading-tight text-foreground capitalize">{item.val}</p>
                            </motion.div>
                          ))}
                        </div>

                        <motion.div 
                          initial={{ opacity: 0, y: 12 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ delay: 0.3 }} 
                          className="w-full max-w-2xl mx-auto mt-6"
                        >
                          <AIAgentBar 
                            context={{
                              businessName: config.businessName,
                              promote: config.promote,
                              idealCustomer: strategyWithContext,
                              location: config.location,
                              generatedAds: [],
                              uploadedAssets: []
                            }} 
                            mode="context"
                            onContextSubmit={(value) => setStrategyContext(value)}
                            onUpdateAds={() => {}}
                            onAddAssets={() => {}}
                          />
                        </motion.div>

                        <div className="flex gap-4 pt-2">
                          <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-16 rounded-2xl font-bold text-foreground/50 hover:text-foreground hover:bg-white/5 transition-all">Atrás</Button>
                          <Button 
                            onClick={() => { setConfig({ ...config, idealCustomer: strategyWithContext }); setStep(4); }} 
                            className="flex-[2] h-16 text-sm font-black bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.4)] group transition-all uppercase tracking-widest"
                          >
                            Asignar Presupuesto <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div 
                      key="step4" 
                      initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.98, y: -10 }} 
                      transition={{ duration: 0.4, ease: "easeOut" }} 
                      className="grid lg:grid-cols-2 gap-10 glass-card rounded-[40px] p-8 md:p-10 relative overflow-hidden transition-all duration-500"
                    >
                      <div className="absolute -top-32 left-0 w-[600px] h-[600px] bg-emerald-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

                      <div className="relative z-10 flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 dark:border-white/5 bg-white/[0.02] text-foreground/60 text-[10px] font-semibold uppercase tracking-[0.2em] mb-6 shadow-sm">
                            <CreditCard className="w-3.5 h-3.5" /> 04. Inversión Inteligente
                          </div>
                          <h3 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-foreground/90">Presupuesto <br/><span className="text-emerald-500/80 italic font-medium">a tu medida</span></h3>
                          <p className="text-foreground/60 font-medium mt-4 text-lg leading-relaxed">Tú decides el ritmo. Empieza con poco o escala para dominar tu mercado.</p>
                        </div>
                        
                        <div className="mt-8 rounded-3xl border border-black/5 dark:border-white/[0.04] bg-white/[0.01] p-8 shadow-sm relative">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40 mb-3">Inversión diaria sugerida</p>
                          <motion.p 
                            key={config.budget} 
                            initial={{ opacity: 0.8 }} 
                            animate={{ opacity: 1 }} 
                            className="text-6xl md:text-7xl font-semibold tracking-tight leading-none text-foreground/90 drop-shadow-sm"
                          >
                            {formatBudget(config.budget)}
                          </motion.p>
                          <p className="text-foreground/50 font-medium mt-4 text-sm leading-relaxed">{budgetRecommendation}</p>
                        </div>
                        
                        <div className="mt-8">
                          <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40 mb-4 block ml-1">Plataformas Activas</label>
                          <div className="grid grid-cols-2 gap-3">
                            {(['meta', 'google', 'tiktok', 'linkedin'] as const).map((platform) => {
                              const isActive = activePlatforms.includes(platform);
                              const pName = platformNames[platform].split(' ')[0];
                              return (
                                <motion.button
                                  key={platform}
                                  onClick={() => setActivePlatforms(prev => prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform])}
                                  className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                                    isActive 
                                      ? `bg-white/[0.04] border-white/10 ring-1 ring-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-foreground/90` 
                                      : 'bg-transparent border-black/5 dark:border-white/[0.03] hover:bg-white/[0.02] text-foreground/50 hover:text-foreground/80'
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-white/10 text-foreground' : 'bg-white/[0.02] text-foreground/40'}`}>
                                    <PlatformIcon platform={platform} size={16} />
                                  </div>
                                  <span className={`font-medium text-sm tracking-tight ${isActive ? 'text-foreground' : 'text-foreground/70'}`}>{pName}</span>
                                  {isActive && <Check className="w-4 h-4 ml-auto text-emerald-500/70" />}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 flex flex-col justify-between space-y-8 py-2">
                        <div className="rounded-3xl bg-white/[0.01] border border-black/5 dark:border-white/[0.04] p-8 relative overflow-hidden shadow-sm">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.01] to-transparent pointer-events-none" />
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40 mb-6 relative z-10">Ajusta tu inversión</p>
                          <div className="relative pb-2 z-10">
                            <input
                              type="range"
                              min={MIN_BUDGET}
                              max={MAX_BUDGET}
                              step={5}
                              value={config.budget}
                              onChange={(e) => setConfig({ ...config, budget: Number(e.target.value) })}
                              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-black/5 dark:bg-white/[0.04] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-[1.5px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                              style={{ background: `linear-gradient(90deg, #10b981 0%, #34d399 ${budgetSliderProgress}%, transparent ${budgetSliderProgress}%, transparent 100%)` }}
                            />
                            <div className="flex justify-between text-[10px] font-medium text-foreground/40 mt-4">
                              <span>$5</span>
                              <span>$2,000</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Alcance', val: budgetProjection.reach.split(' ')[0], color: 'blue', desc: 'Personas' },
                            { label: 'Clicks', val: budgetProjection.clicks.split(' ')[0], color: 'purple', desc: 'Estimados' },
                            { label: 'Leads', val: budgetProjection.leads.split(' ')[0], color: 'emerald', desc: 'Contactos' }
                          ].map((item, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-white/[0.01] border border-black/5 dark:border-white/[0.04] shadow-sm group hover:bg-white/[0.03] transition-colors relative overflow-hidden">
                              <p className="text-[9px] text-foreground/40 font-semibold uppercase tracking-[0.2em] mb-2">{item.label}</p>
                              <p className="text-2xl font-semibold tracking-tight text-foreground/90">{item.val}</p>
                              <p className="text-[8px] text-foreground/30 font-medium mt-1 uppercase tracking-wider">{item.desc}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-4 pt-6">
                          <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 h-14 rounded-xl font-medium text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Atrás</Button>
                          <Button 
                            onClick={() => setStep(5)} 
                            className="flex-[2] h-14 text-sm font-medium bg-emerald-500/90 hover:bg-emerald-400 text-black rounded-xl shadow-[0_2px_10px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_4px_15px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all px-6 tracking-wide"
                          >
                            Personalizar contenido <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 5 && (
                    <motion.div 
                      key="step5" 
                      initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.98, y: -10 }} 
                      transition={{ duration: 0.4, ease: "easeOut" }} 
                      className="flex flex-col gap-10 glass-card rounded-[40px] p-8 md:p-12 relative overflow-hidden transition-all duration-500 w-full"
                    >
                      <div className="absolute -top-32 left-0 w-[600px] h-[600px] bg-emerald-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                        <div>
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 dark:border-white/5 bg-white/[0.02] text-foreground/60 text-[10px] font-semibold uppercase tracking-[0.2em] mb-6 shadow-sm">
                            <ImageIcon className="w-3.5 h-3.5" /> 05. Activos Visuales
                          </div>
                          <h3 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-foreground/90">Potencia <br/><span className="text-emerald-500/80 italic font-medium">el visual</span></h3>
                          <p className="text-foreground/60 font-medium mt-4 text-lg leading-relaxed max-w-2xl">Elige el formato ideal y agrega contenido si lo deseas. Nuestra IA adaptará la estrategia al instante.</p>
                        </div>
                      </div>

                      <div className="max-w-3xl mx-auto w-full relative z-10 space-y-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40 ml-1">Formato Visual</label>
                          <div className="grid grid-cols-2 gap-3">
                            {contentTypes.map((type) => {
                              const Icon = type.icon;
                              const isActive = imageMode === type.id;
                              const colorConfig = {
                                copyonly: { border: 'hover:bg-white/[0.02]', selected: 'bg-white/[0.04] border-white/10 ring-1 ring-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]', icon: 'text-blue-500/80' },
                                image: { border: 'hover:bg-white/[0.02]', selected: 'bg-white/[0.04] border-white/10 ring-1 ring-purple-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]', icon: 'text-purple-500/80' },
                                carousel: { border: 'hover:bg-white/[0.02]', selected: 'bg-white/[0.04] border-white/10 ring-1 ring-amber-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]', icon: 'text-amber-500/80' },
                                video: { border: 'hover:bg-white/[0.02]', selected: 'bg-white/[0.04] border-white/10 ring-1 ring-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]', icon: 'text-emerald-500/80' },
                              }[type.id as keyof typeof colorConfig];

                              return (
                                <motion.button
                                  key={type.id}
                                  onClick={() => handleImageModeSelect(type.id)}
                                  className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden group flex items-center gap-4 ${isActive ? colorConfig.selected : `bg-transparent border-black/5 dark:border-white/[0.03] ${colorConfig.border}`}`}
                                >
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-white/10 ' + colorConfig.icon : 'bg-white/[0.02] text-foreground/40'}`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className={`font-medium text-sm tracking-tight ${isActive ? 'text-foreground/90' : 'text-foreground/70'}`}>{type.title}</p>
                                    <p className="text-[9px] text-foreground/40 font-medium uppercase tracking-wider mt-0.5">{type.description}</p>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {imageMode !== 'copyonly' && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 relative z-10 w-full mt-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-500/80 ml-2">Centro de Carga</label>
                          <div 
                            onClick={() => fileInputRef.current?.click()} 
                            className="border-2 border-dashed border-black/10 dark:border-white/[0.08] rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-center gap-6 hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-all cursor-pointer group bg-white/5 dark:bg-black/40 backdrop-blur-md"
                          >
                            <div className="p-4 bg-white/10 dark:bg-white/[0.03] rounded-[24px] border border-black/5 dark:border-white/[0.06] group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-500 shrink-0 shadow-xl">
                              <Upload className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div className="text-center md:text-left">
                              <p className="font-black text-foreground text-lg tracking-tight group-hover:text-emerald-500 transition-colors">Sube tus creativos maestros</p>
                              <p className="text-xs text-foreground/50 font-bold mt-1">Aceptamos imágenes de alta resolución y video.</p>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*,video/*" multiple className="hidden" />
                          </div>
                          
                          {uploadedAssets.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
                              {uploadedAssets.map((asset) => (
                                <div key={asset.name} className="relative group rounded-[20px] overflow-hidden border border-black/10 dark:border-white/[0.08] bg-black shadow-lg w-32 h-32 shrink-0">
                                  {asset.type === 'video' ? (
                                    <video src={asset.dataUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop autoPlay />
                                  ) : (
                                    <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleRemoveAsset(asset.name); }}
                                      className="p-2 bg-red-500/80 hover:bg-red-600 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-xl"
                                    >
                                      <X className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      <div className="flex gap-4 pt-6 mt-4 border-t border-black/5 dark:border-white/[0.04] relative z-10 w-full">
                        <Button variant="ghost" onClick={() => setStep(4)} className="w-40 h-14 rounded-xl font-medium text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Atrás</Button>
                        <Button 
                          onClick={handleGenerate}
                          disabled={isLoading || activePlatforms.length === 0}
                          className="flex-1 h-14 text-sm font-medium bg-emerald-500/90 hover:bg-emerald-400 text-black rounded-xl shadow-[0_2px_10px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_4px_15px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all px-6 tracking-wide group disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <RefreshCw className="w-4 h-4 mr-3 animate-spin" /> Procesando Estrategia...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              Lanzar Estrategia Maestra <Zap className="ml-2 w-4 h-4 transition-transform group-hover:scale-110" />
                            </span>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div className="flex-1 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    <Sparkles className="w-4 h-4" /> Campaña Optimizada
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-shadow-premium leading-[0.9]">Estrategia <span className="text-emerald-500 italic">Premium</span></h2>
                  <p className="text-xl text-gray-400 font-medium mb-10 leading-relaxed">
                    {hasPaid ? 'Análisis y activos optimizados por IA para máxima conversión en cada plataforma.' : 'Previsualiza tu campaña maestra. Desbloquea el material profesional para empezar a vender.'}
                  </p>
                  
                  <div className="relative group w-full mt-10">
                    <div className="absolute -inset-1 bg-emerald-500/10 rounded-[40px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <AIAgentBar 
                        context={{
                          businessName: config.businessName,
                          promote: config.promote,
                          idealCustomer: config.idealCustomer,
                          location: config.location,
                          generatedAds: generatedAds,
                          uploadedAssets: uploadedAssets
                        }} 
                        onUpdateAds={(newAds) => {
                          setGeneratedAds(prev => {
                            const updated = [...prev];
                            newAds.forEach(newAd => {
                              const idx = updated.findIndex(a => a.platform === newAd.platform);
                              if (idx !== -1) {
                                updated[idx] = { ...updated[idx], ...newAd, isUpdating: true };
                                // Remover el flag después de la animación
                                setTimeout(() => {
                                  setGeneratedAds(current => current.map(a => 
                                    a.platform === newAd.platform ? { ...a, isUpdating: false } : a
                                  ));
                                }, 2000);
                              } else {
                                updated.push({ ...newAd, isUpdating: true });
                              }
                            });
                            return updated;
                          });
                          toast.success("¡Estrategia actualizada por la IA!", {
                            description: "Los copys y activos han sido optimizados.",
                            icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
                            duration: 5000,
                          });
                        }}
                        onAddAssets={processFiles}
                      />
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setShowResults(false)} className="h-20 px-10 rounded-[28px] font-black uppercase tracking-widest text-xs border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] transition-all hover:scale-105 active:scale-95 group">
                  <RefreshCw className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-700" /> Nueva Campaña
                </Button>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400">Contenido del Anuncio</h3>
              </div>

              {/* PREMIUM DELIVERY CONTAINER */}
              <div 
                className="relative rounded-[64px] p-1.5 transition-all duration-700 shadow-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${currentTheme.border}, transparent, ${currentTheme.border})`,
                  boxShadow: `0 0 100px -30px ${currentTheme.glow}`
                }}
              >
                <div 
                  className="rounded-[60px] p-10 lg:p-20 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(10,10,10,0.98) 0%, rgba(5,5,5,1) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(60px)',
                  }}
                >
                  {/* Dynamic Background with Radial Gradients */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div 
                      className="absolute -top-40 -right-40 w-[800px] h-[800px] blur-[200px] rounded-full opacity-25 transition-all duration-1000 animate-pulse"
                      style={{ background: currentTheme.primary }}
                    />
                    <div 
                      className="absolute -bottom-40 -left-40 w-[700px] h-[700px] blur-[200px] rounded-full opacity-20 transition-all duration-1000"
                      style={{ background: currentTheme.secondary || currentTheme.primary }}
                    />
                  </div>
                  
                  {/* Platform Selector Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 relative z-10">
                    {(['google', 'meta', 'tiktok', 'linkedin'] as const).map((platform) => {
                      const isSelected = selectedPlatform === platform;
                      const theme = platformThemes[platform];
                      return (
                        <motion.button
                          key={platform}
                          whileHover={{ y: -5, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPlatform(platform)}
                          className={`relative px-6 py-5 md:py-6 rounded-[32px] flex items-center justify-center gap-4 transition-all duration-700 group overflow-hidden border ${
                            isSelected 
                              ? `bg-gradient-to-br ${theme.gradient} border-white/20 shadow-2xl shadow-${platform === 'meta' ? 'blue' : 'emerald'}-500/20` 
                              : 'glass-card hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[24px] flex items-center justify-center transition-all duration-700 shadow-2xl flex-shrink-0 ${
                            isSelected ? 'bg-white scale-110 shadow-white/20' : 'bg-white/10 group-hover:bg-white/20'
                          }`}
                          >
                            <PlatformIcon platform={platform} size={32} className="!w-8 !h-8" />
                          </div>
                          <div className="text-left">
                            <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${isSelected ? 'text-white/60' : 'text-foreground/50'}`}>Plataforma</p>
                            <p className={`font-black text-lg md:text-xl tracking-tighter ${isSelected ? 'text-white' : 'text-foreground'}`}>{platformNames[platform]}</p>
                          </div>
                          {isSelected && (
                            <motion.div layoutId="active-glow-main" className="absolute inset-0 bg-white/5 blur-2xl pointer-events-none" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start relative z-10">
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
                              imageUrls={uploadedAssets.length > 0 ? uploadedAssets.map(a => a.dataUrl) : ad.imageUrls}
                              isUpdating={ad.isUpdating}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Right: Strategy & Premium Buttons */}
                    <div className={`space-y-12 relative transition-all duration-500 ${!hasPaid ? 'blur-md pointer-events-none grayscale opacity-40 select-none' : ''}`}>
                      {!hasPaid && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center">
                          {/* Este overlay bloquea interacción pero la visualización se mantiene por el blur */}
                        </div>
                      )}
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
                            <h3 className="text-5xl font-black tracking-tighter leading-[1.1]">Estrategia de <span className={currentTheme.text}>{platformNames[selectedPlatform]}</span></h3>
                            <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-lg">Copy de alto impacto diseñado para romper el scroll y maximizar el CTR.</p>
                          </div>

                          {/* PREMIUM BUTTON SYSTEM */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                            <motion.button
                              whileHover={{ y: -3, scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setIsGuideLightboxOpen(true)}
                              className="py-6 px-6 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2.5 bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/10 transition-all duration-300 text-gray-300 hover:text-white"
                            >
                              <BookOpen className="w-4 h-4" /> Guía Visual
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ y: -3, scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={handleDownloadMasterKit}
                              className={`py-6 px-6 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2.5 bg-gradient-to-r ${currentTheme.gradient} hover:opacity-90 transition-all duration-300 text-white shadow-lg`}
                              style={{ boxShadow: `0 15px 35px -10px ${currentTheme.glow}` }}
                            >
                              <Download className="w-4 h-4" /> Descargar Kit
                            </motion.button>

                            <motion.button 
                              whileHover={{ y: -4, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const urls: Record<string, string> = {
                                  meta: 'https://adsmanager.facebook.com/adsmanager/creation',
                                  google: 'https://ads.google.com/aw/campaigns/new',
                                  tiktok: 'https://ads.tiktok.com/i18n/campaign/create',
                                  linkedin: 'https://www.linkedin.com/campaignmanager/new'
                                };
                                window.open(urls[selectedPlatform], '_blank');
                              }}
                              className="sm:col-span-2 py-7 px-8 rounded-[24px] font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3 text-white transition-all duration-300 backdrop-blur-xl border border-white/20 hover:border-white/40 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 group relative overflow-hidden"
                              style={{ boxShadow: `0 20px 50px -15px ${currentTheme.glow}, inset 0 1px 0 rgba(255,255,255,0.1)` }}
                            >
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 50%, ${currentTheme.glow}, transparent)` }} />
                              <Rocket className="w-4 h-4 relative z-10" /> Lanzar mi campaña ahora
                            </motion.button>
                          </div>

                          {/* AI Reasoning - Yellow Note Style - Compactado */}
                          <div className="p-8 rounded-[32px] bg-yellow-500/[0.03] border border-yellow-500/10 relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-1 bg-yellow-500/20 rounded-lg">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500/80">Análisis Estratégico</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed relative z-10 italic">
                              "<TypewriterText text={ad.reasoning} isUpdating={ad.isUpdating} />"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!hasPaid && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[60] p-4">
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-black/60 backdrop-blur-3xl rounded-[32px] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] text-white text-center space-y-6 border border-emerald-500/30"
                      >
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                          <Lock className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-3xl font-black tracking-tight leading-tight uppercase italic text-emerald-500">Contenido Bloqueado</h3>
                        <p className="font-bold text-gray-300 text-lg leading-relaxed">
                          Tu campaña está lista. Desbloquea ahora para obtener todos los <span className="underline decoration-emerald-500/40">copys de alto impacto</span> y el <span className="underline decoration-emerald-500/40">Campaign Kit</span> profesional.
                        </p>
                        <Button 
                          onClick={() => setShowPaymentModal(true)}
                          className="w-full py-8 text-xl font-black bg-black hover:bg-black/90 text-emerald-500 rounded-2xl shadow-2xl transition-all active:scale-[0.98] group"
                        >
                          DESBLOQUEAR AHORA — $49.99
                          <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/60">Acceso instantáneo de por vida</p>
                      </motion.div>
                    </div>
                  )}

                  {/* BLOQUE 3: Pasos a seguir (Checklist) - MOVIDO AL FINAL, FULL WIDTH */}
                  {/* BLOQUE 3: Pasos a seguir (Checklist) - MOVIDO AL FINAL, FULL WIDTH */}
                  <div className={`mt-16 p-8 md:p-12 glass-card rounded-[40px] space-y-8 relative z-10 transition-all duration-500 ${!hasPaid ? 'blur-sm grayscale opacity-30 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                          <CheckCircle2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <h4 className="text-xl md:text-2xl font-black uppercase tracking-widest text-foreground/80">¿Qué hacer ahora?</h4>
                      </div>
                      <div className="hidden md:block text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] px-4 py-2 bg-white/5 rounded-full">Guía de implementación rápida</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {[
                        { title: "Copia el mensaje", desc: "El texto ya está optimizado." },
                        { title: "Baja las imágenes", desc: "Usa el carrusel para impactar." },
                        { title: "Configura cuenta", desc: "Entra al Ads Manager." },
                        { title: "Lanza y mide", desc: "Espera 5 días resultados." }
                      ].map((step, i) => (
                        <div key={i} className="flex gap-4 group p-6 rounded-[28px] bg-white/5 dark:bg-black/20 border border-black/5 dark:border-white/5 hover:border-emerald-500/30 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-white/10 dark:bg-white/5 flex items-center justify-center font-black text-lg text-foreground/60 group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-all shrink-0">
                            {i + 1}
                          </div>
                          <div className="space-y-1">
                            <p className="font-black text-sm text-foreground/90 group-hover:text-foreground transition-colors uppercase tracking-widest">{step.title}</p>
                            <p className="text-xs text-foreground/50 font-bold leading-tight">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOQUE DE ESTRATEGIA - MOVED TO BOTTOM */}
              <div className={`space-y-8 mt-12 transition-all duration-500 ${!hasPaid ? 'blur-sm grayscale opacity-30 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h3 className="text-xl font-black uppercase tracking-widest text-gray-400">Tu Estrategia</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Resultado Estimado Card */}
                  {/* Resultado Estimado Card */}
                  <div className="lg:col-span-2 p-8 md:p-10 glass-card rounded-[40px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BarChart3 className="w-32 h-32 text-emerald-500" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-emerald-500/20 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                          <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h4 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">Resultado estimado de tu campaña</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 rounded-[28px] bg-blue-500/[0.03] border border-blue-500/10">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-3">Alcance estimado</p>
                          <p className="text-3xl font-black text-foreground">{budgetProjection.reach.split(' ')[0]}</p>
                          <p className="text-xs text-foreground/50 font-bold mt-1">Personas</p>
                        </div>
                        <div className="p-6 rounded-[28px] bg-purple-500/[0.03] border border-purple-500/10">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 mb-3">Clicks estimados</p>
                          <p className="text-3xl font-black text-foreground">{budgetProjection.clicks.split(' ')[0]}</p>
                          <p className="text-xs text-foreground/50 font-bold mt-1">Visitas</p>
                        </div>
                        <div className="p-6 rounded-[28px] bg-emerald-500/10 border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden">
                          <div className="absolute inset-0 bg-emerald-500/5 blur-xl"></div>
                          <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-3">Clientes potenciales</p>
                            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{budgetProjection.leads.split(' ')[0]}</p>
                            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-bold mt-1">Contactos</p>
                          </div>
                        </div>
                      </div>

                      {/* Mini Funnel Visual */}
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-4 py-6 px-8 bg-black/5 dark:bg-black/40 rounded-3xl border border-black/5 dark:border-white/5 backdrop-blur-md">
                        <div className="flex flex-col items-center">
                          <Eye className="w-5 h-5 text-foreground/50 mb-1" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Alcance</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-foreground/30 hidden md:block" />
                        <div className="flex flex-col items-center">
                          <MousePointer2 className="w-5 h-5 text-foreground/50 mb-1" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Clicks</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-foreground/30 hidden md:block" />
                        <div className="flex flex-col items-center">
                          <Target className="w-5 h-5 text-emerald-500 mb-1" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Clientes</span>
                        </div>
                        <div className="md:ml-auto w-full md:w-auto text-sm text-foreground/60 font-medium italic mt-4 md:mt-0 text-center md:text-right">
                          "Esta campaña está diseñada para atraer clientes reales a tu negocio."
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 2: TU CAMPAÑA EN SIMPLE */}
                  <div className={`p-8 md:p-10 rounded-[40px] glass-card border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between ${!hasPaid ? 'blur-sm grayscale opacity-30 pointer-events-none' : ''}`}>
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                          <Zap className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h4 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">Tu campaña en simple</h4>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                          <p className="text-sm md:text-base font-bold text-foreground/80 leading-relaxed"><b className="text-foreground">Público:</b> Personas cercanas interesadas en {detectedBusinessLabel}.</p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                          <p className="text-sm md:text-base font-bold text-foreground/80 leading-relaxed"><b className="text-foreground">Objetivo:</b> Atraer clientes reales y visitas a tu negocio.</p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                          <p className="text-sm md:text-base font-bold text-foreground/80 leading-relaxed"><b className="text-foreground">Estrategia:</b> Mensaje directo + oferta irresistible.</p>
                        </div>
                      </div>
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
    </div>
  );
};

export default FlowsightAdsDashboard;
