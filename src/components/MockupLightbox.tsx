import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, BookOpen, Maximize2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentModal } from '@/components/PaymentModal';
import { VisualGuideLightbox } from '@/components/VisualGuideLightbox';
import { GeneratedAd } from '@/types/ads';

interface MockupLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  ads: GeneratedAd[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin';
  businessName: string;
  hasPaid: boolean;
  onPaymentRequired: () => void;
}

const platformColors: Record<string, { bg: string; text: string; accent: string; gradient: string }> = {
  meta: { bg: 'from-blue-600 to-blue-700', text: 'text-blue-600', accent: 'bg-blue-600', gradient: 'from-blue-500 to-blue-600' },
  google: { bg: 'from-red-500 to-yellow-500', text: 'text-red-500', accent: 'bg-red-500', gradient: 'from-red-500 via-yellow-500 to-blue-500' },
  tiktok: { bg: 'from-gray-900 to-black', text: 'text-black', accent: 'bg-black', gradient: 'from-black via-gray-900 to-pink-500' },
  linkedin: { bg: 'from-blue-700 to-blue-800', text: 'text-blue-700', accent: 'bg-blue-700', gradient: 'from-blue-600 to-blue-800' },
};

export const MockupLightbox: React.FC<MockupLightboxProps> = ({
  isOpen,
  onClose,
  ads,
  currentIndex,
  onPrevious,
  onNext,
  platform,
  businessName,
  hasPaid,
  onPaymentRequired,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [paymentAction, setPaymentAction] = useState<'download' | 'publish' | 'guide'>('download');
  const [isZoomed, setIsZoomed] = useState(false);

  const currentAd = ads[currentIndex];
  const colors = platformColors[platform];

  if (!currentAd) return null;

  const handleActionClick = (action: 'download' | 'publish' | 'guide') => {
    if (!hasPaid) {
      setPaymentAction(action);
      setShowPaymentModal(true);
      return;
    }

    if (action === 'guide') {
      setShowGuideModal(true);
    } else if (action === 'publish') {
      const platformUrls: Record<string, string> = {
        meta: 'https://adsmanager.facebook.com/adsmanager/manage/campaigns',
        google: 'https://ads.google.com/aw/campaigns/new',
        tiktok: 'https://ads.tiktok.com/i18n/dashboard',
        linkedin: 'https://www.linkedin.com/campaignmanager/accounts',
      };
      window.open(platformUrls[platform], '_blank');
    } else if (action === 'download') {
      onPaymentRequired();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-8"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0A0A0A] rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Premium */}
              <div className={`bg-gradient-to-r ${colors.gradient} p-8 flex justify-between items-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 text-9xl opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                  <Sparkles size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-white/80" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Vista Previa Premium</span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">{businessName}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl transition-all active:scale-95 backdrop-blur-md border border-white/10"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenido Scrollable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  
                  {/* Columna Izquierda: Mockup con Zoom */}
                  <div className="space-y-6">
                    <div 
                      className={`relative group cursor-zoom-in rounded-[32px] overflow-hidden transition-all duration-500 ${isZoomed ? 'fixed inset-4 z-[60] bg-black/90 p-4 sm:p-12 flex items-center justify-center cursor-zoom-out' : 'bg-gray-50 dark:bg-white/[0.03] p-8 border border-gray-100 dark:border-white/5'}`}
                      onClick={() => setIsZoomed(!isZoomed)}
                    >
                      <motion.div 
                        layout
                        className={`${isZoomed ? 'max-w-4xl w-full h-full flex items-center justify-center' : 'w-full'}`}
                      >
                        {/* El Mockup Real */}
                        <div className={`bg-white dark:bg-[#111] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 mx-auto ${platform === 'tiktok' ? 'max-w-[320px]' : 'w-full'}`}>
                          {/* Simulación de anuncio */}
                          {platform === 'meta' && (
                            <div className="p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">F</div>
                                <div>
                                  <p className="font-bold text-sm dark:text-white">{businessName}</p>
                                  <p className="text-[10px] text-gray-500">Publicidad</p>
                                </div>
                              </div>
                              <p className="text-xs dark:text-gray-300 leading-relaxed">{currentAd.description}</p>
                              <div className="aspect-[1.91/1] bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                                <img src={currentAd.imageUrl} alt="Ad" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t dark:border-white/5">
                                <div className="flex-1">
                                  <p className="text-[10px] font-bold dark:text-white uppercase truncate">{currentAd.headline}</p>
                                  <p className="text-[9px] text-gray-500 truncate">{currentAd.websiteUrl}</p>
                                </div>
                                <button className="bg-gray-100 dark:bg-white/10 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider dark:text-white">{currentAd.cta}</button>
                              </div>
                            </div>
                          )}

                          {platform === 'google' && (
                            <div className="p-6 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Patrocinado</span>
                                <span className="text-[10px] text-gray-400">• {currentAd.websiteUrl}</span>
                              </div>
                              <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{currentAd.headline}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{currentAd.description}</p>
                            </div>
                          )}

                          {platform === 'tiktok' && (
                            <div className="relative aspect-[9/16] bg-black text-white">
                              <img src={currentAd.imageUrl} alt="TikTok" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                              <div className="absolute bottom-0 left-0 p-4 w-full space-y-3">
                                <p className="font-bold text-sm">@{businessName.toLowerCase().replace(/\s/g, '')}</p>
                                <p className="text-xs line-clamp-3">{currentAd.description}</p>
                                <div className="bg-pink-500 py-3 rounded-lg text-center font-black text-xs uppercase tracking-widest">{currentAd.cta}</div>
                              </div>
                              <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-500" />
                                <div className="flex flex-col items-center gap-1"><div className="w-6 h-6 bg-white/20 rounded-full" /><span className="text-[10px]">24.5K</span></div>
                                <div className="flex flex-col items-center gap-1"><div className="w-6 h-6 bg-white/20 rounded-full" /><span className="text-[10px]">1,203</span></div>
                                <div className="flex flex-col items-center gap-1"><div className="w-6 h-6 bg-white/20 rounded-full" /><span className="text-[10px]">856</span></div>
                              </div>
                            </div>
                          )}

                          {platform === 'linkedin' && (
                            <div className="p-5 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-700 rounded flex items-center justify-center text-white font-bold">in</div>
                                <div>
                                  <p className="font-bold text-sm dark:text-white">{businessName}</p>
                                  <p className="text-[10px] text-gray-500">Promocionado</p>
                                </div>
                              </div>
                              <p className="text-xs dark:text-gray-300 leading-relaxed">{currentAd.description}</p>
                              <div className="aspect-[1.91/1] bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden border dark:border-white/5">
                                <img src={currentAd.imageUrl} alt="Ad" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-bold dark:text-white">{currentAd.headline}</p>
                                <button className="border-2 border-blue-700 text-blue-700 dark:text-blue-400 dark:border-blue-400 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-50 transition-colors">{currentAd.cta}</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                      
                      {!isZoomed && (
                        <div className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={16} />
                        </div>
                      )}
                    </div>
                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Haz clic en el mockup para ampliar (Zoom Inmersivo)</p>
                  </div>

                  {/* Columna Derecha: Detalles Premium */}
                  <div className="space-y-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Estrategia</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">{currentAd.type}</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Calidad</p>
                        <p className="text-xl font-black text-emerald-500">{currentAd.score}%</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Análisis del Copy</h4>
                      <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Sparkles className="text-emerald-500" size={40} />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed relative z-10">
                          {currentAd.reasoning || "Este copy ha sido optimizado utilizando principios de psicología de ventas y urgencia para maximizar el CTR en la plataforma seleccionada."}
                        </p>
                      </div>
                    </div>

                    {/* Acciones Finales */}
                    <div className="space-y-4 pt-6 border-t dark:border-white/5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button
                          onClick={() => handleActionClick('guide')}
                          variant="outline"
                          className="py-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 border-gray-100 dark:border-white/5"
                        >
                          <BookOpen size={16} /> Guía
                        </Button>
                        <Button
                          onClick={() => handleActionClick('publish')}
                          className={`py-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 text-white bg-gradient-to-r ${colors.gradient} shadow-xl shadow-emerald-500/10`}
                        >
                          <Share2 size={16} /> Publicar
                        </Button>
                        <Button
                          onClick={() => handleActionClick('download')}
                          className="py-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Download size={16} /> Kit
                        </Button>
                      </div>
                      {!hasPaid && (
                        <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-wider">
                          Desbloquea el Campaign Kit completo con acceso Premium
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navegador Inferior */}
              {ads.length > 1 && (
                <div className="p-6 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <button onClick={onPrevious} className="p-4 hover:bg-gray-200 dark:hover:bg-white/5 rounded-2xl transition-all active:scale-90">
                    <ChevronLeft size={24} className="dark:text-white" />
                  </button>
                  <div className="flex gap-2">
                    {ads.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-gray-300 dark:bg-white/10'}`} />
                    ))}
                  </div>
                  <button onClick={onNext} className="p-4 hover:bg-gray-200 dark:hover:bg-white/5 rounded-2xl transition-all active:scale-90">
                    <ChevronRight size={24} className="dark:text-white" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales adicionales */}
      <VisualGuideLightbox
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        platform={platform}
      />
    </>
  );
};
