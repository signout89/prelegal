import { describe, it, expect } from "vitest";
import { generateMarkdown } from "../app/utils/generateMarkdown";
import { DEFAULT_NDA_DATA, NDAData } from "../app/types";

const base: NDAData = {
  ...DEFAULT_NDA_DATA,
  effectiveDate: "2025-01-15",
  governingLaw: "Delaware",
  jurisdiction: "courts located in New Castle, DE",
  party1Name: "Alice Smith",
  party1Title: "CEO",
  party1Company: "Acme Corp",
  party1Address: "alice@acme.com",
  party1Date: "2025-01-15",
  party2Name: "Bob Jones",
  party2Title: "CTO",
  party2Company: "Beta LLC",
  party2Address: "bob@beta.com",
  party2Date: "2025-01-15",
};

describe("generateMarkdown", () => {
  it("includes the document title", () => {
    const md = generateMarkdown(base);
    expect(md).toContain("# Mutual Non-Disclosure Agreement");
  });

  it("renders custom purpose", () => {
    const md = generateMarkdown({ ...base, purpose: "Exploring a merger." });
    expect(md).toContain("Exploring a merger.");
  });

  it("uses placeholder when purpose is empty", () => {
    const md = generateMarkdown({ ...base, purpose: "" });
    expect(md).toContain("[Purpose]");
  });

  it("formats the effective date", () => {
    const md = generateMarkdown(base);
    expect(md).toContain("January 15, 2025");
  });

  it("uses [Date] placeholder when effectiveDate is empty", () => {
    const md = generateMarkdown({ ...base, effectiveDate: "" });
    expect(md).toContain("[Date]");
  });

  it("marks expires option when mndaTermType is expires", () => {
    const md = generateMarkdown({ ...base, mndaTermType: "expires", mndaTermYears: "2" });
    expect(md).toContain("[x] Expires 2 year(s) from Effective Date.");
    expect(md).toContain("[ ] Continues until terminated");
  });

  it("marks continues option when mndaTermType is continues", () => {
    const md = generateMarkdown({ ...base, mndaTermType: "continues" });
    expect(md).toContain("[ ] Expires");
    expect(md).toContain("[x] Continues until terminated");
  });

  it("defaults mndaTermYears to 1 when blank", () => {
    const md = generateMarkdown({ ...base, mndaTermType: "expires", mndaTermYears: "" });
    expect(md).toContain("Expires 1 year(s) from Effective Date.");
  });

  it("marks fixed confidentiality term with years", () => {
    const md = generateMarkdown({
      ...base,
      confidentialityTermType: "fixed",
      confidentialityTermYears: "3",
    });
    expect(md).toContain("[x] 3 year(s) from Effective Date");
    expect(md).toContain("[ ] In perpetuity.");
  });

  it("marks perpetuity confidentiality term", () => {
    const md = generateMarkdown({ ...base, confidentialityTermType: "perpetuity" });
    expect(md).toContain("[x] In perpetuity.");
    expect(md).toContain("[ ]");
  });

  it("defaults confidentialityTermYears to 1 when blank", () => {
    const md = generateMarkdown({
      ...base,
      confidentialityTermType: "fixed",
      confidentialityTermYears: "",
    });
    expect(md).toContain("1 year(s) from Effective Date");
  });

  it("substitutes governing law into standard terms", () => {
    const md = generateMarkdown(base);
    expect(md).toContain("laws of the State of Delaware");
  });

  it("substitutes jurisdiction into standard terms", () => {
    const md = generateMarkdown(base);
    expect(md).toContain("courts located in New Castle, DE");
  });

  it("uses placeholders when governing law is empty", () => {
    const md = generateMarkdown({ ...base, governingLaw: "", jurisdiction: "" });
    expect(md).toContain("[Governing Law]");
    expect(md).toContain("[Jurisdiction]");
  });

  it("includes modifications when provided", () => {
    const md = generateMarkdown({ ...base, modifications: "Section 2 is waived." });
    expect(md).toContain("Section 2 is waived.");
  });

  it("shows None when modifications is empty", () => {
    const md = generateMarkdown({ ...base, modifications: "" });
    expect(md).toContain("None.");
  });

  it("includes party names in signature table", () => {
    const md = generateMarkdown(base);
    expect(md).toContain("Alice Smith");
    expect(md).toContain("Bob Jones");
  });

  it("includes party titles and companies", () => {
    const md = generateMarkdown(base);
    expect(md).toContain("CEO");
    expect(md).toContain("Acme Corp");
    expect(md).toContain("CTO");
    expect(md).toContain("Beta LLC");
  });

  it("formats party dates", () => {
    const md = generateMarkdown(base);
    const count = (md.match(/January 15, 2025/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(3); // effectiveDate + party1Date + party2Date
  });

  it("leaves party date blank when not set", () => {
    const md = generateMarkdown({ ...base, party1Date: "", party2Date: "" });
    const rows = md.split("\n").filter((l) => l.startsWith("| Date"));
    expect(rows[0]).toContain("|  |  |");
  });
});
