import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: boolean;
}

const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = "website",
  article = false 
}: SEOProps) => {
  const siteName = "FlowSights";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Convierte tus datos en decisiones inteligentes`;
  const defaultDescription = "FlowSights: Expertos en Inteligencia Operativa y Limpieza de Datos para PyMEs. Transformamos tu Excel, POS y WhatsApp en decisiones que generan dinero y optimizan tu operación.";
  const fullDescription = description || defaultDescription;
  const defaultImage = "https://storage.googleapis.com/gpt-engineer-file-uploads/7GdJHUgbeBP6D1AL2fFEaPtiTyj2/social-images/social-1776391379720-ChatGPT_Image_16_abr_2026,_19_47_07.webp";
  const fullImage = image || defaultImage;
  const siteUrl = "https://flowsights.it.com";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />

      {/* Indexing */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
    </Helmet>
  );
};

export default SEO;
