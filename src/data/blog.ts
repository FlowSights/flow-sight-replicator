import datosSuciosImg from "@/assets/blog/datos-sucios.jpg";
import dashboardImg from "@/assets/blog/dashboard.jpg";
import kpisImg from "@/assets/blog/kpis.jpg";
import iaPymesImg from "@/assets/blog/ia-pymes.jpg";
import erroresExcelImg from "@/assets/blog/errores-excel.jpg";
import inventariosImg from "@/assets/blog/inventarios.jpg";

export type BlogSource = {
  title: string;
  outlet: string;
  url: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  date: string;
  author: string;
  image: string;
  free?: boolean; // First article free, rest require login
  content: string[]; // paragraphs (markdown-light)
  sources?: BlogSource[];
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
    image: datosSuciosImg,
    free: true,
    content: [
      "La mayoría de empresas no tiene un problema de falta de datos: tiene un problema de **datos sucios**. Registros duplicados, formatos inconsistentes, campos vacíos y sistemas desconectados generan decisiones costosas todos los días.",
      "**1. Cada reporte muestra un número diferente.** Si ventas, finanzas y operaciones no se ponen de acuerdo en el mismo KPI, no es un problema de personas: es un problema de fuente de verdad.",
      "**2. Tu equipo pasa más tiempo limpiando que analizando.** Cuando los analistas dedican el 70% del tiempo a corregir Excel en lugar de generar insights, hay un problema estructural.",
      "**3. Los inventarios físicos no coinciden con el sistema.** Discrepancias recurrentes indican procesos manuales que rompen la trazabilidad.",
      "**4. Hay clientes duplicados en tu CRM.** Esto distorsiona segmentaciones, campañas y proyecciones de venta.",
      "**5. Las decisiones se toman 'por intuición'.** Cuando nadie confía en los datos, todos vuelven al instinto. Y el instinto no escala.",
      "La buena noticia: cada uno de estos síntomas se resuelve con un proceso disciplinado de limpieza, validación y monitoreo continuo. Y el ROI suele aparecer en menos de 90 días.",
    ],
    sources: [
      { title: "The Cost of Bad Data Is Massive", outlet: "Harvard Business Review", url: "https://hbr.org/2017/09/only-3-of-companies-data-meets-basic-quality-standards" },
      { title: "Why data quality is the new gold", outlet: "McKinsey & Company", url: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-data-driven-enterprise-of-2025" },
      { title: "Bad Data Costs the U.S. $3 Trillion Per Year", outlet: "IBM / Forbes", url: "https://www.forbes.com/sites/gilpress/2021/06/15/bad-data-costs-the-us-3-trillion-per-year/" },
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
    image: dashboardImg,
    content: [
      "Construir un dashboard suena complejo, pero la mayoría de las empresas se traba en lo mismo: querer medirlo todo desde el día uno. El secreto está en empezar pequeño y útil.",
      "**Paso 1: Define la pregunta, no la métrica.** Antes de elegir qué graficar, pregúntate: ¿qué decisión quiero tomar más rápido? ('¿Qué SKU rota menos?' es mejor que 'Quiero ver inventario').",
      "**Paso 2: Identifica las 5 métricas que mueven la aguja.** No 50, no 20: cinco. Costos, ingresos, rotación, tiempo de ciclo y satisfacción suelen ser un buen punto de partida.",
      "**Paso 3: Centraliza los datos antes de visualizarlos.** Un dashboard sobre datos sucios es solo basura bonita. Limpia, estandariza y unifica fuentes primero.",
      "**Paso 4: Itera con los usuarios reales.** Muestra el primer borrador a quienes lo van a usar y ajusta. La adopción es más importante que la sofisticación.",
      "Con herramientas accesibles como Power BI, Looker Studio o incluso Google Sheets bien estructurado, una empresa puede tener su primer dashboard útil corriendo en 10–14 días. La clave no es la tecnología: es la disciplina del proceso.",
    ],
    sources: [
      { title: "How to design a great dashboard", outlet: "Microsoft Power BI Docs", url: "https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips" },
      { title: "Why Most Dashboards Fail", outlet: "MIT Sloan Management Review", url: "https://sloanreview.mit.edu/article/the-do-or-die-questions-boards-should-ask-about-technology/" },
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
    image: kpisImg,
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
    sources: [
      { title: "The Right KPIs for Your Business Stage", outlet: "Harvard Business Review", url: "https://hbr.org/2010/10/the-execution-trap" },
      { title: "Cash Conversion Cycle Explained", outlet: "Investopedia", url: "https://www.investopedia.com/terms/c/cashconversioncycle.asp" },
    ],
  },
  {
    slug: "ia-aplicada-pymes",
    title: "IA para PyMEs: 6 usos prácticos que ya están generando dinero",
    excerpt:
      "La inteligencia artificial dejó de ser cosa de gigantes tecnológicos. Estos son los usos concretos que cualquier PyME puede aplicar este trimestre para reducir costos y vender más.",
    category: "Inteligencia Artificial",
    readingTime: "7 min",
    date: "17 abr 2026",
    author: "Equipo FlowSights",
    image: iaPymesImg,
    content: [
      "Cuando un dueño de PyME escucha 'inteligencia artificial', muchas veces piensa en algo lejano, caro y técnico. La realidad es lo contrario: en 2026 las herramientas de IA cuestan menos que un colaborador junior y se implementan en días, no en meses.",
      "**1. Pronóstico de demanda automático.** En lugar de adivinar cuánto pedir cada semana, la IA analiza tu histórico de ventas, estacionalidad y eventos especiales para sugerir cantidades exactas. Resultado típico: 20–35% menos quiebres de stock y menos capital congelado.",
      "**2. Categorización de gastos y conciliación bancaria.** Modelos como Gemini o GPT pueden leer tus extractos y facturas y clasificarlos automáticamente. Ahorras 10–20 horas al mes de trabajo administrativo.",
      "**3. Atención al cliente 24/7 en WhatsApp.** Un chatbot bien entrenado responde preguntas frecuentes, agenda citas y deriva solo los casos complejos a una persona. Las PyMEs que lo implementan reportan un aumento del 15% en conversión por respuesta inmediata.",
      "**4. Análisis de reseñas y comentarios.** ¿Qué dicen 500 clientes sobre tu producto? Una IA los resume en 3 minutos y detecta los problemas recurrentes. Imposible de hacer manualmente.",
      "**5. Generación de contenido para marketing.** Posts, descripciones de producto, emails y campañas se producen 10x más rápido manteniendo tu tono de marca.",
      "**6. Detección de fraude y anomalías.** La IA identifica transacciones, gastos o patrones que no encajan con tu operación normal. Para retail y servicios, esto solo ya paga la inversión.",
      "El error común no es invertir demasiado en IA: es **no medir el impacto**. Empieza por un caso de uso, mide el ahorro o ingreso adicional en 30 días, y escala lo que funciona.",
      "La pregunta ya no es '¿debería usar IA en mi negocio?'. Es '¿qué tan rápido puedo empezar antes de que mi competencia lo haga?'.",
    ],
    sources: [
      { title: "Generative AI is Already Helping Small Businesses Save Time and Money", outlet: "The New York Times", url: "https://www.nytimes.com/2024/02/29/business/smallbusiness/ai-tools-small-business.html" },
      { title: "The economic potential of generative AI", outlet: "McKinsey & Company", url: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier" },
      { title: "How Small Businesses Are Using AI", outlet: "U.S. Chamber of Commerce", url: "https://www.uschamber.com/co/grow/technology/how-small-businesses-use-ai" },
    ],
  },
  {
    slug: "errores-excel-pymes",
    title: "Los 7 errores más caros que las PyMEs cometen gestionando su negocio en Excel",
    excerpt:
      "Excel es maravilloso… hasta que tu negocio empieza a depender de él para decisiones críticas. Aquí los errores más comunes y cuánto te están costando.",
    category: "Operaciones",
    readingTime: "6 min",
    date: "13 abr 2026",
    author: "Equipo FlowSights",
    image: erroresExcelImg,
    content: [
      "Más del 80% de las PyMEs en Latinoamérica gestionan su operación con Excel o Google Sheets. No tiene nada de malo… hasta que tu negocio crece y los errores empiezan a costar más que la solución.",
      "**1. Una sola persona controla 'el archivo maestro'.** Si esa persona se enferma, renuncia o se le borra el archivo, tu empresa se paraliza. El conocimiento del negocio no debería vivir en la cabeza de una persona ni en un .xlsx en su escritorio.",
      "**2. Versiones duplicadas: Reporte_FINAL_v2_revisado_OK.xlsx.** Cuando hay 5 versiones del mismo archivo, nadie sabe cuál es la verdad. Decisiones tomadas con datos desactualizados son la regla, no la excepción.",
      "**3. Fórmulas rotas que nadie audita.** Un estudio de la Universidad de Hawaii encontró que el 88% de las hojas de cálculo en empresas tienen errores. JP Morgan perdió 6 mil millones de dólares por un error de copy-paste en Excel.",
      "**4. Datos manuales = errores humanos.** Cada vez que alguien transcribe información de un sistema a otro, hay entre 1% y 4% de errores. En operaciones, eso se traduce en miles de dólares perdidos al mes.",
      "**5. No hay trazabilidad.** ¿Quién cambió ese número? ¿Cuándo? ¿Por qué? En Excel, nunca lo sabrás. En un sistema con base de datos, todo queda registrado.",
      "**6. Imposible escalar.** Excel se rompe con miles de filas, no permite que varias personas trabajen simultáneamente sin caos, y los reportes tardan horas en actualizarse.",
      "**7. No hay alertas automáticas.** Te enteras de que el inventario está bajo cuando ya es tarde. Te enteras de que un cliente top dejó de comprar cuando ya se fue.",
      "**¿La solución?** No tiraR Excel a la basura. Mantenerlo donde sirve (cálculos rápidos, simulaciones) y mover lo crítico a un sistema centralizado, con base de datos, alertas y dashboards. La inversión se recupera, en promedio, en menos de 4 meses.",
    ],
    sources: [
      { title: "JPMorgan's $6 billion 'London Whale' Excel Error", outlet: "Bloomberg", url: "https://www.bloomberg.com/news/articles/2013-04-12/jpmorgan-london-whale-loss-traced-to-excel-errors" },
      { title: "Spreadsheet Errors: A Study", outlet: "European Spreadsheet Risks Interest Group (EuSpRIG)", url: "http://www.eusprig.org/horror-stories.htm" },
      { title: "Why Spreadsheets Are So Risky for Business", outlet: "Forbes", url: "https://www.forbes.com/sites/forbestechcouncil/2022/03/01/why-spreadsheets-are-no-longer-enough/" },
    ],
  },
  {
    slug: "inventarios-inteligentes",
    title: "Inventarios inteligentes: cómo predecir quiebres de stock y liberar capital",
    excerpt:
      "Tener mucho inventario es caro. Tener poco también. La buena noticia: con datos básicos puedes anticipar la demanda y reducir hasta 30% tu capital invertido en stock.",
    category: "Inventarios",
    readingTime: "6 min",
    date: "8 abr 2026",
    author: "Equipo FlowSights",
    image: inventariosImg,
    content: [
      "El inventario es uno de los activos más caros e ignorados de cualquier negocio. Está lleno de dinero quieto que podría estar generando rendimiento, vendiéndose o reinvirtiéndose. Y la mayoría de PyMEs lo gestiona 'a ojo'.",
      "**El problema real: el doble costo invisible.** Cuando tienes exceso de inventario, pierdes plata por capital congelado, espacio, mermas y obsolescencia. Cuando tienes poco, pierdes plata por ventas no realizadas, clientes molestos y compras de emergencia más caras. La mayoría no sabe cuál de los dos lados le duele más.",
      "**Paso 1: Clasifica tu inventario con la regla 80/20 (ABC).** El 20% de tus SKUs genera el 80% de tus ingresos. Esos son tus productos A: cero quiebres permitidos. Los productos C (los que casi no rotan) probablemente deberían dejar de existir.",
      "**Paso 2: Mide la rotación real, no la promedio.** Un negocio puede rotar 6 veces al año en promedio y tener productos que rotan 24 veces y otros que rotan 0.5. El promedio te miente. Mide producto por producto.",
      "**Paso 3: Define puntos de reorden basados en datos.** Combina demanda promedio diaria + tiempo de reposición del proveedor + un buffer de seguridad. Esto solo elimina el 70% de los quiebres de stock.",
      "**Paso 4: Usa pronósticos simples antes de saltar a IA.** Una media móvil de 8–12 semanas, ajustada por estacionalidad, es sorprendentemente buena para la mayoría de PyMEs. La IA mejora un 10–20% adicional, pero el 80% del beneficio viene de tener el proceso básico bien montado.",
      "**Paso 5: Conecta ventas con compras.** Es absurdo que el área de ventas vea una cosa y el área de compras vea otra. Una sola fuente de verdad, actualizada en tiempo real, cambia el juego.",
      "**Resultado típico:** Las PyMEs que aplican estos 5 pasos liberan entre 15% y 30% del capital invertido en inventario en los primeros 6 meses, sin perder ventas. Ese capital sirve para crecer, pagar deuda o sobrevivir mejor a temporadas bajas.",
    ],
    sources: [
      { title: "Inventory Optimization in the New Normal", outlet: "McKinsey & Company", url: "https://www.mckinsey.com/capabilities/operations/our-insights/inventory-optimization-show-me-the-money" },
      { title: "How Companies Are Rethinking Inventory", outlet: "The New York Times", url: "https://www.nytimes.com/2023/02/14/business/economy/inventory-supply-chain.html" },
      { title: "ABC Analysis Explained", outlet: "MIT Center for Transportation & Logistics", url: "https://ctl.mit.edu/sites/ctl.mit.edu/files/library/public/Inventory-management.pdf" },
    ],
  },
];
