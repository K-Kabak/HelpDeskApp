const SCRIPT_BLOCK = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const DANGEROUS_TAGS = /<\/?(?:style|iframe|object|embed|link|meta|svg|math)[^>]*>/gi;
const EVENT_HANDLERS = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_PROTOCOL = /javascript:/gi;

/**
 * Removes common XSS vectors from markdown-derived HTML strings.
 */
export function sanitizeMarkdown(input: string) {
  let output = input;
  output = output.replace(SCRIPT_BLOCK, "");
  output = output.replace(DANGEROUS_TAGS, "");
  output = output.replace(EVENT_HANDLERS, "");
  output = output.replace(JS_PROTOCOL, "");
  return output;
}
