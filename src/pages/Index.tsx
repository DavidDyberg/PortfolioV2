import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import spaceBg from "@/assets/space-bg.jpg";
import Skills from "@/components/Skills";

const Index = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <img src={spaceBg} alt="" width={1920} height={1280} className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />

        <div className="container relative z-10 py-24">
          <div className="max-w-3xl animate-fade-up">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6">
              Hi, I'm <span className="text-gradient">David Dyberg</span>
              <br />
              <span className="text-foreground/80">Fullstack Developer</span>
            </h1>
            <div className="flex flex-wrap gap-4 mt-10">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-smooth">
                <Link to="/projects">View My Work <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#about">About me</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="container py-24">
        <div className="max-w-3xl">
          <div className="text-sm uppercase tracking-widest text-primary mb-4">About me</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">A curious, collaborative fullstack developer.</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Hi! My name is David, and I am a curious and solution oriented fullstack developer.
            I'm a prestigeless person and enjoy collaborating with others.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Former colleagues have described me as easy to work with and quick to learn new things.
          </p>
        </div>
      </section>

      <Skills />
    </>
  );
};

export default Index;
