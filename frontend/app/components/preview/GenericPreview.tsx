"use client";

import { DocSpec, Fields } from "../../types";
import { groupBySection } from "../../utils/docs";
import { DocTitle, SignatureTable, StandardTerms, TermSection } from "./parts";

export default function GenericPreview({ spec, fields }: { spec: DocSpec; fields: Fields }) {
  const parties = new Set([spec.party_a, spec.party_b]);
  const sections = groupBySection(spec).filter(([name]) => !parties.has(name));

  return (
    <div className="font-serif text-gray-900">
      <DocTitle title={spec.name} subtitle="Cover Page" />
      {sections.map(([name, items]) => (
        <TermSection key={name} title={name} items={items} fields={fields} />
      ))}
      <p className="text-xs text-gray-600">
        By signing this Cover Page, each party agrees to enter into this agreement, which incorporates the Standard Terms below.
      </p>
      <SignatureTable spec={spec} fields={fields} />
      <StandardTerms docId={spec.id} />
    </div>
  );
}
