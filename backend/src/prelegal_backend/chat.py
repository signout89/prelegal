"""AI chat that identifies the document type and extracts field values."""

import os
from datetime import date
from typing import Literal

from fastapi import APIRouter, HTTPException
from litellm import completion
from pydantic import BaseModel

from .specs import SPECS, SPECS_BY_ID, DocSpec, missing_required

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

GREETING = (
    "Hi, I'm your Prelegal assistant. I can help you draft a Mutual NDA, Cloud Service "
    "Agreement, Pilot Agreement, Data Processing Agreement and more. "
    "What kind of agreement do you need, and who is it between?"
)

DocType = Literal[*[spec.id for spec in SPECS], "none"]

router = APIRouter(prefix="/api/chat", tags=["chat"])


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    document_type: str | None = None
    fields: dict[str, str] = {}


class ChatResponse(BaseModel):
    reply: str
    document_type: str | None
    fields: dict[str, str]
    missing: list[str]
    complete: bool


class FieldUpdate(BaseModel):
    key: str
    value: str


class AIResult(BaseModel):
    """Structured output the model must return on every turn."""

    reply: str
    document_type: DocType
    field_updates: list[FieldUpdate]


def describe_catalog() -> str:
    return "\n".join(f"- {s.id}: {s.name} - {s.description}" for s in SPECS)


def describe_all_keys() -> str:
    return "\n".join(f"- {s.id}: {', '.join(f.key for f in s.fields)}" for s in SPECS)


def describe_fields(spec: DocSpec, values: dict[str, str]) -> str:
    lines = []
    for f in spec.fields:
        extras = ["required" if f.required else "optional"]
        if f.hint:
            extras.append(f"hint: {f.hint}")
        if f.options:
            extras.append(f"one of: {', '.join(f.options)}")
        current = values.get(f.key) or "(empty)"
        lines.append(f"- {f.key} [{f.label}; {'; '.join(extras)}] = {current}")
    return "\n".join(lines)


def system_prompt(doc_type: str | None, values: dict[str, str]) -> str:
    prompt = f"""You are Prelegal, a friendly assistant that helps users draft legal agreements from Common Paper templates.
Today is {date.today().isoformat()}.

Supported document types (use the id as document_type):
{describe_catalog()}

Rules:
- Work out which document the user needs. If unclear, ask. If they ask for a document we do not support, say so and suggest the closest supported one. Use document_type "none" until a type is chosen.
- Once a type is chosen, gather values for its fields through natural conversation, asking at most two or three questions per turn.
- Put every value the user gives you into field_updates using the exact field keys, including in the same turn you first choose the document type. Only include fields that changed. Dates must be YYYY-MM-DD. Fields with options must use one of the listed options.
- Always end with a follow-on question while any required field is still empty.
- Only say the document is ready when no required field is still empty after your field_updates. Then briefly summarize, mention any optional fields they might want, and tell them the document is ready to download.
- Keep replies concise. Do not give legal advice beyond explaining what a field means."""
    if doc_type in SPECS_BY_ID:
        spec = SPECS_BY_ID[doc_type]
        prompt += f"""

Current document: {spec.name} (id: {spec.id}). Fields and current values:
{describe_fields(spec, values)}

Required fields still empty before this turn: {", ".join(missing_required(spec, values)) or "none"}"""
    else:
        prompt += f"""

No document chosen yet. Field keys for each document type (use only these exact keys in field_updates):
{describe_all_keys()}"""
    return prompt


def call_llm(messages: list[dict]) -> AIResult:
    """Call the model via OpenRouter with Cerebras and parse the structured output."""
    response = completion(
        model=MODEL,
        messages=messages,
        response_format=AIResult,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    return AIResult.model_validate_json(response.choices[0].message.content)


def apply_result(result: AIResult, doc_type: str | None, values: dict[str, str]) -> ChatResponse:
    """Merge the model's updates into the current state and compute completeness."""
    new_type = result.document_type if result.document_type != "none" else doc_type
    spec = SPECS_BY_ID.get(new_type)
    if spec is None:
        return ChatResponse(reply=result.reply, document_type=None, fields={}, missing=[], complete=False)
    keys = {f.key for f in spec.fields}
    fields = {k: v for k, v in values.items() if k in keys}
    fields.update({u.key: u.value.strip() for u in result.field_updates if u.key in keys})
    missing = missing_required(spec, fields)
    return ChatResponse(reply=result.reply, document_type=spec.id, fields=fields, missing=missing, complete=not missing)


@router.get("/greeting")
def greeting() -> dict:
    return {"reply": GREETING}


@router.post("/message")
def message(body: ChatRequest) -> ChatResponse:
    if not os.environ.get("OPENROUTER_API_KEY"):
        raise HTTPException(503, "The AI assistant is not configured: OPENROUTER_API_KEY is missing from .env")
    messages = [{"role": "system", "content": system_prompt(body.document_type, body.fields)}]
    messages += [m.model_dump() for m in body.messages]
    result = call_llm(messages)
    return apply_result(result, body.document_type, body.fields)

