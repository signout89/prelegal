"use client";

import { useEffect, useState } from "react";
import { api } from "../../api";
import { DocSpec, FieldSpec, Fields } from "../../types";

export function Value({ value, fallback }: { value?: string; fallback: string }) {
  if (value?.trim()) return <span>{value}</span>;
  return <span className="text-gray-400 italic">{fallback}</span>;
}

export function TermRow({ field, fields }: { field: FieldSpec; fields: Fields }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-1.5 border-b border-gray-100 text-sm">
      <dt className="font-semibold text-navy">{field.label}</dt>
      <dd className="col-span-2">
        <Value value={fields[field.key]} fallback={field.required ? `[${field.label}]` : "None"} />
      </dd>
    </div>
  );
}

export function TermSection({ title, items, fields }: { title: string; items: FieldSpec[]; fields: Fields }) {
  return (
    <section className="mb-5">
      <h3 className="text-sm font-bold text-navy uppercase tracking-wide mb-2">{title}</h3>
      <dl>
        {items.map((f) => (
          <TermRow key={f.key} field={f} fields={fields} />
        ))}
      </dl>
    </section>
  );
}

function partyFields(spec: DocSpec, role: string): FieldSpec[] {
  return spec.fields.filter((f) => f.section === role);
}

export function SignatureTable({ spec, fields }: { spec: DocSpec; fields: Fields }) {
  const parties = [spec.party_a, spec.party_b];
  const rows = ["Company", "Name", "Title", "Address"];
  const labels: Record<string, string> = { Company: "Company", Name: "Print Name", Title: "Title", Address: "Notice Address" };
  const valueFor = (role: string, suffix: string) =>
    fields[partyFields(spec, role).find((f) => f.key.endsWith(suffix))?.key ?? ""] ?? "";

  return (
    <table className="w-full text-xs border-collapse my-6">
      <thead>
        <tr>
          <th className="border border-gray-400 p-2 bg-gray-50 w-1/4"></th>
          {parties.map((p) => (
            <th key={p} className="border border-gray-400 p-2 bg-gray-50 font-bold uppercase">
              {p}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Signature</td>
          {parties.map((p) => (
            <td key={p} className="border border-gray-400 p-2 h-10"></td>
          ))}
        </tr>
        {rows.map((suffix) => (
          <tr key={suffix}>
            <td className="border border-gray-400 p-2 font-semibold bg-gray-50">{labels[suffix]}</td>
            {parties.map((p) => (
              <td key={p} className="border border-gray-400 p-2">
                {valueFor(p, suffix)}
              </td>
            ))}
          </tr>
        ))}
        <tr>
          <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Date</td>
          {parties.map((p) => (
            <td key={p} className="border border-gray-400 p-2"></td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

export function StandardTerms({ docId }: { docId: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    api<{ html: string }>(`/api/templates/${docId}/terms`).then((r) => setHtml(r.html));
  }, [docId]);

  return (
    <>
      <hr className="border-gray-300 my-6" />
      <h2 className="text-base font-bold text-navy mb-3">Standard Terms</h2>
      <div className="terms text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
      <p className="text-xs text-muted text-center mt-6">Common Paper standard terms, free to use under CC BY 4.0.</p>
    </>
  );
}

export function DocTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="text-center mb-6">
      <h1 className="text-xl font-bold text-navy">{title}</h1>
      {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
    </header>
  );
}
