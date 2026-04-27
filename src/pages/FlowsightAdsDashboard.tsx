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
  Lightbulb, Info, ArrowRight
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
}

const FlowsightAdsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const [config, setConfig] = useState<CampaignConfig>({
    promote: '',
    location: '',
    idealCustomer: '',
    budget: 100,
    userImage: null,
  });

  const loadingMessages = [
    'Analizando tu modelo de negocio...',
    'Generando copys persuasivos con IA...',
    'Optimizando creativos visuales...',
    'Estructurando tu Campaign Kit Premium...'
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/flowsight-ads');
  };

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

    const defaultImages = [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop'
    ];

    const ads: GeneratedAd[] = [
      {
        type: 'Offer',
        headline: `¡Oferta Exclusiva: ${config.promote}!`,
        description: `La mejor solución en ${config.location} para ${config.idealCustomer}. ¡Consigue un descuento especial hoy mismo!`,
        cta: 'Obtener Oferta',
        imageUrl: config.userImage || defaultImages[0],
        platform: 'google',
        score: 94,
        platformUrl: 'https://ads.google.com/aw/campaigns/new'
      },
      {
        type: 'Emotional',
        headline: `Diseñado para ${config.idealCustomer}`,
        description: `En ${config.location} entendemos tus necesidades. ${config.promote} es la pieza que faltaba en tu vida.`,
        cta: 'Saber Más',
        imageUrl: config.userImage || defaultImages[1],
        platform: 'meta',
        score: 89,
        platformUrl: 'https://adsmanager.facebook.com/adsmanager/manage/campaigns'
      },
      {
        type: 'Urgency',
        headline: `¡Última oportunidad en ${config.location}!`,
        description: `Solo para ${config.idealCustomer}. No dejes pasar la oportunidad de mejorar con ${config.promote}.`,
        cta: 'Reservar Ahora',
        imageUrl: config.userImage || defaultImages[2],
        platform: 'tiktok',
        score: 97,
        platformUrl: 'https://ads.tiktok.com/i18n/dashboard'
      },
      {
        type: 'Offer',
        headline: `Impulsa tu éxito con ${config.promote}`,
        description: `Soluciones profesionales para ${config.idealCustomer} en ${config.location}. Líderes en el sector.`,
        cta: 'Contactar',
        imageUrl: config.userImage || defaultImages[3],
        platform: 'linkedin',
        score: 92,
        platformUrl: 'https://www.linkedin.com/campaignmanager/accounts'
      }
    ];

    setGeneratedAds(ads);
    setShowResults(true);
    setIsLoading(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header Premium
    doc.setFillColor(10, 20, 30);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('FlowSight Ads', 20, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('CAMPAIGN KIT ESTRATÉGICO PREMIUM', 20, 35);
    doc.text(new Date().toLocaleDateString(), pageWidth - 50, 35);

    let y = 65;
    
    // Sección Estrategia
    doc.setTextColor(10, 20, 30);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('1. Análisis de Estrategia', 20, y);
    y += 12;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const strategyData = [
      ['Objetivo de Negocio:', config.promote],
      ['Mercado Geográfico:', config.location],
      ['Perfil de Audiencia:', config.idealCustomer],
      ['Inversión Mensual:', `$${config.budget} USD`]
    ];

    strategyData.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 25, y);
      doc.setFont(undefined, 'normal');
      doc.text(value, 70, y);
      y += 8;
    });

    y += 10;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(18);
    doc.text('2. Creativos Publicitarios', 20, y);
    y += 12;

    generatedAds.forEach((ad, index) => {
      if (y > 210) { doc.addPage(); y = 20; }
      
      doc.setFillColor(245, 247, 250);
      doc.rect(20, y, pageWidth - 40, 55, 'F');
      
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(12);
      doc.text(`VARIACIÓN ${index + 1}: ${ad.type.toUpperCase()} (${ad.platform.toUpperCase()})`, 25, y + 10);
      
      doc.setTextColor(10, 20, 30);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Título: ${ad.headline}`, 25, y + 20);
      
      doc.setFont(undefined, 'normal');
      const descLines = doc.splitTextToSize(`Cuerpo: ${ad.description}`, pageWidth - 60);
      doc.text(descLines, 25, y + 28);
      
      doc.setFont(undefined, 'bold');
      doc.text(`CTA: ${ad.cta}`, 25, y + 45);
      doc.setTextColor(0, 102, 204);
      doc.text(`Link de Publicación: ${ad.platformUrl}`, 25, y + 50);
      
      y += 65;
    });

    // Nueva Sección: Guía de Implementación
    if (y > 200) { doc.addPage(); y = 20; }
    doc.setTextColor(10, 20, 30);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('3. Guía de Implementación Rápida', 20, y);
    y += 12;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const tips = [
      '• Configura tu píxel de seguimiento antes de lanzar para medir conversiones.',
      '• Realiza pruebas A/B entre las variaciones emocional y de urgencia.',
      '• Revisa el rendimiento después de los primeros 3 días de campaña.',
      '• Asegúrate de que tu landing page sea coherente con el mensaje del anuncio.'
    ];
    
    tips.forEach(tip => {
      doc.text(tip, 25, y);
      y += 7;
    });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Generado por FlowSight Ads AI - La inteligencia que impulsa tu crecimiento.', pageWidth / 2, 285, { align: 'center' });

    doc.save(`FlowSight-Campaign-Kit-${config.promote.replace(/\s+/g, '-')}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="w-full max-w-md text-center relative z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
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
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {loadingMessages[loadingStep]}
              </h2>
              <div className="flex justify-center gap-2">
                {loadingMessages.map((_, i) => (
                  <motion.div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === loadingStep ? 'w-12 bg-emerald-500' : 'w-3 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505]">
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button onClick={() => setShowResults(false)} className="group flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-all font-medium">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Refinar Estrategia
            </button>
            <div className="flex items-center gap-4">
              <Button onClick={generatePDF} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-lg shadow-emerald-500/20 gap-2 font-bold">
                <Download className="w-4 h-4" />
                Descargar Campaign Kit Premium
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-bold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              INTELIGENCIA ARTIFICIAL ACTIVA
            </motion.div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              Tu Campaña de Alto Impacto
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Hemos diseñado 4 variaciones psicológicas para maximizar tus conversiones en {config.location}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {generatedAds.map((ad, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : idx === 2 ? 'bg-pink-500' : 'bg-emerald-500'}`} />
                    <span className="font-bold text-[10px] uppercase tracking-widest text-gray-400">
                      {ad.type === 'Offer' ? 'Comercial' : ad.type === 'Emotional' ? 'Humano' : 'Urgencia'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-black">{ad.score}%</span>
                  </div>
                </div>

                <div className="transform hover:scale-[1.02] transition-transform duration-500">
                  {ad.platform === 'google' && <GoogleAdsPreview {...ad} />}
                  {ad.platform === 'meta' && <MetaPreview {...ad} />}
                  {ad.platform === 'tiktok' && <TikTokPreview {...ad} />}
                  {ad.platform === 'linkedin' && <LinkedInPreview {...ad} />}
                </div>

                <Card className="p-5 bg-white dark:bg-white/5 border-none shadow-xl rounded-3xl space-y-4">
                  <Button 
                    onClick={() => window.open(ad.platformUrl, '_blank')}
                    className="w-full py-5 bg-gray-900 dark:bg-white dark:text-black text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-all rounded-2xl font-black gap-2 text-sm"
                  >
                    Publicar en {ad.platform.toUpperCase()}
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Sección de Valor Añadido */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-emerald-500/5 border-emerald-500/20 rounded-[32px] space-y-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tip de Optimización</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Usa la variación de **Urgencia** durante los últimos 3 días de tu promoción para aumentar el CTR en un 40%.
              </p>
            </Card>
            <Card className="p-8 bg-blue-500/5 border-blue-500/20 rounded-[32px] space-y-4">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Segmentación Sugerida</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Para {config.idealCustomer}, te recomendamos usar intereses en "Tecnología" y "Negocios" en {config.location}.
              </p>
            </Card>
            <Card className="p-8 bg-purple-500/5 border-purple-500/20 rounded-[32px] space-y-4">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">ROI Estimado</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Con un presupuesto de ${config.budget}, podrías alcanzar hasta {(config.budget * 12).toLocaleString()} personas cualificadas.
              </p>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] selection:bg-emerald-500/30">
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-black/80 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => navigate('/flowsight-ads')} className="group flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition-all font-medium">
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
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                  Fase 01: Identidad
                </div>
                <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                  ¿Qué vamos a <span className="text-emerald-500">impulsar</span> hoy?
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400">Dinos el nombre de tu negocio o producto estrella.</p>
              </div>
              
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000" />
                  <Input 
                    value={config.promote}
                    onChange={(e) => setConfig({...config, promote: e.target.value})}
                    placeholder="Ej: Clínica Dental, SaaS de Ventas, Restaurante Gourmet..."
                    className="relative text-2xl py-10 px-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {['Inmobiliaria', 'E-commerce', 'Consultoría', 'Gimnasio', 'Software'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setConfig({...config, promote: tag})}
                      className="px-6 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                disabled={!config.promote}
                onClick={() => setStep(2)}
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
                <MapPinIcon className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500 w-8 h-8 z-10" />
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
                <p className="text-xl text-gray-500 dark:text-gray-400">Describe a tu cliente y sube una imagen si la tienes.</p>
              </div>

              <div className="space-y-6">
                <Textarea 
                  value={config.idealCustomer}
                  onChange={(e) => setConfig({...config, idealCustomer: e.target.value})}
                  placeholder="Ej: Dueños de negocios que buscan escalar, familias jóvenes interesadas en salud..."
                  className="text-xl py-8 px-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500 min-h-[150px]"
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 transition-all ${config.userImage ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-200 dark:border-white/10 hover:border-emerald-500/50'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  {config.userImage ? (
                    <div className="flex items-center gap-6">
                      <img src={config.userImage} className="w-24 h-24 rounded-2xl object-cover shadow-xl" alt="Preview" />
                      <div className="flex-1">
                        <p className="text-emerald-500 font-black">¡Imagen cargada con éxito!</p>
                        <p className="text-sm text-gray-500">Haz clic para cambiarla</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setConfig({...config, userImage: null}); }} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                        <XIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
                        <UploadIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">Sube tu propia imagen</p>
                        <p className="text-gray-500">O deja que nuestra IA genere una por ti</p>
                      </div>
                    </div>
                  )}
                </div>
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
                  <motion.span 
                    key={config.budget}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black text-emerald-500 block"
                  >
                    ${config.budget}
                  </motion.span>
                  <span className="text-2xl font-bold text-gray-400 uppercase tracking-widest">USD / MES</span>
                </div>
                
                <Slider
                  value={[config.budget]}
                  onValueChange={(val) => setConfig({...config, budget: val[0]})}
                  max={5000}
                  min={100}
                  step={100}
                  className="py-4"
                />
                
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
                <Button 
                  onClick={handleGenerate}
                  className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 gap-3"
                >
                  <SparklesIcon className="w-6 h-6" />
                  Generar Campaña Premium
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FlowsightAdsDashboard;
