import React, { useState, useRef, useEffect } from 'react';
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
  RefreshCw, Wand2, Search, Activity, Eye, MousePointer,
  MapPin as MapPinIconLucide, Upload as UploadIconLucide, X as XIconLucide, Sparkles as SparklesIconLucide
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetaPreview, TikTokPreview, LinkedInPreview, GoogleAdsPreview } from '@/components/PlatformPreviewsNative';
import jsPDF from 'jspdf';

interface GeneratedAd {
  headline: string;
  description: string;
  cta: string;
  imageUrl: string;
  platform: 'google' | 'meta' | 'tiktok' | 'linkedin';
  type: 'Offer' | 'Emotional' | 'Urgency';
  score: number;
  platformUrl: string;
}

interface CampaignConfig {
  promote: string;
  location: string;
  idealCustomer: string;
  budget: number;
  userImage: string | null;
  aiPrompt: string;
}

const FlowsightAdsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAdForLightbox, setSelectedAdForLightbox] = useState<GeneratedAd | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  
  const [config, setConfig] = useState<CampaignConfig>({
    promote: '',
    location: '',
    idealCustomer: '',
    budget: 100,
    userImage: null,
    aiPrompt: '',
  });

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
    'Generando copys persuasivos con IA...',
    'Diseñando creativos visuales inteligentes...',
    'Estructurando tu Campaign Kit Premium...'
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/flowsight-ads');
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
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
    setLoadingStep(0);
    
    for (let i = 0; i < loadingMessages.length; i++) {
      setLoadingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Lógica de IA para imágenes: Si no hay imagen, generamos una basada en el prompt o el negocio
    const aiGeneratedImage = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80&sig=${Math.random()}`;
    const finalImage = config.userImage || aiGeneratedImage;

    const ads: GeneratedAd[] = [
      {
        type: 'Offer',
        headline: `¡Oferta Exclusiva: ${config.promote}!`,
        description: `La mejor solución en ${config.location} para ${config.idealCustomer}. ¡Consigue un descuento especial hoy mismo!`,
        cta: 'Obtener Oferta',
        imageUrl: finalImage,
        platform: 'google',
        score: 94,
        platformUrl: `https://ads.google.com/aw/campaigns/new?keyword=${encodeURIComponent(config.promote)}`
      },
      {
        type: 'Emotional',
        headline: `Diseñado para ${config.idealCustomer}`,
        description: `En ${config.location} entendemos tus necesidades. ${config.promote} es la pieza que faltaba en tu vida.`,
        cta: 'Saber Más',
        imageUrl: finalImage,
        platform: 'meta',
        score: 89,
        platformUrl: `https://adsmanager.facebook.com/adsmanager/manage/campaigns`
      },
      {
        type: 'Urgency',
        headline: `¡Última oportunidad en ${config.location}!`,
        description: `Solo para ${config.idealCustomer}. No dejes pasar la oportunidad de mejorar con ${config.promote}.`,
        cta: 'Reservar Ahora',
        imageUrl: finalImage,
        platform: 'tiktok',
        score: 97,
        platformUrl: `https://ads.tiktok.com/i18n/dashboard`
      },
      {
        type: 'Offer',
        headline: `Impulsa tu éxito con ${config.promote}`,
        description: `Soluciones profesionales para ${config.idealCustomer} en ${config.location}. Líderes en el sector.`,
        cta: 'Contactar',
        imageUrl: finalImage,
        platform: 'linkedin',
        score: 92,
        platformUrl: `https://www.linkedin.com/campaignmanager/accounts`
      }
    ];

    setGeneratedAds(ads);
    setShowResults(true);
    setIsLoading(false);
  };

  const generatePDF = (selectedPlatform?: string) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header Premium Dark
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('FlowSight Ads', 20, 30);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(`CAMPAIGN KIT: ${selectedPlatform?.toUpperCase() || 'ESTRATEGIA MULTICANAL'}`, 20, 42);
    doc.setFontSize(10);
    doc.text(`Generado el ${new Date().toLocaleDateString()} • ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 20, 50);

    let y = 75;
    
    // Sección Estrategia
    doc.setTextColor(5, 5, 5);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('1. Estrategia de Mercado', 20, y);
    y += 15;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const strategyData = [
      ['Producto/Servicio:', config.promote],
      ['Ubicación Objetivo:', config.location],
      ['Audiencia Ideal:', config.idealCustomer],
      ['Presupuesto Sugerido:', `$${config.budget} USD / mes`]
    ];

    strategyData.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 25, y);
      doc.setFont(undefined, 'normal');
      doc.text(value, 75, y);
      y += 10;
    });

    y += 15;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(20);
    doc.text('2. Creativos y Mockups', 20, y);
    y += 15;

    const adsToPrint = selectedPlatform 
      ? generatedAds.filter(ad => ad.platform === selectedPlatform)
      : generatedAds;

    adsToPrint.forEach((ad, index) => {
      if (y > 220) { doc.addPage(); y = 25; }
      
      doc.setDrawColor(230, 230, 230);
      doc.setFillColor(252, 252, 252);
      doc.roundedRect(20, y, pageWidth - 40, 70, 3, 3, 'FD');
      
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(13);
      doc.text(`${ad.type.toUpperCase()} - ${ad.platform.toUpperCase()}`, 25, y + 12);
      
      doc.setTextColor(5, 5, 5);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Headline: ${ad.headline}`, 25, y + 25);
      
      doc.setFont(undefined, 'normal');
      const descLines = doc.splitTextToSize(`Copy: ${ad.description}`, pageWidth - 60);
      doc.text(descLines, 25, y + 35);
      
      doc.setFont(undefined, 'bold');
      doc.text(`Llamada a la acción: ${ad.cta}`, 25, y + 55);
      
      doc.setTextColor(0, 102, 204);
      doc.setFontSize(10);
      doc.text(`Enlace de publicación directa: ${ad.platformUrl}`, 25, y + 63);
      
      y += 80;
    });

    // Guía de Implementación Específica
    if (y > 200) { doc.addPage(); y = 25; }
    doc.setTextColor(5, 5, 5);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('3. Guía de Lanzamiento', 20, y);
    y += 15;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const platformTips: Record<string, string[]> = {
      google: ['• Usa palabras clave de intención de compra.', '• Configura extensiones de anuncio.', '• Optimiza para CTR alto.'],
      meta: ['• Segmenta por intereses detallados.', '• Usa el píxel de Meta para retargeting.', '• El visual es el 70% del éxito.'],
      tiktok: ['• El contenido debe parecer orgánico.', '• Usa música en tendencia.', '• Los primeros 3 segundos son vitales.'],
      linkedin: ['• Segmenta por cargo y empresa.', '• Usa un tono profesional pero directo.', '• Ideal para B2B de alto valor.']
    };

    const tips = selectedPlatform ? platformTips[selectedPlatform] : ['• Mide tus conversiones diariamente.', '• Haz pruebas A/B constantes.', '• Escala el presupuesto en los anuncios ganadores.'];
    
    tips.forEach(tip => {
      doc.text(tip, 25, y);
      y += 10;
    });

    doc.save(`FlowSight-Premium-Kit-${selectedPlatform || 'Global'}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="w-full max-w-md text-center relative z-10">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-12 relative"
          >
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <Rocket className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={loadingStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-black text-white tracking-tight">{loadingMessages[loadingStep]}</h2>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === loadingStep ? 'w-8 bg-emerald-500' : 'w-2 bg-white/10'}`} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] selection:bg-emerald-500/30 transition-colors duration-500">
      {/* Lightbox */}
      <AnimatePresence>
        {selectedAdForLightbox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedAdForLightbox(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X className="w-10 h-10" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedAdForLightbox.platform === 'google' && <GoogleAdsPreview {...selectedAdForLightbox} />}
              {selectedAdForLightbox.platform === 'meta' && <MetaPreview {...selectedAdForLightbox} />}
              {selectedAdForLightbox.platform === 'tiktok' && <TikTokPreview {...selectedAdForLightbox} />}
              {selectedAdForLightbox.platform === 'linkedin' && <LinkedInPreview {...selectedAdForLightbox} />}
              
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={() => generatePDF(selectedAdForLightbox.platform)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-2xl font-bold gap-2"
                >
                  <Download className="w-5 h-5" /> Descargar Kit {selectedAdForLightbox.platform.toUpperCase()}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(selectedAdForLightbox.platformUrl, '_blank')}
                  className="border-white/10 text-white hover:bg-white/5 px-8 py-6 rounded-2xl font-bold gap-2"
                >
                  <ExternalLink className="w-5 h-5" /> Publicar Ahora
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-black/60 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={handleLogout} className="group flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition-all font-medium">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Salir
          </button>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-10 bg-emerald-500' : s < step ? 'w-4 bg-emerald-500/30' : 'w-4 bg-gray-200 dark:bg-white/10'}`} />
              ))}
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-2" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
              <Zap className="w-3 h-3 fill-emerald-500" />
              PREMIUM
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <div className="max-w-3xl mx-auto">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 01: Concepto
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
                        placeholder="Ej: Membresía de Gimnasio, Consultoría IA..."
                        className="relative text-2xl py-10 pl-20 pr-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
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
                    onClick={(e) => { e.preventDefault(); setStep(2); }}
                    className="w-full py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 transition-all active:scale-[0.98]"
                  >
                    Siguiente Paso
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 02: Alcance
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      ¿Dónde está tu <span className="text-emerald-500">audiencia</span>?
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Define la ubicación geográfica de tu mercado ideal.</p>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000" />
                    <MapPinIconLucide className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500 w-8 h-8 z-10" />
                    <Input 
                      value={config.location}
                      onChange={(e) => setConfig({...config, location: e.target.value})}
                      placeholder="Ciudad, País o 'Todo el mundo'"
                      className="relative text-2xl py-10 pl-20 pr-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                    <Button 
                      disabled={!config.location}
                      onClick={() => setStep(3)}
                      className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40"
                    >
                      Continuar
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 03: Creatividad
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      Personaliza tu <span className="text-emerald-500">impacto</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Describe a tu cliente y elige cómo quieres tus visuales.</p>
                  </div>

                  <div className="space-y-6">
                    <Textarea 
                      value={config.idealCustomer}
                      onChange={(e) => setConfig({...config, idealCustomer: e.target.value})}
                      placeholder="Ej: Dueños de negocios que buscan escalar, familias jóvenes interesadas en salud..."
                      className="text-xl py-8 px-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
                    />
                    
                    <div className="grid md:grid-cols-2 gap-4">
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
                          <div className="text-center space-y-2">
                            <UploadIconLucide className="w-6 h-6 text-emerald-500 mx-auto" />
                            <p className="font-bold text-sm dark:text-white">Sube tu foto</p>
                          </div>
                        )}
                      </div>

                      <div 
                        onClick={() => setIsEditingImage(!isEditingImage)}
                        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all ${config.aiPrompt ? 'border-blue-500 bg-blue-500/5' : 'border-gray-200 dark:border-white/10 hover:border-blue-500/50'}`}
                      >
                        <div className="text-center space-y-2">
                          <Wand2 className="w-6 h-6 text-blue-500 mx-auto" />
                          <p className="font-bold text-sm dark:text-white">IA Generativa</p>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isEditingImage && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/20 space-y-4">
                            <p className="text-sm font-bold text-blue-500 flex items-center gap-2">
                              <Info className="w-4 h-4" /> Personaliza la imagen de la IA
                            </p>
                            <Textarea 
                              value={config.aiPrompt}
                              onChange={(e) => setConfig({...config, aiPrompt: e.target.value})}
                              placeholder="Ej: Estilo minimalista, colores neón, ambiente de oficina moderna..."
                              className="bg-white dark:bg-black/40 border-blue-500/20 focus:ring-blue-500"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                    <Button 
                      disabled={!config.idealCustomer}
                      onClick={() => setStep(4)}
                      className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40"
                    >
                      Continuar
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 04: Inversión
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
                    
                    <Slider value={[config.budget]} onValueChange={(val) => setConfig({...config, budget: val[0]})} max={5000} min={100} step={100} className="py-4" />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Alcance Est.</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{(config.budget * 15).toLocaleString()}</p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Clicks Est.</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{(config.budget * 0.8).toFixed(0)}</p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">ROI Proyectado</p>
                        <p className="text-lg font-black text-emerald-500">3.5x</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                    <Button onClick={handleGenerate} className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 gap-3">
                      <SparklesIconLucide className="w-6 h-6" /> Generar Campaña Premium
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Tus anuncios están <span className="text-emerald-500">listos</span></h2>
                  <p className="text-gray-500 dark:text-gray-400">Haz clic en cualquier anuncio para verlo en pantalla completa y descargar su kit.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setShowResults(false); setStep(1); }} className="rounded-2xl py-6 px-6 border-gray-200 dark:border-white/10 font-bold">
                    <RefreshCw className="w-4 h-4 mr-2" /> Nueva Campaña
                  </Button>
                </div>
              </div>

              {/* Métricas Wow */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Puntuación de Campaña", value: "94/100", icon: Star, color: "text-yellow-500" },
                  { label: "CTR Proyectado", value: "4.2%", icon: MousePointer, color: "text-emerald-500" },
                  { label: "Impresiones Est.", value: (config.budget * 15).toLocaleString(), icon: Eye, color: "text-blue-500" },
                  { label: "Fuerza del Copy", value: "Excelente", icon: Activity, color: "text-purple-500" }
                ].map((m, i) => (
                  <Card key={i} className="p-6 border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 rounded-3xl shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 ${m.color}`}>
                        <m.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{m.label}</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{m.value}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {generatedAds.map((ad, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    className="group relative cursor-pointer"
                    onClick={() => setSelectedAdForLightbox(ad)}
                  >
                    <div className="absolute -inset-2 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />
                    <div className="relative transform group-hover:scale-[1.02] transition-all duration-500">
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 dark:bg-black/90 p-2 rounded-full shadow-xl">
                          <Maximize2 className="w-5 h-5 text-emerald-500" />
                        </div>
                      </div>
                      {ad.platform === 'google' && <GoogleAdsPreview {...ad} />}
                      {ad.platform === 'meta' && <MetaPreview {...ad} />}
                      {ad.platform === 'tiktok' && <TikTokPreview {...ad} />}
                      {ad.platform === 'linkedin' && <LinkedInPreview {...ad} />}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FlowsightAdsDashboard;
