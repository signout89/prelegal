"""Field specifications for each supported document type."""

from functools import cache

import markdown
from pydantic import BaseModel

from . import config


class Field(BaseModel):
    key: str
    label: str
    section: str
    required: bool = True
    hint: str = ""
    options: list[str] | None = None


class DocSpec(BaseModel):
    id: str
    name: str
    description: str
    templates: list[str]
    party_a: str
    party_b: str
    fields: list[Field]


def party(prefix: str, role: str) -> list[Field]:
    """Company, signer and notice details for one party."""
    section = role
    return [
        Field(key=f"{prefix}Company", label=f"{role} Company", section=section),
        Field(key=f"{prefix}Name", label="Signer Name", section=section),
        Field(key=f"{prefix}Title", label="Signer Title", section=section),
        Field(key=f"{prefix}Address", label="Notice Address", section=section, hint="Email or postal address"),
    ]


def law(effective: bool = True) -> list[Field]:
    """Effective date, governing law and chosen courts."""
    fields = [
        Field(key="governingLaw", label="Governing Law", section="Legal", hint="US state, e.g. Delaware"),
        Field(key="chosenCourts", label="Chosen Courts", section="Legal", hint="e.g. courts in New Castle County, Delaware"),
    ]
    if effective:
        fields.insert(0, Field(key="effectiveDate", label="Effective Date", section="Key Terms", hint="YYYY-MM-DD"))
    return fields


def cap() -> list[Field]:
    return [
        Field(key="generalCapAmount", label="General Cap Amount", section="Liability", hint="e.g. fees paid in the prior 12 months"),
        Field(key="increasedCapAmount", label="Increased Cap Amount", section="Liability", required=False),
    ]


def standard_provider_customer() -> list[Field]:
    return party("provider", "Provider") + party("customer", "Customer")


