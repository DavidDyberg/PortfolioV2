ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';
UPDATE public.projects SET images = ARRAY[image_url] WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images,1) IS NULL);
ALTER TABLE public.projects DROP COLUMN IF EXISTS image_url;