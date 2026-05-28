import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slug";

export type Project = {
  id: string;
  title: string;
  slug: string;
  images: string[];
  description: string;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
  sort_order: number;
  created_at?: string;
};

export type ProjectInput = Omit<Project, "id" | "created_at" | "sort_order" | "slug"> & {
  sort_order?: number;
};

const PROJECTS_KEY = ["projects"] as const;
const BUCKET = "project-images";

/** Extract storage path from a public URL. Returns null if not a bucket URL. */
export const pathFromPublicUrl = (url: string): string | null => {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
};

/** Delete a list of image URLs from storage (best-effort). */
export const deleteImagesFromStorage = async (urls: string[]) => {
  const paths = urls.map(pathFromPublicUrl).filter((p): p is string => !!p);
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw error;
};

/** Build a slug unique within the projects table, excluding optional id. */
const buildUniqueSlug = async (title: string, excludeId?: string): Promise<string> => {
  const base = slugify(title);
  let candidate = base;
  let suffix = 1;
  // Try base, base-2, base-3 until unique
  // (Race conditions are mitigated by the unique constraint at the DB level.)
  while (true) {
    let query = supabase.from("projects").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
};

export const useProjects = () =>
  useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

export const useReorderProjects = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ordered: Project[]) => {
      await Promise.all(
        ordered.map((p, idx) =>
          supabase.from("projects").update({ sort_order: idx + 1 }).eq("id", p.id)
        )
      );
    },
    onMutate: async (ordered) => {
      await qc.cancelQueries({ queryKey: PROJECTS_KEY });
      const previous = qc.getQueryData<Project[]>(PROJECTS_KEY);
      qc.setQueryData<Project[]>(
        PROJECTS_KEY,
        ordered.map((p, idx) => ({ ...p, sort_order: idx + 1 }))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(PROJECTS_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};

export const useProjectBySlug = (slug: string | undefined) =>
  useQuery({
    queryKey: ["projects", "slug", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return (data as Project) ?? null;
    },
  });

export const useAddProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProjectInput) => {
      const { data: maxRow } = await supabase
        .from("projects")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextOrder = (maxRow?.sort_order ?? 0) + 1;
      const slug = await buildUniqueSlug(payload.title);
      const { error } = await supabase
        .from("projects")
        .insert({ ...payload, slug, sort_order: nextOrder });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ProjectInput }) => {
      const slug = await buildUniqueSlug(payload.title, id);
      const { error } = await supabase
        .from("projects")
        .update({ ...payload, slug })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: Project) => {
      if (project.images?.length) {
        await deleteImagesFromStorage(project.images);
      }
      const { error } = await supabase.from("projects").delete().eq("id", project.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};
