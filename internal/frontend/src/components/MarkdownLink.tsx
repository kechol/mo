import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { isPlainLeftClick } from "../utils/linkClick";
import { resolveLink } from "../utils/resolve";

type MarkdownLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
  children?: ReactNode;
  activeGroup: string;
  fileId: string;
  baseDir: string;
  onMarkdownClick: (e: MouseEvent<HTMLAnchorElement>, hrefPath: string) => void;
};

export function MarkdownLink({
  href,
  children,
  activeGroup,
  fileId,
  baseDir,
  onMarkdownClick,
  ...rest
}: MarkdownLinkProps) {
  const resolved = resolveLink(href, activeGroup, fileId, baseDir);

  switch (resolved.type) {
    case "external":
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    case "hash":
      return (
        <a href={href} onClick={(e) => handleHashClick(e, href)} {...rest}>
          {children}
        </a>
      );
    case "markdown":
      return (
        <a
          href={resolved.navigableUrl}
          onClick={(e) => onMarkdownClick(e, resolved.hrefPath)}
          {...rest}
        >
          {children}
        </a>
      );
    case "file":
      return (
        <a href={resolved.href} {...rest}>
          {children}
        </a>
      );
    case "passthrough":
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      );
  }
}

function handleHashClick(e: MouseEvent<HTMLAnchorElement>, href: string | undefined) {
  if (!isPlainLeftClick(e)) return;
  const id = href?.slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  history.pushState(null, "", href);
}
