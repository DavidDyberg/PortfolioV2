ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.projects
)
UPDATE public.projects p SET sort_order = ordered.rn
FROM ordered WHERE ordered.id = p.id;

CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON public.projects(sort_order);