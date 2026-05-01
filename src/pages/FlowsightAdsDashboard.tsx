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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isGuideLightboxOpen, setIsGuideLightboxOpen] = useState(false);
  const [mockupLightboxOpen, setMockupLightboxOpen] = useState(false);
  const [currentMockupAdIndex, setCurrentMockupAdIndex] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<"google" | "meta" | "tiktok" | "linkedin">("meta");

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/flowsight-ads');
    };
    checkUser();
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setConfig({ ...config, userImage: event.target?.result as string });
      reader.readAsDataURL(file);
    }
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
      
      setTimeout(() => {
        setGeneratedAds(ads);
        setShowResults(true);
        setIsLoading(false);
        toast({ title: '✨ Estrategia Maestra Lista' });
      }, 500);
    } catch (error: any) {
      setIsLoading(false);
      toast({ title: 'Error al generar anuncios', variant: 'destructive' });
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
    } else {
      setShowPaymentModal(true);
    }
  };

  const currentTheme = platformThemes[selectedPlatform];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      <PremiumLoadingScreen isVisible={isLoading} progress={loadingProgress} />
      
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-black/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight">Flowsight <span className="text-emerald-500">Ads</span></h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-gray-400 hover:text-white font-bold gap-2">
            <LogOut className="w-4 h-4" /> Salir
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Crea tu campaña <span className="text-emerald-500">maestra</span></h2>
                <p className="text-gray-400 text-lg font-medium">Configuración paso a paso para tu estrategia de alto rendimiento.</p>
                
                {/* Stepper Visual */}
                <div className="flex justify-center items-center gap-3 mt-8">
                  {[1, 2, 3, 4].map((s) => (
                    <div 
                      key={s} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        s === step ? 'w-12 bg-emerald-500' : s < step ? 'w-6 bg-emerald-500/40' : 'w-6 bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
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
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
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
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
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
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 bg-white/5 p-8 rounded-[32px] border border-white/5">
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
                <div className="bg-[#0A0A0A] rounded-[46px] p-8 lg:p-14 relative overflow-hidden">
                  {/* Subtle Background Glow */}
                  <div 
                    className="absolute -top-40 -right-40 w-[600px] h-[600px] blur-[150px] rounded-full opacity-30 transition-all duration-1000"
                    style={{ background: currentTheme.primary }}
                  />
                  
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
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                            isSelected ? 'bg-white scale-110' : 'bg-white/10 group-hover:bg-white/20'
                          }`}>
                            <PlatformIcon platform={platform} size={32} />
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
                          <div className="bg-[#111] rounded-[40px] p-6 border border-white/10 shadow-3xl backdrop-blur-xl relative">
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
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setCurrentMockupAdIndex(generatedAds.indexOf(ad)); setMockupLightboxOpen(true); }}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 hover:bg-emerald-400 transition-colors"
                          >
                            <ZoomIn className="w-3.5 h-3.5" /> Expandir Vista
                          </motion.button>
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
                            <h3 className="text-5xl font-black tracking-tighter leading-[1.1]">Estrategia de <span className={currentTheme.text}>{platformNames[selectedPlatform]}</span></h3>
                            <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-lg">Copy de alto impacto diseñado para romper el scroll y maximizar el CTR.</p>
                          </div>

                          {/* PREMIUM BUTTON SYSTEM */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <motion.button
                              whileHover={{ y: -2, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setIsGuideLightboxOpen(true)}
                              className="py-7 rounded-[24px] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all text-gray-300"
                            >
                              <BookOpen className="w-5 h-5" /> Guía Visual
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ y: -2, scale: 1.02, boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.3)' }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleDownloadMasterKit}
                              className="py-7 rounded-[24px] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black transition-all"
                            >
                              <Download className="w-5 h-5" /> Descargar Kit
                            </motion.button>

                            <motion.button 
                              whileHover={{ y: -2, scale: 1.01, boxShadow: `0 25px 50px -12px ${currentTheme.glow}` }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => {
                                const urls: Record<string, string> = {
                                  meta: 'https://adsmanager.facebook.com',
                                  google: 'https://ads.google.com',
                                  tiktok: 'https://ads.tiktok.com',
                                  linkedin: 'https://www.linkedin.com/campaignmanager'
                                };
                                window.open(urls[selectedPlatform], '_blank');
                              }}
                              className={`sm:col-span-2 py-8 rounded-[28px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 text-white transition-all shadow-2xl ${currentTheme.button}`}
                            >
                              <Share2 className="w-5 h-5" /> Publicar en {platformNames[selectedPlatform]}
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
    </div>
  );
};

export default FlowsightAdsDashboard;
