import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Check, X } from 'lucide-react';
import { MetaPreview, GoogleAdsPreview, TikTokPreview, LinkedInPreview } from './PlatformPreviewsNative';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface EditablePlatformPreviewProps {
  ad: {
    headline: string;
    description: string;
    cta: string;
    imageUrl?: string;
    businessName?: string;
    websiteUrl?: string;
  };
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin';
  onUpdate?: (updates: { headline: string; description: string; cta: string }) => void;
}

export const EditablePlatformPreview: React.FC<EditablePlatformPreviewProps> = ({
  ad,
  platform,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [headline, setHeadline] = useState(ad.headline);
  const [description, setDescription] = useState(ad.description);
  const [cta, setCta] = useState(ad.cta);

  const handleSave = () => {
    onUpdate?.({
      headline,
      description,
      cta,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setHeadline(ad.headline);
    setDescription(ad.description);
    setCta(ad.cta);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 border border-emerald-500/20 shadow-2xl space-y-6"
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Editar Anuncio
          </h3>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-none">{platform.toUpperCase()}</Badge>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Titular</label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Titular"
              maxLength={60}
              className="bg-gray-50 dark:bg-white/5 border-none rounded-xl font-bold py-6"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Descripción</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción"
              maxLength={150}
              rows={4}
              className="bg-gray-50 dark:bg-white/5 border-none rounded-xl font-medium py-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Botón de Acción</label>
            <Input
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="CTA"
              maxLength={20}
              className="bg-gray-50 dark:bg-white/5 border-none rounded-xl font-black py-6"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-black uppercase tracking-widest text-xs">
              <Check className="w-4 h-4 mr-2" /> Guardar
            </Button>
            <Button onClick={handleCancel} variant="ghost" className="flex-1 rounded-xl py-6 font-bold text-gray-500">
              Cancelar
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const PreviewComponent = {
    meta: MetaPreview,
    google: GoogleAdsPreview,
    tiktok: TikTokPreview,
    linkedin: LinkedInPreview,
  }[platform];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group">
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-4 right-4 z-20 p-3 bg-emerald-500 text-black rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      
      <PreviewComponent
        headline={ad.headline}
        description={ad.description}
        cta={ad.cta}
        imageUrl={ad.imageUrl}
        businessName={ad.businessName}
        websiteUrl={ad.websiteUrl}
      />
    </motion.div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${className}`}>
    {children}
  </span>
);
