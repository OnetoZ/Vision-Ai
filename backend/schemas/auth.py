from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""
    mobile_number: str = ""
    brand_name: str = ""
    website_url: str = ""
    industry: str = ""
    target_audience: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    mobile_number: str | None = None
    brand_name: str | None = None
    website_url: str | None = None
    industry: str | None = None
    target_audience: str | None = None
    is_admin: bool = False
    is_approved: bool = False

    class Config:
        from_attributes = True
