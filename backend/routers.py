from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import get_db
from .schemas import UserCreate, UserUpdate, UserResponse, PostCreate, PostUpdate, PostResponse
from .repositories import UserRepository, PostRepository
from .services import TokenService
from .models import User
import hashlib
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

token_service = TokenService()

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    db_user = repo.find_user_by_login(user.login)
    if db_user:
        raise HTTPException(status_code=400, detail="Login already exists")
    user_db = repo.create_user(user)
    user_db.token = token_service.create_token(user.login)
    db.commit()
    db.refresh(user_db)
    return user_db

@router.get("/", response_model=list[UserResponse])
async def get_users(db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    repo = UserRepository(db)
    return repo.get_users()

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    repo = UserRepository(db)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    repo = UserRepository(db)
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
    updated_user = repo.update_user(user_id, user)
    if not updated_user:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
    return updated_user

@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    repo = UserRepository(db)
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
    repo.delete_user(user_id)
    return {"message": "User deleted"}

@router.post("/login")
async def login(user: UserCreate, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    db_user = repo.find_user_by_login(user.login)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials: User not found")
    print(f"User: {db_user.login}, Salt: {db_user.password_salt}, Hash: {db_user.password_hash}")
    print(f"Input password: {user.password}")
    computed_hash = hashlib.sha256((user.password + db_user.password_salt).encode()).hexdigest()
    print(f"Computed hash: {computed_hash}")
    if not verify_password(user.password, db_user.password_hash, db_user.password_salt):
        raise HTTPException(status_code=401, detail="Invalid credentials: Password mismatch")
    db_user.token = token_service.create_token(user.login)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_password(plain_password: str, hashed_password: str, salt: str) -> bool:
    return hashlib.sha256((plain_password + salt).encode()).hexdigest() == hashed_password

@router.post("/{user_id}/posts/", response_model=PostResponse)
async def create_post(user_id: int, post: PostCreate, db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    db_user = db.query(User).filter(User.login == current_user).first()
    if db_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create post for this user")
    repo = PostRepository(db)
    new_post = repo.create_post(post, user_id)
    new_post.likes_count = 0
    new_post.liked_by_me = False
    return new_post

@router.get("/posts/", response_model=List[PostResponse])
async def get_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(token_service.get_current_user_optional)):
    repo = PostRepository(db)
    return repo.get_posts(skip=skip, limit=limit, current_user_id=current_user.id if current_user else None)

@router.get("/{user_id}/posts/", response_model=List[PostResponse])
async def get_posts_by_user(user_id: int, db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    db_user = db.query(User).filter(User.login == current_user).first()
    repo = PostRepository(db)
    return repo.get_posts_by_user(user_id, current_user_id=db_user.id)

@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    db_user = db.query(User).filter(User.login == current_user).first()
    repo = PostRepository(db)
    post = repo.get_post(post_id, current_user_id=db_user.id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(post_id: int, post: PostUpdate, db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    db_user = db.query(User).filter(User.login == current_user).first()
    repo = PostRepository(db)
    db_post = repo.get_post(post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.user_id != db_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    updated_post = repo.update_post(post_id, post)
    updated_post.likes_count = len(updated_post.liked_by)
    updated_post.liked_by_me = any(user.id == db_user.id for user in updated_post.liked_by)
    return updated_post

@router.delete("/posts/{post_id}")
async def delete_post(post_id: int, db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    db_user = db.query(User).filter(User.login == current_user).first()
    repo = PostRepository(db)
    db_post = repo.get_post(post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.user_id != db_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    repo.delete_post(post_id)
    return {"message": "Post deleted"}

@router.post("/posts/{post_id}/like/")
async def like_post(post_id: int, db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    db_user = db.query(User).filter(User.login == current_user).first()
    repo = PostRepository(db)
    if repo.like_post(post_id, db_user.id):
        post = repo.get_post(post_id, current_user_id=db_user.id)
        return {"message": "Post liked", "likes_count": post.likes_count, "liked_by_me": post.liked_by_me}
    raise HTTPException(status_code=400, detail="Post not found or already liked")

@router.delete("/posts/{post_id}/like/")
async def unlike_post(post_id: int, db: Session = Depends(get_db), current_user: str = Depends(token_service.get_current_user)):
    db_user = db.query(User).filter(User.login == current_user).first()
    repo = PostRepository(db)
    if repo.unlike_post(post_id, db_user.id):
        post = repo.get_post(post_id, current_user_id=db_user.id)
        return {"message": "Post unliked", "likes_count": post.likes_count, "liked_by_me": post.liked_by_me}
    raise HTTPException(status_code=400, detail="Post not found or not liked")