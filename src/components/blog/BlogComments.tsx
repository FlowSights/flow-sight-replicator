import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageCircle, Trash2, Pencil, X, Check } from "lucide-react";
import { z } from "zod";

type CommentRow = {
  id: string;
  post_slug: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

const commentSchema = z.object({
  content: z.string().trim().min(1, "Escribe un comentario").max(2000, "Máximo 2000 caracteres"),
});

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch { return iso; }
};

export const BlogComments = ({ slug }: { slug: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("post_slug", slug)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error cargando comentarios", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as CommentRow[];
    setComments(rows);
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
    if (userIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds);
      const map: Record<string, ProfileRow> = {};
      (profs ?? []).forEach((p) => { map[p.id] = p as ProfileRow; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = commentSchema.safeParse({ content: text });
    if (!parsed.success) {
      toast({ title: "Comentario inválido", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("blog_comments").insert({
      post_slug: slug,
      user_id: user.id,
      content: parsed.data.content,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "No pudimos publicar tu comentario", description: error.message, variant: "destructive" });
      return;
    }
    setText("");
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blog_comments").delete().eq("id", id);
    if (error) {
      toast({ title: "Error al borrar", description: error.message, variant: "destructive" });
      return;
    }
    setComments((c) => c.filter((x) => x.id !== id));
  };

  const handleSaveEdit = async (id: string) => {
    const parsed = commentSchema.safeParse({ content: editText });
    if (!parsed.success) {
      toast({ title: "Inválido", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("blog_comments").update({ content: parsed.data.content }).eq("id", id);
    if (error) {
      toast({ title: "Error al editar", description: error.message, variant: "destructive" });
      return;
    }
    setEditingId(null);
    load();
  };

  return (
    <div className="mt-12">
      <h2 className="font-display text-2xl font-bold flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-primary" />
        Comentarios {comments.length > 0 && <span className="text-muted-foreground text-base">({comments.length})</span>}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Comparte tu opinión, una pregunta o tu propia experiencia…"
            rows={4}
            maxLength={2000}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{text.length}/2000</span>
            <Button type="submit" variant="hero" disabled={submitting || !text.trim()}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar comentario"}
            </Button>
          </div>
        </form>
      ) : (
        <Card className="mt-6 p-6 glass-card text-center">
          <p className="text-muted-foreground">Inicia sesión para dejar tu comentario.</p>
          <Button asChild variant="hero" className="mt-4">
            <Link to={`/auth?redirect=/blog/${slug}`}>Iniciar sesión</Link>
          </Button>
        </Card>
      )}

      <div className="mt-8 space-y-4">
        {loading && <p className="text-muted-foreground text-sm">Cargando comentarios…</p>}
        {!loading && comments.length === 0 && (
          <p className="text-muted-foreground text-sm">Aún no hay comentarios. ¡Sé el primero!</p>
        )}
        {comments.map((c) => {
          const profile = profiles[c.user_id];
          const name = profile?.display_name ?? "Lector";
          const isMine = user?.id === c.user_id;
          return (
            <Card key={c.id} className="p-5 glass-card">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={name} />}
                  <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(c.created_at)}
                        {c.updated_at !== c.created_at && " · editado"}
                      </p>
                    </div>
                    {isMine && editingId !== c.id && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(c.id); setEditText(c.content); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingId === c.id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} maxLength={2000} className="resize-none" />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-3.5 h-3.5 mr-1" />Cancelar</Button>
                        <Button size="sm" variant="hero" onClick={() => handleSaveEdit(c.id)}><Check className="w-3.5 h-3.5 mr-1" />Guardar</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">{c.content}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};