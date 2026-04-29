import React, { useState } from 'react';
import { Download, BarChart3, Zap, TrendingUp, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { GeneratedAd } from '@/types/ads';

interface ClientDashboardProps {
  businessName: string;
  generatedAds: GeneratedAd[];
  budget: number;
  location: string;
  createdAt: Date;
  hasPaid: boolean;
  onDownloadKit: () => void;
  onDownloadGuide: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  businessName,
  generatedAds,
  budget,
  location,
  createdAt,
  hasPaid,
  onDownloadKit,
  onDownloadGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'analytics'>('overview');

  const platformCount = {
    meta: generatedAds.filter((ad) => ad.platform === 'meta').length,
    google: generatedAds.filter((ad) => ad.platform === 'google').length,
    tiktok: generatedAds.filter((ad) => ad.platform === 'tiktok').length,
    linkedin: generatedAds.filter((ad) => ad.platform === 'linkedin').length,
  };

  const avgScore =
    generatedAds.length > 0
      ? Math.round(
          generatedAds.reduce((sum, ad) => sum + ad.score, 0) / generatedAds.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">{businessName}</h1>
        <p className="text-slate-300 mb-4">Tu Campaign Kit Premium está listo para usar</p>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-slate-400">Ubicación</p>
            <p className="font-semibold">{location}</p>
          </div>
          <div>
            <p className="text-slate-400">Presupuesto</p>
            <p className="font-semibold">${budget}</p>
          </div>
          <div>
            <p className="text-slate-400">Creado</p>
            <p className="font-semibold">{createdAt.toLocaleDateString('es-ES')}</p>
          </div>
          <div>
            <p className="text-slate-400">Anuncios</p>
            <p className="font-semibold">{generatedAds.length} listos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Resumen', icon: BarChart3 },
          { id: 'assets', label: 'Mis Activos', icon: Download },
          { id: 'analytics', label: 'Rendimiento', icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition ${
              activeTab === id
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Contenido por Tab */}
      <div>
        {/* Resumen */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Puntuación Promedio',
                  value: `${avgScore}/100`,
                  icon: Zap,
                  color: 'from-yellow-400 to-orange-500',
                },
                {
                  label: 'Anuncios Meta',
                  value: platformCount.meta,
                  icon: FileText,
                  color: 'from-blue-400 to-blue-600',
                },
                {
                  label: 'Anuncios Google',
                  value: platformCount.google,
                  icon: FileText,
                  color: 'from-red-400 to-yellow-500',
                },
                {
                  label: 'Anuncios TikTok',
                  value: platformCount.tiktok,
                  icon: FileText,
                  color: 'from-black to-pink-600',
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-br ${stat.color} text-white rounded-lg p-4 shadow-lg`}
                  >
                    <Icon size={20} className="mb-2 opacity-80" />
                    <p className="text-xs opacity-90">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Próximos Pasos */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-blue-600" />
                Próximos Pasos
              </h3>
              <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">1</span>
                  <span>
                    <strong>Descarga tu Kit Premium</strong> - Incluye todos tus anuncios optimizados,
                    guía de lanzamiento y métricas estimadas.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">2</span>
                  <span>
                    <strong>Revisa la Guía Visual</strong> - Pasos claros para publicar en cada
                    plataforma sin errores.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">3</span>
                  <span>
                    <strong>Publica y Monitorea</strong> - Usa nuestros textos optimizados y
                    monitorea el rendimiento.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">4</span>
                  <span>
                    <strong>Optimiza</strong> - Ajusta según resultados y repite el proceso para
                    mejores resultados.
                  </span>
                </li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* Mis Activos */}
        {activeTab === 'assets' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {!hasPaid ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Necesitas acceso premium para descargar tus activos
                </p>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                  Obtener Acceso Premium
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Campaign Kit Premium',
                      description: 'PDF con todos tus anuncios, métricas y guía de lanzamiento',
                      icon: Download,
                      action: onDownloadKit,
                      color: 'from-green-400 to-emerald-600',
                    },
                    {
                      title: 'Guía Visual Paso a Paso',
                      description: 'Instrucciones detalladas para publicar en cada plataforma',
                      icon: FileText,
                      action: onDownloadGuide,
                      color: 'from-blue-400 to-blue-600',
                    },
                  ].map((asset, i) => {
                    const Icon = asset.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-gradient-to-br ${asset.color} text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition cursor-pointer`}
                        onClick={asset.action}
                      >
                        <Icon size={32} className="mb-3 opacity-80" />
                        <h4 className="font-bold text-lg mb-1">{asset.title}</h4>
                        <p className="text-sm opacity-90 mb-4">{asset.description}</p>
                        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold text-sm transition">
                          Descargar Ahora
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Rendimiento */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg p-8 text-center">
              <TrendingUp size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Análisis de Rendimiento
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Una vez que publiques tus anuncios, aquí verás métricas en tiempo real como clics,
                impresiones, conversiones y ROI.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                💡 Tip: Usa la Guía Visual para asegurar que publicas correctamente y obtengas
                los mejores resultados.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
