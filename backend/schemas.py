from pydantic import BaseModel
from typing import Optional, List

class UserCreate(BaseModel):
    login: str
    password: str
    name: Optional[str] = None  # Добавляем поле name как необязательное

class UserUpdate(BaseModel):
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    login: str
    token: Optional[str] = None

    class Config:
        orm_mode = True

class PostCreate(BaseModel):
    content: str

class PostUpdate(BaseModel):
    content: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    content: str
    user_id: int
    likes_count: int
    liked_by_me: bool

    class Config:
        orm_mode = True