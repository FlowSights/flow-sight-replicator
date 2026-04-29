import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  BarChart3, 
  Zap, 
  Layout, 
  ArrowRight, 
  CheckCircle2,
  TrendingUp,
  Target,
  Users
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface PremiumResultsDashboardProps {
  campaignName: string;
  businessName: string;
  platform: 'google' | 'meta' | 'tiktok' | 'linkedin';
  generatedAds: any[];
  onDownloadCampaignKit?: () => void;
  onViewDashboard?: () => void;
  onDownloadAssets?: () => void;
}

export const PremiumResultsDashboard: React.FC<PremiumResultsDashboardProps> = ({
  campaignName,
  businessName,
  platform,
  generatedAds,
  onDownloadCampaignKit,
  onViewDashboard,
  onDownloadAssets,
}) => {
  const platformNames: Record<string, string> = {
    google: 'Google Ads',
    meta: 'Meta Ads',
    tiktok: 'TikTok Ads',
    linkedin: 'LinkedIn Ads',
  };

  return (
    <div className="space-y-8">
      {/* Header Info - Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">{businessName}</h2>
            <p className="text-gray-400 mt-1">Estrategia Premium de Alto Rendimiento</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{platformNames[platform]}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Audiencia Optimizada</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Status</span>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-500">LISTO PARA LANZAR</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid - Assets & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Deliverable Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-8 backdrop-blur-xl transition-all hover:border-emerald-500/30"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Campaign Kit Premium</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8">
                Documento estratégico de 15 páginas con análisis de mercado, psicología del consumidor, 
                variantes de copy optimizadas y hoja de ruta de implementación técnica.
              </p>
            </div>
            <Button 
              onClick={onDownloadCampaignKit}
              className="w-full md:w-auto bg-white text-black hover:bg-emerald-50 font-bold py-6 rounded-2xl flex items-center gap-2 group"
            >
              Descargar Dossier PDF
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>

        {/* ROI Projection Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Rendimiento Est.</h3>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">ROI Proyectado</p>
              <p className="text-4xl font-black text-emerald-400">+340%</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">CTR Estimado</p>
              <p className="text-2xl font-bold text-white">4.2% - 5.8%</p>
            </div>
          </div>
        </motion.div>

        {/* Secondary Assets Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl group hover:border-blue-500/30 transition-all"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/30">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Assets Digitales</h3>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Paquete completo de imágenes y archivos de configuración listos para importar.
          </p>
          <Button 
            variant="outline"
            onClick={onDownloadAssets}
            className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl"
          >
            Descargar Assets
          </Button>
        </motion.div>

        {/* Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl group hover:border-emerald-500/30 transition-all"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
                <Layout className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dashboard Interactivo</h3>
                <p className="text-sm text-gray-400">Personaliza y monitorea tu campaña en tiempo real.</p>
              </div>
            </div>
            <Button 
              onClick={onViewDashboard}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl"
            >
              Abrir Dashboard
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Implementation Roadmap - Professional Look */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8">Hoja de Ruta de Implementación</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Integración', desc: 'Instalación de píxeles y tracking' },
            { step: '02', title: 'Carga', desc: 'Importación de assets y copys' },
            { step: '03', title: 'Testeo', desc: 'Lanzamiento de variantes A/B' },
            { step: '04', title: 'Escalado', desc: 'Optimización de presupuesto' },
          ].map((item, i) => (
            <div key={i} className="relative">
              <span className="text-4xl font-black text-white/5 absolute -top-4 -left-2">{item.step}</span>
              <div className="relative z-10">
                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
