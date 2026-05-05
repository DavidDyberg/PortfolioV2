import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/useProjects";
import { ImageGallery } from "@/components/ImageGallery";

const ProjectDetail = () => {
  const { id } = useParams();
  const { data: project, isLoading } = useProject(id);

  if (isLoading) {
    return <div className="container py-16"><Skeleton className="h-96 rounded-2xl" /></div>;
  }
  if (!project) {
    return <div className="container py-24 text-center"><p className="text-muted-foreground">Project not found.</p></div>;
  }

  return (
    <article className="container py-12 md:py-16 max-w-5xl">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-smooth">
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </Link>
      <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-up">{project.title}</h1>
      <div className="flex flex-wrap gap-2 mb-8">
        {project.tech_stack.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
      </div>
      {project.images?.length > 0 && (
        <ImageGallery images={project.images} alt={project.title} />
      )}
      <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line mb-10">{project.description}</p>
      <div className="flex flex-wrap gap-4">
        {project.live_url && (
          <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth">
            <a href={project.live_url} target="_blank" rel="noreferrer">Live site <ExternalLink className="ml-2 w-4 h-4" /></a>
          </Button>
        )}
        {project.github_url && (
          <Button asChild variant="outline">
            <a href={project.github_url} target="_blank" rel="noreferrer">GitHub <Github className="ml-2 w-4 h-4" /></a>
          </Button>
        )}
      </div>
    </article>
  );
};

export default ProjectDetail;
