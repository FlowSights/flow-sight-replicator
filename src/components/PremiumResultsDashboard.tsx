import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  BarChart3,
  Download,
  Eye,
  Zap,
  CheckCircle2,
  ArrowRight,
  Layout,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface PremiumResultsDashboardProps {
  campaignName: string;
  businessName: string;
  platform: 'google' | 'meta' | 'tiktok' | 'linkedin';
  generatedAds: any[];
  onExportPDF?: () => void;
  onViewDashboard?: () => void;
  onDownloadAssets?: () => void;
}

export const PremiumResultsDashboard: React.FC<PremiumResultsDashboardProps> = ({
  campaignName,
  businessName,
  platform,
  generatedAds,
  onExportPDF,
  onViewDashboard,
  onDownloadAssets,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Colores dinámicos por plataforma
  const platformColors: Record<string, { gradient: string; icon: string; description: string }> = {
    google: {
      gradient: 'from-red-500 via-yellow-500 to-blue-500',
      icon: '🔍',
      description: 'Estrategia completa para Google Ads'
    },
    meta: {
      gradient: 'from-blue-600 to-blue-400',
      icon: '📱',
      description: 'Estrategia completa para Meta (Facebook/Instagram)'
    },
    tiktok: {
      gradient: 'from-gray-900 via-black to-pink-500',
      icon: '🎵',
      description: 'Estrategia completa para TikTok Ads'
    },
    linkedin: {
      gradient: 'from-blue-700 to-blue-500',
      icon: '💼',
      description: 'Estrategia completa para LinkedIn Ads'
    },
  };

  const platformNames: Record<string, string> = {
    google: 'Google Ads',
    meta: 'Meta (Facebook/Instagram)',
    tiktok: 'TikTok Ads',
    linkedin: 'LinkedIn Ads',
  };

  const currentPlatform = platformColors[platform];

  const deliverables = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'PDF Estratégico Premium',
      description: 'Informe profesional de 15+ páginas con análisis, copys y guías paso a paso',
      action: 'Descargar PDF',
      onClick: onExportPDF,
      color: 'emerald',
    },
    {
      icon: <Layout className="w-6 h-6" />,
      title: 'Dashboard Personalizado',
      description: 'Panel interactivo para editar, previsualizar y monitorear tu campaña',
      action: 'Abrir Dashboard',
      onClick: onViewDashboard,
      color: 'blue',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Assets Optimizados',
      description: 'Imágenes y archivos listos para importar directamente en cada plataforma',
      action: 'Descargar Assets',
      onClick: onDownloadAssets,
      color: 'purple',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Hero Section - Banner Dinámico */}
      <motion.div
        key={platform}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-gradient-to-r ${currentPlatform.gradient} rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative`}
      >
        {/* Fondo decorativo */}
        <div className="absolute top-0 right-0 text-8xl opacity-10">{currentPlatform.icon}</div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -mb-20 -ml-20" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">✨ Campaña Generada</span>
          </div>
          <h1 className="text-4xl font-black mb-2">
            {campaignName || 'Tu Campaña'}
          </h1>
          <p className="text-lg opacity-90">
            {currentPlatform.description}
          </p>
        </div>
      </motion.div>

      {/* Tabs de Contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="deliverables" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Entregables</span>
          </TabsTrigger>
          <TabsTrigger value="next-steps" className="gap-2">
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">Próximos Pasos</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className="p-6">
              <div className="text-3xl font-black text-emerald-600 mb-2">
                {generatedAds.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Variantes de Anuncios Generadas
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Optimizadas para máxima conversión
              </p>
            </Card>

            <Card className="p-6">
              <div className="text-3xl font-black text-blue-600 mb-2">
                {Math.max(...generatedAds.map((ad) => ad.score || 0))}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Score de Calidad Promedio
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Basado en análisis de IA
              </p>
            </Card>

            <Card className="p-6">
              <div className="text-3xl font-black text-purple-600 mb-2">
                3
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Formatos de Entrega
              </p>
              <p className="text-xs text-gray-500 mt-2">
                PDF, Dashboard, Assets
              </p>
            </Card>
          </motion.div>

          {/* Anuncios Generados */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="font-bold text-gray-900 dark:text-white">Anuncios Generados</h3>
            {generatedAds.slice(0, 3).map((ad, idx) => (
              <Card key={idx} className="p-4 border-l-4 border-emerald-500">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {ad.type}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{ad.headline}</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-xs font-bold">
                    {ad.score}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {ad.description}
                </p>
              </Card>
            ))}
          </motion.div>
        </TabsContent>

        {/* Tab: Entregables */}
        <TabsContent value="deliverables" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {deliverables.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                    <div
                      className={`w-12 h-12 rounded-lg bg-${item.color}-500/20 text-${item.color}-600 dark:text-${item.color}-400 flex items-center justify-center mb-4`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                      {item.description}
                    </p>
                    <Button
                      onClick={item.onClick}
                      className={`w-full bg-${item.color}-600 hover:bg-${item.color}-700 text-white gap-2`}
                    >
                      <Download className="w-4 h-4" />
                      {item.action}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </TabsContent>

        {/* Tab: Próximos Pasos */}
        <TabsContent value="next-steps" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {[
              {
                step: 1,
                title: 'Descarga tu Kit Premium',
                description: 'Obtén el PDF estratégico y los assets optimizados',
              },
              {
                step: 2,
                title: 'Personaliza en el Dashboard',
                description: 'Edita los copys directamente sobre las previsualizaciones',
              },
              {
                step: 3,
                title: 'Importa a la Plataforma',
                description: 'Usa nuestros archivos listos para importar en Google Ads, Meta, etc.',
              },
              {
                step: 4,
                title: 'Lanza tu Campaña',
                description: 'Sigue la guía paso a paso incluida en tu kit',
              },
              {
                step: 5,
                title: 'Monitorea Resultados',
                description: 'Usa el dashboard para trackear performance en tiempo real',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* CTA Final */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white text-center"
      >
        <p className="text-sm font-semibold opacity-90 mb-2">Listo para Lanzar</p>
        <h3 className="text-2xl font-black mb-3">
          Tu Estrategia Premium está Completa
        </h3>
        <p className="text-sm opacity-90 mb-4">
          Todos tus entregables están listos. Descarga tu kit y comienza a generar resultados hoy mismo.
        </p>
        <Button
          onClick={onExportPDF}
          className="bg-white text-emerald-600 hover:bg-gray-100 font-bold gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar Todo Ahora
        </Button>
      </motion.div>
    </motion.div>
  );
};
