"use client";

import { NDAData } from "../types";

interface Props {
  data: NDAData;
  onChange: (data: NDAData) => void;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const sectionClass = "mb-6 pb-6 border-b border-gray-200 last:border-0";

export default function NDAForm({ data, onChange }: Props) {
  const set = (field: keyof NDAData) => (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => onChange({ ...data, [field]: e.target.value });

  return (
    <form className="space-y-0" onSubmit={(e) => e.preventDefault()}>
      <div className={sectionClass}>
        <h2 className="text-base font-bold text-gray-800 mb-4">Purpose</h2>
        <Field label="Purpose" hint="How Confidential Information may be used">
          <textarea
            className={inputClass}
            rows={3}
            value={data.purpose}
            onChange={set("purpose")}
          />
        </Field>
      </div>

      <div className={sectionClass}>
        <h2 className="text-base font-bold text-gray-800 mb-4">Dates & Term</h2>
        <Field label="Effective Date">
          <input
            type="date"
            className={inputClass}
            value={data.effectiveDate}
            onChange={set("effectiveDate")}
          />
        </Field>

        <Field label="MNDA Term" hint="The length of this MNDA">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="mndaTermType"
                value="expires"
                checked={data.mndaTermType === "expires"}
                onChange={() => onChange({ ...data, mndaTermType: "expires" })}
              />
              Expires after
              <input
                type="number"
                min="1"
                max="10"
                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                value={data.mndaTermYears}
                onChange={set("mndaTermYears")}
                disabled={data.mndaTermType !== "expires"}
              />
              year(s) from Effective Date
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="mndaTermType"
                value="continues"
                checked={data.mndaTermType === "continues"}
                onChange={() =>
                  onChange({ ...data, mndaTermType: "continues" })
                }
              />
              Continues until terminated
            </label>
          </div>
        </Field>

        <Field
          label="Term of Confidentiality"
          hint="How long Confidential Information is protected"
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="confidentialityTermType"
                value="fixed"
                checked={data.confidentialityTermType === "fixed"}
                onChange={() =>
                  onChange({ ...data, confidentialityTermType: "fixed" })
                }
              />
              <input
                type="number"
                min="1"
                max="10"
                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                value={data.confidentialityTermYears}
                onChange={set("confidentialityTermYears")}
                disabled={data.confidentialityTermType !== "fixed"}
              />
              year(s) from Effective Date (trade secrets protected until no longer applicable)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="confidentialityTermType"
                value="perpetuity"
                checked={data.confidentialityTermType === "perpetuity"}
                onChange={() =>
                  onChange({ ...data, confidentialityTermType: "perpetuity" })
                }
              />
              In perpetuity
            </label>
          </div>
        </Field>
      </div>

      <div className={sectionClass}>
        <h2 className="text-base font-bold text-gray-800 mb-4">
          Governing Law & Jurisdiction
        </h2>
        <Field label="Governing Law" hint="State whose laws govern this MNDA">
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. Delaware"
            value={data.governingLaw}
            onChange={set("governingLaw")}
          />
        </Field>
        <Field
          label="Jurisdiction"
          hint="Courts where disputes will be resolved"
        >
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. courts located in New Castle, DE"
            value={data.jurisdiction}
            onChange={set("jurisdiction")}
          />
        </Field>
      </div>

      <div className={sectionClass}>
        <h2 className="text-base font-bold text-gray-800 mb-4">
          MNDA Modifications
        </h2>
        <Field label="Modifications" hint="Any modifications to the standard terms (optional)">
          <textarea
            className={inputClass}
            rows={3}
            placeholder="Leave blank if none"
            value={data.modifications}
            onChange={set("modifications")}
          />
        </Field>
      </div>

      <div className={sectionClass}>
        <h2 className="text-base font-bold text-gray-800 mb-4">Party 1</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <input
              type="text"
              className={inputClass}
              value={data.party1Name}
              onChange={set("party1Name")}
            />
          </Field>
          <Field label="Title">
            <input
              type="text"
              className={inputClass}
              value={data.party1Title}
              onChange={set("party1Title")}
            />
          </Field>
        </div>
        <Field label="Company">
          <input
            type="text"
            className={inputClass}
            value={data.party1Company}
            onChange={set("party1Company")}
          />
        </Field>
        <Field label="Notice Address" hint="Email or postal address">
          <input
            type="text"
            className={inputClass}
            value={data.party1Address}
            onChange={set("party1Address")}
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            className={inputClass}
            value={data.party1Date}
            onChange={set("party1Date")}
          />
        </Field>
      </div>

      <div className={sectionClass}>
        <h2 className="text-base font-bold text-gray-800 mb-4">Party 2</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <input
              type="text"
              className={inputClass}
              value={data.party2Name}
              onChange={set("party2Name")}
            />
          </Field>
          <Field label="Title">
            <input
              type="text"
              className={inputClass}
              value={data.party2Title}
              onChange={set("party2Title")}
            />
          </Field>
        </div>
        <Field label="Company">
          <input
            type="text"
            className={inputClass}
            value={data.party2Company}
            onChange={set("party2Company")}
          />
        </Field>
        <Field label="Notice Address" hint="Email or postal address">
          <input
            type="text"
            className={inputClass}
            value={data.party2Address}
            onChange={set("party2Address")}
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            className={inputClass}
            value={data.party2Date}
            onChange={set("party2Date")}
          />
        </Field>
      </div>
    </form>
  );
}
