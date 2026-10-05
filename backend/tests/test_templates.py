from prelegal_backend.specs import SPECS, missing_required, standard_terms_html


def test_eleven_document_types_with_unique_keys():
    assert len(SPECS) == 11
    for spec in SPECS:
        keys = [f.key for f in spec.fields]
        assert len(keys) == len(set(keys)), spec.id


def test_every_spec_renders_terms():
    for spec in SPECS:
        html = standard_terms_html(spec.id)
        assert "<ol>" in html or "<p>" in html, spec.id


def test_nested_lists_render():
    assert standard_terms_html("csa").count("<ol>") > 1


def test_missing_required():
    spec = next(s for s in SPECS if s.id == "baa")
    missing = missing_required(spec, {"effectiveDate": "2026-01-01", "limitations": ""})
    assert "effectiveDate" not in missing
    assert "limitations" not in missing
    assert "agreement" in missing


def test_list_and_terms_endpoints(client):
    assert len(client.get("/api/templates").json()) == 11
    assert "Cloud Service Agreement" in client.get("/api/templates/csa/terms").json()["html"]
    assert client.get("/api/templates/nope/terms").status_code == 404
