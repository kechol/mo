import { describe, it, expect } from "vitest";
import { resolveLink, resolveImageSrc, extractLanguage } from "./resolve";

describe("resolveLink", () => {
  const baseDir = "/Users/foo/docs";

  it("returns external for undefined href", () => {
    expect(resolveLink(undefined, "default", "a", baseDir)).toEqual({ type: "external" });
  });

  it("returns external for http:// URLs", () => {
    expect(resolveLink("http://example.com", "default", "a", baseDir)).toEqual({
      type: "external",
    });
  });

  it("returns external for https:// URLs", () => {
    expect(resolveLink("https://example.com/page", "default", "a", baseDir)).toEqual({
      type: "external",
    });
  });

  it("returns hash for anchor-only links", () => {
    expect(resolveLink("#section", "default", "a", baseDir)).toEqual({ type: "hash" });
  });

  it("returns markdown with a navigable redirect URL for .md links", () => {
    expect(resolveLink("other.md", "default", "e", baseDir)).toEqual({
      type: "markdown",
      hrefPath: "other.md",
      navigableUrl: "/_/api/groups/default/files/open?from=e&path=other.md",
    });
  });

  it("strips anchor from markdown hrefPath but uses raw path in the redirect URL", () => {
    expect(resolveLink("readme.md#title", "default", "e", baseDir)).toEqual({
      type: "markdown",
      hrefPath: "readme.md",
      navigableUrl: "/_/api/groups/default/files/open?from=e&path=readme.md",
    });
  });

  it("returns markdown for nested path .md links", () => {
    expect(resolveLink("docs/guide.md", "default", "c", baseDir)).toEqual({
      type: "markdown",
      hrefPath: "docs/guide.md",
      navigableUrl: "/_/api/groups/default/files/open?from=c&path=docs%2Fguide.md",
    });
  });

  it("returns markdown for .mdx links", () => {
    expect(resolveLink("component.mdx", "default", "e", baseDir)).toEqual({
      type: "markdown",
      hrefPath: "component.mdx",
      navigableUrl: "/_/api/groups/default/files/open?from=e&path=component.mdx",
    });
  });

  it("returns file with file:// href for local non-md files", () => {
    expect(resolveLink("report.html", "default", "g", baseDir)).toEqual({
      type: "file",
      href: "file:///Users/foo/docs/report.html",
    });
  });

  it("preserves anchors in file:// hrefs", () => {
    expect(resolveLink("data.csv#sheet1", "default", "b", baseDir)).toEqual({
      type: "file",
      href: "file:///Users/foo/docs/data.csv#sheet1",
    });
  });

  it("resolves nested paths against baseDir", () => {
    expect(resolveLink("assets/logo.svg", "default", "d", baseDir)).toEqual({
      type: "file",
      href: "file:///Users/foo/docs/assets/logo.svg",
    });
  });

  it("falls back to raw API URL when baseDir is empty (uploaded source)", () => {
    expect(resolveLink("image.png", "default", "g", "")).toEqual({
      type: "file",
      href: "/_/api/groups/default/files/g/raw/image.png",
    });
  });

  it("returns passthrough for extensionless paths", () => {
    expect(resolveLink("somedir", "default", "a", baseDir)).toEqual({ type: "passthrough" });
  });

  it("returns passthrough for directory-like paths", () => {
    expect(resolveLink("path/to/dir", "default", "a", baseDir)).toEqual({ type: "passthrough" });
  });

  it("encodes group name in the markdown redirect URL", () => {
    expect(resolveLink("other.md", "api/docs", "e", baseDir)).toEqual({
      type: "markdown",
      hrefPath: "other.md",
      navigableUrl: "/_/api/groups/api%2Fdocs/files/open?from=e&path=other.md",
    });
  });
});

describe("resolveImageSrc", () => {
  it("rewrites relative src to raw API URL", () => {
    expect(resolveImageSrc("image.png", "default", "c")).toBe(
      "/_/api/groups/default/files/c/raw/image.png",
    );
  });

  it("rewrites nested relative src", () => {
    expect(resolveImageSrc("assets/photo.jpg", "default", "e")).toBe(
      "/_/api/groups/default/files/e/raw/assets/photo.jpg",
    );
  });

  it("passes through http:// URLs", () => {
    expect(resolveImageSrc("http://example.com/img.png", "default", "a")).toBe(
      "http://example.com/img.png",
    );
  });

  it("passes through https:// URLs", () => {
    expect(resolveImageSrc("https://example.com/img.png", "default", "a")).toBe(
      "https://example.com/img.png",
    );
  });

  it("returns undefined for undefined src", () => {
    expect(resolveImageSrc(undefined, "default", "a")).toBeUndefined();
  });
});

describe("extractLanguage", () => {
  it("extracts language from className", () => {
    expect(extractLanguage("language-typescript")).toBe("typescript");
  });

  it("extracts language with other classes present", () => {
    expect(extractLanguage("foo language-python bar")).toBe("python");
  });

  it("returns null for undefined className", () => {
    expect(extractLanguage(undefined)).toBeNull();
  });

  it("returns null for empty className", () => {
    expect(extractLanguage("")).toBeNull();
  });

  it("returns null when no language- prefix", () => {
    expect(extractLanguage("highlight code")).toBeNull();
  });
});
