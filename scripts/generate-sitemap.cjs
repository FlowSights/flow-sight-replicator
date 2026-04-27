const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'https://flowsights.it.com';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

// Rutas estáticas
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/blog', priority: '0.9', changefreq: 'daily' },
  { path: '/diagnostico', priority: '0.8', changefreq: 'monthly' },
  { path: '/privacidad', priority: '0.5', changefreq: 'monthly' },
  // /auth se excluye del sitemap ya que tiene noindex en el componente SEO
];

// Función para obtener posts del blog (simulada leyendo el archivo de datos)
function getBlogPosts() {
  try {
    const blogDataPath = path.join(__dirname, '../src/data/blog.ts');
    const content = fs.readFileSync(blogDataPath, 'utf8');
    
    // Extraer slugs usando regex simple para evitar dependencias de parsing complejas
    const slugRegex = /slug:\s*["']([^"']+)["']/g;
    const slugs = [];
    let match;
    while ((match = slugRegex.exec(content)) !== null) {
      slugs.push(match[1]);
    }
    return [...new Set(slugs)]; // Eliminar duplicados
  } catch (error) {
    console.error('Error leyendo blog posts:', error);
    return [];
  }
}

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const blogSlugs = getBlogPosts();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Añadir rutas estáticas
  staticRoutes.forEach(route => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Añadir posts del blog
  blogSlugs.forEach((slug) => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/blog/${slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  fs.writeFileSync(OUTPUT_FILE, xml);
  console.log(`Sitemap generado con éxito en ${OUTPUT_FILE}`);
}

generateSitemap();
