import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Shared Markdown renderer with HTML sanitization to prevent XSS in user-generated content.
const sanitizeSchema = structuredClone(defaultSchema);

type SafeMarkdownProps = {
  children: string;
};

export function SafeMarkdown({ children }: SafeMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize(sanitizeSchema)]}
    >
      {children}
    </ReactMarkdown>
  );
}
