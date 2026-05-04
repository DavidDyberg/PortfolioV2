const skills = [
  // Frontend
  { name: "React", url: "https://react.dev", icon: "https://cdn.simpleicons.org/react/61DAFB", category: "Frontend" },
  { name: "React Native", url: "https://reactnative.dev", icon: "https://cdn.simpleicons.org/react/61DAFB", category: "Frontend" },
  { name: "Next.js", url: "https://nextjs.org", icon: "https://cdn.simpleicons.org/nextdotjs/FFFFFF", category: "Frontend" },
  { name: "Expo", url: "https://expo.dev", icon: "https://cdn.simpleicons.org/expo/FFFFFF", category: "Frontend" },
  { name: "TypeScript", url: "https://www.typescriptlang.org", icon: "https://cdn.simpleicons.org/typescript/3178C6", category: "Frontend" },
  { name: "JavaScript", url: "https://developer.mozilla.org/docs/Web/JavaScript", icon: "https://cdn.simpleicons.org/javascript/F7DF1E", category: "Frontend" },
  { name: "HTML5", url: "https://developer.mozilla.org/docs/Web/HTML", icon: "https://cdn.simpleicons.org/html5/E34F26", category: "Frontend" },
  { name: "CSS", url: "https://developer.mozilla.org/docs/Web/CSS", icon: "https://cdn.simpleicons.org/css/1572B6", category: "Frontend" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com", icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4", category: "Frontend" },
  // Backend
  { name: "Node.js", url: "https://nodejs.org", icon: "https://cdn.simpleicons.org/nodedotjs/5FA04E", category: "Backend" },
  { name: "Express.js", url: "https://expressjs.com", icon: "https://cdn.simpleicons.org/express/FFFFFF", category: "Backend" },
  { name: "PHP", url: "https://www.php.net", icon: "https://cdn.simpleicons.org/php/777BB4", category: "Backend" },
  { name: "Prisma", url: "https://www.prisma.io", icon: "https://cdn.simpleicons.org/prisma/FFFFFF", category: "Backend" },
  { name: "MongoDB", url: "https://www.mongodb.com", icon: "https://cdn.simpleicons.org/mongodb/47A248", category: "Backend" },
  { name: "Supabase", url: "https://supabase.com", icon: "https://cdn.simpleicons.org/supabase/3FCF8E", category: "Backend" },
  // Tools
  { name: "Git", url: "https://git-scm.com", icon: "https://cdn.simpleicons.org/git/F05032", category: "Tools" },
  { name: "GitHub", url: "https://github.com", icon: "https://cdn.simpleicons.org/github/FFFFFF", category: "Tools" },
  { name: "React Query", url: "https://tanstack.com/query", icon: "https://cdn.simpleicons.org/reactquery/FF4154", category: "Tools" },
];

const Skills = () => (
  <section id="skills" className="container py-24">
    <div className="max-w-2xl mb-12">
      <div className="text-sm uppercase tracking-widest text-primary mb-4">My Skills</div>
      <h2 className="text-4xl md:text-5xl font-bold">Technologies I work with</h2>
      <p className="text-muted-foreground mt-4 text-lg">
        A toolkit I rely on to ship modern, performant fullstack applications.
      </p>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {skills.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${s.name} – open official website`}
          className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-card hover:border-primary/50 hover:-translate-y-1 hover:shadow-glow transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src={s.icon}
            alt={`${s.name} logo`}
            width={40}
            height={40}
            loading="lazy"
            className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-sm font-medium text-center">{s.name}</span>
        </a>
      ))}
    </div>
  </section>
);

export default Skills;
