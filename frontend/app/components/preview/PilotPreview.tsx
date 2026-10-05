"use client";

import { DocSpec, Fields } from "../../types";
import { DocTitle, SignatureTable, StandardTerms, TermSection, Value } from "./parts";

export default function PilotPreview({ spec, fields }: { spec: DocSpec; fields: Fields }) {
  const pick = (section: string) => spec.fields.filter((f) => f.section === section);

  return (
    <div className="font-serif text-gray-900">
      <DocTitle title="Pilot Agreement" subtitle="Order Form" />
      <p className="text-sm mb-5">
        <strong><Value value={fields.providerCompany} fallback="[Provider]" /></strong> will provide{" "}
        <strong><Value value={fields.customerCompany} fallback="[Customer]" /></strong> with access to its product for a pilot
        period of <strong><Value value={fields.pilotPeriod} fallback="[Pilot Period]" /></strong> starting{" "}
        <Value value={fields.effectiveDate} fallback="[Effective Date]" />, for the following evaluation purposes:{" "}
        <Value value={fields.evaluationPurposes} fallback="[Evaluation Purposes]" />.
      </p>
      <TermSection title="Pilot Terms" items={pick("Order Form")} fields={fields} />
      <TermSection title="Liability" items={pick("Liability")} fields={fields} />
      <TermSection title="Governing Law" items={pick("Legal")} fields={fields} />
      <SignatureTable spec={spec} fields={fields} />
      <StandardTerms docId={spec.id} />
    </div>
  );
}
