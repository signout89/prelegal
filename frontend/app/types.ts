export interface NDAData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: "expires" | "continues";
  mndaTermYears: string;
  confidentialityTermType: "fixed" | "perpetuity";
  confidentialityTermYears: string;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1Name: string;
  party1Title: string;
  party1Company: string;
  party1Address: string;
  party1Date: string;
  party2Name: string;
  party2Title: string;
  party2Company: string;
  party2Address: string;
  party2Date: string;
}

export const DEFAULT_NDA_DATA: NDAData = {
  purpose:
    "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: new Date().toISOString().split("T")[0],
  mndaTermType: "expires",
  mndaTermYears: "1",
  confidentialityTermType: "fixed",
  confidentialityTermYears: "1",
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  party1Name: "",
  party1Title: "",
  party1Company: "",
  party1Address: "",
  party1Date: "",
  party2Name: "",
  party2Title: "",
  party2Company: "",
  party2Address: "",
  party2Date: "",
};

export interface FieldSpec {
  key: string;
  label: string;
  section: string;
  required: boolean;
  hint: string;
  options: string[] | null;
}

export interface DocSpec {
  id: string;
  name: string;
  description: string;
  templates: string[];
  party_a: string;
  party_b: string;
  fields: FieldSpec[];
}

export type Fields = Record<string, string>;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  document_type: string | null;
  fields: Fields;
  missing: string[];
  complete: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface DocumentSummary {
  id: number;
  title: string;
  document_type: string;
  updated_at: string;
}

export interface SavedDocument extends DocumentSummary {
  fields: Fields;
  messages: ChatMessage[];
}
