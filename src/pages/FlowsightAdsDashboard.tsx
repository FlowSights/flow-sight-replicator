import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Sparkles, ArrowRight, Plus, Download, Share2, Trash2, Loader, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  name: string;
  platform: 'google' | 'meta' | 'tiktok' | 'linkedin';
  type: 'search' | 'visual';
  createdAt: string;
  ads: Ad[];
}

interface Ad {
  id: string;
  headline: string;
  description: string;
  cta: string;
  imageUrl?: string;
  budget?: { min: number; recommended: number; max: number };
}

const FlowsightAdsDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState('');
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({
    name: '',
    platform: 'meta' as 'google' | 'meta' | 'tiktok' | 'linkedin',
    product: '',
    audience: '',
    tone: 'professional',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        navigate('/flowsight-ads');
        return;
      }
      setUser(currentUser);
      fetchCampaigns(currentUser.id);
    } catch (error) {
      navigate('/flowsight-ads');
    }
  };

  const fetchCampaigns = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('ads_campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
    } else {
      const formattedCampaigns: Campaign[] = data.map(c => ({
        id: c.id,
        name: c.name,
        platform: c.platform as any,
        type: c.type as any,
        createdAt: c.created_at,
        ads: c.ads as Ad[]
      }));
      setCampaigns(formattedCampaigns);
    }
    setIsLoading(false);
  };

  const generateAIContent = async () => {
    if (!newCampaignData.name || !newCampaignData.product || !newCampaignData.audience) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    const messages = [
      'Analizando tu audiencia...',
      'Generando copys persuasivos...',
      'Creando variantes de anuncios...',
      'Optimizando para conversión...',
      '¡Listo! Tus anuncios están listos',
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        setGeneratingMessage(messages[messageIndex]);
        messageIndex++;
      }
    }, 800);

    await new Promise(resolve => setTimeout(resolve, 4000));
    clearInterval(messageInterval);

    const isGoogleAds = newCampaignData.platform === 'google';
    const ads: Ad[] = isGoogleAds
      ? [
          {
            id: '1',
            headline: `${newCampaignData.product} - Solución #1`,
            description: `Descubre cómo ${newCampaignData.product} transforma la vida de ${newCampaignData.audience}. Resultados comprobados.`,
            cta: 'Conocer más',
            budget: { min: 500, recommended: 1500, max: 5000 },
          },
          {
            id: '2',
            headline: `${newCampaignData.product} - Oferta Especial`,
            description: `${newCampaignData.audience} confían en nosotros. Acceso exclusivo con descuento limitado.`,
            cta: 'Aprovechar oferta',
            budget: { min: 500, recommended: 1500, max: 5000 },
          },
          {
            id: '3',
            headline: `${newCampaignData.product} - Prueba Gratis`,
            description: `Prueba ${newCampaignData.product} sin riesgo. Garantía de satisfacción para ${newCampaignData.audience}.`,
            cta: 'Probar ahora',
            budget: { min: 500, recommended: 1500, max: 5000 },
          },
        ]
      : [
          {
            id: '1',
            headline: `${newCampaignData.product} - Variante 1`,
            description: `Transforma tu ${newCampaignData.audience} con ${newCampaignData.product}. ¡Únete a miles de usuarios satisfechos!`,
            cta: 'Descubre más',
            imageUrl: 'https://via.placeholder.com/1200x628/10b981/ffffff?text=Anuncio+1',
            budget: { min: 300, recommended: 1000, max: 3000 },
          },
          {
            id: '2',
            headline: `${newCampaignData.product} - Variante 2`,
            description: `Solución perfecta para ${newCampaignData.audience}. Resultados en 30 días o tu dinero de vuelta.`,
            cta: 'Comenzar ahora',
            imageUrl: 'https://via.placeholder.com/1200x628/14b8a6/ffffff?text=Anuncio+2',
            budget: { min: 300, recommended: 1000, max: 3000 },
          },
          {
            id: '3',
            headline: `${newCampaignData.product} - Variante 3`,
            description: `${newCampaignData.audience} merece lo mejor. ${newCampaignData.product} es la respuesta que buscabas.`,
            cta: 'Explorar',
            imageUrl: 'https://via.placeholder.com/1200x628/0d9488/ffffff?text=Anuncio+3',
            budget: { min: 300, recommended: 1000, max: 3000 },
          },
        ];

    const { data, error } = await supabase
      .from('ads_campaigns')
      .insert({
        user_id: user.id,
        name: newCampaignData.name,
        platform: newCampaignData.platform,
        type: isGoogleAds ? 'search' : 'visual',
        ads: ads
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la campaña en la base de datos.",
        variant: "destructive"
      });
    } else {
      const newCampaign: Campaign = {
        id: data.id,
        name: data.name,
        platform: data.platform as any,
        type: data.type as any,
        createdAt: data.created_at,
        ads: data.ads as Ad[]
      };
      setCampaigns([newCampaign, ...campaigns]);
      setSelectedCampaign(newCampaign);
      toast({
        title: "Campaña generada",
        description: "Tu campaña ha sido creada y guardada exitosamente.",
      });
    }

    setShowNewCampaignForm(false);
    setNewCampaignData({ name: '', platform: 'meta', product: '', audience: '', tone: 'professional' });
    setIsGenerating(false);
    setGeneratingMessage('');
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from('ads_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la campaña.",
        variant: "destructive"
      });
    } else {
      setCampaigns(campaigns.filter(c => c.id !== id));
      if (selectedCampaign?.id === id) setSelectedCampaign(null);
      toast({
        title: "Eliminada",
        description: "La campaña ha sido eliminada.",
      });
    }
  };

  const downloadCampaignPDF = (campaign: Campaign) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;

    doc.setFontSize(20);
    doc.text(`Campaña: ${campaign.name}`, 10, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Plataforma: ${campaign.platform.toUpperCase()}`, 10, yPosition);
    yPosition += 5;
    doc.text(`Tipo: ${campaign.type === 'search' ? 'Búsqueda (Google Ads)' : 'Visual (Social Media)'}`, 10, yPosition);
    yPosition += 10;

    campaign.ads.forEach((ad, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 10;
      }

      doc.setFontSize(14);
      doc.text(`Anuncio ${index + 1}`, 10, yPosition);
      yPosition += 7;

      doc.setFontSize(11);
      doc.setTextColor(0, 107, 148);
      doc.text(`Titular: ${ad.headline}`, 10, yPosition);
      yPosition += 5;

      doc.setTextColor(0, 0, 0);
      doc.text(`Descripción: ${ad.description}`, 10, yPosition, { maxWidth: 190 });
      yPosition += 10;

      doc.text(`CTA: ${ad.cta}`, 10, yPosition);
      yPosition += 5;

      if (ad.budget) {
        doc.text(`Presupuesto Mínimo: $${ad.budget.min}`, 10, yPosition);
        yPosition += 4;
        doc.text(`Presupuesto Recomendado: $${ad.budget.recommended}`, 10, yPosition);
        yPosition += 4;
        doc.text(`Presupuesto Máximo: $${ad.budget.max}`, 10, yPosition);
        yPosition += 8;
      }

      doc.setDrawColor(200, 200, 200);
      doc.line(10, yPosition, pageWidth - 10, yPosition);
      yPosition += 5;
    });

    doc.save(`${campaign.name}.pdf`);
  };

  const openPlatformEditor = (platform: string) => {
    const urls: { [key: string]: string } = {
      google: 'https://ads.google.com/home/',
      meta: 'https://business.facebook.com/ads/manager/',
      tiktok: 'https://ads.tiktok.com/',
      linkedin: 'https://www.linkedin.com/campaign/launch/',
    };
    window.open(urls[platform], '_blank');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/flowsight-ads');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display text-emerald-900 dark:text-emerald-100">Flowsight Ads</h1>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Bienvenido, {user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowRight className="w-4 h-4 rotate-180 mr-2" />
                Volver
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Campañas */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <Card className="p-6 glass-card">
              <h2 className="text-xl font-bold mb-4">Mis Campañas</h2>
              <Button onClick={() => setShowNewCampaignForm(!showNewCampaignForm)} variant="hero" className="w-full mb-4">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>

              <AnimatePresence>
                {showNewCampaignForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg space-y-4">
                    <div>
                      <Label>Nombre de Campaña</Label>
                      <Input value={newCampaignData.name} onChange={(e) => setNewCampaignData({ ...newCampaignData, name: e.target.value })} placeholder="Ej: Verano 2024" className="mt-1" />
                    </div>
                    <div>
                      <Label>Plataforma</Label>
                      <select value={newCampaignData.platform} onChange={(e) => setNewCampaignData({ ...newCampaignData, platform: e.target.value as any })} className="w-full mt-1 p-2 border rounded-lg bg-white dark:bg-gray-800">
                        <option value="google">Google Ads (Búsqueda)</option>
                        <option value="meta">Meta (Facebook/Instagram)</option>
                        <option value="tiktok">TikTok</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>
                    <div>
                      <Label>Producto/Servicio</Label>
                      <Input value={newCampaignData.product} onChange={(e) => setNewCampaignData({ ...newCampaignData, product: e.target.value })} placeholder="Ej: Consultoría de datos" className="mt-1" />
                    </div>
                    <div>
                      <Label>Audiencia Objetivo</Label>
                      <Input value={newCampaignData.audience} onChange={(e) => setNewCampaignData({ ...newCampaignData, audience: e.target.value })} placeholder="Ej: Empresarios de 25-45 años" className="mt-1" />
                    </div>
                    <Button onClick={generateAIContent} variant="hero" className="w-full" disabled={isGenerating}>
                      {isGenerating ? 'Generando...' : 'Generar con IA'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading Screen */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center max-w-md">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="mb-6">
                        <Sparkles className="w-12 h-12 text-emerald-600 mx-auto" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-2">Generando Anuncios con IA</h3>
                      <motion.p key={generatingMessage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-600 dark:text-gray-300">
                        {generatingMessage}
                      </motion.p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Campañas List */}
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <motion.button key={campaign.id} whileHover={{ x: 4 }} onClick={() => setSelectedCampaign(campaign)} className={`w-full text-left p-3 rounded-lg transition-all ${selectedCampaign?.id === campaign.id ? 'bg-emerald-100 dark:bg-emerald-900/30 border-l-4 border-emerald-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <p className="font-semibold text-sm">{campaign.name}</p>
                    <p className="text-xs text-gray-500">{campaign.platform.toUpperCase()} • {campaign.ads.length} anuncios</p>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            {selectedCampaign ? (
              <Card className="p-8 glass-card">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedCampaign.name}</h2>
                  <div className="flex gap-4 items-center">
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-semibold">
                      {selectedCampaign.platform.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{selectedCampaign.ads.length} anuncios generados</span>
                  </div>
                </div>

                {/* Anuncios */}
                <div className="space-y-6 mb-8">
                  {selectedCampaign.ads.map((ad) => (
                    <motion.div key={ad.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">{ad.headline}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{ad.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold">{ad.cta}</span>
                        {ad.budget && (
                          <div className="text-sm text-gray-500">
                            <p>Presupuesto: ${ad.budget.min} - ${ad.budget.max}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Acciones */}
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={() => downloadCampaignPDF(selectedCampaign)} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                  <Button onClick={() => openPlatformEditor(selectedCampaign.platform)} variant="hero">
                    <Share2 className="w-4 h-4 mr-2" />
                    Publicar en {selectedCampaign.platform.charAt(0).toUpperCase() + selectedCampaign.platform.slice(1)}
                  </Button>
                  <Button onClick={() => deleteCampaign(selectedCampaign.id)} variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-12 glass-card text-center">
                <Sparkles className="w-16 h-16 text-emerald-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Crea tu primera campaña</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Selecciona una campaña o crea una nueva para comenzar a generar anuncios con IA</p>
                <Button onClick={() => setShowNewCampaignForm(true)} variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Campaña
                </Button>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FlowsightAdsDashboard;
