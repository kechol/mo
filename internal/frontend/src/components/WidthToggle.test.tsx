import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WidthToggle } from "./WidthToggle";

describe("WidthToggle", () => {
  it("shows 'Wide view' title when narrow", () => {
    render(<WidthToggle isWide={false} onToggle={() => {}} />);
    expect(screen.getByTitle("Wide view")).toBeInTheDocument();
  });

  it("shows 'Narrow view' title when wide", () => {
    render(<WidthToggle isWide={true} onToggle={() => {}} />);
    expect(screen.getByTitle("Narrow view")).toBeInTheDocument();
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<WidthToggle isWide={false} onToggle={onToggle} />);

    await user.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
