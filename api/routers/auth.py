from fastapi import APIRouter, HTTPException, Request

from fastapi.responses import RedirectResponse
import os
import requests
import jwt
from urllib.parse import urlencode, quote
from datetime import datetime, timedelta
import secrets

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

BACKEND_URL = os.getenv("BACKEND_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL")

REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_THIS_SECRET")
JWT_ALGORITHM = "HS256"


# ------------------------------------------------------------
# Create JWT Token
# ------------------------------------------------------------
def create_token(user):
    payload = {
        "sub": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# ------------------------------------------------------------
# Step 1 → Redirect user to Google OAuth login
# ------------------------------------------------------------
@router.get("/login")
def auth_login():
    state = secrets.token_urlsafe(16)
    nonce = secrets.token_urlsafe(16)

    params = {
        "response_type": "code",
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        "include_granted_scopes": "true",
        "state": state,
        "nonce": nonce,
    }

    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)

    return RedirectResponse(url=google_auth_url)


# ------------------------------------------------------------
# Step 2 → Google callback
# ------------------------------------------------------------
@router.get("/callback")
def auth_callback(code: str, request: Request):
    token_res = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    token_data = token_res.json()

    if "access_token" not in token_data:
        raise HTTPException(status_code=400, detail=token_data)

    access_token = token_data["access_token"]

    user_res = requests.get(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    user = user_res.json()

    if "email" not in user:
        raise HTTPException(status_code=400, detail=user)

    token = create_token(user)

    params = urlencode({
        "token": token,
        "name": user.get("name"),
        "email": user.get("email"),
        "picture": user.get("picture"),
    })

    return RedirectResponse(f"{FRONTEND_URL}/oauth-success?{params}")
