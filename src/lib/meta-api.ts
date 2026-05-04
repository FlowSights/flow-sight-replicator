const META_API_VERSION = 'v19.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// Configuración de "Producción" desde variables de entorno
export const META_CONFIG = {
  accessToken: import.meta.env.VITE_META_ACCESS_TOKEN || localStorage.getItem('meta_access_token'),
  adAccountId: import.meta.env.VITE_META_AD_ACCOUNT_ID || localStorage.getItem('meta_ad_account_id'),
};

export interface MetaAdAccount {
  id: string;
  name: string;
  account_id: string;
}

export const metaApi = {
  /**
   * Obtiene la lista de cuentas publicitarias asociadas al token
   */
  async getAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
    try {
      const response = await fetch(`${BASE_URL}/me/adaccounts?fields=name,account_id&access_token=${accessToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Error al obtener cuentas publicitarias');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Meta API Error (getAdAccounts):', error);
      throw error;
    }
  },

  /**
   * Sube una imagen a Meta desde una URL o Blob
   */
  async uploadImage(accessToken: string, adAccountId: string, imageUrl: string): Promise<string> {
    try {
      let response;
      
      // Si es un Blob local (empieza con blob:), debemos subirlo como archivo (multipart/form-data)
      if (imageUrl.startsWith('blob:')) {
        const blob = await fetch(imageUrl).then(r => r.blob());
        const formData = new FormData();
        formData.append('filename', blob, `ad_image_${Date.now()}.png`);
        formData.append('access_token', accessToken);

        response = await fetch(`${BASE_URL}/${adAccountId}/adimages`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Si es una URL pública, usamos el parámetro 'url'
        response = await fetch(`${BASE_URL}/${adAccountId}/adimages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: imageUrl,
            access_token: accessToken,
          }),
        });
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Error al subir imagen a Meta');
      }
      
      const hash = Object.values(data.images)[0] as any;
      return hash.hash;
    } catch (error) {
      console.error('Meta API Error (uploadImage):', error);
      throw error;
    }
  },

  /**
   * Crea un Ad Creative (El diseño del anuncio)
   */
  async createAdCreative(
    accessToken: string, 
    adAccountId: string, 
    details: {
      name: string;
      imageHash: string;
      headline: string;
      body: string;
      link: string;
      callToAction: string;
    }
  ): Promise<string> {
    try {
      const creativeData = {
        name: `Flowsight_${details.name}_${Date.now()}`,
        object_story_spec: {
          page_id: '', // Se necesita el ID de la página, pero usualmente se saca del Ad Account
          link_data: {
            image_hash: details.imageHash,
            link: details.link,
            message: details.body,
            call_to_action: {
              type: details.callToAction.toUpperCase().replace(/\s/g, '_'),
              value: {
                link: details.link,
              },
            },
            name: details.headline,
          },
        },
        access_token: accessToken,
      };

      // Si no tenemos Page ID, Meta a veces da error. 
      // En una integración real, deberíamos dejar al usuario elegir la página.
      // Por ahora, intentaremos crear un creative "Link Data" genérico.
      
      const response = await fetch(`${BASE_URL}/${adAccountId}/adcreatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creativeData),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Error al crear Ad Creative');
      }
      
      return data.id;
    } catch (error) {
      console.error('Meta API Error (createAdCreative):', error);
      throw error;
    }
  }
};
