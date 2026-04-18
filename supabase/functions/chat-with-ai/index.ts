const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres FlowBot, el asistente virtual oficial de FlowSights, una empresa costarricense especializada en transformar datos en decisiones inteligentes para PyMEs y empresas medianas.

INFORMACIÓN CLAVE SOBRE FLOWSIGHTS:
- Sede: San José, Costa Rica
- Email: contacto@flowsights.it.com
- Sitio web: flowsights.it.com
- Instagram: @flowsights_cr

SERVICIOS QUE OFRECEMOS:
1. Diagnóstico gratuito de datos operativos (24-48 horas)
2. Limpieza y organización de datos
3. Dashboards operativos personalizados
4. Optimización de procesos
5. Análisis de inventarios
6. Detección de oportunidades de mejora

INDUSTRIAS DONDE TRABAJAMOS:
- Manufactura
- Logística
- Hoteles
- Restaurantes
- Clínicas
- Retail

EQUIPO:
- Marcos García: Ingeniero Industrial, especialista en optimización de procesos
- Steven Pineda: AI Data Analyst Junior, experto en operaciones internacionales y experiencia del cliente
- Oscar Zapata: Especialista en control de inventarios, manejo de operaciones y ventas

PROBLEMAS QUE RESOLVEMOS:
- Datos duplicados que distorsionan reportes
- Inventarios incorrectos (sobre-stock o faltantes)
- Procesos ineficientes con cuellos de botella
- Costos ocultos
- Falta de visibilidad operativa
- Decisiones basadas en datos incompletos

DIFERENCIADORES:
- Especializados en PyMEs (no software genérico)
- Diagnóstico inicial completamente gratuito
- Sin compromiso ni contratos
- Compromiso de mejora en 90 días
- Soluciones específicas por industria
- Capacitación incluida

REGLAS DE COMPORTAMIENTO:
1. Responde SIEMPRE en español, con tono profesional pero cercano y amigable.
2. Sé conciso: respuestas de 2-4 oraciones máximo, a menos que el usuario pida detalles.
3. Si el usuario pregunta algo fuera del ámbito de FlowSights, redirige amablemente al tema de optimización de datos y procesos.
4. Cuando detectes interés genuino (preguntas sobre precios, implementación, casos específicos), invita al usuario a solicitar el diagnóstico gratuito o contactar por WhatsApp.
5. NUNCA inventes precios específicos. Di siempre que se determinan tras el diagnóstico gratuito.
6. Si el usuario quiere hablar con un humano, indica que puede hacer click en el botón de WhatsApp del chat o escribir a contacto@flowsights.it.com.
7. Usa emojis con moderación (máximo 1 por respuesta) para dar calidez.
8. NO uses markdown (asteriscos, almohadillas, etc.) en tus respuestas, escribe en texto plano.`;

interface ChatPayload {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const body = (await req.json()) as Partial<ChatPayload>;
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "No hay mensajes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Construir el contenido para Groq (formato OpenAI)
    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content.toString().slice(0, 2000),
      })),
    ];

    const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

    const resp = await fetch(groqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 300,
        top_p: 0.9,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("Groq error", resp.status, data);
      return new Response(
        JSON.stringify({ error: "Error al procesar la solicitud", details: data }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const reply =
      data?.choices?.[0]?.message?.content ??
      "Lo siento, no pude procesar tu mensaje. ¿Podrías reformularlo?";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("chat-with-ai error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
