import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Calendar, Clock, Mail, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { blogPosts } from "@/data/blog";

const WHATSAPP_URL = "https://wa.me/message/FVHDA5OZHN66P1";
const EMAIL_URL = "mailto:contacto@flowsights.it.com";

// Render very light "markdown": **bold** segments
const renderParagraph = (text: string, idx: number) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p key={idx} className="text-foreground/90 leading-relaxed text-lg">
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </p>
  );
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return <Navigate to="/blog" replace />;

  const others = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

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
              <Link to="/blog"><ArrowLeft className="w-4 h-4 mr-1" /> Blog</Link>
            </Button>
          </div>
        </nav>
      </header>

      <article className="pt-32 pb-16">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{post.category}</span>
            <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime} de lectura</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mt-4 leading-tight">{post.title}</h1>
          <p className="text-muted-foreground mt-3">Por {post.author}</p>

          <div className="mt-10 space-y-6">
            {post.content.map((para, i) => renderParagraph(para, i))}
          </div>

          <Card className="mt-12 p-8 glass-card bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
            <h3 className="font-display text-xl font-bold">¿Quieres aplicar esto en tu empresa?</h3>
            <p className="text-muted-foreground mt-2 text-sm">Solicita un diagnóstico gratuito y te diremos por dónde empezar.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Button variant="hero" asChild>
                <Link to="/#contacto">Diagnóstico gratuito <ArrowRight className="ml-1" /></Link>
              </Button>
              <Button asChild className="bg-[#25D366] hover:bg-[#20bd5a] text-white">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1" /> WhatsApp</a>
              </Button>
              <Button variant="outline" asChild>
                <a href={EMAIL_URL}><Mail className="mr-1" /> Escríbenos</a>
              </Button>
            </div>
          </Card>
        </div>
      </article>

      {others.length > 0 && (
        <section className="pb-24 border-t border-border/50">
          <div className="container max-w-5xl pt-16">
            <h2 className="font-display text-2xl font-bold mb-6">Sigue leyendo</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {others.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="group">
                  <Card className="p-6 h-full glass-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{p.category}</span>
                    <h3 className="font-display text-lg font-bold mt-3 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{p.excerpt}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
