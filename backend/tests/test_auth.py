USER = {"email": "Ada@Example.com", "name": "Ada", "password": "secret-pass"}


def test_signup_sets_cookie_and_me_returns_user(client):
    res = client.post("/api/auth/signup", json=USER)
    assert res.status_code == 201
    assert "prelegal_token" in res.cookies
    me = client.get("/api/auth/me").json()
    assert me["email"] == "ada@example.com"
    assert me["name"] == "Ada"


def test_duplicate_signup_conflicts(client):
    client.post("/api/auth/signup", json=USER)
    assert client.post("/api/auth/signup", json=USER).status_code == 409


def test_short_password_rejected(client):
    assert client.post("/api/auth/signup", json={**USER, "password": "short"}).status_code == 422


def test_signin_and_signout(client):
    client.post("/api/auth/signup", json=USER)
    client.post("/api/auth/signout")
    assert client.get("/api/auth/me").status_code == 401
    res = client.post("/api/auth/signin", json={"email": USER["email"], "password": USER["password"]})
    assert res.status_code == 200
    assert client.get("/api/auth/me").status_code == 200


def test_signin_wrong_password(client):
    client.post("/api/auth/signup", json=USER)
    res = client.post("/api/auth/signin", json={"email": USER["email"], "password": "wrong-pass"})
    assert res.status_code == 401


def test_me_requires_auth(client):
    assert client.get("/api/auth/me").status_code == 401
    client.cookies.set("prelegal_token", "garbage")
    assert client.get("/api/auth/me").status_code == 401
