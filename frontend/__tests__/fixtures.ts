import { vi } from "vitest";
import { DocSpec } from "../app/types";

const party = (prefix: string, role: string) =>
  ["Company", "Name", "Title", "Address"].map((s) => ({
    key: `${prefix}${s}`,
    label: s,
    section: role,
    required: true,
    hint: "",
    options: null,
  }));

export const PILOT: DocSpec = {
  id: "pilot",
  name: "Pilot Agreement",
  description: "Trial",
  templates: ["Pilot-Agreement.md"],
  party_a: "Provider",
  party_b: "Customer",
  fields: [
    { key: "pilotPeriod", label: "Pilot Period", section: "Order Form", required: true, hint: "", options: null },
    { key: "fees", label: "Pilot Fees", section: "Order Form", required: false, hint: "", options: null },
    ...party("provider", "Provider"),
    ...party("customer", "Customer"),
  ],
};

export const BAA: DocSpec = {
  ...PILOT,
  id: "baa",
  name: "Business Associate Agreement",
  party_b: "Company",
  fields: [
    { key: "agreement", label: "Underlying Agreement", section: "Key Terms", required: true, hint: "", options: null },
    ...party("provider", "Provider"),
    ...party("company", "Company"),
  ],
};

type Handler = (init?: RequestInit) => unknown;

/** Install a fetch mock routing "METHOD /path" keys to JSON responses. */
export function mockFetch(routes: Record<string, Handler>) {
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${String(input)}`;
    const handler = routes[key];
    if (!handler) return new Response(JSON.stringify({ detail: "Not signed in" }), { status: 401 });
    return new Response(JSON.stringify(handler(init)), { status: 200 });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}
