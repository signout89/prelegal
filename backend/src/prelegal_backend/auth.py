"""Email/password auth with bcrypt hashes and a JWT in an HttpOnly cookie."""

import sqlite3
from datetime import UTC, datetime, timedelta
from typing import Annotated

import bcrypt
import jwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from pydantic import BaseModel, EmailStr, Field

from . import config, db

COOKIE_NAME = "prelegal_token"
TOKEN_TTL = timedelta(days=7)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignUp(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1)
    password: str = Field(min_length=8)


class SignIn(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    id: int
    email: str
    name: str


def _set_token(response: Response, user_id: int) -> None:
    payload = {"sub": str(user_id), "exp": datetime.now(UTC) + TOKEN_TTL}
    token = jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")
    response.set_cookie(
        COOKIE_NAME, token, httponly=True, samesite="lax", max_age=int(TOKEN_TTL.total_seconds())
    )


def current_user(token: Annotated[str | None, Cookie(alias=COOKIE_NAME)] = None) -> User:
    """Resolve the signed-in user from the auth cookie, or raise 401."""
    if not token:
        raise HTTPException(401, "Not signed in")
    try:
        user_id = int(jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])["sub"])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid session")
    with db.connect() as conn:
        row = conn.execute("SELECT id, email, name FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise HTTPException(401, "Invalid session")
    return User(**row)


CurrentUser = Annotated[User, Depends(current_user)]


@router.post("/signup", status_code=201)
def signup(body: SignUp, response: Response) -> User:
    password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    email = body.email.lower()
    try:
        with db.connect() as conn:
            cur = conn.execute(
                "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
                (email, body.name.strip(), password_hash),
            )
    except sqlite3.IntegrityError:
        raise HTTPException(409, "An account with this email already exists")
    _set_token(response, cur.lastrowid)
    return User(id=cur.lastrowid, email=email, name=body.name.strip())


@router.post("/signin")
def signin(body: SignIn, response: Response) -> User:
    with db.connect() as conn:
        row = conn.execute(
            "SELECT id, email, name, password_hash FROM users WHERE email = ?",
            (body.email.lower(),),
        ).fetchone()
    if row is None or not bcrypt.checkpw(body.password.encode(), row["password_hash"].encode()):
        raise HTTPException(401, "Invalid email or password")
    _set_token(response, row["id"])
    return User(id=row["id"], email=row["email"], name=row["name"])


@router.post("/signout")
def signout(response: Response) -> dict:
    response.delete_cookie(COOKIE_NAME)
    return {"ok": True}


@router.get("/me")
def me(user: CurrentUser) -> User:
    return user
