import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
};

export const ImageGallery = ({ images, alt }: Props) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const single = images.length === 1;

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  if (images.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          "grid gap-4 mb-10",
          single ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => openAt(i)}
            aria-label={`Open ${alt} image ${i + 1}`}
            className="group rounded-2xl overflow-hidden border border-border shadow-card bg-muted/40 flex items-center justify-center p-4 cursor-pointer transition-smooth hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src={src}
              alt={`${alt} – image ${i + 1}`}
              loading="lazy"
              className={cn(
                "w-auto max-w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]",
                single ? "max-h-[600px]" : "max-h-[400px]",
              )}
            />
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-6xl border-none bg-background/40 backdrop-blur-xl p-0 sm:rounded-2xl shadow-glow">
          <div className="relative flex items-center justify-center min-h-[60vh] max-h-[90vh] p-4 sm:p-8">
            <img
              src={images[index]}
              alt={`${alt} – image ${index + 1}`}
              className="max-h-[85vh] max-w-full w-auto object-contain rounded-lg animate-fade-up"
            />

            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={prev}
                  aria-label="Previous image"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full opacity-90 hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full opacity-90 hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Go to image ${i + 1}`}
                      className={cn(
                        "w-2 h-2 rounded-full transition-smooth",
                        i === index ? "bg-primary w-6" : "bg-muted-foreground/50 hover:bg-muted-foreground",
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
