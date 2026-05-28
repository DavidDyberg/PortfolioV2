export const slugify = (input: string): string => {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics (é→e, ñ→n, etc.)
    .replace(/[åä]/gi, "a")
    .replace(/[ö]/gi, "o")
    .replace(/[ø]/gi, "o")
    .replace(/[æ]/gi, "ae")
    .replace(/[ß]/gi, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "project";
};
