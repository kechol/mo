export interface ParsedFrontmatter {
  yaml: string;
  content: string;
}

export function parseFrontmatter(raw: string): ParsedFrontmatter | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  return { yaml: match[1], content: match[2] };
}
