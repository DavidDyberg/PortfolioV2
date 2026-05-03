import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Sparkles, Zap } from "lucide-react";
import spaceBg from "@/assets/space-bg.jpg";

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 backdrop-blur text-xs text-muted-foreground mb-8">
              <Sparkles className="w-3 h-3 text-primary" />
              Available for freelance projects
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6">
              Hi, I'm <span className="text-gradient">Alex Carter</span>
              <br />
              <span className="text-foreground/80">Frontend Developer</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              I design and build polished, performant interfaces — pairing thoughtful UX
              with modern web tech to ship products people love.
            </p>
            <div className="flex flex-wrap gap-4">
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
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-sm uppercase tracking-widest text-primary mb-4">About me</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Building the web, one pixel at a time.</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              I'm a frontend developer with a passion for clean code, intuitive interfaces,
              and delightful micro-interactions. I work with React, TypeScript, and modern
              CSS to bring ambitious ideas to life.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              When I'm not coding, you'll find me sketching UI concepts, contributing to
              open-source, or exploring new design systems.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              { icon: Code2, title: "Modern Stack", desc: "React, TypeScript, Tailwind, Vite, and the latest tools." },
              { icon: Zap, title: "Performance First", desc: "Lighthouse-perfect builds with thoughtful UX." },
              { icon: Sparkles, title: "Polished UI", desc: "Pixel-perfect interfaces with smooth animations." },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-card hover:border-primary/40 transition-smooth">
                <f.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
