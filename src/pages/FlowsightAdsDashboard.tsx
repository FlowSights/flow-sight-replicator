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
  TrendingUp, ShieldCheck, Star
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
}

interface CampaignConfig {
  promote: string;
  location: string;
  idealCustomer: string;
  budget: number;
}

const FlowsightAdsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'meta' | 'tiktok' | 'linkedin' | 'google'>('meta');
  
  const [config, setConfig] = useState<CampaignConfig>({
    promote: '',
    location: '',
    idealCustomer: '',
    budget: 100,
  });

  const loadingMessages = [
    'Analizando tu negocio...',
    'Creando tus textos publicitarios...',
    'Diseñando tus visuales...',
    'Preparando tu kit de campaña...'
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/flowsight-ads');
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setLoadingStep(0);
    
    // Simulate loading steps
    for (let i = 0; i < loadingMessages.length; i++) {
      setLoadingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    const ads: GeneratedAd[] = [
      {
        type: 'Offer',
        headline: `¡Oferta Especial en ${config.promote}!`,
        description: `Descubre por qué somos los mejores en ${config.location}. ¡Aprovecha nuestra promoción exclusiva para nuevos clientes!`,
        cta: 'Obtener Oferta',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
        platform: 'google',
        score: 92
      },
      {
        type: 'Emotional',
        headline: `Tu bienestar en ${config.promote} es nuestra prioridad`,
        description: `Entendemos lo que buscas. En ${config.location} estamos listos para ayudarte a lograr tus metas con un servicio humano y profesional.`,
        cta: 'Saber Más',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop',
        platform: 'meta',
        score: 88
      },
      {
        type: 'Urgency',
        headline: `¡Últimos cupos para ${config.promote}!`,
        description: `No te quedes fuera. La demanda en ${config.location} está creciendo. Reserva tu lugar hoy mismo y transforma tu realidad.`,
        cta: 'Reservar Ahora',
        imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop',
        platform: 'tiktok',
        score: 95
      }
    ];

    setGeneratedAds(ads);
    setShowResults(true);
    setIsLoading(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Flowsight Ads - Campaign Kit', 20, 25);
    doc.setFontSize(10);
    doc.text('Tu campaña profesional lista para publicar', 20, 32);

    // Content
    doc.setTextColor(0, 0, 0);
    let y = 55;
    
    doc.setFontSize(16);
    doc.text('Resumen de Estrategia', 20, y);
    y += 10;
    
    doc.setFontSize(11);
    doc.text(`Negocio: ${config.promote}`, 20, y); y += 7;
    doc.text(`Ubicación: ${config.location}`, 20, y); y += 7;
    doc.text(`Cliente Ideal: ${config.idealCustomer}`, 20, y); y += 7;
    doc.text(`Presupuesto Sugerido: $${config.budget}/mes`, 20, y); y += 15;

    generatedAds.forEach((ad, index) => {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text(`Variación ${index + 1}: ${ad.type}`, 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(`Título: ${ad.headline}`, 25, y); y += 6;
      const descLines = doc.splitTextToSize(`Descripción: ${ad.description}`, pageWidth - 50);
      doc.text(descLines, 25, y); y += (descLines.length * 5) + 2;
      doc.text(`Llamada a la acción: ${ad.cta}`, 25, y); y += 12;
    });

    doc.save('Flowsight-Campaign-Kit.pdf');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-emerald-100 dark:border-emerald-900/30 rounded-full"></div>
            <motion.div 
              className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {loadingMessages[loadingStep]}
              </h2>
              <div className="flex justify-center gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${
                      i <= loadingStep ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button onClick={() => setShowResults(false)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Editar datos
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tus anuncios están listos</h2>
            <Button onClick={generatePDF} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Download className="w-4 h-4" />
              Descargar Campaign Kit
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {generatedAds.map((ad, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
              >
                <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-gray-900 rounded-3xl">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                      {ad.type === 'Offer' ? 'Oferta' : ad.type === 'Emotional' ? 'Emocional' : 'Urgencia'}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold">{ad.score}/100</span>
                    </div>
                  </div>
                  
                  <div className="aspect-video relative overflow-hidden">
                    <img src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold shadow-sm">
                      {ad.platform.toUpperCase()} PREVIEW
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                      {ad.headline}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {ad.description}
                    </p>
                    <Button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-all rounded-xl py-6 font-bold">
                      {ad.cta}
                    </Button>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-medium">Alta probabilidad de generar clics</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => navigate('/flowsight-ads')} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`h-1.5 w-8 rounded-full ${s <= step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
              ))}
            </div>
            <Button onClick={handleLogout} variant="ghost" className="text-gray-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 md:py-24">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  Paso 1 de 4
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">¿Qué deseas promocionar?</h1>
                <p className="text-gray-500 dark:text-gray-400">Dinos el nombre de tu negocio o el servicio específico.</p>
              </div>
              <div className="space-y-4">
                <Input 
                  value={config.promote}
                  onChange={(e) => setConfig({...config, promote: e.target.value})}
                  placeholder="Ej: Clínica Dental, Restaurante, Software de Ventas..."
                  className="text-lg py-8 px-6 rounded-2xl border-gray-200 dark:border-gray-800 focus:ring-emerald-500"
                />
                <div className="flex flex-wrap gap-2">
                  {['Inmobiliaria', 'Hotel', 'Servicio de Limpieza', 'Gimnasio'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setConfig({...config, promote: tag})}
                      className="px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <Button 
                disabled={!config.promote}
                onClick={() => setStep(2)}
                className="w-full py-8 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-500/20"
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  Paso 2 de 4
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">¿Dónde se encuentra tu negocio?</h1>
                <p className="text-gray-500 dark:text-gray-400">Esto nos ayuda a segmentar geográficamente tus anuncios.</p>
              </div>
              <div className="relative">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input 
                  value={config.location}
                  onChange={(e) => setConfig({...config, location: e.target.value})}
                  placeholder="Ciudad, País o Región"
                  className="text-lg py-8 pl-16 pr-6 rounded-2xl border-gray-200 dark:border-gray-800 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 py-8 text-lg rounded-2xl">Atrás</Button>
                <Button 
                  disabled={!config.location}
                  onClick={() => setStep(3)}
                  className="flex-[2] py-8 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-500/20"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  Paso 3 de 4
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">¿Quién es tu cliente ideal?</h1>
                <p className="text-gray-500 dark:text-gray-400">Describe brevemente a quién quieres llegar.</p>
              </div>
              <div className="space-y-4">
                <Textarea 
                  value={config.idealCustomer}
                  onChange={(e) => setConfig({...config, idealCustomer: e.target.value})}
                  placeholder="Ej: Familias jóvenes, dueños de negocios, turistas, estudiantes..."
                  className="text-lg py-6 px-6 rounded-2xl border-gray-200 dark:border-gray-800 focus:ring-emerald-500 min-h-[150px]"
                />
                <div className="flex flex-wrap gap-2">
                  {['Familias', 'Turistas', 'Empresarios', 'Estudiantes', 'Propietarios'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setConfig({...config, idealCustomer: tag})}
                      className="px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 py-8 text-lg rounded-2xl">Atrás</Button>
                <Button 
                  disabled={!config.idealCustomer}
                  onClick={() => setStep(4)}
                  className="flex-[2] py-8 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-500/20"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  Paso 4 de 4
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">¿Cuánto deseas invertir?</h1>
                <p className="text-gray-500 dark:text-gray-400">Selecciona tu presupuesto mensual estimado.</p>
              </div>
              
              <div className="space-y-12 py-8">
                <div className="text-center">
                  <span className="text-6xl font-bold text-emerald-600">${config.budget}</span>
                  <span className="text-xl text-gray-400 ml-2">/ mes</span>
                </div>
                <Slider
                  value={[config.budget]}
                  onValueChange={(val) => setConfig({...config, budget: val[0]})}
                  max={2000}
                  min={50}
                  step={50}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-gray-400 font-medium">
                  <span>$50</span>
                  <span>$500</span>
                  <span>$1000</span>
                  <span>$2000</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 py-8 text-lg rounded-2xl">Atrás</Button>
                <Button 
                  onClick={handleGenerate}
                  className="flex-[2] py-8 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-500/20 gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generar Campaña
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
