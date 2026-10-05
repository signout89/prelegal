import { DEFAULT_NDA_DATA, DocSpec, Fields, NDAData } from "../types";

/** Keys of required fields that are still empty. */
export function missingRequired(spec: DocSpec, fields: Fields): string[] {
  return spec.fields.filter((f) => f.required && !fields[f.key]?.trim()).map((f) => f.key);
}

/** Map chat-extracted fields onto the Mutual NDA preview data. */
export function toNDAData(fields: Fields): NDAData {
  return { ...DEFAULT_NDA_DATA, purpose: "", effectiveDate: "", ...fields } as NDAData;
}

/** A readable title for saving, e.g. "Pilot Agreement - Acme Corp". */
export function documentTitle(spec: DocSpec, fields: Fields): string {
  const counterparty = spec.fields.find((f) => f.section === spec.party_b && f.key.endsWith("Company"));
  const name = counterparty ? fields[counterparty.key]?.trim() : "";
  return name ? `${spec.name} - ${name}` : spec.name;
}

/** Fields grouped by section, in spec order. */
export function groupBySection(spec: DocSpec): [string, DocSpec["fields"]][] {
  const groups = new Map<string, DocSpec["fields"]>();
  for (const field of spec.fields) {
    groups.set(field.section, [...(groups.get(field.section) ?? []), field]);
  }
  return [...groups.entries()];
}
