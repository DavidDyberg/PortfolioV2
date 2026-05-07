import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Project = {
  id: string;
  title: string;
  images: string[];
  description: string;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
  sort_order: number;
  created_at?: string;
};

export type ProjectInput = Omit<Project, "id" | "created_at" | "sort_order"> & { sort_order?: number };

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

export const useProjects = () =>
  useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

export const useProject = (id: string | undefined) =>
  useQuery({
    queryKey: ["projects", id],
    enabled: !!id,
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return (data as Project) ?? null;
    },
  });

export const useAddProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProjectInput) => {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ProjectInput }) => {
      const { error } = await supabase.from("projects").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: Project) => {
      // Delete images first; if it fails, abort project deletion.
      if (project.images?.length) {
        await deleteImagesFromStorage(project.images);
      }
      const { error } = await supabase.from("projects").delete().eq("id", project.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};
