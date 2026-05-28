-- Recompute slugs from titles, only adding -2, -3, ... on duplicates
WITH base AS (
  SELECT
    id,
    lower(regexp_replace(
      regexp_replace(
        translate(title, 'åäöÅÄÖáàâãéèêíìîóòôõúùûñçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÑÇ', 'aaoaaoaaaaeeeiiioooouuuncAAAAEEEIIIOOOOUUUNC'),
        '[^a-zA-Z0-9]+', '-', 'g'
      ),
      '(^-+|-+$)', '', 'g'
    )) AS base_slug,
    row_number() OVER (
      PARTITION BY lower(regexp_replace(
        regexp_replace(
          translate(title, 'åäöÅÄÖáàâãéèêíìîóòôõúùûñçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÑÇ', 'aaoaaoaaaaeeeiiioooouuuncAAAAEEEIIIOOOOUUUNC'),
          '[^a-zA-Z0-9]+', '-', 'g'
        ),
        '(^-+|-+$)', '', 'g'
      ))
      ORDER BY created_at
    ) AS rn
  FROM public.projects
)
UPDATE public.projects p
SET slug = CASE WHEN b.rn = 1 THEN b.base_slug ELSE b.base_slug || '-' || b.rn END
FROM base b
WHERE p.id = b.id;