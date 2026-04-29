import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, Sparkles, LogOut, Zap, Target, 
  Image as ImageIcon, BarChart3, Upload, X, 
  Check, Download, ExternalLink, Maximize2, 
  ChevronLeft, ChevronRight, MapPin, Users, 
  TrendingUp, ShieldCheck, Star, Rocket,
  Globe, MousePointer2, Layout, FileText,
  Lightbulb, Info, ArrowRight, MapPin as MapPinIcon,
  Upload as UploadIcon, X as XIcon, Sparkles as SparklesIcon,
  RefreshCw, Search, Activity, Eye, MousePointer,
  MapPin as MapPinIconLucide, Upload as UploadIconLucide, X as XIconLucide, Sparkles as SparklesIconLucide,
  BookOpen, PlayCircle, MousePointerClick, Moon, Sun,
  Building2, Link2, Globe2, CreditCard
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Edit2 } from 'lucide-react';
import { LocationInput } from '@/components/LocationInput';
import { ROIEstimator } from '@/components/ROIEstimator';
import { motion, AnimatePresence } from 'framer-motion';
import { MetaPreview, TikTokPreview, LinkedInPreview, GoogleAdsPreview } from '@/components/PlatformPreviewsNative';
import { VisualGuideLightbox } from '@/components/VisualGuideLightbox';
import jsPDF from 'jspdf';
import { useCountUp } from '@/hooks/useCountUp';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { useInactivityTimeoutStrict } from '@/hooks/useInactivityTimeoutStrict';
import { MockupLightbox } from '@/components/MockupLightbox';
import { AppleStyleLoadingScreen } from '@/components/AppleStyleLoadingScreen';
import { SimplifiedROICalculator } from '@/components/SimplifiedROICalculator';
import { SmartLocationSelector } from '@/components/SmartLocationSelector';
import { ClientDashboard } from '@/components/ClientDashboard';
import { PaymentModal } from '@/components/PaymentModal';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { generateAdsWithGeminiIntegration } from '@/lib/dashboardIntegration';
import { downloadPremiumPDF } from '@/lib/premiumPDFExporter';
import { downloadAssetsPackage } from '@/lib/assetsExporter';
import { EditablePlatformPreview } from '@/components/EditablePlatformPreview';
import { DynamicROIEstimator } from '@/components/DynamicROIEstimator';
import { PremiumResultsDashboard } from '@/components/PremiumResultsDashboard';
import { AdsResultsShowcase } from '@/components/AdsResultsShowcase';
import { downloadPremiumPDFV2 } from '@/lib/premiumPDFExporterV2';
import { useToast } from '@/hooks/use-toast';

type HeroStat = { value: number; suffix: string; prefix?: string; label: string; decimals?: number };

const AnimatedStat = ({ stat, className = "font-display text-3xl font-bold text-gradient" }: { stat: HeroStat; className?: string }) => {
  const { value, ref } = useCountUp(stat.value, 1800, stat.decimals ?? 0);
  const formatted = (stat.decimals ?? 0) > 0 ? value.toFixed(stat.decimals) : Math.round(value).toString();
  return (
    <div>
      <div className={className}>
        <span ref={ref}>{stat.prefix ?? ""}{formatted}{stat.suffix}</span>
      </div>
      {stat.label ? <div className="text-sm text-muted-foreground mt-1">{stat.label}</div> : null}
    </div>
  );
};

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

interface CampaignConfig {
  businessName: string;
  websiteUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  promote: string;
  location: string;
  idealCustomer: string;
  budget: number;
  userImage: string | null;
}


const FlowsightAdsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAdForLightbox, setSelectedAdForLightbox] = useState<GeneratedAd | null>(null);
  const [metricsVisible, setMetricsVisible] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCampaignForPayment, setSelectedCampaignForPayment] = useState<string | null>(null);
  const [mockupLightboxOpen, setMockupLightboxOpen] = useState(false);
  const [mockupLightboxIndex, setMockupLightboxIndex] = useState(0);
  const [showClientDashboard, setShowClientDashboard] = useState(false);
  const { hasPaid, isLoading: isPaymentLoading } = usePaymentStatus();
  
  // Inactividad estricta: cierra sesión después de 3 minutos
  useInactivityTimeoutStrict(() => {
    setShowInactivityModal(true);
  });

  const [activeGuidePlatform, setActiveGuidePlatform] = useState<string | null>(null);
  const [isGuideLightboxOpen, setIsGuideLightboxOpen] = useState(false);
  const [guideLightboxPlatform, setGuideLightboxPlatform] = useState<'meta' | 'google' | 'tiktok' | 'linkedin'>('meta');
  
  const [config, setConfig] = useState<CampaignConfig>({
    businessName: '',
    websiteUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    promote: '',
    location: '',
    idealCustomer: '',
    budget: 100,
    userImage: null,
  });

  const [selectedPlatform, setSelectedPlatform] = useState<'google' | 'meta' | 'tiktok' | 'linkedin'>('meta');

  const suggestions = [
    { label: "Membresía de Gimnasio", icon: "💪" },
    { label: "Consultoría de Negocios", icon: "📈" },
    { label: "Restaurante Gourmet", icon: "🍳" },
    { label: "Tienda de Ropa Online", icon: "👕" },
    { label: "Servicios de Limpieza", icon: "✨" },
    { label: "Agencia de Viajes", icon: "✈️" }
  ];

  const loadingMessages = [
    'Analizando tu modelo de negocio...',
    'Consultando IA para generar copys únicos...',
    'Optimizando textos para máxima conversión...',
    'Estructurando tu Campaign Kit Premium...'
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/flowsight-ads');
  };

  // Cerrar sesión por inactividad (10 minutos)
  const handleInactivityTimeout = useCallback(async () => {
    setShowInactivityModal(true);
    await supabase.auth.signOut();
  }, []);

  useInactivityTimeout(handleInactivityTimeout, 10 * 60 * 1000);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/flowsight-ads');
        return;
      }

      // Lógica de Master Account: Acceso total para el administrador
      // (El hook usePaymentStatus ya maneja la verificación de pagos)
    };
    checkUser();
  }, [navigate]);

  // Efecto para mostrar notificación de pago exitoso
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && hasPaid) {
      toast({
        title: '✅ ¡Pago Exitoso!',
        description: 'Tu acceso premium ha sido activado. Ahora puedes descargar tus kits y publicar directamente.',
      });
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [hasPaid, toast]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig({ ...config, userImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setLoadingStep(0);

    try {
      // Llamar a Gemini a través de la Edge Function
      const generatedAds = await generateAdsWithGeminiIntegration(config, (step) => {
        setLoadingStep(step);
      });

      setGeneratedAds(generatedAds);
      setShowResults(true);
      
      // Mostrar métricas después de 500ms
      setTimeout(() => setMetricsVisible(true), 500);

      toast({
        title: '✨ Anuncios Generados',
        description: `Se generaron ${generatedAds.length} anuncios con IA. ¡Listos para tu estrategia!`,
      });
    } catch (error: any) {
      console.error('Error generando anuncios:', error);
      toast({
        title: 'Error al generar anuncios',
        description: error.message || 'Por favor, intenta de nuevo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (generatedAds.length === 0) return;

    const pdfData = {
      businessName: config.businessName,
      websiteUrl: config.websiteUrl,
      promote: config.promote,
      location: config.location,
      idealCustomer: config.idealCustomer,
      budget: config.budget,
      platform: selectedPlatform,
      ads: generatedAds.map((ad) => ({
        type: ad.type,
        headline: ad.headline,
        description: ad.description,
        cta: ad.cta,
        reasoning: ad.reasoning || 'Optimizado para máxima conversión',
        score: ad.score,
        imageUrl: ad.imageUrl,
      })),
      userImage: config.userImage || undefined,
    };

    downloadPremiumPDFV2(pdfData);
    toast({
      title: '✅ Campaing Kit Descargado',
      description: 'Tu estrategia premium está lista',
    });
  };

  const handleDownloadAssets = () => {
    if (generatedAds.length === 0) return;

    const assetsData = {
      businessName: config.businessName,
      platform: selectedPlatform,
      ads: generatedAds.map((ad) => ({
        headline: ad.headline,
        description: ad.description,
        cta: ad.cta,
        imageUrl: ad.imageUrl,
        type: ad.type,
      })),
      websiteUrl: config.websiteUrl,
    };

    downloadAssetsPackage(assetsData);
    toast({
      title: '✅ Assets Descargados',
      description: 'Archivos listos para importar en tu plataforma',
    });
  };

  const handleViewDashboard = () => {
    setShowClientDashboard(true);
    setTimeout(() => {
      const dashboardElement = document.getElementById('client-dashboard');
      if (dashboardElement) {
        dashboardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const generatePDF = (selectedPlatform?: string) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    const campaignId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    // Helper: Dibujar linea decorativa emerald
    const drawAccentLine = (yPos: number) => {
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.8);
      doc.line(margin, yPos, margin + 40, yPos);
    };

    // Helper: Dibujar seccion header
    const drawSectionHeader = (title: string, yPos: number): number => {
      drawAccentLine(yPos);
      doc.setTextColor(5, 5, 5);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, yPos + 10);
      return yPos + 18;
    };

    // Helper: Check page break
    const checkPageBreak = (yPos: number, needed: number = 40): number => {
      if (yPos + needed > pageHeight - 30) {
        doc.addPage();
        return 25;
      }
      return yPos;
    };

    // =============================================
    // PAGINA 1: PORTADA PREMIUM
    // =============================================
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Acento decorativo superior
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // Logo / Marca
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('FLOWSIGHT ADS', margin, 35);

    // Badge Premium
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(pageWidth - 65, 27, 45, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('PREMIUM KIT', pageWidth - 60, 35);

    // Titulo principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(42);
    doc.setFont(undefined, 'bold');
    doc.text('Campaign', margin, 90);
    doc.text('Kit', margin, 108);

    // Nombre de plataforma
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(42);
    const platformNames: Record<string, string> = { meta: 'Meta Ads', google: 'Google Ads', tiktok: 'TikTok Ads', linkedin: 'LinkedIn Ads' };
    doc.text(selectedPlatform ? platformNames[selectedPlatform] || selectedPlatform.toUpperCase() : 'Multicanal', margin, 126);

    // Linea separadora
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.line(margin, 140, margin + 60, 140);

    // Datos de la campana en portada
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    if (config.businessName) {
      doc.text(`Negocio: ${config.businessName}`, margin, 148);
    }
    doc.text(`Producto: ${config.promote}`, margin, config.businessName ? 158 : 155);
    doc.text(`Mercado: ${config.location}`, margin, config.businessName ? 168 : 165);
    doc.text(`Audiencia: ${config.idealCustomer}`, margin, config.businessName ? 178 : 175);
    doc.text(`Inversion: $${config.budget} USD / mes`, margin, config.businessName ? 188 : 185);
    if (config.websiteUrl) {
      doc.setTextColor(16, 185, 129);
      doc.text(`Web: ${config.websiteUrl}`, margin, config.businessName ? 198 : 195);
    }

    // Imagen del usuario en portada (lado derecho)
    if (config.userImage) {
      try {
        // Determinar formato de la imagen
        const imgFormat = config.userImage.startsWith('data:image/png') ? 'PNG'
          : config.userImage.startsWith('data:image/webp') ? 'WEBP'
          : 'JPEG';
        // Imagen principal del anuncio en portada
        const imgX = pageWidth / 2 + 5;
        const imgY = 60;
        const imgW = pageWidth / 2 - margin - 5;
        const imgH = imgW * 0.6;
        // Marco decorativo
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.5);
        doc.roundedRect(imgX - 1, imgY - 1, imgW + 2, imgH + 2, 3, 3, 'S');
        doc.addImage(config.userImage, imgFormat, imgX, imgY, imgW, imgH, undefined, 'FAST');
        // Etiqueta sobre la imagen
        doc.setFillColor(16, 185, 129);
        doc.roundedRect(imgX, imgY + imgH - 10, 40, 8, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont(undefined, 'bold');
        doc.text('CREATIVO DEL ANUNCIO', imgX + 3, imgY + imgH - 4.5);
      } catch (e) {
        // Si falla la imagen, continuar sin ella
      }
    }

    // Footer portada
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Generado el ${dateStr}`, margin, pageHeight - 25);
    doc.text(`ID: ${campaignId}`, margin, pageHeight - 18);
    doc.setTextColor(16, 185, 129);
    doc.text('Documento confidencial y personalizado', pageWidth - 85, pageHeight - 18);

    // =============================================
    // PAGINA 2: RESUMEN ESTRATEGICO
    // =============================================
    doc.addPage();
    let y = 25;

    // Header de pagina
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('FLOWSIGHT ADS  |  CAMPAIGN KIT PREMIUM', margin, 10);
    doc.setTextColor(150, 150, 150);
    doc.text(`${config.promote.toUpperCase()}`, pageWidth - margin - 40, 10);

    y = 30;
    y = drawSectionHeader('Resumen de tu Estrategia', y);
    y += 5;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    const introLines = doc.splitTextToSize(
      `Este documento contiene tu campana publicitaria completa, lista para lanzar. Hemos disenado cada elemento pensando en maximizar tus resultados con la menor complejidad posible. Solo necesitas seguir los pasos de esta guia para tener tu anuncio en vivo.`,
      contentWidth
    );
    doc.text(introLines, margin, y);
    y += introLines.length * 5 + 10;

    // Tabla de estrategia
    const strategyItems = [
      ...(config.businessName ? [{ label: 'Tu negocio', value: config.businessName, icon: 'Empresa' }] : []),
      { label: 'Que vendes', value: config.promote, icon: 'Producto' },
      { label: 'Donde esta tu cliente', value: config.location, icon: 'Mercado' },
      { label: 'A quien le hablas', value: config.idealCustomer, icon: 'Audiencia' },
      { label: 'Cuanto invertir', value: `$${config.budget} USD / mes`, icon: 'Inversion' },
      { label: 'Donde publicar', value: selectedPlatform ? platformNames[selectedPlatform] : 'Todas las plataformas', icon: 'Plataforma' },
      ...(config.websiteUrl ? [{ label: 'Sitio web', value: config.websiteUrl, icon: 'Web' }] : []),
    ];

    strategyItems.forEach((item) => {
      y = checkPageBreak(y, 22);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text(item.icon.toUpperCase(), margin + 5, y + 7);
      doc.setTextColor(5, 5, 5);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const valLines = doc.splitTextToSize(item.value, contentWidth - 50);
      doc.text(valLines[0] || '', margin + 45, y + 7);
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.text(item.label, margin + 45, y + 14);
      y += 22;
    });

    // Metricas proyectadas
    y += 10;
    y = checkPageBreak(y, 50);
    y = drawSectionHeader('Proyecciones Estimadas', y);
    y += 5;

    const metrics = [
      { label: 'Alcance Estimado', value: `${(config.budget * 15).toLocaleString('es-ES')} personas`, desc: 'Personas que veran tu anuncio cada mes' },
      { label: 'Clics Estimados', value: `${(config.budget * 0.8).toFixed(0)} clics`, desc: 'Visitas esperadas a tu pagina web' },
      { label: 'ROI Proyectado', value: '3.5x', desc: 'Retorno estimado sobre tu inversion' },
      { label: 'Costo por Clic', value: `$${(config.budget / (config.budget * 0.8)).toFixed(2)} USD`, desc: 'Lo que pagas por cada visita' },
    ];

    const metricWidth = (contentWidth - 10) / 2;
    metrics.forEach((m, i) => {
      const col = i % 2;
      if (col === 0 && i > 0) y += 30;
      if (col === 0) y = checkPageBreak(y, 30);
      const xPos = margin + col * (metricWidth + 10);
      doc.setFillColor(5, 5, 5);
      doc.roundedRect(xPos, y, metricWidth, 25, 2, 2, 'F');
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(m.value, xPos + 5, y + 12);
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.text(m.label.toUpperCase(), xPos + 5, y + 19);
    });
    y += 35;

    // =============================================
    // PAGINA 3: CREATIVOS DEL ANUNCIO
    // =============================================
    doc.addPage();
    y = 25;

    // Header de pagina
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('FLOWSIGHT ADS  |  CAMPAIGN KIT PREMIUM', margin, 10);

    y = 30;
    y = drawSectionHeader('Tus Anuncios Listos para Publicar', y);
    y += 5;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    const creativeIntro = doc.splitTextToSize(
      'A continuacion encontraras los textos de tus anuncios optimizados por IA. Solo necesitas copiar y pegar cada elemento en la plataforma correspondiente.',
      contentWidth
    );
    doc.text(creativeIntro, margin, y);
    y += creativeIntro.length * 5 + 10;

    const adsToPrint = selectedPlatform 
      ? generatedAds.filter(ad => ad.platform === selectedPlatform)
      : generatedAds;

    // Sección de imagen del creativo (una vez, antes de los copies)
    if (config.userImage) {
      y = checkPageBreak(y, 75);
      try {
        const imgFormat = config.userImage.startsWith('data:image/png') ? 'PNG'
          : config.userImage.startsWith('data:image/webp') ? 'WEBP'
          : 'JPEG';
        // Imagen centrada con proporción 1.91:1 (estándar publicitario)
        const adImgW = contentWidth;
        const adImgH = adImgW / 1.91;
        // Fondo oscuro
        doc.setFillColor(10, 10, 10);
        doc.roundedRect(margin, y, contentWidth, adImgH + 16, 3, 3, 'F');
        // Etiqueta superior
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.text('IMAGEN DEL ANUNCIO  ·  LISTA PARA USAR', margin + 5, y + 8);
        // Imagen
        doc.addImage(config.userImage, imgFormat, margin, y + 12, adImgW, adImgH, undefined, 'FAST');
        // Dimensiones recomendadas
        doc.setFillColor(0, 0, 0, 0.6);
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(7);
        doc.text('Dimensiones recomendadas: 1200 x 628 px (Meta/Google) · 1080 x 1920 px (TikTok/Stories)', margin + 5, y + adImgH + 10);
        y += adImgH + 22;
      } catch (e) {
        // Si falla la imagen, continuar
      }
    }
    y += 5;

    adsToPrint.forEach((ad) => {
      y = checkPageBreak(y, 85);
      
      // Card del anuncio
      doc.setFillColor(252, 252, 252);
      doc.setDrawColor(230, 230, 230);
      doc.roundedRect(margin, y, contentWidth, 75, 3, 3, 'FD');
      
      // Badge de tipo
      const typeColors: Record<string, [number, number, number]> = {
        'Offer': [16, 185, 129],
        'Emotional': [139, 92, 246],
        'Urgency': [239, 68, 68],
      };
      const badgeColor = typeColors[ad.type] || [16, 185, 129];
      doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
      doc.roundedRect(margin + 5, y + 5, 35, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont(undefined, 'bold');
      const typeLabels: Record<string, string> = { 'Offer': 'OFERTA', 'Emotional': 'EMOCIONAL', 'Urgency': 'URGENCIA' };
      doc.text(typeLabels[ad.type] || ad.type.toUpperCase(), margin + 8, y + 10.5);

      // Plataforma
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text(ad.platform.toUpperCase(), margin + 45, y + 10.5);

      // Score
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(`${ad.score}`, margin + contentWidth - 25, y + 13);
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(6);
      doc.text('/100', margin + contentWidth - 12, y + 13);

      // Titulo
      doc.setTextColor(5, 5, 5);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      const headlineLines = doc.splitTextToSize(ad.headline, contentWidth - 20);
      doc.text(headlineLines, margin + 5, y + 24);
      
      // Descripcion
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const descLines = doc.splitTextToSize(ad.description, contentWidth - 20);
      doc.text(descLines, margin + 5, y + 38);
      
      // CTA
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(margin + 5, y + 52, 40, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text(ad.cta, margin + 10, y + 58.5);

      // Enlace directo
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(`Publicar aqui: ${ad.platformUrl}`, margin + 5, y + 70);
      doc.link(margin + 5, y + 66, contentWidth - 10, 8, { url: ad.platformUrl });
      
      y += 82;
    });

    // =============================================
    // PAGINA 4: GUIA DE LANZAMIENTO PASO A PASO
    // =============================================
    doc.addPage();
    y = 25;

    // Header de pagina
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('FLOWSIGHT ADS  |  CAMPAIGN KIT PREMIUM', margin, 10);

    y = 30;
    y = drawSectionHeader('Guia de Lanzamiento Paso a Paso', y);
    y += 5;

    const dailyBudget = (config.budget / 30).toFixed(0);
    const weeklyBudget = (config.budget / 4).toFixed(0);
    const cpcGoogle = (1.5).toFixed(2); // CPC promedio Google Search
    const cpcMeta = (0.8).toFixed(2);   // CPC promedio Meta
    const cpcTikTok = (0.5).toFixed(2); // CPC promedio TikTok
    const cpcLinkedIn = (5.0).toFixed(2); // CPC promedio LinkedIn
    const estimatedClicks = Math.round(config.budget * 0.8);
    const estimatedReach = Math.round(config.budget * 15);

    const platformGuides: Record<string, Array<{step: string; title: string; desc: string; link?: string}>> = {
      google: [
        { step: '01', title: 'Crea tu campana en Google Ads', desc: 'Ve a Google Ads > Campanas > Nueva campana. Elige objetivo "Trafico al sitio web" o "Ventas". Tipo de campana: Busqueda.', link: 'https://ads.google.com/aw/campaigns/new' },
        { step: '02', title: 'Configura el presupuesto diario', desc: `Ingresa $${dailyBudget} USD/dia. Google puede gastar hasta el doble en dias de alta demanda, pero el promedio mensual no superara $${config.budget} USD. Si en 7 dias no ves clics, sube el presupuesto un 20%.` },
        { step: '03', title: 'Agrega palabras clave exactas', desc: `Usa concordancia exacta: [${config.promote}], [${config.promote} precio], [${config.promote} en ${config.location}]. Evita palabras genericas de 1 sola palabra. Apunta a un CPC maximo de $${cpcGoogle} USD por clic.` },
        { step: '04', title: 'Pega tus titulos y descripciones', desc: 'Agrega 3 titulos (max 30 caracteres cada uno) y 2 descripciones (max 90 caracteres). Usa los textos de la pagina anterior. El sistema rotara las combinaciones y mostrara las que mejor funcionen.' },
        { step: '05', title: 'Activa extensiones de anuncio', desc: 'En "Recursos" agrega: Enlace de sitio (tu URL principal), Llamada (tu telefono), Extracto de texto (3 beneficios clave). Esto no tiene costo extra y aumenta el CTR hasta un 15%.' },
        { step: '06', title: 'Metricas clave a revisar en 7 dias', desc: `CTR objetivo: mayor a 3%. Si es menor, cambia el titulo. CPC real objetivo: menor a $${cpcGoogle} USD. Si es mayor, pausa las palabras clave mas caras. Tasa de conversion objetivo: mayor a 2%.` },
      ],
      meta: [
        { step: '01', title: 'Crea tu campana en Meta Ads', desc: 'Ve a Administrador de Anuncios > Crear. Objetivo recomendado: "Trafico" (para visitas) o "Ventas" (si tienes pixel instalado en tu web).', link: 'https://adsmanager.facebook.com/adsmanager/manage/campaigns' },
        { step: '02', title: 'Configura el presupuesto del conjunto de anuncios', desc: `Presupuesto diario: $${dailyBudget} USD. Activa "Presupuesto Advantage+" para que Meta lo distribuya automaticamente. Programa el anuncio todos los dias, sin restriccion de horario, al menos las primeras 2 semanas.` },
        { step: '03', title: 'Define tu audiencia con precision', desc: `Ubicacion: ${config.location}. Edad: ajusta segun tu cliente ideal (ej: 25-45). Activa "Expansion de audiencia Advantage+" para que Meta encuentre personas similares a las que ya te compran. Audiencia estimada ideal: entre 200,000 y 1,000,000 personas.` },
        { step: '04', title: 'Sube tu imagen y textos del anuncio', desc: 'Formato: imagen 1200x628 px (feed) o 1080x1920 px (stories/reels). Sube la imagen de este kit. Pega el texto principal y el titular de la pagina anterior. CTA recomendado: "Mas informacion" o "Comprar ahora".'},
        { step: '05', title: 'Activa el Pixel de Meta en tu web', desc: 'Si tienes sitio web, instala el Pixel de Meta (codigo de seguimiento). Esto permite a Meta optimizar para conversiones reales, no solo clics, y puede reducir tu costo por resultado hasta un 40%.' },
        { step: '06', title: 'Metricas clave a revisar en 7 dias', desc: `CPM objetivo: menor a $8 USD. Si es mayor, tu audiencia es muy pequena o el anuncio tiene baja relevancia. CPC objetivo: menor a $${cpcMeta} USD. CTR objetivo: mayor a 1.5%. Frecuencia: si supera 3.0, cambia la imagen del anuncio.` },
      ],
      tiktok: [
        { step: '01', title: 'Crea tu campana en TikTok Ads', desc: 'Ve a TikTok Ads Manager > Campanas > Crear. Objetivo: "Trafico" para empezar. Cuando tengas datos, cambia a "Conversiones".', link: 'https://ads.tiktok.com/i18n/dashboard' },
        { step: '02', title: 'Configura el presupuesto del grupo de anuncios', desc: `Presupuesto diario minimo en TikTok: $20 USD. Recomendado para tu caso: $${Math.max(20, parseInt(dailyBudget))} USD/dia. Activa "Optimizacion de presupuesto de campana" para que TikTok distribuya entre grupos de anuncios.` },
        { step: '03', title: 'Configura la audiencia', desc: `Ubicacion: ${config.location}. Edad y genero segun tu cliente. Intereses: deja amplios al inicio (TikTok aprende mejor con audiencias grandes). Tamano de audiencia ideal: entre 500,000 y 5,000,000 personas.` },
        { step: '04', title: 'Sube tu creativo en formato vertical', desc: 'Formato obligatorio: video o imagen 9:16 (1080x1920 px). Duracion de video recomendada: 9 a 15 segundos. Los primeros 3 segundos deben mostrar el beneficio principal. Activa "Identidad de marca" para mostrar tu nombre y logo.' },
        { step: '05', title: 'Activa Smart Creative', desc: 'En la seccion de creativos, activa "Smart Creative". TikTok combinara automaticamente distintas versiones de tu anuncio y mostrara la que mejor funcione, sin costo adicional.' },
        { step: '06', title: 'Metricas clave a revisar en 7 dias', desc: `CPM objetivo: menor a $10 USD. CPC objetivo: menor a $${cpcTikTok} USD. Tasa de reproduccion al 100% objetivo: mayor a 20%. Si el video no llega al 20%, el problema esta en los primeros 3 segundos: cambia el inicio.` },
      ],
      linkedin: [
        { step: '01', title: 'Crea tu campana en LinkedIn', desc: 'Ve a Campaign Manager > Crear campana. Objetivo: "Visitas al sitio web" o "Generacion de contactos" (Lead Gen Forms, muy efectivo en LinkedIn).', link: 'https://www.linkedin.com/campaignmanager/accounts' },
        { step: '02', title: 'Configura el presupuesto', desc: `Presupuesto diario: $${Math.max(10, parseInt(dailyBudget))} USD (minimo recomendado en LinkedIn: $10 USD/dia). LinkedIn es mas caro que otras plataformas (CPC promedio: $${cpcLinkedIn} USD), pero la calidad del lead es mucho mayor.` },
        { step: '03', title: 'Segmenta por cargo y empresa', desc: `Ubicacion: ${config.location}. Cargo: elige los titulos exactos de tu cliente ideal (ej: "Director de Marketing", "CEO", "Gerente de Compras"). Tamano de empresa segun tu mercado. Audiencia ideal: entre 50,000 y 300,000 personas.` },
        { step: '04', title: 'Crea tu anuncio de imagen unica', desc: 'Formato: imagen 1200x627 px. Sube la imagen de este kit. Texto introductorio: max 150 caracteres (lo que ve el usuario antes de "ver mas"). Titular: max 70 caracteres. CTA: "Mas informacion" o "Registrarse".'},
        { step: '05', title: 'Activa el Insight Tag en tu web', desc: 'Instala el Insight Tag de LinkedIn en tu sitio web. Esto permite retargeting (mostrar anuncios a quienes ya visitaron tu web) y medir conversiones. El retargeting en LinkedIn puede reducir el CPA hasta un 30%.' },
        { step: '06', title: 'Metricas clave a revisar en 7 dias', desc: `CTR objetivo: mayor a 0.4% (LinkedIn tiene CTRs mas bajos que otras plataformas, es normal). CPC objetivo: menor a $${cpcLinkedIn} USD. Tasa de apertura de Lead Gen Form: mayor a 10%. Si el CTR es menor a 0.4%, cambia el titular del anuncio.` },
      ],
    };

    const guide = selectedPlatform && platformGuides[selectedPlatform] 
      ? platformGuides[selectedPlatform] 
      : platformGuides['meta'];

    guide.forEach((item) => {
      y = checkPageBreak(y, 30);
      
      // Numero de paso
      doc.setFillColor(16, 185, 129);
      doc.circle(margin + 6, y + 6, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text(item.step, margin + 3.5, y + 8);

      // Titulo del paso
      doc.setTextColor(5, 5, 5);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(item.title, margin + 18, y + 8);

      // Descripcion
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      const stepDesc = doc.splitTextToSize(item.desc, contentWidth - 20);
      doc.text(stepDesc, margin + 18, y + 15);

      // Enlace si existe
      if (item.link) {
        const linkY = y + 15 + stepDesc.length * 4;
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(8);
        doc.text(item.link, margin + 18, linkY);
        doc.link(margin + 18, linkY - 3, contentWidth - 20, 5, { url: item.link });
        y = linkY + 8;
      } else {
        y += 15 + stepDesc.length * 4 + 5;
      }
    });

    // =============================================
    // PAGINA 5: CONSEJOS PARA MAXIMIZAR RESULTADOS
    // =============================================
    doc.addPage();
    y = 25;

    // Header de pagina
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('FLOWSIGHT ADS  |  CAMPAIGN KIT PREMIUM', margin, 10);

    y = 30;
    y = drawSectionHeader('Consejos para Maximizar tus Resultados', y);
    y += 5;

    const platformAdvice: Record<string, Array<{title: string; desc: string}>> = {
      google: [
        { title: 'Semana 1-2: Periodo de aprendizaje (no toques nada)', desc: 'Google necesita entre 50 y 100 conversiones para salir del periodo de aprendizaje. Durante este tiempo, el CPC puede ser mas alto de lo normal. No pauses ni edites la campana. Solo observa.' },
        { title: 'Semana 2: Revisa el Informe de Terminos de Busqueda', desc: `Ve a Palabras clave > Terminos de busqueda. Agrega como palabras clave negativas todo lo que no sea relevante para ${config.promote}. Esto puede reducir el desperdicio de presupuesto hasta un 30%.` },
        { title: 'Si el CTR es menor a 3%: cambia los titulos', desc: 'Un CTR bajo significa que las personas ven tu anuncio pero no hacen clic. Prueba titulos que incluyan el precio, una oferta o una pregunta directa. Ejemplo: "Desde $X USD" o "Disponible en ${config.location}".' },
        { title: 'Si el CPC supera $2.00 USD: pausa palabras caras', desc: 'Ve a Palabras clave, ordena por CPC de mayor a menor. Pausa las que cuesten mas de $2.00 USD y tengan 0 conversiones. Esto libera presupuesto para las que si convierten.' },
        { title: 'Mes 2: Activa Smart Bidding', desc: 'Una vez que tengas al menos 30 conversiones registradas, cambia la estrategia de puja a "CPA objetivo" o "Maximizar conversiones". Ingresa como CPA objetivo el 20% del valor de tu venta promedio.' },
        { title: 'Indicador de exito: ROAS mayor a 3x', desc: `Si gastas $${config.budget} USD y generas mas de $${config.budget * 3} USD en ventas, tu campana es rentable. Si el ROAS es menor a 2x despues de 30 dias, revisa la pagina de destino y el proceso de compra.` },
      ],
      meta: [
        { title: 'Semana 1-2: Fase de aprendizaje de Meta', desc: 'Meta necesita al menos 50 eventos de optimizacion (clics, compras, leads) por semana para salir del aprendizaje. Evita editar el conjunto de anuncios durante este periodo o reiniciara el proceso.' },
        { title: 'Si el CPM supera $10 USD: amplia la audiencia', desc: `Un CPM alto indica que tu audiencia es muy pequena o muy competida. Expande la ubicacion mas alla de ${config.location}, sube el rango de edad 5 anos, o activa "Expansion de audiencia Advantage+".` },
        { title: 'Si el CTR es menor a 1%: cambia la imagen', desc: 'En Meta, la imagen genera el 80% de los clics. Si el CTR esta por debajo de 1%, duplica el anuncio con una imagen diferente y pausa el original. Prueba imagenes con personas reales vs. productos solos.' },
        { title: 'Frecuencia mayor a 3.0: rota los creativos', desc: 'Cuando la frecuencia supera 3.0, las personas ya vieron tu anuncio demasiadas veces y lo ignoran. Duplica el conjunto de anuncios con una imagen nueva. Mantener frecuencia entre 1.5 y 2.5 es lo ideal.' },
        { title: 'Mes 2: Crea una audiencia de retargeting', desc: 'Ve a Audiencias > Crear audiencia personalizada > Personas que visitaron tu web (ultimos 30 dias). Crea un anuncio especifico para ellos con una oferta o descuento. El retargeting convierte 3x mas que el trafico frio.' },
        { title: 'Indicador de exito: CPA menor al 20% del valor de venta', desc: `Si tu producto vale $100 USD, tu costo por adquisicion (CPA) no deberia superar $20 USD. Con presupuesto de $${config.budget} USD/mes y CPA de $20, deberias obtener al menos ${Math.round(config.budget / 20)} clientes nuevos.` },
      ],
      tiktok: [
        { title: 'Semana 1: Fase de aprendizaje de TikTok', desc: 'TikTok necesita al menos 50 conversiones por grupo de anuncios para optimizar bien. Durante la primera semana, el algoritmo esta aprendiendo. No pauses ni edites el grupo de anuncios.' },
        { title: 'Si la tasa de reproduccion al 100% es menor a 20%: cambia el inicio', desc: 'Si menos del 20% de las personas ven tu video completo, el problema esta en los primeros 3 segundos. Prueba empezar con una pregunta, un dato sorprendente o mostrando el resultado final primero.' },
        { title: 'Si el CPM supera $12 USD: amplia la audiencia', desc: 'TikTok funciona mejor con audiencias grandes. Si tu CPM es alto, elimina los filtros de intereses y deja solo ubicacion y edad. El algoritmo de TikTok es muy bueno encontrando a las personas correctas por su cuenta.' },
        { title: 'Semana 2: Prueba 3 versiones del creativo', desc: 'Crea 3 variantes del anuncio con distintos primeros 3 segundos. Deja correr 3 dias y pausa las 2 que tengan menor CTR. Esto puede mejorar el rendimiento hasta un 50%.' },
        { title: 'Activa el Pixel de TikTok en tu web', desc: 'Instala el Pixel de TikTok en tu sitio web. Esto permite optimizar para conversiones reales (no solo clics) y crear audiencias de retargeting. Sin el Pixel, solo puedes optimizar para trafico.' },
        { title: 'Indicador de exito: CPC menor a $0.50 USD', desc: `Con presupuesto de $${config.budget} USD/mes y CPC de $0.50 USD, deberias obtener al menos ${Math.round(config.budget / 0.5)} clics al mes. Si el CPC supera $1.00 USD, el creativo necesita mejoras.` },
      ],
      linkedin: [
        { title: 'Semana 1-2: Fase de aprendizaje de LinkedIn', desc: 'LinkedIn necesita entre 7 y 14 dias para optimizar la entrega. Durante este periodo, el CPC puede ser mas alto. No hagas cambios. El algoritmo esta encontrando a las personas con mayor probabilidad de hacer clic.' },
        { title: 'Si el CTR es menor a 0.4%: cambia el titular', desc: 'En LinkedIn, el titular es lo mas importante. Prueba incluir el beneficio concreto ("Reduce costos un 30%") o dirigirte directamente al cargo ("Para Directores de Marketing"). Evita titulos genericos.' },
        { title: 'Audiencia menor a 50,000: amplia los criterios', desc: 'Si tu audiencia es menor a 50,000 personas, el costo por impresion sera muy alto. Agrega mas titulos de cargo, expande a paises vecinos, o sube el rango de anos de experiencia.' },
        { title: 'Semana 3: Activa el retargeting de visitantes web', desc: 'Si tienes el Insight Tag instalado, crea una campana de retargeting para personas que visitaron tu web en los ultimos 90 dias. En LinkedIn, el retargeting puede reducir el CPA hasta un 30%.' },
        { title: 'Usa Lead Gen Forms para capturar contactos', desc: 'En lugar de enviar trafico a tu web, usa el formulario nativo de LinkedIn. Las personas no tienen que salir de la app para dejar sus datos. La tasa de conversion es 3x mayor que con landing pages externas.' },
        { title: 'Indicador de exito: CPL menor a $50 USD', desc: `En LinkedIn B2B, un costo por lead (CPL) menor a $50 USD es excelente. Con presupuesto de $${config.budget} USD/mes, apunta a obtener al menos ${Math.round(config.budget / 50)} leads calificados. Si el CPL supera $100 USD, revisa la segmentacion.` },
      ],
    };

    const advice = selectedPlatform && platformAdvice[selectedPlatform]
      ? platformAdvice[selectedPlatform]
      : platformAdvice['meta'];

    advice.forEach((item, i) => {
      y = checkPageBreak(y, 35);
      
      // Numero
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text(`${i + 1}`, margin, y + 10);

      // Titulo
      doc.setTextColor(5, 5, 5);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(item.title, margin + 12, y + 5);

      // Descripcion
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      const adviceLines = doc.splitTextToSize(item.desc, contentWidth - 15);
      doc.text(adviceLines, margin + 12, y + 12);
      y += 12 + adviceLines.length * 4 + 10;
    });

    // =============================================
    // PAGINA FINAL: CHECKLIST Y CIERRE
    // =============================================
    y = checkPageBreak(y, 100);
    if (y < 50) {
      // Estamos en pagina nueva
    } else {
      doc.addPage();
      y = 25;
    }

    // Header de pagina
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('FLOWSIGHT ADS  |  CAMPAIGN KIT PREMIUM', margin, 10);

    y = 30;
    y = drawSectionHeader('Tu Checklist de Lanzamiento', y);
    y += 5;

    const checklist = [
      'Tengo una cuenta activa en la plataforma elegida',
      'Mi imagen/video cumple con las dimensiones recomendadas',
      'He copiado los textos del anuncio de este documento',
      'He definido mi presupuesto diario',
      'He configurado mi audiencia objetivo',
      'He agregado la URL de mi pagina web o tienda',
      'He revisado la vista previa del anuncio',
      'He publicado mi campana',
    ];

    checklist.forEach((item) => {
      y = checkPageBreak(y, 12);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(margin, y, 5, 5, 1, 1, 'S');
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(item, margin + 10, y + 4);
      y += 12;
    });

    y += 15;
    y = checkPageBreak(y, 50);

    // Bloque de cierre
    doc.setFillColor(5, 5, 5);
    doc.roundedRect(margin, y, contentWidth, 45, 3, 3, 'F');
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Necesitas ayuda?', margin + 10, y + 15);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Nuestro equipo esta listo para ayudarte a optimizar tus resultados.', margin + 10, y + 25);
    doc.setTextColor(16, 185, 129);
    doc.text('contacto@flowsights.com  |  WhatsApp: +54 9 11 1234-5678', margin + 10, y + 35);

    // Footer final
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text(`FlowSight Ads  |  Campaign Kit Premium  |  ${dateStr}  |  ID: ${campaignId}`, margin, pageHeight - 10);

    doc.save(`FlowSight-Premium-Kit-${selectedPlatform || 'Global'}.pdf`);
  };

  if (isLoading) {
    return <AppleStyleLoadingScreen isVisible={true} currentStep={loadingStep} totalSteps={4} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] selection:bg-emerald-500/30 transition-colors duration-500">
      {/* Lightbox */}
      <AnimatePresence>
        {selectedAdForLightbox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedAdForLightbox(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X className="w-10 h-10" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedAdForLightbox.platform === 'google' && <GoogleAdsPreview {...selectedAdForLightbox} imageUrl={selectedAdForLightbox.imageUrl} businessName={selectedAdForLightbox.businessName} websiteUrl={selectedAdForLightbox.websiteUrl} />}
              {selectedAdForLightbox.platform === 'meta' && <MetaPreview {...selectedAdForLightbox} imageUrl={selectedAdForLightbox.imageUrl} businessName={selectedAdForLightbox.businessName} websiteUrl={selectedAdForLightbox.websiteUrl} />}
              {selectedAdForLightbox.platform === 'tiktok' && <TikTokPreview {...selectedAdForLightbox} imageUrl={selectedAdForLightbox.imageUrl} businessName={selectedAdForLightbox.businessName} />}
              {selectedAdForLightbox.platform === 'linkedin' && <LinkedInPreview {...selectedAdForLightbox} imageUrl={selectedAdForLightbox.imageUrl} businessName={selectedAdForLightbox.businessName} />}
              
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={() => generatePDF(selectedAdForLightbox.platform)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-2xl font-bold gap-2"
                >
                  <Download className="w-5 h-5" /> Descargar Kit {selectedAdForLightbox.platform.toUpperCase()}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(selectedAdForLightbox.platformUrl, '_blank')}
                  className="border-white/10 text-white hover:bg-white/5 px-8 py-6 rounded-2xl font-bold gap-2"
                >
                  <ExternalLink className="w-5 h-5" /> Publicar Ahora
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-black/60 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { 
                if (showResults) {
                  // Desde resultados, volver al paso 5 (presupuesto)
                  setShowResults(false);
                  setGeneratedAds([]);
                  setStep(5);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (step > 1) {
                  setStep(step - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={step === 1 && !showResults}
              className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Volver al paso anterior"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Atrás
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${showResults ? 'w-4 bg-emerald-500/50' : s === step ? 'w-10 bg-emerald-500' : s < step ? 'w-4 bg-emerald-500/30' : 'w-4 bg-gray-200 dark:bg-white/10'}`} />
              ))}
              {showResults && <div className="h-1.5 w-10 rounded-full bg-emerald-500" />}
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-2" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
              <Zap className="w-3 h-3 fill-emerald-500" />
              PREMIUM
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 transition-all" 
              title="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={handleLogout} className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-all font-medium" title="Cerrar sesion">
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Cerrar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <div className="max-w-3xl mx-auto">
              {step === 1 && (
                <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 01: Tu Negocio
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      Cuéntanos sobre tu <span className="text-emerald-500">negocio</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">La IA usará esta información para personalizar tus anuncios y mockups.</p>
                  </div>

                  {/* Nombre del negocio */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Nombre del negocio o empresa</label>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000" />
                      <Building2 className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500 w-7 h-7 z-10" />
                      <Input
                        value={config.businessName}
                        onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                        placeholder="Ej: FlowSights, Café Luna, Studio Fit..."
                        className="relative text-2xl py-10 pl-20 pr-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Links del negocio */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Links del negocio <span className="normal-case font-normal text-gray-400">(opcionales — ayudan a la IA)</span></label>
                    <div className="space-y-3">
                      {/* Web */}
                      <div className="relative flex items-center gap-3 bg-white dark:bg-white/5 rounded-2xl shadow-lg px-5 py-4 border border-gray-100 dark:border-white/5 focus-within:border-emerald-500/40 transition-all">
                        <Globe2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <Input
                          value={config.websiteUrl}
                          onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                          placeholder="https://tunegocio.com"
                          className="border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0 placeholder:text-gray-400"
                        />
                      </div>
                      {/* Instagram */}
                      <div className="relative flex items-center gap-3 bg-white dark:bg-white/5 rounded-2xl shadow-lg px-5 py-4 border border-gray-100 dark:border-white/5 focus-within:border-pink-500/40 transition-all">
                        <span className="w-5 h-5 text-pink-400 flex-shrink-0 font-bold text-sm flex items-center justify-center">IG</span>
                        <Input
                          value={config.instagramUrl}
                          onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/tunegocio"
                          className="border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0 placeholder:text-gray-400"
                        />
                      </div>
                      {/* Facebook */}
                      <div className="relative flex items-center gap-3 bg-white dark:bg-white/5 rounded-2xl shadow-lg px-5 py-4 border border-gray-100 dark:border-white/5 focus-within:border-blue-500/40 transition-all">
                        <span className="w-5 h-5 text-blue-500 flex-shrink-0 font-bold text-sm flex items-center justify-center">FB</span>
                        <Input
                          value={config.facebookUrl}
                          onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/tunegocio"
                          className="border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    {(config.websiteUrl || config.instagramUrl || config.facebookUrl) && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> ¡Perfecto! La IA analizará tus links para personalizar mejor la campaña.
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    disabled={!config.businessName}
                    onClick={(e) => { e.preventDefault(); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="w-full py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 transition-all active:scale-[0.98]"
                  >
                    Siguiente Paso
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 02: Concepto
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      ¿Qué vamos a <span className="text-emerald-500">vender</span> hoy?
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Describe tu producto o servicio en una frase potente.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000" />
                      <SparklesIconLucide className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500 w-8 h-8 z-10" />
                      <Input 
                        value={config.promote}
                        onChange={(e) => setConfig({...config, promote: e.target.value})}
                        placeholder="Ej: Membresía de Gimnasio, Consultoría IA..."
                        className="relative text-2xl py-10 pl-20 pr-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => setConfig({...config, promote: s.label})}
                          className="px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="button"
                    disabled={!config.promote}
                    onClick={(e) => { e.preventDefault(); setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="w-full py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 transition-all active:scale-[0.98]"
                  >
                    Siguiente Paso
                  </Button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 03: Alcance
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      ¿Dónde está tu <span className="text-emerald-500">audiencia</span>?
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Define la ubicación geográfica de tu mercado ideal.</p>
                  </div>

                  <LocationInput
                    value={config.location}
                    onChange={(value) => setConfig({...config, location: value})}
                    placeholder="Escribe una ciudad o país..."
                  />

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                    <Button 
                      disabled={!config.location}
                      onClick={() => { setStep(4); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40"
                    >
                      Continuar
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 04: Creatividad
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      Personaliza tu <span className="text-emerald-500">impacto</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Describe a tu cliente y elige cómo quieres tus visuales.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Textarea 
                        value={config.idealCustomer}
                        onChange={(e) => setConfig({...config, idealCustomer: e.target.value})}
                        placeholder="Ej: Dueños de negocios que buscan escalar, familias jóvenes interesadas en salud..."
                        className="text-xl py-8 px-8 rounded-3xl border-none bg-white dark:bg-white/5 shadow-2xl focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
                      />
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Familias jóvenes",
                          "Dueños de negocio",
                          "Profesionales",
                          "Estudiantes",
                          "Emprendedores",
                          "Padres de familia"
                        ].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              const newValue = config.idealCustomer ? `${config.idealCustomer}, ${tag}` : tag;
                              setConfig({...config, idealCustomer: newValue});
                            }}
                            className="px-4 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium transition-all border border-emerald-500/20 hover:border-emerald-500/50"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all ${config.userImage ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-200 dark:border-white/10 hover:border-emerald-500/50'}`}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                      {config.userImage ? (
                        <div className="flex items-center gap-4">
                          <img src={config.userImage} className="w-16 h-16 rounded-xl object-cover shadow-lg" alt="Preview" />
                          <div className="flex-1">
                            <p className="text-emerald-500 font-bold text-sm">¡Imagen cargada!</p>
                            <p className="text-xs text-gray-500">Click para cambiar</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setConfig({...config, userImage: null}); }} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                            <XIconLucide className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-3">
                          <UploadIconLucide className="w-8 h-8 text-emerald-500 mx-auto" />
                          <p className="font-bold text-base dark:text-white">Sube la imagen de tu anuncio</p>
                          <p className="text-xs text-gray-400">JPG, PNG o WEBP · Recomendado 1200×630 px</p>
                        </div>
                      )}
                    </div>
                    {!config.userImage && (
                      <p className="text-xs text-amber-500 font-medium flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" /> La imagen es obligatoria para generar los mockups.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                    <Button 
                      disabled={!config.idealCustomer || !config.userImage}
                      onClick={() => { setStep(5); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continuar
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 05: Inversión
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      ¿Cuál es tu <span className="text-emerald-500">presupuesto</span>?
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">Ajusta la inversión mensual para ver proyecciones.</p>
                  </div>
                  
                  <div className="space-y-12 py-10 bg-white dark:bg-white/5 rounded-[40px] p-10 shadow-2xl">
                    <div className="text-center space-y-2">
                      <motion.span key={config.budget} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl font-black text-emerald-500 block">
                        ${config.budget}
                      </motion.span>
                      <span className="text-2xl font-bold text-gray-400 uppercase tracking-widest">USD / MES</span>
                    </div>
                    
                    <Slider value={[config.budget]} onValueChange={(val) => setConfig({...config, budget: val[0]})} max={5000} min={50} step={50} className="py-4" />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Alcance Est.</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{(config.budget * 15).toLocaleString('es-ES')}</p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Clicks Est.</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{(config.budget * 0.8).toFixed(0)}</p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">ROI Proyectado</p>
                        <p className="text-lg font-black text-emerald-500">3.5x</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(4)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                    <Button onClick={handleGenerate} className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 gap-3">
                      <SparklesIconLucide className="w-6 h-6" /> Generar Campaña Premium
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Tus anuncios están <span className="text-emerald-500">listos</span></h2>
                  <p className="text-gray-500 dark:text-gray-400">Selecciona una plataforma para ver y personalizar tus anuncios.</p>
                </div>
                <div className="flex gap-3">
                  {!hasPaid && (
                    <Button 
                      onClick={() => setShowPaymentModal(true)}
                      className="rounded-2xl py-6 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <CreditCard className="w-4 h-4" /> Checkout
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { setShowResults(false); setStep(1); }} className="rounded-2xl py-6 px-6 border-gray-200 dark:border-white/10 font-bold">
                    <RefreshCw className="w-4 h-4 mr-2" /> Nueva Campaña
                  </Button>
                </div>
              </div>

              {/* Selector de Plataformas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['meta', 'google', 'tiktok', 'linkedin'] as const).map((platform) => {
                  const platformLabels = { meta: 'Meta', google: 'Google', tiktok: 'TikTok', linkedin: 'LinkedIn' };
                  const platformColors = {
                    meta: 'from-blue-500 to-blue-600',
                    google: 'from-red-500 via-yellow-500 to-blue-500',
                    tiktok: 'from-black to-pink-500',
                    linkedin: 'from-blue-600 to-blue-700',
                  };
                  return (
                    <motion.button
                      key={platform}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`p-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all border-2 ${
                        selectedPlatform === platform
                          ? `bg-gradient-to-r ${platformColors[platform]} text-white border-transparent shadow-lg`
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {platformLabels[platform]}
                    </motion.button>
                  );
                })}
              </div>

              {/* Métricas Wow */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Puntuación de Campaña", value: 94, suffix: "/100", icon: Star, color: "text-yellow-500" },
                  { label: "CTR Proyectado", value: 4.2, suffix: "%", icon: MousePointer, color: "text-emerald-500" },
                  { label: "Impresiones Est.", value: config.budget * 15, suffix: "", icon: Eye, color: "text-blue-500" },
                  { label: "Fuerza del Copy", value: "Excelente", suffix: "", icon: Activity, color: "text-purple-500", isText: true }
                ].map((m, i) => (
                  <Card key={i} className="p-6 border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 rounded-3xl shadow-xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 ${m.color}`}>
                        <m.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{m.label}</p>
                        <div className="text-2xl font-black text-gray-900 dark:text-white flex items-baseline">
                          {metricsVisible ? (
                            m.isText ? (
                              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{m.value}</motion.span>
                            ) : (
                              <AnimatedStat stat={{ value: m.value as number, suffix: m.suffix, label: "", decimals: typeof m.value === 'number' && m.value % 1 !== 0 ? 1 : 0 }} className="text-2xl font-black" />
                            )
                          ) : (
                            <span>0{m.suffix}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Ads Results Showcase - Mockups con Botones de Acción */}
              <AdsResultsShowcase
                ads={generatedAds}
                businessName={config.businessName}
                hasPaid={hasPaid}
                onViewGuide={(platform) => {
                  setGuideLightboxPlatform(platform);
                  setIsGuideLightboxOpen(true);
                }}
                onDownloadPDF={(platform) => {
                  if (hasPaid) {
                    handleExportPDF();
                  } else {
                    setShowPaymentModal(true);
                  }
                }}
                onPublish={(platform, url) => {
                  if (hasPaid) {
                    window.open(url, '_blank');
                  } else {
                    setShowPaymentModal(true);
                  }
                }}
                onCheckout={() => setShowPaymentModal(true)}
              />

              {/* Premium Results Dashboard */}
              <PremiumResultsDashboard
                campaignName={config.businessName}
                businessName={config.businessName}
                platform={selectedPlatform}
                generatedAds={generatedAds}
                onExportPDF={handleExportPDF}
                onViewDashboard={handleViewDashboard}
                onDownloadAssets={handleDownloadAssets}
              />

              {/* Simplified ROI Calculator */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                  Lo que puedes esperar
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">Visualiza el potencial de tu inversión en cada plataforma</p>
                <SimplifiedROICalculator
                  budget={config.budget}
                  onBudgetChange={(budget) => setConfig({...config, budget})}
                />
              </div>

              {/* Client Dashboard - Nuevo */}
              {hasPaid && (
                <div id="client-dashboard" className="mt-12 pt-8 border-t border-white/10">
                  <ClientDashboard
                    businessName={config.businessName}
                    generatedAds={generatedAds}
                    budget={config.budget}
                    location={config.location}
                    createdAt={new Date()}
                    hasPaid={hasPaid}
                    onDownloadKit={handleExportPDF}
                    onDownloadGuide={() => setIsGuideLightboxOpen(true)}
                  />
                </div>
              )}

              {/* Editable Platform Previews - Premium Gallery */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="space-y-2 mb-8">
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Personaliza tus <span className="text-emerald-500">Anuncios</span></h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Ajusta los textos y descarga cada Campaing Kit personalizado para tu plataforma</p>
                </div>
                <div className="space-y-6">
                  {generatedAds.map((ad, idx) => (
                      <EditablePlatformPreview
                        key={idx}
                        platform={ad.platform}
                        headline={ad.headline}
                        description={ad.description}
                        cta={ad.cta}
                        imageUrl={ad.imageUrl}
                        businessName={ad.businessName}
                        websiteUrl={ad.websiteUrl}
                        hasPaid={hasPaid}
                        onDownloadKit={() => {
                          downloadPremiumPDFV2(config, [ad], ad.platform);
                          toast({
                            title: '✅ Campaing Kit Descargado',
                            description: `Kit personalizado para ${ad.platform} listo`,
                          });
                        }}
                        onDownloadGuide={() => {
                          setGuideLightboxPlatform(ad.platform);
                          setIsGuideLightboxOpen(true);
                        }}
                        onPublish={() => window.open(ad.platformUrl, '_blank')}
                        onPaymentRequired={() => setShowPaymentModal(true)}
                        onUpdate={(updates) => {
                          const updatedAds = [...generatedAds];
                          updatedAds[idx] = {
                            ...updatedAds[idx],
                            ...updates,
                          };
                          setGeneratedAds(updatedAds);
                        }}
                      />
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Apple Style Loading Screen */}
      <AppleStyleLoadingScreen
        isVisible={isLoading}
        currentStep={loadingStep}
        totalSteps={4}
      />

      {/* Mockup Lightbox */}
      <MockupLightbox
        isOpen={mockupLightboxOpen}
        onClose={() => setMockupLightboxOpen(false)}
        ads={generatedAds.filter((ad) => ad.platform === selectedPlatform)}
        currentIndex={mockupLightboxIndex}
        onPrevious={() => setMockupLightboxIndex(Math.max(0, mockupLightboxIndex - 1))}
        onNext={() => setMockupLightboxIndex(Math.min(generatedAds.filter((ad) => ad.platform === selectedPlatform).length - 1, mockupLightboxIndex + 1))}
        platform={selectedPlatform}
        businessName={config.businessName}
        hasPaid={hasPaid}
        onPaymentRequired={() => setShowPaymentModal(true)}
      />
      {/* Visual Guide Lightbox */}
      <VisualGuideLightbox 
        isOpen={isGuideLightboxOpen} 
        onClose={() => setIsGuideLightboxOpen(false)} 
        platform={guideLightboxPlatform} 
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        campaignId="flowsights-ads-kit"
        campaignName={config.businessName || 'Tu Campaña'}
        amount={4999}
        currency="USD"
      />
    </div>
  );
};

export default FlowsightAdsDashboard;
