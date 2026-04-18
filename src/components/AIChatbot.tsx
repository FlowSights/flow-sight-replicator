import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_URL = "https://wa.me/message/FVHDA5OZHN66P1";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "¡Hola! 👋 Soy FlowBot, el asistente virtual de FlowSights. Puedo contarte sobre nuestros servicios, industrias, el equipo o ayudarte a solicitar un diagnóstico gratuito. ¿En qué te puedo ayudar?",
};

export const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-with-ai", {
        body: {
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;

      const reply = (data as { reply?: string })?.reply ??
        "Disculpa, tuve un problema. ¿Puedes intentar de nuevo o contactarnos por WhatsApp?";

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: reply },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            "Disculpa, no pude conectarme en este momento. ¿Te gustaría continuar la conversación por WhatsApp? Haz click en el botón verde de abajo. 💬",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickReplies = [
    "¿Qué servicios ofrecen?",
    "¿Cómo es el diagnóstico gratuito?",
    "Quiero hablar con un humano",
  ];

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir chat con IA"
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/40 blur-xl group-hover:bg-primary/60 transition-all" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 grid place-items-center shadow-2xl group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
              {hasNewMessage && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
          </div>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-card border border-border/60 px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chatea con FlowBot ✨
          </span>
        </button>
      )}

      {/* Ventana del chat */}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[380px] sm:max-w-[calc(100vw-3rem)] sm:h-[600px] sm:max-h-[calc(100vh-3rem)] bg-card border border-border/60 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3 flex items-center justify-between text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 grid place-items-center backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  FlowBot
                  <span className="inline-flex items-center gap-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    En línea
                  </span>
                </div>
                <div className="text-xs opacity-90">Asistente IA · FlowSights</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mensajes */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border/60 text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            {/* Quick replies — solo en la primera interacción */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => sendMessage(), 50);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-card hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp CTA */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-4 mt-2 mb-2 flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366] hover:bg-[#1FB855] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Hablar con un humano por WhatsApp
          </a>

          {/* Input */}
          <div className="border-t border-border/60 p-3 bg-card flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
              className="flex-1 border-border/60"
              maxLength={500}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              size="icon"
              aria-label="Enviar mensaje"
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
