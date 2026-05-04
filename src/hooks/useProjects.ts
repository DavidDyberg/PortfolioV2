import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Project = {
  id: string;
  title: string;
  image_url: string | null;
  description: string;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
  created_at?: string;
};

export type ProjectInput = Omit<Project, "id" | "created_at">;

const PROJECTS_KEY = ["projects"] as const;

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
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ProjectInput;
    }) => {
      const { error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};