SPECS: list[DocSpec] = [
    DocSpec(
        id="mutual-nda",
        name="Mutual NDA",
        description="Mutual Non-Disclosure Agreement for sharing confidential information both ways.",
        templates=["Mutual-NDA.md"],
        party_a="Party 1",
        party_b="Party 2",
        fields=[
            Field(key="purpose", label="Purpose", section="Key Terms", hint="How Confidential Information may be used"),
            Field(key="effectiveDate", label="Effective Date", section="Key Terms", hint="YYYY-MM-DD"),
            Field(key="mndaTermType", label="MNDA Term", section="Key Terms", options=["expires", "continues"]),
            Field(key="mndaTermYears", label="MNDA Term (years)", section="Key Terms", required=False, hint="Only when the MNDA expires"),
            Field(key="confidentialityTermType", label="Term of Confidentiality", section="Key Terms", options=["fixed", "perpetuity"]),
            Field(key="confidentialityTermYears", label="Confidentiality (years)", section="Key Terms", required=False, hint="Only when fixed"),
            Field(key="governingLaw", label="Governing Law", section="Legal", hint="US state, e.g. Delaware"),
            Field(key="jurisdiction", label="Jurisdiction", section="Legal", hint="City or county and state"),
            Field(key="modifications", label="MNDA Modifications", section="Legal", required=False),
            *party("party1", "Party 1"),
            *party("party2", "Party 2"),
        ],
    ),
    DocSpec(
        id="csa",
        name="Cloud Service Agreement",
        description="Agreement for selling and buying cloud software and SaaS products.",
        templates=["CSA.md"],
        party_a="Provider",
        party_b="Customer",
        fields=[
            *law(),
            Field(key="subscriptionPeriod", label="Subscription Period", section="Order Form", hint="e.g. 12 months"),
            Field(key="fees", label="Fees", section="Order Form", hint="e.g. $2,000 per month"),
            Field(key="paymentProcess", label="Payment Process", section="Order Form", hint="e.g. invoiced monthly, net 30"),
            Field(key="technicalSupport", label="Technical Support", section="Order Form"),
            Field(key="nonRenewalNoticeDate", label="Non-Renewal Notice Period", section="Order Form", required=False),
            Field(key="useLimitations", label="Use Limitations", section="Order Form", required=False),
            Field(key="additionalWarranties", label="Additional Warranties", section="Order Form", required=False),
            *cap(),
            *standard_provider_customer(),
        ],
    ),
    DocSpec(
        id="design-partner",
        name="Design Partner Agreement",
        description="Early-stage product partnership exchanging access for feedback.",
        templates=["design-partner-agreement.md"],
        party_a="Provider",
        party_b="Partner",
        fields=[
            *law(),
            Field(key="term", label="Term", section="Key Terms", hint="e.g. 6 months"),
            Field(key="program", label="Program", section="Key Terms", hint="What the design partner program covers"),
            Field(key="fees", label="Fees", section="Key Terms", hint="e.g. no fees"),
            *party("provider", "Provider"),
            *party("partner", "Partner"),
        ],
    ),
    DocSpec(
        id="sla",
        name="Service Level Agreement",
        description="Uptime commitments and remedies, used alongside the CSA.",
        templates=["sla.md"],
        party_a="Provider",
        party_b="Customer",
        fields=[
            Field(key="targetUptime", label="Target Uptime", section="Service Levels", hint="e.g. 99.9%"),
            Field(key="uptimeCredit", label="Uptime Credit", section="Service Levels", hint="e.g. 10% of monthly fees"),
            Field(key="targetResponseTime", label="Target Response Time", section="Service Levels", hint="e.g. 4 business hours"),
            Field(key="responseTimeCredit", label="Response Time Credit", section="Service Levels"),
            Field(key="supportChannel", label="Support Channel", section="Service Levels", hint="e.g. support@provider.com"),
            Field(key="scheduledDowntime", label="Scheduled Downtime", section="Service Levels", required=False),
            *standard_provider_customer(),
        ],
    ),
    DocSpec(
        id="psa",
        name="Professional Services Agreement",
        description="Professional services engagements with statements of work and deliverables.",
        templates=["psa.md"],
        party_a="Provider",
        party_b="Customer",
        fields=[
            *law(),
            Field(key="deliverables", label="Deliverables", section="Statement of Work"),
            Field(key="sowTerm", label="SOW Term", section="Statement of Work", hint="e.g. 3 months"),
            Field(key="fees", label="Fees", section="Statement of Work"),
            Field(key="paymentPeriod", label="Payment Period", section="Statement of Work", hint="e.g. 30 days from invoice"),
            Field(key="rejectionPeriod", label="Rejection Period", section="Statement of Work", hint="e.g. 10 business days"),
            Field(key="resubmissionPeriod", label="Resubmission Period", section="Statement of Work", hint="e.g. 10 business days"),
            Field(key="timeOfAssignment", label="Time of Assignment", section="Statement of Work", hint="When IP in deliverables transfers"),
            Field(key="customerObligations", label="Customer Obligations", section="Statement of Work", required=False),
            Field(key="insuranceMinimums", label="Insurance Minimums", section="Statement of Work", required=False),
            *cap(),
            *standard_provider_customer(),
        ],
    ),
    DocSpec(
        id="dpa",
        name="Data Processing Agreement",
        description="How a vendor processes personal data on behalf of a customer (GDPR/CCPA).",
        templates=["DPA.md"],
        party_a="Provider",
        party_b="Customer",
        fields=[
            Field(key="agreement", label="Underlying Agreement", section="Key Terms", hint="e.g. Cloud Service Agreement dated 2026-01-01"),
            Field(key="natureAndPurpose", label="Nature and Purpose of Processing", section="Processing"),
            Field(key="dataSubjects", label="Categories of Data Subjects", section="Processing"),
            Field(key="personalData", label="Categories of Personal Data", section="Processing"),
            Field(key="specialCategoryData", label="Special Category Data", section="Processing", required=False),
            Field(key="durationOfProcessing", label="Duration of Processing", section="Processing"),
            Field(key="frequencyOfTransfer", label="Frequency of Transfer", section="Processing", hint="e.g. continuous"),
            Field(key="approvedSubprocessors", label="Approved Subprocessors", section="Processing"),
            Field(key="securityContact", label="Provider Security Contact", section="Processing"),
            Field(key="governingMemberState", label="Governing Member State", section="Legal", hint="e.g. Ireland"),
            *standard_provider_customer(),
        ],
    ),
    DocSpec(
        id="software-license",
        name="Software License Agreement",
        description="Licensing on-premise or downloadable software.",
        templates=["Software-License-Agreement.md"],
        party_a="Provider",
        party_b="Customer",
        fields=[
            *law(),
            Field(key="subscriptionPeriod", label="Subscription Period", section="Order Form"),
            Field(key="permittedUses", label="Permitted Uses", section="Order Form"),
            Field(key="licenseLimits", label="License Limits", section="Order Form", hint="e.g. 50 seats"),
            Field(key="fees", label="Fees", section="Order Form"),
            Field(key="paymentProcess", label="Payment Process", section="Order Form"),
            Field(key="warrantyPeriod", label="Warranty Period", section="Order Form", hint="e.g. 90 days"),
            Field(key="nonRenewalNoticeDate", label="Non-Renewal Notice Period", section="Order Form", required=False),
            *cap(),
            *standard_provider_customer(),
        ],
    ),
    DocSpec(
        id="partnership",
        name="Partnership Agreement",
        description="Business partnership covering roles, revenue sharing, IP and termination.",
        templates=["Partnership-Agreement.md"],
        party_a="Company",
        party_b="Partner",
        fields=[
            *law(),
            Field(key="endDate", label="End Date", section="Key Terms"),
            Field(key="territory", label="Territory", section="Key Terms"),
            Field(key="obligations", label="Partner Obligations", section="Key Terms"),
            Field(key="paymentSchedule", label="Payment Schedule", section="Key Terms", hint="e.g. 20% revenue share, paid quarterly"),
            Field(key="paymentProcess", label="Payment Process", section="Key Terms"),
            Field(key="brandGuidelines", label="Brand Guidelines", section="Key Terms", required=False),
            *cap(),
            *party("company", "Company"),
            *party("partner", "Partner"),
        ],
    ),
    DocSpec(
        id="pilot",
        name="Pilot Agreement",
        description="Short-term trial or product evaluation before a longer-term deal.",
        templates=["Pilot-Agreement.md"],
        party_a="Provider",
        party_b="Customer",
        fields=[
            *law(),
            Field(key="pilotPeriod", label="Pilot Period", section="Order Form", hint="e.g. 30 days"),
            Field(key="evaluationPurposes", label="Evaluation Purposes", section="Order Form"),
            Field(key="fees", label="Pilot Fees", section="Order Form", required=False, hint="Leave blank if free"),
            Field(key="generalCapAmount", label="General Cap Amount", section="Liability"),
            *standard_provider_customer(),
        ],
    ),
    DocSpec(
        id="baa",
        name="Business Associate Agreement",
        description="HIPAA agreement for vendors handling protected health information.",
        templates=["BAA.md"],
        party_a="Provider",
        party_b="Company",
        fields=[
            Field(key="effectiveDate", label="BAA Effective Date", section="Key Terms", hint="YYYY-MM-DD"),
            Field(key="agreement", label="Underlying Agreement", section="Key Terms"),
            Field(key="breachNotificationPeriod", label="Breach Notification Period", section="Key Terms", hint="e.g. 5 business days"),
            Field(key="limitations", label="Limitations", section="Key Terms", required=False),
            *party("provider", "Provider"),
            *party("company", "Company"),
        ],
    ),
    DocSpec(
        id="ai-addendum",
        name="AI Addendum",
        description="AI-specific terms added to an existing agreement.",
        templates=["AI-Addendum.md"],
        party_a="Provider",
        party_b="Customer",
        fields=[
            Field(key="agreement", label="Underlying Agreement", section="Key Terms"),
            Field(key="trainingData", label="Training Data", section="AI Terms", hint="What customer data may be used for training"),
            Field(key="trainingPurposes", label="Training Purposes", section="AI Terms"),
            Field(key="trainingRestrictions", label="Training Restrictions", section="AI Terms"),
            Field(key="improvementRestrictions", label="Improvement Restrictions", section="AI Terms", required=False),
            *standard_provider_customer(),
        ],
    ),
]

SPECS_BY_ID = {spec.id: spec for spec in SPECS}


def missing_required(spec: DocSpec, values: dict[str, str]) -> list[str]:
    """Keys of required fields that have no value yet."""
    return [f.key for f in spec.fields if f.required and not values.get(f.key, "").strip()]


@cache
def standard_terms_html(doc_id: str) -> str:
    """Render the document's template markdown (which embeds HTML spans) to HTML."""
    spec = SPECS_BY_ID[doc_id]
    text = "\n\n".join((config.TEMPLATES_DIR / name).read_text() for name in spec.templates)
    return markdown.markdown(text, extensions=["tables", "sane_lists"])
