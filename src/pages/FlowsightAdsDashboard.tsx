import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Sparkles, LogOut, Zap, Target, Image as ImageIcon, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

type CampaignType = 'campaigns' | 'ads' | null;

const FlowsightAdsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [campaignType, setCampaignType] = useState<CampaignType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/flowsight-ads');
  };

  const handleSelectCampaignType = (type: CampaignType) => {
    setCampaignType(type);
  };

  const handleGenerateContent = async (type: 'campaigns' | 'ads') => {
    setIsLoading(true);
    
    const messages = [
      'Analizando tu audiencia...',
      'Generando copys persuasivos...',
      'Optimizando imágenes...',
      'Calculando presupuestos...',
      '¡Casi listo!',
    ];

    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoadingMessage(messages[i]);
    }

    setIsLoading(false);
  };

  // Pantalla de Carga Full-Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900 flex items-center justify-center z-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Generando tu contenido
          </h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-400 h-8"
            key={loadingMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {loadingMessage}
          </motion.p>
          <div className="mt-12 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-emerald-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Selector de Tipo de Campaña
  if (!campaignType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => navigate('/flowsight-ads-info')}
              className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 px-4 py-2 rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold font-display bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-4">
              ¿Qué deseas crear?
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Elige entre campañas de búsqueda o anuncios visuales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Campañas (Google Ads) */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectCampaignType('campaigns')}
              className="cursor-pointer"
            >
              <Card className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-2 border-white/20 dark:border-gray-800 hover:border-emerald-500/50 p-8 rounded-3xl transition-all shadow-lg hover:shadow-2xl">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl w-fit mb-6">
                  <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Campañas
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Crea campañas de búsqueda para Google Ads con textos optimizados y presupuestos inteligentes.
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-8">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Textos persuasivos
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Segmentación avanzada
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    Presupuesto optimizado
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
                  Crear Campaña
                </Button>
              </Card>
            </motion.div>

            {/* Anuncios (Social Media) */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectCampaignType('ads')}
              className="cursor-pointer"
            >
              <Card className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-2 border-white/20 dark:border-gray-800 hover:border-emerald-500/50 p-8 rounded-3xl transition-all shadow-lg hover:shadow-2xl">
                <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl w-fit mb-6">
                  <ImageIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Anuncios Visuales
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Crea anuncios visuales para Meta, TikTok y LinkedIn con imágenes generadas por IA.
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-8">
                  <li className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    Imágenes optimizadas
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    3 plataformas
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Generación IA
                  </li>
                </ul>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg">
                  Crear Anuncio
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Interfaz de Configuración Full-Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setCampaignType(null)}
            className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 px-4 py-2 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Atrás
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {campaignType === 'campaigns' ? 'Nueva Campaña' : 'Nuevo Anuncio'}
          </h2>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Full-Screen Configuration */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuración */}
          <div className="lg:col-span-2">
            <Card className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-800 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Configuración
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la {campaignType === 'campaigns' ? 'Campaña' : 'Anuncio'}
                  </label>
                  <Input 
                    placeholder="Ej: Campaña Verano 2026"
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción del Producto/Servicio
                  </label>
                  <Textarea 
                    placeholder="Describe qué vendes y por qué es especial..."
                    className="rounded-lg min-h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Audiencia Objetivo
                  </label>
                  <Input 
                    placeholder="Ej: Mujeres 25-45, interesadas en tecnología"
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Presupuesto (USD)
                  </label>
                  <Input 
                    type="number"
                    placeholder="100"
                    className="rounded-lg"
                  />
                </div>

                <Button 
                  onClick={() => handleGenerateContent(campaignType as 'campaigns' | 'ads')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-6 text-lg rounded-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generar con IA
                </Button>
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div>
            <Card className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-800 p-8 rounded-3xl sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Vista Previa
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-64 flex items-center justify-center text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  La vista previa aparecerá aquí después de generar contenido
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowsightAdsDashboard;
