import { PromoImage } from './PromoImage';

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
  meta: { bg: 'from-blue-600 to-blue-700', text: 'text-blue-600', accent: 'bg-blue-600', gradient: 'from-[#0668E1] to-[#0047AB]' },
  google: { bg: 'from-red-500 to-yellow-500', text: 'text-red-500', accent: 'bg-red-500', gradient: 'from-[#4285F4] via-[#EA4335] to-[#FBBC05]' },
  tiktok: { bg: 'from-gray-900 to-black', text: 'text-[#FE2C55]', accent: 'bg-[#FE2C55]', gradient: 'from-black via-[#121212] to-[#FE2C55]' },
  linkedin: { bg: 'from-blue-700 to-blue-800', text: 'text-blue-700', accent: 'bg-[#0077B5]', gradient: 'from-[#0077B5] to-[#004182]' },
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

  if (!isOpen) return null;

  const currentAd = ads?.[currentIndex];
  const colors = platformColors[platform];

  if (!currentAd || !colors) return null;

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
            className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 sm:p-8"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white dark:bg-[#080808] rounded-[48px] shadow-[0_0_120px_rgba(0,0,0,0.8)] max-w-7xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Premium con Gradiente Dinámico */}
              <div className={`bg-gradient-to-r ${colors.gradient} p-8 lg:p-10 flex justify-between items-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 text-9xl opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                  <Sparkles size={160} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1 bg-white/20 rounded-lg backdrop-blur-md">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">Vista Previa Premium</span>
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{businessName}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-[24px] transition-all active:scale-90 backdrop-blur-xl border border-white/20 shadow-xl"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Contenido Principal */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#080808]">
                <div className="p-8 lg:p-16 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-24 items-center">
                  
                  {/* Columna Izquierda: Mockup Optmizado */}
                  <div className="space-y-8">
                    <div className="relative group rounded-[40px] overflow-hidden bg-white/[0.02] p-8 md:p-12 border border-white/5 shadow-inner">
                      <motion.div
                        className="w-full origin-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {/* Mockups por Plataforma con PromoImage para Soporte de Video e IA Margins */}
                        <div className={`bg-white dark:bg-[#0c0c0c] rounded-[36px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 mx-auto ${platform === 'tiktok' ? 'max-w-[340px]' : 'w-full'}`}>
                          
                          {platform === 'meta' && (
                            <div className="p-5 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-[#0668E1] rounded-full flex items-center justify-center text-white font-black text-lg">
                                  {businessName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-black text-[15px] dark:text-white leading-tight">{businessName}</p>
                                  <div className="flex items-center gap-1">
                                    <p className="text-[11px] text-gray-400 font-bold">Publicidad</p>
                                    <span className="text-gray-600 text-[10px]">•</span>
                                    <Sparkles className="w-3 h-3 text-emerald-500" />
                                  </div>
                                </div>
                              </div>
                              <p className="text-[14px] dark:text-gray-200 leading-relaxed font-medium">{currentAd.description}</p>
                              <div className="rounded-2xl overflow-hidden shadow-lg border border-white/5">
                                <PromoImage src={currentAd.imageUrl} platform="meta" />
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-white/5 bg-white/[0.02] -mx-5 px-5 -mb-5 py-4">
                                <div className="flex-1 pr-4">
                                  <p className="text-[12px] font-black dark:text-white uppercase truncate tracking-tight">{currentAd.headline}</p>
                                  <p className="text-[10px] text-gray-500 font-bold truncate mt-0.5">{currentAd.websiteUrl}</p>
                                </div>
                                <button className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest dark:text-white transition-all border border-white/10">{currentAd.cta}</button>
                              </div>
                            </div>
                          )}

                          {platform === 'google' && (
                            <div className="p-8 space-y-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                  <div className="w-5 h-5 bg-[#4285F4] rounded-sm" />
                                </div>
                                <div>
                                  <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Patrocinado</span>
                                  <p className="text-[11px] text-gray-500 font-bold">{currentAd.websiteUrl}</p>
                                </div>
                              </div>
                              <div className="flex gap-6 items-start">
                                <div className="flex-1 space-y-2">
                                  <h3 className="text-2xl font-bold text-[#8ab4f8] leading-tight hover:underline cursor-pointer">{currentAd.headline}</h3>
                                  <p className="text-[15px] text-gray-400 leading-relaxed font-medium">{currentAd.description}</p>
                                </div>
                                <div className="w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                                  <PromoImage src={currentAd.imageUrl} platform="google" />
                                </div>
                              </div>
                            </div>
                          )}

                          {platform === 'tiktok' && (
                            <div className="relative aspect-[9/16] bg-black text-white">
                              <PromoImage src={currentAd.imageUrl} platform="tiktok" className="absolute inset-0 opacity-90" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                              <div className="absolute bottom-0 left-0 p-6 w-full space-y-4">
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-[15px] tracking-tight">@{businessName.toLowerCase().replace(/\s/g, '')}</p>
                                  <Badge className="bg-white/20 text-[9px] h-4">Publicidad</Badge>
                                </div>
                                <p className="text-[13px] leading-snug font-medium line-clamp-3">{currentAd.description}</p>
                                <div className={`py-4 rounded-xl text-center font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl ${colors.accent}`}>{currentAd.cta}</div>
                              </div>
                              <div className="absolute right-4 bottom-32 flex flex-col items-center gap-8">
                                <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black shadow-xl">
                                  {businessName.charAt(0)}
                                </div>
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                                    <Sparkles className="w-5 h-5 text-white fill-white" />
                                  </div>
                                  <span className="text-[11px] font-black">24.5K</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                                    <Maximize2 className="w-5 h-5 text-white" />
                                  </div>
                                  <span className="text-[11px] font-black">1,203</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {platform === 'linkedin' && (
                            <div className="p-7 space-y-5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-14 h-14 bg-[#0077B5] rounded flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">in</div>
                                  <div>
                                    <p className="font-black text-[16px] dark:text-white leading-tight">{businessName}</p>
                                    <p className="text-[11px] text-gray-500 font-bold mt-0.5">Promocionado</p>
                                  </div>
                                </div>
                                <X size={20} className="text-gray-600" />
                              </div>
                              <p className="text-[14px] dark:text-gray-300 leading-relaxed font-medium">{currentAd.description}</p>
                              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                                <PromoImage src={currentAd.imageUrl} platform="linkedin" />
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <p className="text-[15px] font-black dark:text-white tracking-tight">{currentAd.headline}</p>
                                <button className="border-2 border-[#0077B5] text-[#0077B5] dark:text-[#0077B5] dark:border-[#0077B5] px-6 py-2 rounded-full text-[13px] font-black uppercase tracking-widest hover:bg-blue-500/10 transition-all">{currentAd.cta}</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>

                    {/* Navegación Variante */}
                    <div className="flex items-center justify-between gap-6 px-4">
                      <button
                        onClick={onPrevious}
                        className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-90 group"
                      >
                        <ChevronLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
                      </button>
                      <div className="flex-1 py-4 bg-white/5 rounded-2xl border border-white/5 text-center backdrop-blur-md">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-500 mb-1">Estrategia Activa</p>
                        <p className="text-lg font-black text-white">Variante {currentIndex + 1} de {ads.length}</p>
                      </div>
                      <button
                        onClick={onNext}
                        className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-90 group"
                      >
                        <ChevronRight size={24} className="text-white group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Columna Derecha: Contenido y Acciones */}
                  <div className="space-y-12">
                    <div className="space-y-10">
                      <div className="flex items-center gap-4">
                        <Badge className={`px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl ${colors.accent} text-white border-none`}>
                          {platform} Campaign
                        </Badge>
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                          <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-black text-yellow-500 tracking-wider">{currentAd.score}/100 SCORE</span>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">Titular del Anuncio</label>
                          <p className="text-2xl font-black text-white tracking-tight leading-tight">{currentAd.headline}</p>
                        </div>
                        <div>
                          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">Descripción (Ad Copy)</label>
                          <p className="text-lg text-gray-400 font-medium leading-relaxed">{currentAd.description}</p>
                        </div>
                        <div>
                          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">Llamada a la Acción (CTA)</label>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 font-black text-white uppercase tracking-widest text-xs">
                            {currentAd.cta}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sistema de Botones Premium con Colores de Plataforma */}
                    <div className="space-y-4 pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleActionClick('guide')}
                          className="py-5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 font-black text-[11px] uppercase tracking-widest text-gray-300 hover:text-white transition-all flex items-center justify-center gap-3 backdrop-blur-md shadow-xl"
                        >
                          <BookOpen size={18} />
                          Guía Visual
                        </button>
                        <button
                          onClick={() => handleActionClick('download')}
                          className="py-5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 font-black text-[11px] uppercase tracking-widest text-gray-300 hover:text-white transition-all flex items-center justify-center gap-3 backdrop-blur-md shadow-xl"
                        >
                          <Download size={18} />
                          Descargar Kit
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleActionClick('publish')}
                        className={`w-full py-7 px-8 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 relative overflow-hidden shadow-2xl group ${
                          hasPaid
                            ? `bg-gradient-to-r ${colors.gradient} text-white border border-white/20`
                            : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                        }`}
                      >
                        {hasPaid && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
                        Publicar en {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales Relacionados */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          action={paymentAction}
        />
      )}
      {showGuideModal && (
        <VisualGuideLightbox
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
          platform={platform}
        />
      )}
    </>
  );
};
