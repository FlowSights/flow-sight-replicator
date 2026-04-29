import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  BookOpen,
  FileText,
  Sparkles,
  Lock,
  Zap,
} from 'lucide-react';
import { Button } from './ui/button';
import { MetaPreview, GoogleAdsPreview, TikTokPreview, LinkedInPreview } from './PlatformPreviewsNative';
import { platformColors, PlatformIcon, platformNames } from './PlatformIcons';

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

interface AdsResultsShowcaseProps {
  ads: GeneratedAd[];
  businessName: string;
  hasPaid: boolean;
  onViewGuide: (platform: 'meta' | 'google' | 'tiktok' | 'linkedin') => void;
  onDownloadPDF: (platform: 'meta' | 'google' | 'tiktok' | 'linkedin') => void;
  onPublish: (platform: 'meta' | 'google' | 'tiktok' | 'linkedin', url: string) => void;
  onCheckout: () => void;
}

export const AdsResultsShowcase: React.FC<AdsResultsShowcaseProps> = ({
  ads,
  businessName,
  hasPaid,
  onViewGuide,
  onDownloadPDF,
  onPublish,
  onCheckout,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<'meta' | 'google' | 'tiktok' | 'linkedin'>('meta');

  // Agrupar anuncios por plataforma
  const adsByPlatform = ads.reduce((acc, ad) => {
    if (!acc[ad.platform]) {
      acc[ad.platform] = [];
    }
    acc[ad.platform].push(ad);
    return acc;
  }, {} as Record<string, GeneratedAd[]>);

  const platforms = Object.keys(adsByPlatform) as Array<'meta' | 'google' | 'tiktok' | 'linkedin'>;
  const currentAds = adsByPlatform[selectedPlatform] || [];
  const currentAd = currentAds[currentIndex] || currentAds[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % currentAds.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + currentAds.length) % currentAds.length);
  };

  const handlePlatformChange = (platform: 'meta' | 'google' | 'tiktok' | 'linkedin') => {
    setSelectedPlatform(platform);
    setCurrentIndex(0);
  };

  if (!currentAd) {
    return null;
  }

  const colors = platformColors[selectedPlatform];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-8 p-8 rounded-[40px] transition-colors duration-500 ${colors.bg} border-2 ${colors.border}`}
    >
      {/* Selector de Plataformas */}
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => {
          const pColors = platformColors[platform];
          const isSelected = selectedPlatform === platform;
          return (
            <button
              key={platform}
              onClick={() => handlePlatformChange(platform)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 ${
                isSelected
                  ? `bg-gradient-to-r ${pColors.gradient} text-white shadow-lg scale-105`
                  : 'bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              <PlatformIcon platform={platform} size={20} className={isSelected ? 'text-white' : 'text-gray-400'} />
              {platformNames[platform]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Mockup Visual */}
        <div className="relative group">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedPlatform}-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative z-10 flex justify-center"
            >
              {selectedPlatform === 'meta' && <MetaPreview {...currentAd} />}
              {selectedPlatform === 'google' && <GoogleAdsPreview {...currentAd} />}
              {selectedPlatform === 'tiktok' && <TikTokPreview {...currentAd} />}
              {selectedPlatform === 'linkedin' && <LinkedInPreview {...currentAd} />}
            </motion.div>
          </AnimatePresence>

          {/* Controles de Navegación */}
          {currentAds.length > 1 && (
            <div className="absolute inset-y-0 -inset-x-4 flex items-center justify-between pointer-events-none z-20">
              <button
                onClick={handlePrev}
                className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-xl text-gray-800 dark:text-white pointer-events-auto hover:scale-110 transition-transform"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-xl text-gray-800 dark:text-white pointer-events-auto hover:scale-110 transition-transform"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Información y Acciones */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${colors.gradient} text-white text-xs font-black uppercase tracking-widest`}>
                {currentAd.type}
              </div>
              <div className="flex items-center gap-1 text-yellow-500 font-bold">
                <Sparkles className="w-4 h-4 fill-yellow-500" />
                {currentAd.score}/100
              </div>
            </div>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">
              Estrategia de <span className={colors.text}>{platformNames[selectedPlatform]}</span>
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {currentAd.reasoning || "Este anuncio ha sido optimizado por nuestra IA para maximizar el CTR y las conversiones en esta plataforma específica."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={() => onViewGuide(selectedPlatform)}
              variant="outline"
              className="h-16 rounded-2xl border-2 border-gray-200 dark:border-white/10 font-bold text-lg gap-3"
            >
              <BookOpen className="w-5 h-5" /> Guía Visual
            </Button>
            <Button
              onClick={() => onDownloadPDF(selectedPlatform)}
              className={`h-16 rounded-2xl bg-gradient-to-r ${colors.gradient} text-white font-bold text-lg gap-3 shadow-xl`}
            >
              {!hasPaid ? <Lock className="w-5 h-5" /> : <Download className="w-5 h-5" />}
              Descargar Kit
            </Button>
            <Button
              onClick={() => onPublish(selectedPlatform, currentAd.platformUrl)}
              className="h-16 rounded-2xl bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold text-lg gap-3 sm:col-span-2"
            >
              <ExternalLink className="w-5 h-5" /> Publicar en {platformNames[selectedPlatform]}
            </Button>
          </div>

          {!hasPaid && (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Desbloquea tu Campaign Kit</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Obtén acceso completo a todos los activos y guías por solo $49.99</p>
              </div>
              <Button onClick={onCheckout} className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
                Pagar
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
