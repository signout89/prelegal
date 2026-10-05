"""Document type specs and rendered standard terms."""

from fastapi import APIRouter, HTTPException

from .specs import SPECS, SPECS_BY_ID, DocSpec, standard_terms_html

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("")
def list_templates() -> list[DocSpec]:
    return SPECS


@router.get("/{doc_id}/terms")
def get_terms(doc_id: str) -> dict:
    if doc_id not in SPECS_BY_ID:
        raise HTTPException(404, "Unknown document type")
    return {"html": standard_terms_html(doc_id)}
