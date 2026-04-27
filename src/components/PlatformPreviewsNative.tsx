import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Send, Bookmark, MoreHorizontal, Globe, Search, MoreVertical, ThumbsUp, MessageSquare, Repeat2 } from 'lucide-react';

interface PreviewProps {
  headline: string;
  description: string;
  cta: string;
  imageUrl?: string;
  platform: 'meta' | 'tiktok' | 'linkedin' | 'google';
}

export const MetaPreview: React.FC<PreviewProps> = ({ headline, description, cta, imageUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#242526] rounded-xl shadow-2xl overflow-hidden max-w-[400px] mx-auto border border-gray-200 dark:border-gray-800"
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">F</div>
          <div>
            <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">FlowSights</p>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <p className="text-[12px]">Publicidad</p>
              <span>•</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>
        <MoreHorizontal className="text-gray-500 w-5 h-5" />
      </div>

      {/* Description */}
      <div className="px-3 pb-3">
        <p className="text-[14px] text-gray-900 dark:text-gray-200 leading-normal">{description}</p>
      </div>

      {/* Image */}
      <div className="relative aspect-[1.91/1] bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          <img src={imageUrl} alt="Ad" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="w-12 h-12 opacity-20" />
          </div>
        )}
      </div>

      {/* CTA Bar */}
      <div className="bg-[#f0f2f5] dark:bg-[#3a3b3c] p-3 flex justify-between items-center">
        <div className="flex-1 pr-4">
          <p className="text-[12px] text-gray-500 dark:text-gray-400 uppercase">FLOWSIGHTS.COM</p>
          <p className="text-[16px] font-bold text-gray-900 dark:text-white truncate">{headline}</p>
        </div>
        <button className="bg-[#e4e6eb] dark:bg-[#4e4f50] hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg text-[14px] transition-colors whitespace-nowrap">
          {cta}
        </button>
      </div>

      {/* Interactions */}
      <div className="px-3 py-2 flex justify-between border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <ThumbsUp className="w-5 h-5 text-gray-500" />
          <MessageSquare className="w-5 h-5 text-gray-500" />
          <Share2 className="w-5 h-5 text-gray-500" />
        </div>
      </div>
    </motion.div>
  );
};

export const GoogleAdsPreview: React.FC<PreviewProps> = ({ headline, description, cta, imageUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl overflow-hidden max-w-[600px] mx-auto border border-gray-200 dark:border-gray-800 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-full px-4 flex items-center">
          <span className="text-sm text-gray-400">google.com/search?q=mi+negocio</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-gray-900 dark:text-white">Patrocinado</span>
          <span className="text-[12px] text-gray-500">• flowsights.com</span>
          <MoreVertical className="w-3 h-3 text-gray-500 ml-auto" />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 className="text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight mb-1">
              {headline}
            </h3>
            <p className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed">
              {description}
            </p>
          </div>
          {imageUrl && (
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
              <img src={imageUrl} alt="Ad" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="pt-3 flex gap-6">
          <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-[14px] font-medium hover:underline cursor-pointer">
            {cta}
          </div>
          <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-[14px] font-medium hover:underline cursor-pointer">
            Ver Precios
          </div>
          <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-[14px] font-medium hover:underline cursor-pointer">
            Contacto
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const TikTokPreview: React.FC<PreviewProps> = ({ headline, description, cta, imageUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black rounded-[32px] shadow-2xl overflow-hidden max-w-[320px] mx-auto aspect-[9/16] relative border-[8px] border-gray-800"
    >
      {imageUrl && (
        <img src={imageUrl} alt="TikTok Ad" className="w-full h-full object-cover opacity-80" />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* UI Overlay */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <div className="flex items-end justify-between mb-4">
          <div className="flex-1 pr-12">
            <p className="text-white font-bold mb-1">@FlowSights</p>
            <p className="text-white text-[13px] line-clamp-3 mb-3">{description}</p>
            <div className="flex items-center gap-2 text-white text-[13px] font-medium">
              <span className="bg-white/20 backdrop-blur px-2 py-0.5 rounded">Ad</span>
              <span className="truncate">{headline}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 items-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white font-bold">F</div>
            <div className="flex flex-col items-center">
              <Heart className="w-8 h-8 text-white fill-white" />
              <span className="text-white text-[12px] font-medium">24.5K</span>
            </div>
            <div className="flex flex-col items-center">
              <MessageCircle className="w-8 h-8 text-white fill-white" />
              <span className="text-white text-[12px] font-medium">1,203</span>
            </div>
            <div className="flex flex-col items-center">
              <Share2 className="w-8 h-8 text-white fill-white" />
              <span className="text-white text-[12px] font-medium">856</span>
            </div>
          </div>
        </div>

        <button className="w-full bg-[#fe2c55] hover:bg-[#ef2950] text-white font-bold py-3 rounded-lg text-[15px] transition-colors shadow-lg">
          {cta}
        </button>
      </div>
    </motion.div>
  );
};

export const LinkedInPreview: React.FC<PreviewProps> = ({ headline, description, cta, imageUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1b1f23] rounded-xl shadow-2xl overflow-hidden max-w-[450px] mx-auto border border-gray-200 dark:border-gray-800"
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xl">F</div>
          <div>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">FlowSights</p>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">1,234 seguidores</p>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <p className="text-[12px]">Promocionado</p>
            </div>
          </div>
        </div>
        <MoreHorizontal className="text-gray-500 w-5 h-5" />
      </div>

      <div className="px-3 pb-3">
        <p className="text-[14px] text-gray-900 dark:text-gray-200 leading-normal">{description}</p>
      </div>

      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
        {imageUrl && <img src={imageUrl} alt="Ad" className="w-full h-full object-cover" />}
      </div>

      <div className="p-3 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
        <div className="flex-1 pr-4">
          <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate">{headline}</p>
        </div>
        <button className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold py-1.5 px-4 rounded-full text-[14px] transition-colors">
          {cta}
        </button>
      </div>

      <div className="px-3 py-2 flex gap-6 text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded cursor-pointer">
          <ThumbsUp className="w-5 h-5" />
          <span className="text-[12px] font-bold">Recomendar</span>
        </div>
        <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded cursor-pointer">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[12px] font-bold">Comentar</span>
        </div>
        <div className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded cursor-pointer">
          <Repeat2 className="w-5 h-5" />
          <span className="text-[12px] font-bold">Compartir</span>
        </div>
      </div>
    </motion.div>
  );
};

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
