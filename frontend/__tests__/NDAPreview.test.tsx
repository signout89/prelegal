import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NDAPreview from "../app/components/NDAPreview";
import { DEFAULT_NDA_DATA, NDAData } from "../app/types";

const base: NDAData = {
  ...DEFAULT_NDA_DATA,
  effectiveDate: "2025-03-20",
  mndaTermType: "expires",
  mndaTermYears: "2",
  confidentialityTermType: "fixed",
  confidentialityTermYears: "3",
  governingLaw: "California",
  jurisdiction: "San Francisco County, CA",
  modifications: "",
  party1Name: "Jane Doe",
  party1Title: "President",
  party1Company: "Foo Inc",
  party1Address: "jane@foo.com",
  // Use different party dates so they don't collide with effectiveDate in assertions
  party1Date: "2025-04-01",
  party2Name: "John Roe",
  party2Title: "VP",
  party2Company: "Bar LLC",
  party2Address: "john@bar.com",
  party2Date: "2025-05-15",
};

describe("NDAPreview", () => {
  it("renders the document title", () => {
    render(<NDAPreview data={base} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Mutual Non-Disclosure Agreement"
    );
  });

  it("renders the custom purpose", () => {
    render(<NDAPreview data={{ ...base, purpose: "Partnership evaluation." }} />);
    expect(screen.getByText("Partnership evaluation.")).toBeInTheDocument();
  });

  it("shows fallback when purpose is empty", () => {
    render(<NDAPreview data={{ ...base, purpose: "" }} />);
    expect(
      screen.getByText("Evaluating whether to enter into a business relationship with the other party.")
    ).toBeInTheDocument();
  });

  it("formats the effective date", () => {
    render(<NDAPreview data={base} />);
    // The <p> directly wrapping formatDate is the only element with this exact text
    expect(screen.getByText("March 20, 2025")).toBeInTheDocument();
  });

  it("checks the expires checkbox and shows years when mndaTermType is expires", () => {
    render(<NDAPreview data={base} />);
    // The year is rendered inside <strong> — RTL getByText only reads direct text nodes,
    // so we match the <strong> element directly with its exact text value.
    expect(screen.getByText("2", { selector: "strong" })).toBeInTheDocument();
    // The [N] placeholder is not shown when expires is selected
    expect(screen.queryByText("[N]", { selector: "strong" })).not.toBeInTheDocument();
  });

  it("checks the continues checkbox when mndaTermType is continues", () => {
    render(<NDAPreview data={{ ...base, mndaTermType: "continues" }} />);
    expect(
      screen.getByText("Continues until terminated in accordance with the terms of the MNDA.")
    ).toBeInTheDocument();
  });

  it("checks the fixed confidentiality checkbox with years", () => {
    render(<NDAPreview data={base} />);
    // Same issue: year count is in <strong>, so match it directly.
    // base uses confidentialityTermYears: "3", mndaTermYears: "2" — no collision.
    expect(screen.getByText("3", { selector: "strong" })).toBeInTheDocument();
  });

  it("checks perpetuity when confidentialityTermType is perpetuity", () => {
    render(<NDAPreview data={{ ...base, confidentialityTermType: "perpetuity" }} />);
    const matches = screen.getAllByText("In perpetuity.");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows governing law in cover page", () => {
    render(<NDAPreview data={base} />);
    const matches = screen.getAllByText("California");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows jurisdiction in cover page", () => {
    render(<NDAPreview data={base} />);
    const matches = screen.getAllByText("San Francisco County, CA");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows placeholder when governing law is empty", () => {
    render(<NDAPreview data={{ ...base, governingLaw: "" }} />);
    expect(screen.getAllByText("[Fill in state]").length).toBeGreaterThan(0);
  });

  it("shows placeholder when jurisdiction is empty", () => {
    render(<NDAPreview data={{ ...base, jurisdiction: "" }} />);
    expect(screen.getAllByText("[Fill in city or county and state]").length).toBeGreaterThan(0);
  });

  it("shows None. when modifications is empty", () => {
    render(<NDAPreview data={base} />);
    expect(screen.getByText("None.")).toBeInTheDocument();
  });

  it("shows modifications text when provided", () => {
    render(<NDAPreview data={{ ...base, modifications: "Section 2 is waived." }} />);
    expect(screen.getByText("Section 2 is waived.")).toBeInTheDocument();
  });

  it("renders party names in signature table", () => {
    render(<NDAPreview data={base} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("John Roe")).toBeInTheDocument();
  });

  it("renders party titles in signature table", () => {
    render(<NDAPreview data={base} />);
    expect(screen.getByText("President")).toBeInTheDocument();
    expect(screen.getByText("VP")).toBeInTheDocument();
  });

  it("renders party companies in signature table", () => {
    render(<NDAPreview data={base} />);
    expect(screen.getByText("Foo Inc")).toBeInTheDocument();
    expect(screen.getByText("Bar LLC")).toBeInTheDocument();
  });

  it("renders party addresses in signature table", () => {
    render(<NDAPreview data={base} />);
    expect(screen.getByText("jane@foo.com")).toBeInTheDocument();
    expect(screen.getByText("john@bar.com")).toBeInTheDocument();
  });

  it("includes the Standard Terms section", () => {
    render(<NDAPreview data={base} />);
    expect(screen.getByRole("heading", { level: 2, name: "Standard Terms" })).toBeInTheDocument();
  });

  it("embeds governing law in standard terms section 9", () => {
    render(<NDAPreview data={base} />);
    const section9 = screen.getByText(/9\. Governing Law and Jurisdiction\./);
    expect(section9.closest("p")).toHaveTextContent("California");
  });
});
