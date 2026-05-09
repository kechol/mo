export function buildLocalFileUrl(baseDir: string, relPath: string): string | null {
  if (!baseDir) return null;
  // Windows: "C:\…" → "/C:/…" so URL() resolves it as file:///C:/…
  const normalizedDir = baseDir.replace(/\\/g, "/");
  const rooted = normalizedDir.startsWith("/") ? normalizedDir : `/${normalizedDir}`;
  const withSlash = rooted.endsWith("/") ? rooted : `${rooted}/`;
  try {
    return new URL(relPath, `file://${withSlash}`).href;
  } catch {
    return null;
  }
}
