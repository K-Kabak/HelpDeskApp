import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Shared Markdown renderer with HTML sanitization to prevent XSS in user-generated content.
const sanitizeSchema = structuredClone(defaultSchema);

type SafeMarkdownProps = {
  children: string;
};

export function SafeMarkdown({ children }: SafeMarkdownProps) {
  // rehypeSanitize returns a plugin function that is compatible with react-markdown's rehypePlugins
  // Using type assertion through unknown for better type safety than 'as any'
  // This is necessary due to type incompatibility between rehype-sanitize and react-markdown types
  type RehypePlugin = NonNullable<React.ComponentProps<typeof ReactMarkdown>["rehypePlugins"]>[number];
  const sanitizePlugin = rehypeSanitize(sanitizeSchema) as unknown as RehypePlugin;
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[sanitizePlugin]}
    >
      {children}
    </ReactMarkdown>
  );
}
