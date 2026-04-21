import { Link, useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Calendar, Clock, Mail, MessageCircle, ExternalLink, BookOpen } from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { blogPosts } from "@/data/blog";
import { useAuth } from "@/contexts/AuthContext";
import { BlogComments } from "@/components/blog/BlogComments";
import SEO from "@/components/SEO";

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
  const { user, loading: authLoading } = useAuth();

  // Scroll al inicio cuando se carga o cambia el artículo (top of page, both mobile + desktop)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  const others = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);
  const locked = false; // Contenido siempre gratuito por requerimiento

  return (
    <div className="min-h-screen">
      <SEO 
        title={post.title}
        description={post.excerpt}
        image={post.image}
        url={`/blog/${post.slug}`}
        article={true}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": post.image,
          "author": {
            "@type": "Organization",
            "name": "FlowSights"
          },
          "publisher": {
            "@type": "Organization",
            "name": "FlowSights",
            "logo": {
              "@type": "ImageObject",
              "url": "https://flowsights.it.com/favicon.png"
            }
          },
          "datePublished": "2026-04-21", // Idealmente usar la fecha real del post
          "description": post.excerpt
        })}
      </script>
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <nav className="container flex items-center justify-between h-20">
          <Link 
            to="/" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 font-display font-bold text-xl md:text-2xl hover:opacity-90 transition-opacity"
          >
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

          <div className="mt-8 rounded-2xl overflow-hidden border border-border/50 shadow-lg">
            <img
              src={post.image}
              alt={post.title}
              width={1280}
              height={720}
              className="w-full aspect-video object-cover"
            />
          </div>

          {locked ? (
            <>
              {/* Show first 2 paragraphs as teaser, then paywall */}
              <div className="mt-10 space-y-6 relative">
                {post.content.slice(0, 2).map((para, i) => renderParagraph(para, i))}
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
              </div>
              <Card className="mt-8 p-8 glass-card border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 text-center">
                <Lock className="w-10 h-10 text-primary mx-auto" />
                <h3 className="font-display text-2xl font-bold mt-4">Sigue leyendo gratis</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">
                  Crea una cuenta gratuita para desbloquear este artículo, comentar y recibir nuevos contenidos sobre datos y operaciones para PyMEs.
                </p>
                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  <Button variant="hero" asChild>
                    <Link to={`/auth?redirect=/blog/${slug}`}>Crear cuenta gratis <ArrowRight className="ml-1" /></Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/auth?redirect=/blog/${slug}`}>Ya tengo cuenta</Link>
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <>
              <div className="mt-10 space-y-6">
                {post.content.map((para, i) => renderParagraph(para, i))}
              </div>

              {post.sources && post.sources.length > 0 && (
                <div className="mt-12 p-6 rounded-2xl border border-border/50 bg-muted/30">
                  <h3 className="font-display text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Fuentes y lecturas recomendadas
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {post.sources.map((s, i) => (
                      <li key={i} className="text-sm">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-start gap-2 hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                          <span>
                            <span className="font-medium">{s.title}</span>
                            <span className="text-muted-foreground"> · {s.outlet}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <BlogComments slug={post.slug} />
            </>
          )}

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
                  <Card className="overflow-hidden h-full glass-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow">
                    <img src={p.image} alt={p.title} width={1280} height={720} loading="lazy" className="w-full aspect-video object-cover" />
                    <div className="p-6">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{p.category}</span>
                      <h3 className="font-display text-lg font-bold mt-3 group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{p.excerpt}</p>
                    </div>
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
