import { buildLocalFileUrl } from "./fileUrl";
import { groupApiPath } from "./groups";

export type LinkResolution =
  | { type: "external" }
  | { type: "hash" }
  | { type: "markdown"; hrefPath: string; navigableUrl: string }
  | { type: "file"; href: string }
  | { type: "passthrough" };

function rawBasePath(group: string, fileId: string): string {
  return `${groupApiPath(group)}/files/${fileId}/raw`;
}

function buildOpenRedirectUrl(group: string, fileId: string, hrefPath: string): string {
  const params = new URLSearchParams({ from: fileId, path: hrefPath });
  return `${groupApiPath(group)}/files/open?${params.toString()}`;
}

export function resolveLink(
  href: string | undefined,
  group: string,
  fileId: string,
  baseDir: string,
): LinkResolution {
  if (!href || href.startsWith("http://") || href.startsWith("https://")) {
    return { type: "external" };
  }
  if (href.startsWith("#")) {
    return { type: "hash" };
  }
  const hrefPath = href.split("#")[0];
  if (hrefPath.endsWith(".md") || hrefPath.endsWith(".mdx")) {
    return {
      type: "markdown",
      hrefPath,
      navigableUrl: buildOpenRedirectUrl(group, fileId, hrefPath),
    };
  }
  const basename = hrefPath.split("/").pop() || "";
  if (basename.includes(".")) {
    const fileUrl = buildLocalFileUrl(baseDir, href);
    return {
      type: "file",
      href: fileUrl ?? `${rawBasePath(group, fileId)}/${href}`,
    };
  }
  return { type: "passthrough" };
}

export function resolveImageSrc(
  src: string | undefined,
  group: string,
  fileId: string,
): string | undefined {
  if (src && !src.startsWith("http://") && !src.startsWith("https://")) {
    return `${rawBasePath(group, fileId)}/${src}`;
  }
  return src;
}

export function extractLanguage(className: string | undefined): string | null {
  const match = /language-(\w+)/.exec(className || "");
  return match ? match[1] : null;
}
