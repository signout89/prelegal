import pytest

from prelegal_backend import chat
from prelegal_backend.chat import AIResult, FieldUpdate, apply_result

NDA_COMPLETE = {
    "purpose": "Evaluate a partnership",
    "effectiveDate": "2026-10-05",
    "mndaTermType": "expires",
    "confidentialityTermType": "fixed",
    "governingLaw": "Delaware",
    "jurisdiction": "New Castle, DE",
    **{f"party{n}{k}": "x" for n in (1, 2) for k in ("Company", "Name", "Title", "Address")},
}


def result(reply="ok", doc="none", **updates):
    return AIResult(reply=reply, document_type=doc, field_updates=[FieldUpdate(key=k, value=v) for k, v in updates.items()])


def test_no_document_type_yet():
    res = apply_result(result(), None, {})
    assert res.document_type is None
    assert res.complete is False


def test_detects_type_and_ignores_unknown_keys():
    res = apply_result(result(doc="pilot", pilotPeriod=" 30 days ", bogus="x"), None, {})
    assert res.document_type == "pilot"
    assert res.fields == {"pilotPeriod": "30 days"}
    assert "providerCompany" in res.missing


def test_none_keeps_current_type_and_values():
    res = apply_result(result(governingLaw="Texas"), "csa", {"fees": "$10"})
    assert res.document_type == "csa"
    assert res.fields == {"fees": "$10", "governingLaw": "Texas"}


def test_switching_type_keeps_shared_fields():
    res = apply_result(result(doc="pilot"), "csa", {"providerCompany": "Acme", "technicalSupport": "email"})
    assert res.fields == {"providerCompany": "Acme"}


def test_complete_when_required_filled():
    res = apply_result(result(doc="mutual-nda"), "mutual-nda", NDA_COMPLETE)
    assert res.missing == []
    assert res.complete is True


def test_system_prompt_includes_current_values():
    prompt = chat.system_prompt("csa", {"fees": "$99"})
    assert "Current document: Cloud Service Agreement" in prompt
    assert "fees [Fees; required" in prompt and "= $99" in prompt
    first_turn = chat.system_prompt(None, {})
    assert "Current document" not in first_turn
    assert "- mutual-nda: purpose, effectiveDate" in first_turn
    assert "party1Company" in first_turn


def test_greeting(client):
    assert "Prelegal" in client.get("/api/chat/greeting").json()["reply"]


def test_message_without_api_key_returns_clear_error(client, monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    res = client.post("/api/chat/message", json={"messages": [{"role": "user", "content": "hi"}]})
    assert res.status_code == 503
    assert "OPENROUTER_API_KEY" in res.json()["detail"]


def test_message_endpoint(client, monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    seen = {}

    def fake_llm(messages):
        seen["messages"] = messages
        return result(reply="Which state?", doc="mutual-nda", purpose="Hiring")

    monkeypatch.setattr(chat, "call_llm", fake_llm)
    res = client.post("/api/chat/message", json={"messages": [{"role": "user", "content": "I need an NDA"}]})
    body = res.json()
    assert body["reply"] == "Which state?"
    assert body["document_type"] == "mutual-nda"
    assert body["fields"] == {"purpose": "Hiring"}
    assert seen["messages"][0]["role"] == "system"
    assert seen["messages"][1] == {"role": "user", "content": "I need an NDA"}
