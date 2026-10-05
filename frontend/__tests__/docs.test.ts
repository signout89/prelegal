import { describe, expect, it } from "vitest";
import { documentTitle, groupBySection, missingRequired, toNDAData } from "../app/utils/docs";
import { BAA, PILOT } from "./fixtures";

describe("docs utils", () => {
  it("lists missing required fields only", () => {
    const missing = missingRequired(PILOT, { pilotPeriod: "30 days", providerCompany: "  " });
    expect(missing).not.toContain("pilotPeriod");
    expect(missing).not.toContain("fees");
    expect(missing).toContain("providerCompany");
  });

  it("titles a document with the counterparty company", () => {
    expect(documentTitle(PILOT, { customerCompany: "Acme" })).toBe("Pilot Agreement - Acme");
    expect(documentTitle(BAA, { companyCompany: "Clinic" })).toBe("Business Associate Agreement - Clinic");
    expect(documentTitle(PILOT, {})).toBe("Pilot Agreement");
  });

  it("groups fields by section in order", () => {
    expect(groupBySection(PILOT).map(([name]) => name)).toEqual(["Order Form", "Provider", "Customer"]);
  });

  it("maps fields to NDA data with blank defaults", () => {
    const data = toNDAData({ governingLaw: "Texas" });
    expect(data.governingLaw).toBe("Texas");
    expect(data.purpose).toBe("");
    expect(data.mndaTermType).toBe("expires");
  });
});
