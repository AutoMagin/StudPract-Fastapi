from pydantic import BaseModel
from typing import Optional, List

class UserCreate(BaseModel):
    login: str
    name: Optional[str] = None
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    login: str
    name: Optional[str]
    token: Optional[str] = None

    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    title: str
    content: str

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    user_id: int
    likes_count: Optional[int] = 0
    liked_by_me: Optional[bool] = False

    class Config:
        from_attributes = True
        
class PaginatedUserResponse(BaseModel):
    users: List[UserResponse]
    total: int
    skip: int
    limit: int