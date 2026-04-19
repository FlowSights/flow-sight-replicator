import { Bot, FileSpreadsheet, BarChart3, Sparkles, Search, Stars, Layers, Globe } from "lucide-react";

const tools = [
  { name: "ChatGPT", icon: Bot },
  { name: "Claude", icon: Sparkles },
  { name: "Gemini", icon: Stars },
  { name: "Perplexity", icon: Search },
  { name: "Power BI", icon: BarChart3 },
  { name: "Google Sheets", icon: FileSpreadsheet },
  { name: "Excel", icon: FileSpreadsheet },
  { name: "Microsoft 365", icon: Layers },
  { name: "Google Workspace", icon: Layers },
  { name: "Meta", icon: Globe },
];

export const ToolsMarquee = () => {
  const loop = [...tools, ...tools];
  return (
    <section className="py-14 border-y border-border/50 bg-card/40 overflow-hidden">
      <div className="container text-center mb-8">
        <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">Stack tecnológico</span>
        <h3 className="font-display text-2xl md:text-3xl font-bold mt-3">
          Trabajamos con las herramientas <span className="text-gradient">más modernas</span> y las que ya conoces
        </h3>
      </div>

      <div
        className="relative"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div className="flex gap-4 animate-marquee whitespace-nowrap w-max">
          {loop.map((t, i) => {
            const Icon = t.icon;
            return (
              <div
                key={`${t.name}-${i}`}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-border/40 shadow-sm hover:border-primary/50 hover:shadow-glow transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(32px) saturate(250%) brightness(1.15)",
                  WebkitBackdropFilter: "blur(32px) saturate(250%) brightness(1.15)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">{t.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
