import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";

type Project = {
  id: string;
  title: string;
  image_url: string | null;
  description: string;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
};

const empty = { title: "", image_url: "", description: "", tech_stack: "", live_url: "", github_url: "" };

const Admin = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects((data ?? []) as Project[]);
  };

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) { navigate("/auth"); return; }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", s.session.user.id);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      await load();
      setReady(true);
    })();
  }, [navigate]);

  const startNew = () => { setEditingId(null); setForm(empty); setShowForm(true); };
  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      image_url: p.image_url ?? "",
      description: p.description,
      tech_stack: p.tech_stack.join(", "),
      live_url: p.live_url ?? "",
      github_url: p.github_url ?? "",
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim() || null,
      live_url: form.live_url.trim() || null,
      github_url: form.github_url.trim() || null,
      tech_stack: form.tech_stack.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const { error } = editingId
      ? await supabase.from("projects").update(payload).eq("id", editingId)
      : await supabase.from("projects").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Project updated" : "Project added");
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  if (!ready) return <div className="container py-20">Loading…</div>;

  if (!isAdmin) {
    return (
      <section className="container py-20 max-w-2xl">
        <div className="rounded-2xl border border-border bg-card/60 p-8">
          <h1 className="text-2xl font-bold mb-3">Admin access required</h1>
          <p className="text-muted-foreground">
            Your account is signed in but doesn't have the <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">admin</code> role yet.
            Open the backend to grant your user the admin role in the <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">user_roles</code> table.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your portfolio projects.</p>
        </div>
        <Button onClick={startNew} className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth">
          <Plus className="w-4 h-4 mr-2" /> New project
        </Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-10 rounded-2xl border border-border bg-card/60 backdrop-blur p-6 md:p-8 shadow-card animate-fade-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{editingId ? "Edit project" : "New project"}</h2>
            <Button type="button" size="icon" variant="ghost" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Title</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Tech stack (comma-separated)</Label>
              <Input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, TypeScript, Tailwind" />
            </div>
            <div>
              <Label>Live URL</Label>
              <Input value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
            </div>
            <div>
              <Label>GitHub URL</Label>
              <Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button type="submit" className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth">
              {editingId ? "Save changes" : "Create project"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 hover:border-primary/40 transition-smooth">
            <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
              {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{p.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{p.description}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => startEdit(p)}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No projects yet — create your first one.</div>
        )}
      </div>
    </section>
  );
};

export default Admin;
