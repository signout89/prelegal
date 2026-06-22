"use client";

import { NDAData } from "../types";

interface Props {
  data: NDAData;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "[Date]";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className="inline-block w-4 h-4 border border-gray-600 mr-1 text-center text-xs leading-4">
      {checked ? "✓" : ""}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-gray-800 mt-5 mb-1">{children}</h3>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 italic mb-1">{children}</p>;
}

function Placeholder({ value, fallback }: { value: string; fallback: string }) {
  if (value.trim()) return <span>{value}</span>;
  return <span className="text-gray-400 italic">{fallback}</span>;
}

export default function NDAPreview({ data }: Props) {
  const isExpiresSelected = data.mndaTermType === "expires";
  const isFixedConfidentiality = data.confidentialityTermType === "fixed";

  return (
    <div className="font-serif text-sm text-gray-900 leading-relaxed">
      <h1 className="text-xl font-bold text-center mb-2">
        Mutual Non-Disclosure Agreement
      </h1>

      <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-5 text-xs text-gray-600">
        This Mutual Non-Disclosure Agreement (the &quot;MNDA&quot;) consists of: (1) this
        Cover Page (&quot;<strong>Cover Page</strong>&quot;) and (2) the Common Paper Mutual
        NDA Standard Terms Version 1.0 (&quot;<strong>Standard Terms</strong>&quot;). Any
        modifications of the Standard Terms should be made on the Cover Page,
        which will control over conflicts with the Standard Terms.
      </div>

      {/* Cover Page */}
      <SectionHeading>Purpose</SectionHeading>
      <Hint>How Confidential Information may be used</Hint>
      <p className="text-sm">
        <Placeholder
          value={data.purpose}
          fallback="Evaluating whether to enter into a business relationship with the other party."
        />
      </p>

      <SectionHeading>Effective Date</SectionHeading>
      <p>{formatDate(data.effectiveDate)}</p>

      <SectionHeading>MNDA Term</SectionHeading>
      <Hint>The length of this MNDA</Hint>
      <div className="space-y-1 text-sm">
        <div className="flex items-start gap-1">
          <Checkbox checked={isExpiresSelected} />
          <span className={isExpiresSelected ? "" : "text-gray-400"}>
            Expires{" "}
            <strong>
              {isExpiresSelected ? data.mndaTermYears || "1" : "[N]"}
            </strong>{" "}
            year(s) from Effective Date.
          </span>
        </div>
        <div className="flex items-start gap-1">
          <Checkbox checked={!isExpiresSelected} />
          <span className={!isExpiresSelected ? "" : "text-gray-400"}>
            Continues until terminated in accordance with the terms of the MNDA.
          </span>
        </div>
      </div>

      <SectionHeading>Term of Confidentiality</SectionHeading>
      <Hint>How long Confidential Information is protected</Hint>
      <div className="space-y-1 text-sm">
        <div className="flex items-start gap-1">
          <Checkbox checked={isFixedConfidentiality} />
          <span className={isFixedConfidentiality ? "" : "text-gray-400"}>
            <strong>
              {isFixedConfidentiality
                ? data.confidentialityTermYears || "1"
                : "[N]"}
            </strong>{" "}
            year(s) from Effective Date, but in the case of trade secrets until
            Confidential Information is no longer considered a trade secret
            under applicable laws.
          </span>
        </div>
        <div className="flex items-start gap-1">
          <Checkbox checked={!isFixedConfidentiality} />
          <span className={!isFixedConfidentiality ? "" : "text-gray-400"}>
            In perpetuity.
          </span>
        </div>
      </div>

      <SectionHeading>Governing Law &amp; Jurisdiction</SectionHeading>
      <p className="text-sm">
        Governing Law:{" "}
        <Placeholder value={data.governingLaw} fallback="[Fill in state]" />
      </p>
      <p className="text-sm">
        Jurisdiction:{" "}
        <Placeholder
          value={data.jurisdiction}
          fallback="[Fill in city or county and state]"
        />
      </p>

      <SectionHeading>MNDA Modifications</SectionHeading>
      <p className="text-sm">
        <Placeholder value={data.modifications} fallback="None." />
      </p>

      <p className="text-xs text-gray-600 mt-4 mb-3">
        By signing this Cover Page, each party agrees to enter into this MNDA
        as of the Effective Date.
      </p>

      {/* Signature Table */}
      <table className="w-full text-xs border-collapse mb-6">
        <thead>
          <tr>
            <th className="border border-gray-400 p-2 text-left w-1/4 bg-gray-50"></th>
            <th className="border border-gray-400 p-2 text-center w-3/8 bg-gray-50 font-bold">
              PARTY 1
            </th>
            <th className="border border-gray-400 p-2 text-center w-3/8 bg-gray-50 font-bold">
              PARTY 2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
              Signature
            </td>
            <td className="border border-gray-400 p-2 h-10"></td>
            <td className="border border-gray-400 p-2 h-10"></td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
              Print Name
            </td>
            <td className="border border-gray-400 p-2">{data.party1Name}</td>
            <td className="border border-gray-400 p-2">{data.party2Name}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
              Title
            </td>
            <td className="border border-gray-400 p-2">{data.party1Title}</td>
            <td className="border border-gray-400 p-2">{data.party2Title}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
              Company
            </td>
            <td className="border border-gray-400 p-2">
              {data.party1Company}
            </td>
            <td className="border border-gray-400 p-2">
              {data.party2Company}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
              <span>Notice Address</span>
              <br />
              <span className="font-normal text-gray-500 text-xs">
                Email or postal
              </span>
            </td>
            <td className="border border-gray-400 p-2">
              {data.party1Address}
            </td>
            <td className="border border-gray-400 p-2">
              {data.party2Address}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
              Date
            </td>
            <td className="border border-gray-400 p-2">
              {data.party1Date ? formatDate(data.party1Date) : ""}
            </td>
            <td className="border border-gray-400 p-2">
              {data.party2Date ? formatDate(data.party2Date) : ""}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="text-xs text-gray-500 text-center mb-6">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use
        under CC BY 4.0.
      </p>

      <hr className="border-gray-300 mb-6" />

      {/* Standard Terms */}
      <h2 className="text-base font-bold mb-4">Standard Terms</h2>
      <div className="space-y-3 text-xs leading-relaxed">
        <p>
          <strong>1. Introduction.</strong> This Mutual Non-Disclosure Agreement
          (which incorporates these Standard Terms and the Cover Page (defined
          below)) (&quot;<strong>MNDA</strong>&quot;) allows each party (&quot;
          <strong>Disclosing Party</strong>&quot;) to disclose or make available
          information in connection with the Purpose which (1) the Disclosing
          Party identifies to the receiving party (&quot;
          <strong>Receiving Party</strong>&quot;) as &quot;confidential&quot;, &quot;proprietary&quot;, or
          the like or (2) should be reasonably understood as confidential or
          proprietary due to its nature and the circumstances of its disclosure
          (&quot;<strong>Confidential Information</strong>&quot;). Each party&apos;s
          Confidential Information also includes the existence and status of the
          parties&apos; discussions and information on the Cover Page.
          Confidential Information includes technical or business information,
          product designs or roadmaps, requirements, pricing, security and
          compliance documentation, technology, inventions and know-how. To use
          this MNDA, the parties must complete and sign a cover page
          incorporating these Standard Terms (&quot;<strong>Cover Page</strong>&quot;).
          Each party is identified on the Cover Page and capitalized terms have
          the meanings given herein or on the Cover Page.
        </p>
        <p>
          <strong>2. Use and Protection of Confidential Information.</strong>{" "}
          The Receiving Party shall: (a) use Confidential Information solely for
          the Purpose; (b) not disclose Confidential Information to third
          parties without the Disclosing Party&apos;s prior written approval, except
          that the Receiving Party may disclose Confidential Information to its
          employees, agents, advisors, contractors and other representatives
          having a reasonable need to know for the Purpose, provided these
          representatives are bound by confidentiality obligations no less
          protective of the Disclosing Party than the applicable terms in this
          MNDA and the Receiving Party remains responsible for their compliance
          with this MNDA; and (c) protect Confidential Information using at
          least the same protections the Receiving Party uses for its own
          similar information but no less than a reasonable standard of care.
        </p>
        <p>
          <strong>3. Exceptions.</strong> The Receiving Party&apos;s obligations in
          this MNDA do not apply to information that it can demonstrate: (a) is
          or becomes publicly available through no fault of the Receiving Party;
          (b) it rightfully knew or possessed prior to receipt from the
          Disclosing Party without confidentiality restrictions; (c) it
          rightfully obtained from a third party without confidentiality
          restrictions; or (d) it independently developed without using or
          referencing the Confidential Information.
        </p>
        <p>
          <strong>4. Disclosures Required by Law.</strong> The Receiving Party
          may disclose Confidential Information to the extent required by law,
          regulation or regulatory authority, subpoena or court order, provided
          (to the extent legally permitted) it provides the Disclosing Party
          reasonable advance notice of the required disclosure and reasonably
          cooperates, at the Disclosing Party&apos;s expense, with the Disclosing
          Party&apos;s efforts to obtain confidential treatment for the Confidential
          Information.
        </p>
        <p>
          <strong>5. Term and Termination.</strong> This MNDA commences on the
          Effective Date and expires at the end of the MNDA Term. Either party
          may terminate this MNDA for any or no reason upon written notice to
          the other party. The Receiving Party&apos;s obligations relating to
          Confidential Information will survive for the Term of Confidentiality,
          despite any expiration or termination of this MNDA.
        </p>
        <p>
          <strong>6. Return or Destruction of Confidential Information.</strong>{" "}
          Upon expiration or termination of this MNDA or upon the Disclosing
          Party&apos;s earlier request, the Receiving Party will: (a) cease using
          Confidential Information; (b) promptly after the Disclosing Party&apos;s
          written request, destroy all Confidential Information in the Receiving
          Party&apos;s possession or control or return it to the Disclosing Party;
          and (c) if requested by the Disclosing Party, confirm its compliance
          with these obligations in writing.
        </p>
        <p>
          <strong>7. Proprietary Rights.</strong> The Disclosing Party retains
          all of its intellectual property and other rights in its Confidential
          Information and its disclosure to the Receiving Party grants no
          license under such rights.
        </p>
        <p>
          <strong>8. Disclaimer.</strong> ALL CONFIDENTIAL INFORMATION IS
          PROVIDED &quot;AS IS&quot;, WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING
          THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A
          PARTICULAR PURPOSE.
        </p>
        <p>
          <strong>9. Governing Law and Jurisdiction.</strong> This MNDA and all
          matters relating hereto are governed by, and construed in accordance
          with, the laws of the State of{" "}
          <strong>
            <Placeholder
              value={data.governingLaw}
              fallback="[Governing Law]"
            />
          </strong>
          , without regard to the conflict of laws provisions of such{" "}
          <Placeholder value={data.governingLaw} fallback="[Governing Law]" />.
          Any legal suit, action, or proceeding relating to this MNDA must be
          instituted in the federal or state courts located in{" "}
          <strong>
            <Placeholder value={data.jurisdiction} fallback="[Jurisdiction]" />
          </strong>
          . Each party irrevocably submits to the exclusive jurisdiction of such{" "}
          <Placeholder value={data.jurisdiction} fallback="[Jurisdiction]" /> in
          any such suit, action, or proceeding.
        </p>
        <p>
          <strong>10. Equitable Relief.</strong> A breach of this MNDA may
          cause irreparable harm for which monetary damages are an insufficient
          remedy. Upon a breach of this MNDA, the Disclosing Party is entitled
          to seek appropriate equitable relief, including an injunction, in
          addition to its other remedies.
        </p>
        <p>
          <strong>11. General.</strong> Neither party has an obligation under
          this MNDA to disclose Confidential Information to the other or proceed
          with any proposed transaction. Neither party may assign this MNDA
          without the prior written consent of the other party, except that
          either party may assign this MNDA in connection with a merger,
          reorganization, acquisition or other transfer of all or substantially
          all its assets or voting securities. This MNDA may only be amended,
          modified, waived, or supplemented by an agreement in writing signed by
          both parties.
        </p>
      </div>
      <p className="text-xs text-gray-500 text-center mt-4">
        Common Paper Mutual Non-Disclosure Agreement Version 1.0 free to use
        under CC BY 4.0.
      </p>
    </div>
  );
}
