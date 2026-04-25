import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles, Download, LogOut, Plus, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlatformPreview } from '@/components/PlatformPreview';
import { downloadCampaignPackage, openPlatformEditor } from '@/lib/campaignExporter';

interface Campaign {
  id: string;
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin';
  objective: string;
  toneOfVoice: string;
  targetAudience: string;
  product: string;
  adCopies: string[];
  generatedImages: string[];
  budgetRecommendation: {
    min: number;
    recommended: number;
    max: number;
  };
}

const FlowsightAdsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'meta' as const,
    objective: 'sales',
    toneOfVoice: 'professional',
    targetAudience: '',
    product: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/flowsight-ads');
      } else {
        setUser(user);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/flowsight-ads');
      } else {
        setUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
    } else {
      navigate('/flowsight-ads');
    }
  };

  const generateCampaign = async () => {
    if (!formData.product || !formData.targetAudience) {
      alert('Por favor completa todos los campos');
      return;
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      platform: formData.platform,
      objective: formData.objective,
      toneOfVoice: formData.toneOfVoice,
      targetAudience: formData.targetAudience,
      product: formData.product,
      adCopies: [
        `Descubre ${formData.product} - La solución perfecta para ${formData.targetAudience}`,
        `${formData.product}: Transforma tu negocio hoy`,
        `¿Buscas ${formData.product}? Aquí está la respuesta`,
      ],
      generatedImages: [
        'https://via.placeholder.com/1200x628?text=Ad+1',
        'https://via.placeholder.com/1200x628?text=Ad+2',
        'https://via.placeholder.com/1200x628?text=Ad+3',
      ],
      budgetRecommendation: {
        min: 100,
        recommended: 500,
        max: 2000,
      },
    };

    setCampaigns([...campaigns, newCampaign]);
    setSelectedCampaign(newCampaign);
    setIsCreating(false);
    setFormData({
      platform: 'meta',
      objective: 'sales',
      toneOfVoice: 'professional',
      targetAudience: '',
      product: '',
    });
  };

  const handleDownloadCampaign = (campaign: Campaign) => {
    downloadCampaignPackage(campaign);
  };

  const handlePublishToPlatform = (platform: 'meta' | 'google' | 'tiktok' | 'linkedin') => {
    openPlatformEditor(platform);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold font-display text-emerald-900">Flowsight Ads</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="hidden md:flex items-center gap-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 rounded-full mr-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Volver a la web
            </Button>
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Campaigns List */}
          <div className="lg:col-span-1">
            <Card className="p-6 glass-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-emerald-900">Tus Campañas</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreating(!isCreating)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva
                </Button>
              </div>

              {campaigns.length === 0 && !isCreating && (
                <p className="text-sm text-gray-600 py-4">
                  Aún no tienes campañas. ¡Crea una nueva!
                </p>
              )}

              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => setSelectedCampaign(campaign)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCampaign?.id === campaign.id
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium text-sm">{campaign.product}</div>
                    <div className="text-xs opacity-75">{campaign.platform.toUpperCase()}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {isCreating ? (
              <Card className="p-8 glass-card">
                <h2 className="text-2xl font-bold font-display text-emerald-900 mb-6">
                  Crear Nueva Campaña
                </h2>

                <form className="space-y-6">
                  <div>
                    <Label htmlFor="product">Producto o Servicio *</Label>
                    <Input
                      id="product"
                      placeholder="Ej: Plataforma de Automatización"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="audience">Audiencia Objetivo *</Label>
                    <Input
                      id="audience"
                      placeholder="Ej: Empresarios y directores de operaciones"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({ ...formData, targetAudience: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="platform">Plataforma</Label>
                      <Select value={formData.platform} onValueChange={(value: any) => setFormData({ ...formData, platform: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meta">Meta (Facebook/Instagram)</SelectItem>
                          <SelectItem value="google">Google Ads</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="objective">Objetivo</Label>
                      <Select value={formData.objective} onValueChange={(value) => setFormData({ ...formData, objective: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Ventas</SelectItem>
                          <SelectItem value="leads">Leads</SelectItem>
                          <SelectItem value="traffic">Tráfico</SelectItem>
                          <SelectItem value="awareness">Reconocimiento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tone">Tono de Voz</Label>
                    <Select value={formData.toneOfVoice} onValueChange={(value) => setFormData({ ...formData, toneOfVoice: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Profesional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="humorous">Humorístico</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="hero"
                      onClick={generateCampaign}
                      className="flex-1 gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generar Campaña con IA
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Card>
            ) : selectedCampaign ? (
              <Card className="p-8 glass-card">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold font-display text-emerald-900 mb-2">
                    {selectedCampaign.product}
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      {selectedCampaign.platform.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {selectedCampaign.objective}
                    </span>
                  </div>
                </div>

                {/* Platform Preview Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                    Vista Previa en {selectedCampaign.platform.toUpperCase()}
                  </h3>
                  <div className="flex justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <PlatformPreview
                      platform={selectedCampaign.platform}
                      headline={selectedCampaign.adCopies[0]}
                      description={selectedCampaign.adCopies[0]}
                      cta="Conocer más"
                      imageUrl={selectedCampaign.generatedImages[0]}
                    />
                  </div>
                </div>

                {/* Ad Copies */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">Variantes de Anuncios</h3>
                  <div className="space-y-3">
                    {selectedCampaign.adCopies.map((copy, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">{copy}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget Recommendation */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                    Recomendación de Presupuesto
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-xs text-orange-600 font-medium mb-1">Mínimo</div>
                      <div className="text-2xl font-bold text-orange-700">
                        ${selectedCampaign.budgetRecommendation.min}
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-xs text-emerald-600 font-medium mb-1">Recomendado</div>
                      <div className="text-2xl font-bold text-emerald-700">
                        ${selectedCampaign.budgetRecommendation.recommended}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xs text-green-600 font-medium mb-1">Máximo</div>
                      <div className="text-2xl font-bold text-green-700">
                        ${selectedCampaign.budgetRecommendation.max}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="hero"
                    className="w-full gap-2"
                    onClick={() => handleDownloadCampaign(selectedCampaign)}
                  >
                    <Download className="w-4 h-4" />
                    Descargar Paquete Completo
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    {selectedCampaign.platform === 'meta' && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handlePublishToPlatform('meta')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir Meta Ads
                      </Button>
                    )}
                    {selectedCampaign.platform === 'google' && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handlePublishToPlatform('google')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir Google Ads
                      </Button>
                    )}
                    {selectedCampaign.platform === 'tiktok' && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handlePublishToPlatform('tiktok')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir TikTok Ads
                      </Button>
                    )}
                    {selectedCampaign.platform === 'linkedin' && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handlePublishToPlatform('linkedin')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir LinkedIn Ads
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 glass-card text-center">
                <Sparkles className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                  Comienza a crear campañas
                </h3>
                <p className="text-gray-600 mb-6">
                  Selecciona una campaña existente o crea una nueva para empezar
                </p>
                <Button
                  variant="hero"
                  onClick={() => setIsCreating(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear Primera Campaña
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowsightAdsDashboard;
