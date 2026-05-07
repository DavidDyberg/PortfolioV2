import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { GripVertical, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Project,
  deleteImagesFromStorage,
  useAddProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/hooks/useProjects";

const empty = { title: "", description: "", tech_stack: "", live_url: "", github_url: "" };

type PendingImage = { file: File; previewUrl: string };

const Admin = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const { data: projects = [] } = useProjects();
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) { navigate("/auth"); return; }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", s.session.user.id);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      setReady(true);
    })();
  }, [navigate]);

  const resetImages = () => {
    pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingImages([]);
    setExistingImages([]);
    setRemovedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startNew = () => {
    setEditingId(null);
    setForm(empty);
    resetImages();
    setShowForm(true);
  };

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      tech_stack: p.tech_stack.join(", "),
      live_url: p.live_url ?? "",
      github_url: p.github_url ?? "",
    });
    resetImages();
    setExistingImages(p.images ?? []);
    setShowForm(true);
  };

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length !== files.length) toast.error("Only image files are allowed");
    setPendingImages((prev) => [
      ...prev,
      ...valid.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePending = (idx: number) => {
    setPendingImages((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExisting = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("project-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("project-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const uploaded: string[] = [];
      for (const p of pendingImages) {
        uploaded.push(await uploadImage(p.file));
      }
      const images = [...existingImages, ...uploaded];

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        images,
        live_url: form.live_url.trim() || null,
        github_url: form.github_url.trim() || null,
        tech_stack: form.tech_stack.split(",").map((s) => s.trim()).filter(Boolean),
      };

      if (editingId) {
        await updateProject.mutateAsync({ id: editingId, payload });
        if (removedImages.length) {
          try { await deleteImagesFromStorage(removedImages); } catch (err: any) {
            toast.error("Project saved, but some images could not be removed from storage");
          }
        }
      } else {
        await addProject.mutateAsync(payload);
      }
      toast.success(editingId ? "Project updated" : "Project added");
      setShowForm(false);
      resetImages();
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject.mutateAsync(deleteTarget);
      toast.success("Project and images deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete project (images may not have been cleaned up)");
    }
  };

  if (!ready) return <div className="container py-20">Loading…</div>;

  if (!isAdmin) {
    return (
      <section className="container py-20 max-w-2xl">
        <div className="rounded-2xl border border-border bg-card/60 p-8">
          <h1 className="text-2xl font-bold mb-3">Admin access required</h1>
          <p className="text-muted-foreground">
            Your account is signed in but doesn't have the <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">admin</code> role yet.
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
              <Label>Project images</Label>
              {(existingImages.length > 0 || pendingImages.length > 0) && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {existingImages.map((url) => (
                    <div key={url} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-[4/3]">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExisting(url)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {pendingImages.map((p, i) => (
                    <div key={p.previewUrl} className="relative group rounded-lg overflow-hidden border border-primary/40 bg-muted aspect-[4/3]">
                      <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-primary-foreground">New</span>
                      <button
                        type="button"
                        onClick={() => removePending(i)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFilesChange}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90 file:cursor-pointer cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  You can select multiple images. Removed images will be deleted from storage on save.
                </p>
              </div>
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
            <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth">
              {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {pendingImages.length ? "Uploading…" : "Saving…"}</>) : (<><Upload className="w-4 h-4 mr-2" /> {editingId ? "Save changes" : "Create project"}</>)}
            </Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 hover:border-primary/40 transition-smooth">
            <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0 relative">
              {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
              {p.images?.length > 1 && (
                <span className="absolute bottom-0.5 right-0.5 text-[10px] px-1 rounded bg-background/80 text-foreground">+{p.images.length - 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{p.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 break-words" title={p.description}>
                {p.description}
              </p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => startEdit(p)} aria-label="Edit project">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(p)} aria-label="Delete project">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No projects yet — create your first one.</div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && !deleteProject.isPending && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{deleteTarget?.title}</span>? All associated images will also be removed from storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProject.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              disabled={deleteProject.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProject.isPending ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting…</>) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default Admin;
