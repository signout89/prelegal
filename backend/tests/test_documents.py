DOC = {
    "title": "Acme NDA",
    "document_type": "mutual-nda",
    "fields": {"purpose": "Hiring"},
    "messages": [{"role": "user", "content": "NDA please"}],
}


def signup(client, email="ada@example.com"):
    client.post("/api/auth/signup", json={"email": email, "name": "Ada", "password": "secret-pass"})


def test_requires_auth(client):
    assert client.get("/api/documents").status_code == 401
    assert client.post("/api/documents", json=DOC).status_code == 401


def test_crud_roundtrip(client):
    signup(client)
    created = client.post("/api/documents", json=DOC).json()
    assert created["fields"] == {"purpose": "Hiring"}
    assert created["messages"] == DOC["messages"]

    listed = client.get("/api/documents").json()
    assert [d["title"] for d in listed] == ["Acme NDA"]

    updated = client.put(f"/api/documents/{created['id']}", json={**DOC, "title": "Renamed"}).json()
    assert updated["title"] == "Renamed"
    assert client.get(f"/api/documents/{created['id']}").json()["title"] == "Renamed"

    assert client.delete(f"/api/documents/{created['id']}").status_code == 204
    assert client.get(f"/api/documents/{created['id']}").status_code == 404


def test_unknown_type_rejected(client):
    signup(client)
    assert client.post("/api/documents", json={**DOC, "document_type": "nope"}).status_code == 422


def test_users_cannot_see_each_others_documents(client):
    signup(client, "ada@example.com")
    doc_id = client.post("/api/documents", json=DOC).json()["id"]
    client.post("/api/auth/signout")
    signup(client, "bob@example.com")
    assert client.get("/api/documents").json() == []
    assert client.get(f"/api/documents/{doc_id}").status_code == 404
    assert client.put(f"/api/documents/{doc_id}", json=DOC).status_code == 404
    assert client.delete(f"/api/documents/{doc_id}").status_code == 404
