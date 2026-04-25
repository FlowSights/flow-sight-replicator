interface CampaignData {
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

export const generateCampaignJSON = (campaign: CampaignData): string => {
  const campaignConfig = {
    campaignName: campaign.product,
    platform: campaign.platform,
    objective: campaign.objective,
    targetAudience: campaign.targetAudience,
    toneOfVoice: campaign.toneOfVoice,
    budget: {
      minimum: `$${campaign.budgetRecommendation.min}`,
      recommended: `$${campaign.budgetRecommendation.recommended}`,
      maximum: `$${campaign.budgetRecommendation.max}`,
    },
    adVariants: campaign.adCopies.map((copy, idx) => ({
      variantNumber: idx + 1,
      headline: copy.split('\n')[0] || copy.substring(0, 50),
      description: copy,
      imageIndex: idx,
      callToAction: 'Conocer más',
    })),
    platformSpecificInstructions: getPlatformInstructions(campaign.platform),
    generatedAt: new Date().toISOString(),
  };

  return JSON.stringify(campaignConfig, null, 2);
};

export const generatePlatformCSV = (campaign: CampaignData): string => {
  const headers = [
    'Variant',
    'Headline',
    'Description',
    'Call to Action',
    'Image File',
    'Platform',
    'Objective',
    'Target Audience',
    'Tone',
  ];

  const rows = campaign.adCopies.map((copy, idx) => [
    `Variant ${idx + 1}`,
    copy.split('\n')[0] || copy.substring(0, 50),
    copy,
    'Conocer más',
    `image_${idx + 1}.jpg`,
    campaign.platform.toUpperCase(),
    campaign.objective,
    campaign.targetAudience,
    campaign.toneOfVoice,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

export const generateInstructions = (platform: 'meta' | 'google' | 'tiktok' | 'linkedin'): string => {
  const instructions: Record<string, string> = {
    meta: `
# Instrucciones para Publicar en Meta (Facebook/Instagram)

## Paso 1: Acceder a Meta Ads Manager
1. Ve a https://business.facebook.com/
2. Selecciona "Ads Manager"
3. Haz clic en "Crear" para crear una nueva campaña

## Paso 2: Configuración de Campaña
1. Selecciona el objetivo de tu campaña
2. Define tu presupuesto (usa la recomendación: $500/día)
3. Selecciona tu audiencia objetivo

## Paso 3: Crear Anuncio
1. En "Formato de anuncio", selecciona "Carrusel" o "Imagen única"
2. Carga las imágenes desde la carpeta "images/" del archivo descargado
3. Copia el texto del archivo "campaign_config.json" en los campos de titular y descripción
4. Establece el Call-to-Action (CTA)

## Paso 4: Revisar y Publicar
1. Revisa la vista previa
2. Haz clic en "Publicar"

¡Tu campaña está en vivo!
    `,
    google: `
# Instrucciones para Publicar en Google Ads

## Paso 1: Acceder a Google Ads
1. Ve a https://ads.google.com/
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Crear campaña"

## Paso 2: Seleccionar Tipo de Campaña
1. Elige "Búsqueda" para anuncios de texto
2. Define tu presupuesto diario

## Paso 3: Crear Grupo de Anuncios
1. Añade palabras clave relevantes
2. Establece tu oferta máxima

## Paso 4: Crear Anuncio
1. Copia el titular del archivo "campaign_config.json"
2. Copia la descripción
3. Añade la URL de destino
4. Establece el Call-to-Action

## Paso 5: Revisar y Publicar
1. Revisa todos los detalles
2. Haz clic en "Publicar"

¡Tu campaña está lista!
    `,
    tiktok: `
# Instrucciones para Publicar en TikTok Ads

## Paso 1: Acceder a TikTok Ads Manager
1. Ve a https://ads.tiktok.com/
2. Inicia sesión o crea una cuenta de publicidad
3. Haz clic en "Crear campaña"

## Paso 2: Configuración de Campaña
1. Selecciona el objetivo: "Conversiones" o "Tráfico"
2. Define tu presupuesto diario

## Paso 3: Crear Grupo de Anuncios
1. Define tu audiencia objetivo
2. Selecciona ubicaciones y dispositivos

## Paso 4: Crear Anuncio
1. Carga el video/imagen desde la carpeta "images/"
2. Añade el titular y descripción del archivo "campaign_config.json"
3. Establece el Call-to-Action

## Paso 5: Revisar y Publicar
1. Revisa la vista previa
2. Haz clic en "Publicar"

¡Tu campaña está en vivo en TikTok!
    `,
    linkedin: `
# Instrucciones para Publicar en LinkedIn Ads

## Paso 1: Acceder a LinkedIn Campaign Manager
1. Ve a https://www.linkedin.com/campaignmanager/
2. Inicia sesión con tu cuenta de LinkedIn
3. Haz clic en "Crear campaña"

## Paso 2: Definir Objetivo
1. Selecciona el objetivo (Clics en el sitio web, Conversiones, etc.)
2. Define tu presupuesto

## Paso 3: Crear Grupo de Anuncios
1. Define tu audiencia (cargo, industria, ubicación)
2. Selecciona ubicaciones

## Paso 4: Crear Anuncio
1. Carga la imagen desde la carpeta "images/"
2. Copia el titular del archivo "campaign_config.json"
3. Copia la descripción
4. Establece el Call-to-Action

## Paso 5: Revisar y Publicar
1. Revisa la vista previa
2. Haz clic en "Publicar"

¡Tu campaña está lista en LinkedIn!
    `,
  };

  return instructions[platform] || 'Instrucciones no disponibles';
};

const getPlatformInstructions = (platform: 'meta' | 'google' | 'tiktok' | 'linkedin'): string => {
  const instructionsMap: Record<string, string> = {
    meta: 'Usa Meta Ads Manager. Carga las imágenes y copia el texto en los campos correspondientes.',
    google: 'Usa Google Ads. Crea anuncios de búsqueda con el texto proporcionado.',
    tiktok: 'Usa TikTok Ads Manager. Carga el video/imagen y el texto del anuncio.',
    linkedin: 'Usa LinkedIn Campaign Manager. Carga la imagen y el contenido del anuncio.',
  };

  return instructionsMap[platform] || 'Instrucciones no disponibles';
};

export const downloadCampaignPackage = async (campaign: CampaignData) => {
  // Crear objeto con todos los archivos
  const campaignJSON = generateCampaignJSON(campaign);
  const campaignCSV = generatePlatformCSV(campaign);
  const instructions = generateInstructions(campaign.platform);

  // Crear un blob con el contenido
  const content = `
PAQUETE DE CAMPAÑA - ${campaign.product.toUpperCase()}
Plataforma: ${campaign.platform.toUpperCase()}
Objetivo: ${campaign.objective}
Audiencia: ${campaign.targetAudience}
Presupuesto Recomendado: $${campaign.budgetRecommendation.recommended}/día

---

CONFIGURACIÓN DE CAMPAÑA:
${campaignJSON}

---

DATOS EN FORMATO CSV:
${campaignCSV}

---

INSTRUCCIONES DETALLADAS:
${instructions}

---

NOTAS IMPORTANTES:
- Las imágenes están disponibles en la carpeta "images/" del archivo descargado
- Asegúrate de tener una cuenta activa en ${campaign.platform}
- Revisa siempre la vista previa antes de publicar
- Monitorea el rendimiento de tu campaña después de publicar

Generado por Flowsight Ads - ${new Date().toLocaleDateString()}
  `;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flowsight-campaign-${campaign.id}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const openPlatformEditor = (platform: 'meta' | 'google' | 'tiktok' | 'linkedin') => {
  const urls: Record<string, string> = {
    meta: 'https://business.facebook.com/adsmanager/',
    google: 'https://ads.google.com/adsmanager/',
    tiktok: 'https://ads.tiktok.com/',
    linkedin: 'https://www.linkedin.com/campaignmanager/',
  };

  window.open(urls[platform], '_blank');
};
