import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MarkdownLink } from "./MarkdownLink";

const baseDir = "/Users/foo/docs";

function renderLink(href: string | undefined, onMarkdownClick = vi.fn()) {
  render(
    <MarkdownLink
      href={href}
      activeGroup="default"
      fileId="src1"
      baseDir={baseDir}
      onMarkdownClick={onMarkdownClick}
    >
      label
    </MarkdownLink>,
  );
  return { onMarkdownClick };
}

function appendHeading(id: string): HTMLElement {
  const heading = document.createElement("h2");
  heading.id = id;
  heading.textContent = "Section";
  document.body.appendChild(heading);
  return heading;
}

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe("MarkdownLink", () => {
  it("renders external links with target=_blank and noopener noreferrer", () => {
    renderLink("https://example.com");
    const link = screen.getByRole("link", { name: "label" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("renders markdown links with the navigable redirect URL", () => {
    renderLink("./other.md");
    const link = screen.getByRole("link", { name: "label" });
    expect(link).toHaveAttribute(
      "href",
      "/_/api/groups/default/files/open?from=src1&path=.%2Fother.md",
    );
  });

  it("renders local file links as file:// URLs resolved against baseDir", () => {
    renderLink("./report.html");
    const link = screen.getByRole("link", { name: "label" });
    expect(link).toHaveAttribute("href", "file:///Users/foo/docs/report.html");
  });

  it("falls back to the raw API URL when baseDir is empty (uploaded source)", () => {
    render(
      <MarkdownLink
        href="image.png"
        activeGroup="default"
        fileId="src1"
        baseDir=""
        onMarkdownClick={vi.fn()}
      >
        label
      </MarkdownLink>,
    );
    const link = screen.getByRole("link", { name: "label" });
    expect(link).toHaveAttribute("href", "/_/api/groups/default/files/src1/raw/image.png");
  });

  it("renders passthrough hrefs for extensionless paths", () => {
    renderLink("somedir");
    const link = screen.getByRole("link", { name: "label" });
    expect(link).toHaveAttribute("href", "somedir");
  });

  it("invokes onMarkdownClick on a plain left click", () => {
    const { onMarkdownClick } = renderLink("./other.md");
    const link = screen.getByRole("link", { name: "label" });
    link.click();
    expect(onMarkdownClick).toHaveBeenCalledTimes(1);
    expect(onMarkdownClick.mock.calls[0][1]).toBe("./other.md");
  });

  it("scrolls smoothly to the target heading when a hash link is clicked", () => {
    const target = appendHeading("section");
    const scrollSpy = vi.fn();
    target.scrollIntoView = scrollSpy;
    const matchMediaSpy = vi
      .spyOn(window, "matchMedia")
      .mockReturnValue({ matches: false } as MediaQueryList);

    renderLink("#section");
    const link = screen.getByRole("link", { name: "label" });
    link.click();

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    matchMediaSpy.mockRestore();
  });

  it("uses instant scroll when the user prefers reduced motion", () => {
    const target = appendHeading("section");
    const scrollSpy = vi.fn();
    target.scrollIntoView = scrollSpy;
    const matchMediaSpy = vi
      .spyOn(window, "matchMedia")
      .mockReturnValue({ matches: true } as MediaQueryList);

    renderLink("#section");
    screen.getByRole("link", { name: "label" }).click();

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    matchMediaSpy.mockRestore();
  });

  it("lets cmd-click on a markdown link bubble through to the browser", () => {
    const { onMarkdownClick } = renderLink("./other.md");
    const link = screen.getByRole("link", { name: "label" });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true });
    link.dispatchEvent(event);
    // The handler still fires (React listens on click) but it must not
    // preventDefault, so the browser's native open-in-new-tab kicks in.
    expect(onMarkdownClick).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(false);
  });

  it("lets cmd-click on a hash link bubble through to the browser", () => {
    const target = appendHeading("section");
    const scrollSpy = vi.fn();
    target.scrollIntoView = scrollSpy;

    renderLink("#section");
    const link = screen.getByRole("link", { name: "label" });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true });
    link.dispatchEvent(event);

    expect(scrollSpy).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
