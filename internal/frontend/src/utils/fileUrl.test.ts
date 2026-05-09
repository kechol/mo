import { describe, it, expect } from "vitest";
import { buildLocalFileUrl } from "./fileUrl";

describe("buildLocalFileUrl", () => {
  it("returns a file:// URL for a Unix baseDir and relative path", () => {
    expect(buildLocalFileUrl("/Users/foo/docs", "report.html")).toBe(
      "file:///Users/foo/docs/report.html",
    );
  });

  it("strips leading ./ via URL resolution", () => {
    expect(buildLocalFileUrl("/Users/foo/docs", "./report.html")).toBe(
      "file:///Users/foo/docs/report.html",
    );
  });

  it("resolves parent-directory references", () => {
    expect(buildLocalFileUrl("/Users/foo/docs", "../other/report.html")).toBe(
      "file:///Users/foo/other/report.html",
    );
  });

  it("preserves anchors", () => {
    expect(buildLocalFileUrl("/a/b", "page.html#section")).toBe("file:///a/b/page.html#section");
  });

  it("URL-encodes spaces and other special characters", () => {
    expect(buildLocalFileUrl("/a/b", "my report.html")).toBe("file:///a/b/my%20report.html");
  });

  it("handles a baseDir that already ends with /", () => {
    expect(buildLocalFileUrl("/a/b/", "page.html")).toBe("file:///a/b/page.html");
  });

  it("treats absolute relPath as filesystem-absolute", () => {
    expect(buildLocalFileUrl("/a/b", "/abs/page.html")).toBe("file:///abs/page.html");
  });

  it("normalizes Windows-style baseDir", () => {
    expect(buildLocalFileUrl("C:\\Users\\foo\\docs", "report.html")).toBe(
      "file:///C:/Users/foo/docs/report.html",
    );
  });

  it("returns null for empty baseDir (uploaded files)", () => {
    expect(buildLocalFileUrl("", "report.html")).toBeNull();
  });
});
