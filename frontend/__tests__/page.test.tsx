import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../app/page";

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => "blob:mock");
  global.URL.revokeObjectURL = vi.fn();
});

describe("Home page", () => {
  it("renders the Prelegal header", () => {
    render(<Home />);
    expect(screen.getByText("Prelegal")).toBeInTheDocument();
  });

  it("renders the Mutual NDA Creator subtitle", () => {
    render(<Home />);
    expect(screen.getByText("Mutual NDA Creator")).toBeInTheDocument();
  });

  it("renders the Download Markdown button", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /download markdown/i })).toBeInTheDocument();
  });

  it("renders the Download PDF button", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
  });

  it("renders the NDA form (h2 Party 1 only appears in the form, not the preview)", () => {
    render(<Home />);
    // "Party 1" is only in NDAForm (h2), not in NDAPreview
    expect(screen.getByRole("heading", { level: 2, name: "Party 1" })).toBeInTheDocument();
  });

  it("renders the NDA preview with the document title", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Mutual Non-Disclosure Agreement" })
    ).toBeInTheDocument();
  });

  it("updates preview when governing law is typed in form", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const govLawInput = screen.getByPlaceholderText("e.g. Delaware");
    await user.clear(govLawInput);
    await user.type(govLawInput, "Texas");
    expect(screen.getAllByText(/Texas/).length).toBeGreaterThan(0);
  });

  it("Download Markdown button triggers a blob download", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await user.click(screen.getByRole("button", { name: /download markdown/i }));
    expect(URL.createObjectURL).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("Download PDF button calls window.print", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    await user.click(screen.getByRole("button", { name: /download pdf/i }));
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
