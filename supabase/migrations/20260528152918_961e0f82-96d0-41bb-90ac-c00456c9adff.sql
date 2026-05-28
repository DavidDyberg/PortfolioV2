ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill slugs from titles
UPDATE public.projects
SET slug = lower(regexp_replace(
  regexp_replace(
    translate(title, 'åäöÅÄÖáàâãéèêíìîóòôõúùûñçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÑÇ', 'aaoAAOaaaaeeeiiioooouuuncAAAAEEEIIIOOOOUUUNC'),
    '[^a-zA-Z0-9]+', '-', 'g'
  ),
  '(^-+|-+$)', '', 'g'
)) || '-' || substr(id::text, 1, 6)
WHERE slug IS NULL;

ALTER TABLE public.projects ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.projects ADD CONSTRAINT projects_slug_unique UNIQUE (slug);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);