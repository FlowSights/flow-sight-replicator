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
  BookOpen, PlayCircle, MousePointerClick, Moon, Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { LocationInput } from '@/components/LocationInput';
import { ROIEstimator } from '@/components/ROIEstimator';
import { motion, AnimatePresence } from 'framer-motion';
import { MetaPreview, TikTokPreview, LinkedInPreview, GoogleAdsPreview } from '@/components/PlatformPreviewsNative';
import { VisualGuideLightbox } from '@/components/VisualGuideLightbox';
import jsPDF from 'jspdf';
import { useCountUp } from '@/hooks/useCountUp';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

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
}

interface CampaignConfig {
  promote: string;
  location: string;
  idealCustomer: string;
  budget: number;
  userImage: string | null;
}


const FlowsightAdsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAdForLightbox, setSelectedAdForLightbox] = useState<GeneratedAd | null>(null);
  const [metricsVisible, setMetricsVisible] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  const [activeGuidePlatform, setActiveGuidePlatform] = useState<string | null>(null);
  const [isGuideLightboxOpen, setIsGuideLightboxOpen] = useState(false);
  const [guideLightboxPlatform, setGuideLightboxPlatform] = useState<'meta' | 'google' | 'tiktok' | 'linkedin'>('meta');
  
  const [config, setConfig] = useState<CampaignConfig>({
    promote: '',
    location: '',
    idealCustomer: '',
    budget: 100,
    userImage: null,
  });

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
    'Generando copys persuasivos con IA...',
    'Diseñando creativos visuales inteligentes...',
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
      }
    };
    checkUser();
  }, [navigate]);

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
    
    for (let i = 0; i < loadingMessages.length; i++) {
      setLoadingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // La imagen es provista por el usuario (obligatoria desde el paso 3)
    const finalImage = config.userImage || '';
    console.log('[FlowSightAds] Rendering with user image:', finalImage.startsWith('data:') ? 'base64 image' : finalImage);

    const ads: GeneratedAd[] = [
      {
        type: 'Offer',
        headline: `¡Oferta Exclusiva: ${config.promote}!`,
        description: `La mejor solución en ${config.location} para ${config.idealCustomer}. ¡Consigue un descuento especial hoy mismo!`,
        cta: 'Obtener Oferta',
        imageUrl: finalImage,
        platform: 'google',
        score: 94,
        platformUrl: `https://ads.google.com/aw/campaigns/new?keyword=${encodeURIComponent(config.promote)}`
      },
      {
        type: 'Emotional',
        headline: `Diseñado para ${config.idealCustomer}`,
        description: `En ${config.location} entendemos tus necesidades. ${config.promote} es la pieza que faltaba en tu vida.`,
        cta: 'Saber Más',
        imageUrl: finalImage,
        platform: 'meta',
        score: 89,
        platformUrl: `https://adsmanager.facebook.com/adsmanager/manage/campaigns`
      },
      {
        type: 'Urgency',
        headline: `¡Última oportunidad en ${config.location}!`,
        description: `Solo para ${config.idealCustomer}. No dejes pasar la oportunidad de mejorar con ${config.promote}.`,
        cta: 'Reservar Ahora',
        imageUrl: finalImage,
        platform: 'tiktok',
        score: 97,
        platformUrl: `https://ads.tiktok.com/i18n/dashboard`
      },
      {
        type: 'Offer',
        headline: `Impulsa tu éxito con ${config.promote}`,
        description: `Soluciones profesionales para ${config.idealCustomer} en ${config.location}. Líderes en el sector.`,
        cta: 'Contactar',
        imageUrl: finalImage,
        platform: 'linkedin',
        score: 92,
        platformUrl: `https://www.linkedin.com/campaignmanager/accounts`
      }
    ];

    setGeneratedAds(ads);
    setShowResults(true);
    setIsLoading(false);
    setTimeout(() => setMetricsVisible(true), 500);
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
    doc.text(`Producto: ${config.promote}`, margin, 155);
    doc.text(`Mercado: ${config.location}`, margin, 165);
    doc.text(`Audiencia: ${config.idealCustomer}`, margin, 175);
    doc.text(`Inversion: $${config.budget} USD / mes`, margin, 185);

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
      { label: 'Que vendes', value: config.promote, icon: 'Producto' },
      { label: 'Donde esta tu cliente', value: config.location, icon: 'Mercado' },
      { label: 'A quien le hablas', value: config.idealCustomer, icon: 'Audiencia' },
      { label: 'Cuanto invertir', value: `$${config.budget} USD / mes`, icon: 'Inversion' },
      { label: 'Donde publicar', value: selectedPlatform ? platformNames[selectedPlatform] : 'Todas las plataformas', icon: 'Plataforma' },
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
      { label: 'Alcance Estimado', value: `${(config.budget * 15).toLocaleString()} personas`, desc: 'Personas que veran tu anuncio cada mes' },
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

    const platformGuides: Record<string, Array<{step: string; title: string; desc: string; link?: string}>> = {
      google: [
        { step: '01', title: 'Abre Google Ads', desc: 'Haz clic en el enlace para ir directamente a crear tu campana.', link: 'https://ads.google.com/aw/campaigns/new' },
        { step: '02', title: 'Elige tu objetivo', desc: 'Selecciona "Ventas" o "Trafico del sitio web" segun tu necesidad.' },
        { step: '03', title: 'Define tu presupuesto', desc: `Ingresa $${(config.budget / 30).toFixed(0)} USD como presupuesto diario (equivale a $${config.budget}/mes).` },
        { step: '04', title: 'Agrega palabras clave', desc: 'Piensa como busca tu cliente. Usa frases especificas, no palabras sueltas.' },
        { step: '05', title: 'Copia tus textos', desc: 'Pega los titulos y descripciones de la pagina anterior en los campos del anuncio.' },
        { step: '06', title: 'Publica', desc: 'Revisa el resumen y haz clic en "Publicar campana". Google lo revisara en unas horas.' },
      ],
      meta: [
        { step: '01', title: 'Abre el Administrador de Anuncios', desc: 'Haz clic en el enlace para ir directamente a tu cuenta.', link: 'https://adsmanager.facebook.com/adsmanager/manage/campaigns' },
        { step: '02', title: 'Haz clic en "+ Crear"', desc: 'El boton verde en la esquina superior izquierda.' },
        { step: '03', title: 'Elige tu objetivo', desc: 'Selecciona "Trafico" para visitas o "Ventas" para conversiones.' },
        { step: '04', title: 'Define tu audiencia', desc: `Ingresa "${config.location}" como ubicacion y ajusta edad y genero segun tu cliente ideal.` },
        { step: '05', title: 'Sube tu imagen y textos', desc: 'Carga la imagen que preparamos y pega el copy y titulo de la pagina anterior.' },
        { step: '06', title: 'Publica', desc: 'Revisa la vista previa y presiona "Publicar". Meta lo revisara en minutos.' },
      ],
      tiktok: [
        { step: '01', title: 'Abre TikTok Ads Manager', desc: 'Haz clic en el enlace para ir a tu panel de control.', link: 'https://ads.tiktok.com/i18n/dashboard' },
        { step: '02', title: 'Crea una campana', desc: 'Haz clic en "Crear" en la pestana de Campanas.' },
        { step: '03', title: 'Elige tu objetivo', desc: 'Selecciona "Trafico" para empezar rapido.' },
        { step: '04', title: 'Configura tu audiencia', desc: `Define ubicacion "${config.location}", edad y genero. Deja los intereses amplios.` },
        { step: '05', title: 'Sube tu contenido', desc: 'Carga tu imagen o video en formato vertical (9:16) y pega el texto del anuncio.' },
        { step: '06', title: 'Envia a revision', desc: 'Revisa la vista previa en formato movil y presiona "Enviar".' },
      ],
      linkedin: [
        { step: '01', title: 'Abre Campaign Manager', desc: 'Haz clic en el enlace para ir a tu cuenta publicitaria.', link: 'https://www.linkedin.com/campaignmanager/accounts' },
        { step: '02', title: 'Crea una campana', desc: 'Selecciona tu cuenta y haz clic en "Crear" > "Campana".' },
        { step: '03', title: 'Elige tu objetivo', desc: 'Selecciona "Visitas al sitio web" o "Generacion de contactos".' },
        { step: '04', title: 'Segmenta profesionalmente', desc: 'Usa filtros de cargo, sector y tamano de empresa para llegar a los decisores correctos.' },
        { step: '05', title: 'Sube tu imagen y textos', desc: 'Elige "Anuncio con imagen", sube la imagen y pega los textos de la pagina anterior.' },
        { step: '06', title: 'Lanza tu campana', desc: `Confirma tu presupuesto de $${(config.budget / 30).toFixed(0)} USD/dia y haz clic en "Lanzar campana".` },
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
        { title: 'Usa palabras clave especificas', desc: 'Las frases largas y detalladas ("comprar zapatos deportivos baratos en Madrid") atraen clientes con mayor intencion de compra que las palabras genericas ("zapatos").' },
        { title: 'Activa las extensiones de anuncio', desc: 'Agrega tu numero de telefono, direccion y enlaces adicionales. Esto hace que tu anuncio ocupe mas espacio en Google y se vea mas profesional, sin costo extra.' },
        { title: 'No toques nada en 5 dias', desc: 'El sistema de Google necesita entre 3 y 7 dias para aprender quien hace clic en tu anuncio. Si cambias cosas antes, reinicia el aprendizaje.' },
        { title: 'Revisa el "Informe de terminos de busqueda"', desc: 'Despues de una semana, revisa por que palabras reales te encontraron. Elimina las que no tienen sentido para tu negocio.' },
      ],
      meta: [
        { title: 'La imagen es el 70% del exito', desc: 'En Facebook e Instagram, la gente se detiene por la imagen, no por el texto. Asegurate de que tu visual sea llamativo y profesional.' },
        { title: 'Deja que Meta optimice por ti', desc: 'Activa "Ubicaciones Advantage+" y "Presupuesto Advantage+". La inteligencia artificial de Meta sabe donde mostrar tu anuncio al menor costo.' },
        { title: 'Responde los comentarios', desc: 'Cuando alguien comenta en tu anuncio, respondele rapido. Esto mejora la relevancia del anuncio y genera confianza.' },
        { title: 'Prueba diferentes imagenes', desc: 'Despues de una semana, duplica tu anuncio con una imagen diferente. Compara cual funciona mejor y apaga el perdedor.' },
      ],
      tiktok: [
        { title: 'Que parezca contenido real', desc: 'Los anuncios que parecen videos caseros o naturales funcionan mucho mejor que los que se ven "producidos". La autenticidad es la clave en TikTok.' },
        { title: 'Los primeros 3 segundos lo son todo', desc: 'Si no captas la atencion en los primeros 3 segundos, la persona seguira de largo. Empieza con algo impactante o una pregunta directa.' },
        { title: 'Usa musica en tendencia', desc: 'TikTok es una plataforma de audio. Usar una cancion popular puede multiplicar el alcance de tu anuncio.' },
        { title: 'Formato vertical obligatorio', desc: 'Tu contenido debe ser en formato 9:16 (vertical, pantalla completa). Nunca uses videos horizontales en TikTok.' },
      ],
      linkedin: [
        { title: 'Segmenta por cargo, no por intereses', desc: 'LinkedIn es poderoso porque puedes llegar directamente a "Directores de Marketing" o "CEOs de empresas de tecnologia". Usa esta ventaja.' },
        { title: 'Manten tu audiencia entre 50K y 300K', desc: 'Si tu audiencia es muy pequena, sera cara. Si es muy grande, sera poco relevante. El punto ideal esta en ese rango.' },
        { title: 'Tono profesional pero humano', desc: 'Evita sonar como un robot corporativo. Habla como un profesional que le escribe a otro profesional. Directo, claro y con valor.' },
        { title: 'El mejor horario: martes a jueves', desc: 'Los profesionales estan mas activos en LinkedIn entre martes y jueves, de 8am a 10am y de 5pm a 6pm.' },
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
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="w-full max-w-md text-center relative z-10">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-12 relative"
          >
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <Rocket className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={loadingStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-black text-white tracking-tight">{loadingMessages[loadingStep]}</h2>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === loadingStep ? 'w-8 bg-emerald-500' : 'w-2 bg-white/10'}`} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
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
              {selectedAdForLightbox.platform === 'google' && <GoogleAdsPreview {...selectedAdForLightbox} imageUrl={selectedAdForLightbox.imageUrl} />}
              {selectedAdForLightbox.platform === 'meta' && <MetaPreview {...selectedAdForLightbox} imageUrl={selectedAdForLightbox.imageUrl} />}
              {selectedAdForLightbox.platform === 'tiktok' && <TikTokPreview {...selectedAdForLightbox} imageUrl={selectedAdForLightbox.imageUrl} />}
              {selectedAdForLightbox.platform === 'linkedin' && <LinkedInPreview {...selectedAdForLightbox} imageUrl={selectedAdForLightbox.imageUrl} />}
              
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
                if (step > 1) {
                  setStep(step - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }} 
              disabled={step === 1}
              className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Volver al paso anterior"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Atrás
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-10 bg-emerald-500' : s < step ? 'w-4 bg-emerald-500/30' : 'w-4 bg-gray-200 dark:bg-white/10'}`} />
              ))}
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
                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 01: Concepto
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
                    onClick={(e) => { e.preventDefault(); setStep(2); }}
                    className="w-full py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 transition-all active:scale-[0.98]"
                  >
                    Siguiente Paso
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 02: Alcance
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
                    <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                    <Button 
                      disabled={!config.location}
                      onClick={() => setStep(3)}
                      className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40"
                    >
                      Continuar
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 03: Creatividad
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
                    <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
                    <Button 
                      disabled={!config.idealCustomer || !config.userImage}
                      onClick={() => setStep(4)}
                      className="flex-[2] py-10 text-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continuar
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest">
                      Fase 04: Inversión
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
                    
                    <Slider value={[config.budget]} onValueChange={(val) => setConfig({...config, budget: val[0]})} max={5000} min={100} step={100} className="py-4" />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Alcance Est.</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{(config.budget * 15).toLocaleString()}</p>
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
                    <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 py-10 text-xl font-bold rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5">Atrás</Button>
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
                  <p className="text-gray-500 dark:text-gray-400">Haz clic en cualquier anuncio para verlo en pantalla completa y descargar su kit.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setShowResults(false); setStep(1); }} className="rounded-2xl py-6 px-6 border-gray-200 dark:border-white/10 font-bold">
                    <RefreshCw className="w-4 h-4 mr-2" /> Nueva Campaña
                  </Button>
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {generatedAds.map((ad, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    className="group relative flex flex-col h-full"
                  >
                    <div className="absolute -inset-2 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />
                    <div 
                      className="relative transform group-hover:scale-[1.02] transition-all duration-500 cursor-pointer flex-1"
                      onClick={() => setSelectedAdForLightbox(ad)}
                    >
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-white/90 dark:bg-black/90 p-2 rounded-full shadow-xl">
                          <Maximize2 className="w-5 h-5 text-emerald-500" />
                        </div>
                      </div>
                      {ad.platform === 'google' && <GoogleAdsPreview {...ad} imageUrl={ad.imageUrl} />}
                      {ad.platform === 'meta' && <MetaPreview {...ad} imageUrl={ad.imageUrl} />}
                      {ad.platform === 'tiktok' && <TikTokPreview {...ad} imageUrl={ad.imageUrl} />}
                      {ad.platform === 'linkedin' && <LinkedInPreview {...ad} imageUrl={ad.imageUrl} />}
                    </div>
                    <div className="mt-4 space-y-3 relative z-20">
                      <Button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); generatePDF(ad.platform); }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold gap-2 transition-all cursor-pointer py-4 rounded-2xl border-0"
                      >
                        <Download className="w-4 h-4" /> Kit {ad.platform.toUpperCase()}
                      </Button>
                      
                      <div className="flex gap-2">
                      <Button 
                        variant="ghost"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(ad.platformUrl, '_blank'); }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-transparent dark:hover:bg-emerald-500/20 dark:text-emerald-400 rounded-xl py-2 text-xs font-bold gap-1.5 cursor-pointer transition-all border-2 border-emerald-600 dark:border-emerald-500 hover:border-emerald-700 dark:hover:border-emerald-400"
                      >
                        <ExternalLink className="w-3 h-3" /> Publicar
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={(e) => { 
                          e.preventDefault();
                          e.stopPropagation();
                          setGuideLightboxPlatform(ad.platform);
                          setIsGuideLightboxOpen(true);
                        }}
                        className="flex-1 bg-transparent hover:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl py-2 text-xs font-bold gap-1.5 transition-all cursor-pointer border-2 border-blue-600 dark:border-blue-500 hover:border-blue-700 dark:hover:border-blue-400"
                      >
                        <BookOpen className="w-3 h-3" /> Guía Visual
                      </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ROI Estimator Section - After Ads */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                  ¿Cuánto te aporta usar FlowSights Ads?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">Compara lo que obtendrías gestionando tus anuncios solo vs. con la ayuda de FlowSights Ads</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {generatedAds.map((ad, idx) => (
                    <ROIEstimator key={idx} budget={config.budget} platform={ad.platform} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Visual Guide Lightbox */}
        <VisualGuideLightbox 
          isOpen={isGuideLightboxOpen}
          onClose={() => setIsGuideLightboxOpen(false)}
          platform={guideLightboxPlatform}
        />

        {/* Modal de sesión expirada por inactividad */}
        <AnimatePresence>
          {showInactivityModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-gray-100 dark:border-white/10"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  Sesión cerrada
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                  Tu sesión se cerró automáticamente por <strong>10 minutos de inactividad</strong> como medida de seguridad.
                </p>
                <Button
                  onClick={() => {
                    setShowInactivityModal(false);
                    navigate('/flowsight-ads');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl text-base"
                >
                  Volver a iniciar sesión
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FlowsightAdsDashboard;
