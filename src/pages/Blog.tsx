import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { blogPosts } from "@/data/blog";

const accents = [
  "hover:border-[hsl(var(--accent-violet)/0.6)] hover:shadow-[0_10px_40px_-10px_hsl(var(--accent-violet)/0.4)]",
  "hover:border-[hsl(var(--accent-amber)/0.6)] hover:shadow-[0_10px_40px_-10px_hsl(var(--accent-amber)/0.4)]",
  "hover:border-[hsl(var(--accent-sky)/0.6)] hover:shadow-[0_10px_40px_-10px_hsl(var(--accent-sky)/0.4)]",
];

const Blog = () => {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <nav className="container flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl md:text-2xl hover:opacity-90 transition-opacity">
            <img src={logo} alt="FlowSights logo" width={48} height={48} className="w-12 h-12 object-contain" />
            <span>FlowSights</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Volver</Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="pt-32 pb-16">
        <div className="container max-w-5xl">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Blog FlowSights</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold mt-3">
            Ideas para operar con <span className="text-gradient">datos confiables</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl">
            Artículos cortos y prácticos sobre operaciones, calidad de datos y decisiones inteligentes para empresas en crecimiento.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container max-w-5xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, i) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
              <Card className={`p-6 h-full glass-card transition-all duration-300 hover:-translate-y-1 ${accents[i % accents.length]}`}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{post.category}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime}</span>
                </div>
                <h2 className="font-display text-xl font-bold leading-snug group-hover:text-primary transition-colors">{post.title}</h2>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{post.excerpt}</p>
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  <span className="inline-flex items-center gap-1 text-primary font-medium">Leer <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
