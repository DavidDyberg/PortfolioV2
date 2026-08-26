import { useRef, useState } from "react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  SquareCode,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/Markdown";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  id?: string;
};

type Action =
  | { kind: "wrap"; before: string; after: string; placeholder: string }
  | { kind: "line"; prefix: string; placeholder: string }
  | { kind: "block"; before: string; after: string; placeholder: string };

const TOOLS: { label: string; icon: typeof Bold; action: Action }[] = [
  { label: "Bold", icon: Bold, action: { kind: "wrap", before: "**", after: "**", placeholder: "bold text" } },
  { label: "Italic", icon: Italic, action: { kind: "wrap", before: "*", after: "*", placeholder: "italic text" } },
  { label: "Heading 1", icon: Heading1, action: { kind: "line", prefix: "# ", placeholder: "Heading 1" } },
  { label: "Heading 2", icon: Heading2, action: { kind: "line", prefix: "## ", placeholder: "Heading 2" } },
  { label: "Heading 3", icon: Heading3, action: { kind: "line", prefix: "### ", placeholder: "Heading 3" } },
  { label: "Bullet list", icon: List, action: { kind: "line", prefix: "- ", placeholder: "List item" } },
  { label: "Numbered list", icon: ListOrdered, action: { kind: "line", prefix: "1. ", placeholder: "List item" } },
  { label: "Quote", icon: Quote, action: { kind: "line", prefix: "> ", placeholder: "Quote" } },
  { label: "Link", icon: Link2, action: { kind: "wrap", before: "[", after: "](https://)", placeholder: "link text" } },
  { label: "Inline code", icon: Code, action: { kind: "wrap", before: "`", after: "`", placeholder: "code" } },
  {
    label: "Code block",
    icon: SquareCode,
    action: { kind: "block", before: "```\n", after: "\n```", placeholder: "code" },
  },
];

export const MarkdownEditor = ({ value, onChange, required, placeholder, id }: MarkdownEditorProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");

  const applyAction = (action: Action) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);

    let next = value;
    let selStart = start;
    let selEnd = end;

    if (action.kind === "line") {
      // Expand selection to full lines
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEndIdx = value.indexOf("\n", end);
      const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
      const block = value.slice(lineStart, lineEnd) || action.placeholder;
      const prefixed = block
        .split("\n")
        .map((line) => (line.startsWith(action.prefix) ? line : `${action.prefix}${line}`))
        .join("\n");
      next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
      selStart = lineStart;
      selEnd = lineStart + prefixed.length;
    } else {
      const inner = selected || action.placeholder;
      const insertion = `${action.before}${inner}${action.after}`;
      const prefixNewlines = action.kind === "block" && start > 0 && !value.slice(0, start).endsWith("\n\n") ? "\n\n" : "";
      next = value.slice(0, start) + prefixNewlines + insertion + value.slice(end);
      selStart = start + prefixNewlines.length + action.before.length;
      selEnd = selStart + inner.length;
    }

    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    });
  };

  return (
    <div className="mt-2 rounded-xl border border-border bg-background/40 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-2">
        {TOOLS.map(({ label, icon: Icon, action }) => (
          <Button
            key={label}
            type="button"
            size="icon"
            variant="ghost"
            title={label}
            aria-label={label}
            disabled={tab === "preview"}
            onClick={() => applyAction(action)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-1 rounded-lg bg-background p-0.5 border border-border">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-smooth ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "write" ? (
        <Textarea
          id={id}
          ref={(el) => {
            ref.current = el;
            if (el) {
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }
          }}
          required={required}
          rows={6}
          placeholder={placeholder ?? "Write your description in Markdown…"}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          className="resize-none overflow-hidden border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[160px] font-mono text-sm"
        />
      ) : (
        <div className="p-4 min-h-[160px]">
          {value.trim() ? (
            <Markdown content={value} className="text-base" />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}
      <p className="px-4 py-2 text-xs text-muted-foreground border-t border-border bg-muted/20">
        Markdown supported — headings, bold, italic, lists, links, quotes and code.
      </p>
    </div>
  );
};
