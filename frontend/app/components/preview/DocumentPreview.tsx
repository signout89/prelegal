"use client";

import { DocSpec, Fields } from "../../types";
import { toNDAData } from "../../utils/docs";
import NDAPreview from "../NDAPreview";
import CSAPreview from "./CSAPreview";
import GenericPreview from "./GenericPreview";
import PilotPreview from "./PilotPreview";

export default function DocumentPreview({ spec, fields }: { spec: DocSpec | null; fields: Fields }) {
  if (!spec) {
    return (
      <div className="text-center text-muted py-24">
        <p className="text-lg font-semibold text-navy mb-2">Your document will appear here</p>
        <p className="text-sm">Tell the assistant what agreement you need to get started.</p>
      </div>
    );
  }
  if (spec.id === "mutual-nda") return <NDAPreview data={toNDAData(fields)} />;
  if (spec.id === "csa") return <CSAPreview spec={spec} fields={fields} />;
  if (spec.id === "pilot") return <PilotPreview spec={spec} fields={fields} />;
  return <GenericPreview spec={spec} fields={fields} />;
}
