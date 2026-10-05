"use client";

import { DocSpec, Fields } from "../../types";
import { DocTitle, SignatureTable, StandardTerms, TermSection, Value } from "./parts";

export default function CSAPreview({ spec, fields }: { spec: DocSpec; fields: Fields }) {
  const pick = (section: string) => spec.fields.filter((f) => f.section === section);

  return (
    <div className="font-serif text-gray-900">
      <DocTitle title="Cloud Service Agreement" subtitle="Order Form" />
      <p className="text-sm mb-5">
        This Order Form is entered into between <strong><Value value={fields.providerCompany} fallback="[Provider]" /></strong>{" "}
        (&quot;Provider&quot;) and <strong><Value value={fields.customerCompany} fallback="[Customer]" /></strong>{" "}
        (&quot;Customer&quot;) as of <Value value={fields.effectiveDate} fallback="[Effective Date]" />, and is governed by
        the Common Paper Cloud Service Agreement Standard Terms.
      </p>
      <TermSection title="Subscription" items={pick("Order Form")} fields={fields} />
      <TermSection title="Liability" items={pick("Liability")} fields={fields} />
      <TermSection title="Governing Law" items={pick("Legal")} fields={fields} />
      <SignatureTable spec={spec} fields={fields} />
      <StandardTerms docId={spec.id} />
    </div>
  );
}
