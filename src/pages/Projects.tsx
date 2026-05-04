import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";

const Projects = () => {
  const { data: projects, isLoading } = useProjects();

  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-2xl mb-12 animate-fade-up">
        <div className="text-sm uppercase tracking-widest text-primary mb-3">
          Selected work
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Projects</h1>
        <p className="text-muted-foreground text-lg">
          A collection of things I've designed and built.
        </p>
      </div>

      {isLoading || !projects ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          No projects yet. Sign in as admin to add some.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="group rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:border-primary/50 hover:-translate-y-1 transition-smooth"
            >
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-primary opacity-30" />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-gradient">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.tech_stack.slice(0, 4).map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Projects;
