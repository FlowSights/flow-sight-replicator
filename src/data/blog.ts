export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  date: string;
  author: string;
  content: string[]; // paragraphs (markdown-light)
};

export const blogPosts: BlogPost[] = [
  {
    slug: "5-senales-datos-sucios",
    title: "5 señales de que tus datos están saboteando tus decisiones",
    excerpt:
      "Si tus reportes nunca cuadran o cada gerente trae un número distinto, probablemente tienes un problema de calidad de datos. Aquí cómo detectarlo a tiempo.",
    category: "Calidad de Datos",
    readingTime: "4 min",
    date: "10 abr 2026",
    author: "Equipo FlowSights",
    content: [
      "La mayoría de empresas no tiene un problema de falta de datos: tiene un problema de **datos sucios**. Registros duplicados, formatos inconsistentes, campos vacíos y sistemas desconectados generan decisiones costosas todos los días.",
      "**1. Cada reporte muestra un número diferente.** Si ventas, finanzas y operaciones no se ponen de acuerdo en el mismo KPI, no es un problema de personas: es un problema de fuente de verdad.",
      "**2. Tu equipo pasa más tiempo limpiando que analizando.** Cuando los analistas dedican el 70% del tiempo a corregir Excel en lugar de generar insights, hay un problema estructural.",
      "**3. Los inventarios físicos no coinciden con el sistema.** Discrepancias recurrentes indican procesos manuales que rompen la trazabilidad.",
      "**4. Hay clientes duplicados en tu CRM.** Esto distorsiona segmentaciones, campañas y proyecciones de venta.",
      "**5. Las decisiones se toman 'por intuición'.** Cuando nadie confía en los datos, todos vuelven al instinto. Y el instinto no escala.",
      "La buena noticia: cada uno de estos síntomas se resuelve con un proceso disciplinado de limpieza, validación y monitoreo continuo. Y el ROI suele aparecer en menos de 90 días.",
    ],
  },
  {
    slug: "como-empezar-dashboard-operativo",
    title: "Cómo empezar con un dashboard operativo (sin morir en el intento)",
    excerpt:
      "No necesitas un equipo de BI ni un software caro para empezar. Te mostramos los 4 pasos para construir tu primer dashboard útil en menos de 2 semanas.",
    category: "Dashboards",
    readingTime: "5 min",
    date: "3 abr 2026",
    author: "Equipo FlowSights",
    content: [
      "Construir un dashboard suena complejo, pero la mayoría de las empresas se traba en lo mismo: querer medirlo todo desde el día uno. El secreto está en empezar pequeño y útil.",
      "**Paso 1: Define la pregunta, no la métrica.** Antes de elegir qué graficar, pregúntate: ¿qué decisión quiero tomar más rápido? ('¿Qué SKU rota menos?' es mejor que 'Quiero ver inventario').",
      "**Paso 2: Identifica las 5 métricas que mueven la aguja.** No 50, no 20: cinco. Costos, ingresos, rotación, tiempo de ciclo y satisfacción suelen ser un buen punto de partida.",
      "**Paso 3: Centraliza los datos antes de visualizarlos.** Un dashboard sobre datos sucios es solo basura bonita. Limpia, estandariza y unifica fuentes primero.",
      "**Paso 4: Itera con los usuarios reales.** Muestra el primer borrador a quienes lo van a usar y ajusta. La adopción es más importante que la sofisticación.",
      "Con herramientas accesibles como Power BI, Looker Studio o incluso Google Sheets bien estructurado, una empresa puede tener su primer dashboard útil corriendo en 10–14 días. La clave no es la tecnología: es la disciplina del proceso.",
    ],
  },
  {
    slug: "kpis-operativos-que-importan",
    title: "Los 7 KPIs operativos que realmente importan en una PyME",
    excerpt:
      "Olvídate de los tableros con 40 métricas. Estos son los indicadores que cualquier dueño o gerente operativo debería revisar cada semana.",
    category: "Operaciones",
    readingTime: "6 min",
    date: "27 mar 2026",
    author: "Equipo FlowSights",
    content: [
      "En operaciones, **menos es más**. Estos son los 7 KPIs que recomendamos a cualquier PyME que quiera tomar el control de su negocio sin volverse un esclavo de los reportes.",
      "**1. Margen operativo por línea de producto/servicio.** Te dice qué genera dinero de verdad y qué te está consumiendo recursos.",
      "**2. Tiempo de ciclo.** Desde que entra una orden hasta que se entrega. Reducirlo libera capital y mejora satisfacción.",
      "**3. Rotación de inventario.** Inventario parado es dinero muerto. Si rotas menos de 4 veces al año en retail, hay oportunidad.",
      "**4. Costo por adquisición (CAC) vs. Lifetime Value (LTV).** Un negocio sano mantiene una relación LTV/CAC mayor a 3.",
      "**5. Tasa de error operativo.** Devoluciones, retrabajos, quejas. Cada error tiene un costo escondido enorme.",
      "**6. Productividad por colaborador.** Ingresos o unidades producidas por persona. Permite comparar periodos y benchmarks de industria.",
      "**7. Cash conversion cycle.** Cuántos días pasan desde que pagas a tu proveedor hasta que cobras. Optimizarlo mejora el flujo de caja sin necesidad de vender más.",
      "Si revisas estos 7 indicadores cada semana, en 3 meses vas a ver con una claridad totalmente nueva qué palancas mover en tu operación. Y eso es exactamente lo que separa a las empresas que crecen de las que sobreviven.",
    ],
  },
];
