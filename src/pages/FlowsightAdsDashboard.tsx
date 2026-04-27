import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Sparkles, LogOut, Zap, Target, Image as ImageIcon, BarChart3, Upload, X, Check, Download, ExternalLink, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetaPreview, TikTokPreview, LinkedInPreview, GoogleAdsPreview } from '@/components/PlatformPreviewsNative';
import jsPDF from 'jspdf';

type CampaignType = 'campaigns' | 'ads' | null;
type ImageMode = 'own' | 'reference' | 'ai' | null;

interface UploadedImage {
  id: string;
  url: string;
  file: File;
  selected: boolean;
}

interface GeneratedAd {
  headline: string;
  description: string;
  cta: string;
  imageUrl?: string;
}

interface CampaignConfig {
  name: string;
  description: string;
  audience: string;
  budget: number;
  keywords: string;
  negativeKeywords: string;
  interests: string;
  location: string;
  estimatedReach: number;
  targetPopulation: number;
}

const FlowsightAdsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [campaignType, setCampaignType] = useState<CampaignType>(null);
  const [imageMode, setImageMode] = useState<ImageMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'meta' | 'tiktok' | 'linkedin' | 'google'>('meta');
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  
  const [config, setConfig] = useState<CampaignConfig>({
    name: '',
    description: '',
    audience: '',
    budget: 100,
    keywords: '',
    negativeKeywords: '',
    interests: '',
    location: '',
    estimatedReach: 5000,
    targetPopulation: 50000,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/flowsight-ads');
  };

  const handleSelectCampaignType = (type: CampaignType) => {
    setCampaignType(type);
  };

  const handleSelectImageMode = (mode: ImageMode) => {
    setImageMode(mode);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: UploadedImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: event.target?.result as string,
          file: file,
          selected: false,
        };
        setUploadedImages([...uploadedImages, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleImageSelection = (id: string) => {
    setUploadedImages(
      uploadedImages.map((img) =>
        img.id === id ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const removeImage = (id: string) => {
    setUploadedImages(uploadedImages.filter((img) => img.id !== id));
  };

  const handleGenerateContent = async (type: 'campaigns' | 'ads') => {
    setIsLoading(true);
    
    const messages = [
      'Analizando tu audiencia...',
      'Generando copys persuasivos...',
      'Optimizando imágenes...',
      'Calculando presupuestos...',
      'Validando configuración...',
      '¡Casi listo!',
    ];

    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoadingMessage(messages[i]);
    }

    const ads: GeneratedAd[] = [
      {
        headline: config.name || 'Transforma tu negocio',
        description: config.description || 'Crea campañas de publicidad con IA en minutos.',
        cta: 'Comenzar ahora',
        imageUrl: uploadedImages[0]?.url || 'https://via.placeholder.com/1200x628/10b981/ffffff?text=Anuncio+1',
      },
      {
        headline: 'Anuncios que convierten',
        description: config.description || 'Nuestra IA analiza tu audiencia y crea anuncios personalizados.',
        cta: 'Ver más',
        imageUrl: uploadedImages[1]?.url || 'https://via.placeholder.com/1200x628/14b8a6/ffffff?text=Anuncio+2',
      },
      {
        headline: 'Publicidad inteligente',
        description: 'Optimiza automáticamente tus campañas. Menos tiempo, más resultados.',
        cta: 'Probar gratis',
        imageUrl: uploadedImages[2]?.url || 'https://via.placeholder.com/1200x628/0d9488/ffffff?text=Anuncio+3',
      },
    ];

    setGeneratedAds(ads);
    setShowPreview(true);
    setCurrentAdIndex(0);
    setIsLoading(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header con branding
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Flowsight Ads', 20, 25);
    doc.setFontSize(10);
    doc.text('Estrategia de Publicidad Premium', 20, 32);

    // Reset color
    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // Título
    doc.setFontSize(18);
    doc.text(`Campaña: ${config.name}`, 20, yPosition);
    yPosition += 15;

    // Información de campaña
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Información de la Campaña', 20, yPosition);
    yPosition += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const campaignInfo = [
      `Plataforma: ${selectedPlatform.toUpperCase()}`,
      `Presupuesto: $${config.budget}`,
      `Alcance Estimado: ${config.estimatedReach.toLocaleString()} personas`,
      `Población Objetivo: ${config.targetPopulation.toLocaleString()} personas`,
      `Ubicación: ${config.location || 'Global'}`,
      `Intereses: ${config.interests || 'No especificados'}`,
    ];

    campaignInfo.forEach((info) => {
      doc.text(info, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Descripción
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Descripción del Producto/Servicio', 20, yPosition);
    yPosition += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const descriptionLines = doc.splitTextToSize(config.description, pageWidth - 40);
    doc.text(descriptionLines, 25, yPosition);
    yPosition += descriptionLines.length * 6 + 5;

    // Anuncio actual
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text(`Anuncio ${currentAdIndex + 1} de ${generatedAds.length}`, 20, yPosition);
    yPosition += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Headline: ${generatedAds[currentAdIndex].headline}`, 25, yPosition);
    yPosition += 6;
    
    const descLines = doc.splitTextToSize(`Descripción: ${generatedAds[currentAdIndex].description}`, pageWidth - 40);
    doc.text(descLines, 25, yPosition);
    yPosition += descLines.length * 6 + 3;

    doc.text(`CTA: ${generatedAds[currentAdIndex].cta}`, 25, yPosition);
    yPosition += 10;

    // Instrucciones por plataforma
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Instrucciones de Publicación', 20, 20);

    yPosition = 35;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');

    if (selectedPlatform === 'meta') {
      doc.text('Meta Ads Manager (Facebook/Instagram)', 20, yPosition);
      yPosition += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      const metaInstructions = [
        '1. Accede a facebook.com/ads/manager',
        '2. Haz clic en "Crear" en la esquina superior izquierda',
        '3. Selecciona tu objetivo de campaña',
        '4. Configura tu audiencia según los datos proporcionados',
        '5. Copia el headline y descripción en los campos correspondientes',
        '6. Carga la imagen generada en la sección de creativos',
        '7. Establece el presupuesto diario: $' + (config.budget / 30).toFixed(2),
        '8. Revisa y publica tu anuncio',
      ];
      metaInstructions.forEach((instruction) => {
        doc.text(instruction, 25, yPosition);
        yPosition += 6;
      });
    } else if (selectedPlatform === 'google') {
      doc.text('Google Ads', 20, yPosition);
      yPosition += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      const googleInstructions = [
        '1. Accede a ads.google.com',
        '2. Haz clic en "+ Campaña"',
        '3. Selecciona "Búsqueda" como tipo de campaña',
        '4. Configura tu presupuesto: $' + config.budget,
        '5. Añade palabras clave: ' + (config.keywords || 'Relacionadas con tu negocio'),
        '6. Crea un grupo de anuncios',
        '7. Copia el headline y descripción',
        '8. Establece tu URL de destino y publica',
      ];
      googleInstructions.forEach((instruction) => {
        doc.text(instruction, 25, yPosition);
        yPosition += 6;
      });
    } else if (selectedPlatform === 'tiktok') {
      doc.text('TikTok Ads Manager', 20, yPosition);
      yPosition += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      const tiktokInstructions = [
        '1. Accede a ads.tiktok.com',
        '2. Haz clic en "Crear campaña"',
        '3. Selecciona tu objetivo de marketing',
        '4. Configura tu presupuesto: $' + config.budget,
        '5. Define tu audiencia objetivo',
        '6. Crea un grupo de anuncios',
        '7. Carga tu video o imagen vertical',
        '8. Añade el headline y descripción',
        '9. Revisa y lanza tu campaña',
      ];
      tiktokInstructions.forEach((instruction) => {
        doc.text(instruction, 25, yPosition);
        yPosition += 6;
      });
    } else if (selectedPlatform === 'linkedin') {
      doc.text('LinkedIn Campaign Manager', 20, yPosition);
      yPosition += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      const linkedinInstructions = [
        '1. Accede a linkedin.com/campaignmanager',
        '2. Haz clic en "Crear campaña"',
        '3. Selecciona tu objetivo',
        '4. Configura tu presupuesto: $' + config.budget,
        '5. Define audiencia profesional',
        '6. Crea tu anuncio patrocinado',
        '7. Carga la imagen de alta calidad',
        '8. Añade headline y descripción',
        '9. Publica tu campaña',
      ];
      linkedinInstructions.forEach((instruction) => {
        doc.text(instruction, 25, yPosition);
        yPosition += 6;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generado por Flowsight Ads - Publicidad Inteligente con IA', 20, pageHeight - 10);

    doc.save(`${config.name || 'Campaña'}-Flowsight-Ads.pdf`);
  };

  const openPublishLink = () => {
    const links: Record<string, string> = {
      meta: 'https://business.facebook.com/latest/home',
      google: 'https://ads.google.com',
      tiktok: 'https://ads.tiktok.com',
      linkedin: 'https://www.linkedin.com/campaignmanager',
    };
    window.open(links[selectedPlatform], '_blank');
  };

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
            Generando tu contenido premium
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
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-emerald-500 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (fullScreenPreview && generatedAds.length > 0) {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
        <button
          onClick={() => setFullScreenPreview(false)}
          className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="w-full max-w-4xl">
          <div className="mb-6">
            {selectedPlatform === 'meta' && (
              <MetaPreview {...generatedAds[currentAdIndex]} platform="meta" />
            )}
            {selectedPlatform === 'tiktok' && (
              <TikTokPreview {...generatedAds[currentAdIndex]} platform="tiktok" />
            )}
            {selectedPlatform === 'linkedin' && (
              <LinkedInPreview {...generatedAds[currentAdIndex]} platform="linkedin" />
            )}
            {campaignType === 'campaigns' && (
              <GoogleAdsPreview {...generatedAds[currentAdIndex]} platform="google" />
            )}
          </div>

          <div className="flex justify-between items-center text-white">
            <button
              onClick={() => setCurrentAdIndex(Math.max(0, currentAdIndex - 1))}
              disabled={currentAdIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>
            <span>{currentAdIndex + 1} / {generatedAds.length}</span>
            <button
              onClick={() => setCurrentAdIndex(Math.min(generatedAds.length - 1, currentAdIndex + 1))}
              disabled={currentAdIndex === generatedAds.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              Siguiente
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!campaignType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900">
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => navigate('/flowsight-ads')}
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectCampaignType('campaigns')}
              className="cursor-pointer"
            >
              <Card className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-2 border-white/20 dark:border-gray-800 hover:border-blue-500/50 p-8 rounded-3xl transition-all shadow-lg hover:shadow-2xl">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl w-fit mb-6">
                  <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Campañas Google Ads
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Crea campañas de búsqueda con textos optimizados, palabras clave y presupuestos inteligentes.
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-8">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Textos persuasivos
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Palabras clave optimizadas
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    Presupuesto automático
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
                  Crear Campaña
                </Button>
              </Card>
            </motion.div>

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

  if (!imageMode && campaignType === 'ads') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900">
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
              Elige tu estrategia de imágenes
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

        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectImageMode('own')}
              className="cursor-pointer"
            >
              <Card className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-2 border-white/20 dark:border-gray-800 hover:border-purple-500/50 p-8 rounded-3xl transition-all shadow-lg hover:shadow-2xl h-full flex flex-col">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl w-fit mb-6">
                  <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Usa tus imágenes
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                  Carga tus propias imágenes de productos o servicios. Perfectas para mantener tu identidad visual.
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg">
                  Continuar
                </Button>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectImageMode('reference')}
              className="cursor-pointer"
            >
              <Card className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-2 border-white/20 dark:border-gray-800 hover:border-orange-500/50 p-8 rounded-3xl transition-all shadow-lg hover:shadow-2xl h-full flex flex-col">
                <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl w-fit mb-6">
                  <Sparkles className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  IA como referencia
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                  Carga imágenes como referencia y deja que la IA las optimice y genere variaciones.
                </p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg">
                  Continuar
                </Button>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectImageMode('ai')}
              className="cursor-pointer"
            >
              <Card className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-2 border-white/20 dark:border-gray-800 hover:border-pink-500/50 p-8 rounded-3xl transition-all shadow-lg hover:shadow-2xl h-full flex flex-col">
                <div className="p-4 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20 rounded-2xl w-fit mb-6">
                  <Zap className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  100% IA
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                  Deja que la IA genere imágenes completamente nuevas basadas en tu descripción.
                </p>
                <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg">
                  Continuar
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => {
              if (campaignType === 'ads' && imageMode) {
                setImageMode(null);
              } else {
                setCampaignType(null);
              }
            }}
            className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 px-4 py-2 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Atrás
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {campaignType === 'campaigns' ? 'Nueva Campaña Google Ads' : 'Nuevo Anuncio Visual'}
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-800 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Configuración Premium
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la {campaignType === 'campaigns' ? 'Campaña' : 'Anuncio'}
                  </label>
                  <Input 
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                    placeholder="Ej: Campaña Verano 2026"
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción del Producto/Servicio
                  </label>
                  <Textarea 
                    value={config.description}
                    onChange={(e) => setConfig({...config, description: e.target.value})}
                    placeholder="Describe qué vendes y por qué es especial..."
                    className="rounded-lg min-h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Audiencia Objetivo
                  </label>
                  <Input 
                    value={config.audience}
                    onChange={(e) => setConfig({...config, audience: e.target.value})}
                    placeholder="Ej: Mujeres 25-45, interesadas en tecnología"
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ubicación Geográfica
                  </label>
                  <Input 
                    value={config.location}
                    onChange={(e) => setConfig({...config, location: e.target.value})}
                    placeholder="Ej: Colombia, Bogotá"
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Intereses (Tags)
                  </label>
                  <Input 
                    value={config.interests}
                    onChange={(e) => setConfig({...config, interests: e.target.value})}
                    placeholder="Ej: Marketing, Tecnología, Negocios"
                    className="rounded-lg"
                  />
                </div>

                {campaignType === 'campaigns' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Palabras Clave
                      </label>
                      <Input 
                        value={config.keywords}
                        onChange={(e) => setConfig({...config, keywords: e.target.value})}
                        placeholder="Ej: software marketing, herramientas IA"
                        className="rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Palabras Clave Negativas
                      </label>
                      <Input 
                        value={config.negativeKeywords}
                        onChange={(e) => setConfig({...config, negativeKeywords: e.target.value})}
                        placeholder="Ej: gratis, barato"
                        className="rounded-lg"
                      />
                    </div>
                  </>
                )}

                {/* Sliders */}
                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Presupuesto Diario
                      </label>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        ${config.budget}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={config.budget}
                      onChange={(e) => {
                        const budget = parseInt(e.target.value);
                        setConfig({
                          ...config,
                          budget,
                          estimatedReach: budget * 50,
                        });
                      }}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>$10</span>
                      <span>$1000</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Alcance Estimado
                      </label>
                      <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                        {config.estimatedReach.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="500000"
                      step="1000"
                      value={config.estimatedReach}
                      onChange={(e) => setConfig({...config, estimatedReach: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Población Objetivo
                      </label>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {config.targetPopulation.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10000"
                      max="5000000"
                      step="10000"
                      value={config.targetPopulation}
                      onChange={(e) => setConfig({...config, targetPopulation: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>

                {campaignType === 'ads' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Imágenes
                    </label>
                    <div className="space-y-4">
                      {imageMode !== 'ai' && (
                        <>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-lg p-6 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          >
                            <Upload className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Carga tus imágenes</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {imageMode === 'reference' ? 'La IA las optimizará' : 'Se usarán tal cual'}
                            </p>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </>
                      )}
                      
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          <AnimatePresence>
                            {uploadedImages.map((img) => (
                              <motion.div
                                key={img.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative group"
                              >
                                <img
                                  src={img.url}
                                  alt="Uploaded"
                                  className={`w-full h-24 object-cover rounded-lg cursor-pointer transition-all ${
                                    img.selected ? 'ring-2 ring-emerald-500' : ''
                                  }`}
                                  onClick={() => toggleImageSelection(img.id)}
                                />
                                {img.selected && (
                                  <div className="absolute inset-0 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <Check className="w-6 h-6 text-white" />
                                  </div>
                                )}
                                <button
                                  onClick={() => removeImage(img.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => handleGenerateContent(campaignType as 'campaigns' | 'ads')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-6 text-lg rounded-lg font-semibold"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generar Anuncios Premium
                </Button>
              </div>
            </Card>
          </div>

          <div>
            {showPreview && generatedAds.length > 0 ? (
              <Card className="glass-card backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-gray-800 p-8 rounded-3xl sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Vista Previa
                </h3>
                
                {campaignType === 'ads' && (
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {(['meta', 'tiktok', 'linkedin'] as const).map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedPlatform === platform
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                        }`}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mb-4 overflow-auto max-h-96">
                  {selectedPlatform === 'meta' && (
                    <MetaPreview {...generatedAds[currentAdIndex]} platform="meta" />
                  )}
                  {selectedPlatform === 'tiktok' && (
                    <TikTokPreview {...generatedAds[currentAdIndex]} platform="tiktok" />
                  )}
                  {selectedPlatform === 'linkedin' && (
                    <LinkedInPreview {...generatedAds[currentAdIndex]} platform="linkedin" />
                  )}
                  {campaignType === 'campaigns' && (
                    <GoogleAdsPreview {...generatedAds[currentAdIndex]} platform="google" />
                  )}
                </div>

                <button
                  onClick={() => setFullScreenPreview(true)}
                  className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  Ver en Grande
                </button>

                <div className="flex gap-2 justify-between items-center mb-4">
                  <button
                    onClick={() => setCurrentAdIndex(Math.max(0, currentAdIndex - 1))}
                    disabled={currentAdIndex === 0}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-sm"
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentAdIndex + 1} / {generatedAds.length}
                  </span>
                  <button
                    onClick={() => setCurrentAdIndex(Math.min(generatedAds.length - 1, currentAdIndex + 1))}
                    disabled={currentAdIndex === generatedAds.length - 1}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-sm"
                  >
                    Siguiente →
                  </button>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={generatePDF}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </Button>
                  <Button
                    onClick={openPublishLink}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Publicar en {selectedPlatform.toUpperCase()}
                  </Button>
                </div>
              </Card>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowsightAdsDashboard;
