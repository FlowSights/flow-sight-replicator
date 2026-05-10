import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Send, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import type { GeneratedAd } from '@/types/ads';

type UploadedAsset = {
  name: string;
  dataUrl: string;
};

type AdUpdate = Partial<GeneratedAd> & Pick<GeneratedAd, 'platform'>;

interface AIAgentBarProps {
  context: {
    businessName: string;
    promote: string;
    idealCustomer: string;
    location: string;
    generatedAds: GeneratedAd[];
    uploadedAssets?: UploadedAsset[];
  };
  hasPaid?: boolean;
  onUpdateAds?: (newAds: AdUpdate[]) => void;
  onAddAssets?: (files: File[]) => void;
  mode?: 'chat' | 'context';
  onContextSubmit?: (context: string) => void;
}

const GeminiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 animate-pulse">
    <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" 
      className="fill-cyan-400"
      style={{ fill: 'url(#gemini-gradient)' }}
    />
    <defs>
      <linearGradient id="gemini-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4facfe" />
        <stop offset="100%" stopColor="#00f2fe" />
      </linearGradient>
    </defs>
  </svg>
);

export const AIAgentBar: React.FC<AIAgentBarProps> = ({
  context,
  hasPaid = true,
  onUpdateAds,
  onAddAssets,
  mode = 'chat',
  onContextSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullResponse, setFullResponse] = useState<string | null>(null);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextSent, setContextSent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isOpen]);

  useEffect(() => {
    if (fullResponse) {
      setDisplayedResponse('');
      let currentIndex = 0;
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      typingTimerRef.current = setInterval(() => {
        currentIndex++;
        setDisplayedResponse(fullResponse.substring(0, currentIndex));
        if (currentIndex >= fullResponse.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        }
      }, 5);
      return () => { if (typingTimerRef.current) clearInterval(typingTimerRef.current); };
    }
  }, [fullResponse]);



  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleAskGemini = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    if (mode === 'context') {
      const contextValue = query.trim();
      onContextSubmit?.(contextValue);
      setContextSent(true);
      setQuery('');
      window.setTimeout(() => setContextSent(false), 2600);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    setIsExpanded(false);

    setFullResponse(null);
    setDisplayedResponse('');
    setQuery('');
    
    try {
      const systemPrompt = `Eres un Estratega de Marketing Senior experto en Ads, conversando con el cliente de la agencia FlowSights.
CLIENTE: "${context.businessName}"
OBJETIVO: "${context.promote}"
AUDIENCIA: "${context.idealCustomer}"

TUS ANUNCIOS ACTUALES (Campaña Activa):
${JSON.stringify(context.generatedAds, null, 2)}

INSTRUCCIÓN TÉCNICA OBLIGATORIA:
1. Sé conversacional, amigable y extremadamente experto en marketing digital.
2. Puedes responder preguntas, dar consejos sobre marketing, o charlar sobre la campaña actual.
3. Evita introducciones largas. Sé conciso y al grano. Usa un tono persuasivo.
4. NUNCA menciones la palabra "JSON" al usuario ni ofrezcas mostrar código. Los cambios ocurren en segundo plano.
5. SOLO SI el usuario te pide explícitamente modificar, optimizar, cambiar o crear anuncios (o si tu consejo implica directamente un nuevo copy que el usuario aceptaría implementar), DEBES aplicar los cambios adjuntando AL FINAL DE TU RESPUESTA exactamente este bloque JSON envuelto en etiquetas XML:

<update_ads>[{"headline": "Tu Título Atractivo", "description": "Tu descripción persuasiva aquí", "cta": "Comprar ahora", "platform": "meta"}]</update_ads>

Nota sobre modificaciones: Solo incluye las plataformas que realmente modificaste. No uses markdown dentro del bloque JSON. Si no hay modificaciones, NO incluyas el bloque JSON ni las etiquetas.`;

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          messages: [
            { role: 'user', content: query || "Por favor, crea una nueva estrategia y optimiza los copys de mi campaña." }
          ],
          images: [],
          systemPrompt: systemPrompt
        }
      });

      if (error) throw error;
      
      let cleanReply = (data.reply || '').trim();
      let hasUpdated = false;

      // 1. Extraer JSON usando etiquetas XML (Método principal)
      const xmlMatch = cleanReply.match(/<update_ads>([\s\S]*?)<\/update_ads>/i);
      let extractedJson = xmlMatch ? xmlMatch[1] : null;

      // 2. Método de respaldo: Buscar bloque markdown de json que empiece con array
      if (!extractedJson) {
        const markdownMatch = cleanReply.match(/```(?:json)?\s*(\[\s*\{[\s\S]*?\}\s*\])\s*```/i);
        if (markdownMatch) {
          extractedJson = markdownMatch[1];
        }
      }

      // 3. Método de último recurso: Buscar un array crudo al final de la respuesta
      if (!extractedJson) {
        const rawArrayMatch = cleanReply.match(/(\[\s*\{\s*"headline"[\s\S]*\}\s*\])$/i);
        if (rawArrayMatch) {
          extractedJson = rawArrayMatch[1];
        }
      }

      if (extractedJson) {
        try {
          const jsonString = extractedJson.replace(/```json/gi, "").replace(/```/gi, "").trim();
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].headline) {
            if (onUpdateAds) {
              onUpdateAds(parsed);
              hasUpdated = true;
            }
          }
        } catch (e) {
          console.error("JSON Parse Error:", e);
        }
      }

      if (hasUpdated) {
        setShowSuccess(true);
      }

      // Limpieza agresiva del texto visible
      cleanReply = cleanReply.replace(/<update_ads>[\s\S]*?<\/update_ads>/gi, "");
      cleanReply = cleanReply.replace(/```json[\s\S]*?```/gi, "");
      cleanReply = cleanReply.replace(/```[\s\S]*?```/g, "");
      cleanReply = cleanReply.replace(/\[\s*\{\s*"headline"[\s\S]*\}\s*\]/gi, ""); // Elimina arrays crudos de anuncios
      
      // Limpiar frases donde la IA anuncia el JSON
      cleanReply = cleanReply.replace(/¿Te gustaría probar alguno de estos cambios\? Si es así, te puedo adjuntar los cambios como un bloque JSON.*/gi, "");
      cleanReply = cleanReply.replace(/Aquí te presento las modificaciones en el bloque JSON.*/gi, "");
      cleanReply = cleanReply.replace(/Aquí tienes el JSON.*/gi, "");
      cleanReply = cleanReply.replace(/Adjunto el bloque JSON.*/gi, "");
      cleanReply = cleanReply.replace(/\*\*Actualización de anuncios\*\*/gi, "");
      cleanReply = cleanReply.replace(/Te adjunto los cambios.*/gi, "");
      
      // Eliminar asteriscos para que la respuesta sea limpia
      cleanReply = cleanReply.replace(/\*/g, "");

      cleanReply = cleanReply.trim();
      
      if (hasUpdated && !cleanReply.includes("✨")) {
        if (cleanReply) {
          cleanReply += "\n\n✨ He actualizado la estrategia con éxito.";
        } else {
          cleanReply = "✨ He actualizado los anuncios con las mejoras solicitadas.";
        }
      }
      
      // Si la respuesta quedó vacía después de limpiar el código y no hubo actualización
      if (!cleanReply && !hasUpdated) {
        cleanReply = "No estoy seguro de cómo responder a eso. ¿En qué te ayudo con tu campaña?";
      }

      setFullResponse(cleanReply);
    } catch (err) {
      console.error(err);
      setFullResponse("Error en la conexión. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute -top-14 right-0 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md z-50"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">¡Campaña actualizada por Gemini!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form 
        onSubmit={handleAskGemini}
        className={`relative flex flex-col backdrop-blur-[60px] border rounded-[32px] p-2 shadow-[0_20px_80px_rgba(0,0,0,0.5)] transition-all group ${
          mode === 'context'
            ? 'bg-emerald-500/[0.03] border-emerald-500/15 hover:bg-emerald-500/[0.05] hover:border-emerald-400/30'
            : 'bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03] hover:border-white/10'
        }`}
      >
        {mode === 'context' && (
          <div className="px-5 pt-4 pb-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400/80">
                  Contexto extra para la IA
                </p>
                <p className="mt-1 text-sm font-medium text-white/45">
                  Agrega detalles de tu negocio, clientes, ofertas o zona. No es un chat; es una nota para mejorar la campaña.
                </p>
              </div>
              <AnimatePresence>
                {contextSent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="hidden sm:flex shrink-0 items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-300"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Enviado
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
        <div className="flex items-center px-4 py-1.5">
          
          <div className="mr-3 shrink-0 drop-shadow-[0_0_12px_rgba(79,172,254,0.4)]">
            <GeminiIcon />
          </div>

          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === 'context'
                ? "Ej: vendemos cafés especiales, tenemos delivery y queremos atraer oficinas cercanas..."
                : hasPaid ? "Pregúntale a Gemini..." : "Desbloquea premium para usar la IA"
            }
            disabled={!hasPaid || loading}
            className={`flex-1 bg-transparent border-none outline-none font-medium text-white px-0 py-0 transition-all caret-white ${
              mode === 'context'
                ? 'h-12 text-base md:text-lg placeholder:text-emerald-100/25'
                : 'h-10 text-lg md:text-xl placeholder:text-white/20'
            }`}
          />

          <div className="flex items-center gap-2 ml-3">
            <button 
              type="submit"
              disabled={!query.trim() || loading || !hasPaid}
              aria-label={mode === 'context' ? 'Añadir contexto a la estrategia' : 'Enviar mensaje a Gemini'}
              className={`rounded-full transition-all flex items-center justify-center ${
                query.trim()
                  ? mode === 'context'
                    ? 'bg-emerald-400 text-black px-5 py-3 shadow-[0_0_25px_rgba(52,211,153,0.35)]'
                    : 'bg-white text-black p-2.5 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'bg-white/5 text-white/20'
              } disabled:opacity-50`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : contextSent ? (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 text-sm font-black"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="hidden md:inline">Listo</span>
                </motion.span>
              ) : (
                <span className="flex items-center gap-2 text-sm font-black">
                  <Send className="w-5 h-5" />
                  {mode === 'context' && <span className="hidden md:inline">Añadir</span>}
                </span>
              )}
            </button>
          </div>
        </div>
        {mode === 'context' && (
          <AnimatePresence>
            {contextSent && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="px-5 pb-4 text-center text-sm font-bold text-emerald-300"
              >
                Contexto añadido. Puedes continuar con el siguiente paso.
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </form>

      <AnimatePresence>
        {isOpen && (displayedResponse || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-6 w-full bg-[#050505]/60 backdrop-blur-[80px] border border-white/[0.03] rounded-[40px] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-[100]"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Estratega Virtual Gemini</span>
              </div>
              <button 
                onClick={() => { setIsOpen(false); setFullResponse(null); setDisplayedResponse(''); }}
                className="p-3 -mr-3 text-white/5 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`text-white/70 text-base leading-relaxed font-medium min-h-[80px] whitespace-pre-wrap ${!isExpanded ? 'line-clamp-4' : ''}`}>
              {displayedResponse}
              {loading && !displayedResponse && (
                <div className="flex gap-2 py-3">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 rounded-full bg-cyan-400/50"
                    />
                  ))}
                </div>
              )}
            </div>
            
            {fullResponse && fullResponse.length > 250 && !loading && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="mt-3 text-[10px] font-bold text-cyan-400/80 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-1"
              >
                {isExpanded ? "Mostrar menos" : "Ver más"}
              </button>
            )}
            
            <div className="flex flex-wrap gap-3 mt-10">
              {['OPTIMIZAR CTR', 'ANÁLISIS DE AUDIENCIA', 'NUEVOS COPYS'].map(label => (
                <button
                  key={label}
                  onClick={() => setQuery(label.toLowerCase())}
                  className="px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all uppercase tracking-widest"
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
