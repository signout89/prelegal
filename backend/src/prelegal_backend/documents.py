"""Saved documents, scoped to the signed-in user."""

import json
import sqlite3

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from . import db
from .auth import CurrentUser
from .chat import Message
from .specs import SPECS_BY_ID

router = APIRouter(prefix="/api/documents", tags=["documents"])


class DocumentIn(BaseModel):
    title: str = Field(min_length=1)
    document_type: str
    fields: dict[str, str]
    messages: list[Message]


class DocumentSummary(BaseModel):
    id: int
    title: str
    document_type: str
    updated_at: str


class Document(DocumentSummary):
    fields: dict[str, str]
    messages: list[Message]


def _to_document(row: sqlite3.Row) -> Document:
    return Document(
        id=row["id"],
        title=row["title"],
        document_type=row["document_type"],
        updated_at=row["updated_at"],
        fields=json.loads(row["fields"]),
        messages=json.loads(row["messages"]),
    )


def _check_type(body: DocumentIn) -> None:
    if body.document_type not in SPECS_BY_ID:
        raise HTTPException(422, "Unknown document type")


def _fetch(conn: sqlite3.Connection, doc_id: int, user_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM documents WHERE id = ? AND user_id = ?", (doc_id, user_id)).fetchone()
    if row is None:
        raise HTTPException(404, "Document not found")
    return row


@router.get("")
def list_documents(user: CurrentUser) -> list[DocumentSummary]:
    with db.connect() as conn:
        rows = conn.execute(
            "SELECT id, title, document_type, updated_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC, id DESC",
            (user.id,),
        ).fetchall()
    return [DocumentSummary(**row) for row in rows]


@router.post("", status_code=201)
def create_document(body: DocumentIn, user: CurrentUser) -> Document:
    _check_type(body)
    with db.connect() as conn:
        cur = conn.execute(
            "INSERT INTO documents (user_id, title, document_type, fields, messages) VALUES (?, ?, ?, ?, ?)",
            (user.id, body.title, body.document_type, json.dumps(body.fields), json.dumps([m.model_dump() for m in body.messages])),
        )
        return _to_document(_fetch(conn, cur.lastrowid, user.id))


@router.get("/{doc_id}")
def get_document(doc_id: int, user: CurrentUser) -> Document:
    with db.connect() as conn:
        return _to_document(_fetch(conn, doc_id, user.id))


@router.put("/{doc_id}")
def update_document(doc_id: int, body: DocumentIn, user: CurrentUser) -> Document:
    _check_type(body)
    with db.connect() as conn:
        _fetch(conn, doc_id, user.id)
        conn.execute(
            "UPDATE documents SET title = ?, document_type = ?, fields = ?, messages = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (body.title, body.document_type, json.dumps(body.fields), json.dumps([m.model_dump() for m in body.messages]), doc_id),
        )
        return _to_document(_fetch(conn, doc_id, user.id))


@router.delete("/{doc_id}", status_code=204)
def delete_document(doc_id: int, user: CurrentUser) -> None:
    with db.connect() as conn:
        _fetch(conn, doc_id, user.id)
        conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
