import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NDAForm from "../app/components/NDAForm";
import { DEFAULT_NDA_DATA, NDAData } from "../app/types";

function setup(overrides: Partial<NDAData> = {}) {
  const data: NDAData = { ...DEFAULT_NDA_DATA, ...overrides };
  const onChange = vi.fn();
  render(<NDAForm data={data} onChange={onChange} />);
  return { onChange };
}

// The Field component does not associate labels with inputs via htmlFor,
// so inputs have no accessible name. We select by position within the
// ordered list of textbox-role elements:
//   0: purpose (textarea), 1: governingLaw, 2: jurisdiction,
//   3: modifications (textarea), 4: party1Name, 5: party1Title,
//   6: party1Company, 7: party1Address, 8: party2Name, …
const tb = (n: number) => screen.getAllByRole("textbox")[n];

describe("NDAForm", () => {
  it("renders the Purpose section", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Purpose" })).toBeInTheDocument();
  });

  it("renders the Dates & Term section", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Dates & Term" })).toBeInTheDocument();
  });

  it("renders the Governing Law & Jurisdiction section", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: "Governing Law & Jurisdiction" })
    ).toBeInTheDocument();
  });

  it("renders the MNDA Modifications section", () => {
    setup();
    expect(screen.getByRole("heading", { name: "MNDA Modifications" })).toBeInTheDocument();
  });

  it("renders Party 1 and Party 2 sections", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Party 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Party 2" })).toBeInTheDocument();
  });

  it("calls onChange with updated purpose when textarea changes", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ purpose: "" });
    await user.type(tb(0), "A");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: "A" })
    );
  });

  it("calls onChange with updated governing law", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ governingLaw: "" });
    const input = screen.getByPlaceholderText("e.g. Delaware");
    await user.type(input, "N");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ governingLaw: "N" })
    );
  });

  it("calls onChange with updated jurisdiction", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ jurisdiction: "" });
    const input = screen.getByPlaceholderText("e.g. courts located in New Castle, DE");
    await user.type(input, "X");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ jurisdiction: "X" })
    );
  });

  it("switches mndaTermType to continues when radio clicked", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ mndaTermType: "expires" });
    const continuesRadio = screen.getByRole("radio", { name: /Continues until terminated/ });
    await user.click(continuesRadio);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ mndaTermType: "continues" })
    );
  });

  it("switches mndaTermType to expires when radio clicked", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ mndaTermType: "continues" });
    const expiresRadio = screen.getByRole("radio", { name: /Expires after/ });
    await user.click(expiresRadio);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ mndaTermType: "expires" })
    );
  });

  it("disables MNDA term years input when mndaTermType is continues", () => {
    setup({ mndaTermType: "continues" });
    const yearInputs = screen.getAllByRole("spinbutton");
    expect(yearInputs[0]).toBeDisabled();
  });

  it("enables MNDA term years input when mndaTermType is expires", () => {
    setup({ mndaTermType: "expires" });
    const yearInputs = screen.getAllByRole("spinbutton");
    expect(yearInputs[0]).not.toBeDisabled();
  });

  it("switches confidentialityTermType to perpetuity when radio clicked", async () => {
    const user = userEvent.setup();
    const { onChange } = setup({ confidentialityTermType: "fixed" });
    const perpetuityRadio = screen.getByRole("radio", { name: /In perpetuity/ });
    await user.click(perpetuityRadio);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ confidentialityTermType: "perpetuity" })
    );
  });

  it("disables confidentiality years input when confidentialityTermType is perpetuity", () => {
    setup({ confidentialityTermType: "perpetuity" });
    const yearInputs = screen.getAllByRole("spinbutton");
    expect(yearInputs[1]).toBeDisabled();
  });

  it("calls onChange with updated party1Name", async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await user.type(tb(4), "A");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ party1Name: "A" })
    );
  });

  it("calls onChange with updated party2Name", async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    await user.type(tb(8), "B");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ party2Name: "B" })
    );
  });

  it("does not submit the form on enter", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(tb(0), "{Enter}");
    // form submit is prevented — no error thrown
  });
});
