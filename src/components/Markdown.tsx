import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

type MarkdownProps = {
  content: string;
  className?: string;
};

/** Safely renders a Markdown string with typography matched to the portfolio design. */
export const Markdown = ({ content, className }: MarkdownProps) => (
  <div className={cn("text-lg text-muted-foreground leading-relaxed space-y-4", className)}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        h1: ({ children }) => (
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-8 mb-3">{children}</h2>
        ),
        h2: ({ children }) => (
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mt-8 mb-3">{children}</h3>
        ),
        h3: ({ children }) => (
          <h4 className="text-xl md:text-2xl font-semibold text-foreground mt-6 mb-2">{children}</h4>
        ),
        h4: ({ children }) => (
          <h5 className="text-lg font-semibold text-foreground mt-6 mb-2">{children}</h5>
        ),
        p: ({ children }) => <p className="leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc pl-6 space-y-1.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1.5">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4 hover:opacity-80 transition-smooth"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/60 pl-4 italic text-muted-foreground/90">
            {children}
          </blockquote>
        ),
        code: ({ className: cls, children }) => {
          const isBlock = !!cls?.includes("language-");
          if (isBlock) {
            return <code className="block text-sm font-mono">{children}</code>;
          }
          return (
            <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[0.9em] font-mono">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="rounded-xl border border-border bg-muted/60 p-4 overflow-x-auto text-sm">
            {children}
          </pre>
        ),
        hr: () => <hr className="border-border my-8" />,
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="w-full text-base border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">{children}</th>
        ),
        td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
        img: ({ src, alt }) => (
          <img src={src as string} alt={alt ?? ""} loading="lazy" className="rounded-xl border border-border" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);
