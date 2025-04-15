from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserCreate, UserUpdate, UserResponse, PostCreate, PostUpdate, PostResponse
from repositories import UserRepository, PostRepository
from services import TokenService
from models import User, Post
import hashlib
import os
from typing import List, Optional, Dict
from utils import generate_random_user

router = APIRouter(prefix="/users", tags=["users"])

token_service = TokenService()

class PaginatedUserResponse(BaseModel):
    users: List[UserResponse]
    total: int
    skip: int
    limit: int


@router.get("/", response_model=PaginatedUserResponse)
async def get_users(
    skip: int = 0,
    limit: int = 10,
    sort_by: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(token_service.get_current_user_optional)
):
    try:
        repo = UserRepository(db)
        # Получаем пользователей с пагинацией
        users = repo.get_all(skip=skip, limit=limit, sort_by=sort_by, search=search)
        
        # Считаем общее количество пользователей для пагинации
        total_query = db.query(User)
        if search:
            total_query = total_query.filter(User.name.ilike(f"%{search}%"))
        total = total_query.count()

        print(f"Returning users: {[user.__dict__ for user in users]}, total: {total}")
        return {
            "users": users,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        print(f"Error in get_users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        repo = UserRepository(db)
        db_user = repo.get_by_login(user.login)
        if db_user:
            raise HTTPException(status_code=400, detail="User already exists")

        salt = hashlib.sha256(os.urandom(32)).hexdigest()
        password_hash = hashlib.sha256((user.password + salt).encode()).hexdigest()

        new_user = User(
            login=user.login,
            name=user.name,
            password_hash=password_hash,
            password_salt=salt
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = token_service.create_access_token(data={"sub": new_user.login})
        new_user.token = token
        return new_user
    except Exception as e:
        print(f"Error in create_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(token_service.get_current_user)):
    try:
        repo = UserRepository(db)
        user = repo.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
        print(f"Returning user: {user.__dict__}")
        return user
    except Exception as e:
        print(f"Error in get_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(token_service.get_current_user)):
    try:
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this user")
        repo = UserRepository(db)
        user = repo.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
        user = repo.update(user, user_update.dict(exclude_unset=True))
        return user
    except Exception as e:
        print(f"Error in update_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(token_service.get_current_user)):
    try:
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this user")
        repo = UserRepository(db)
        user = repo.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
        repo.delete(user)
        return {"message": "User deleted"}
    except Exception as e:
        print(f"Error in delete_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/login", response_model=UserResponse)
async def login_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        repo = UserRepository(db)
        db_user = repo.get_by_login(user.login)
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid login or password")

        password_hash = hashlib.sha256((user.password + db_user.password_salt).encode()).hexdigest()
        if password_hash != db_user.password_hash:
            raise HTTPException(status_code=401, detail="Invalid login or password")

        token = token_service.create_access_token(data={"sub": db_user.login})
        db_user.token = token
        return db_user
    except Exception as e:
        print(f"Error in login_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/{user_id}/posts/", response_model=PostResponse)
async def create_post(
    user_id: int,
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(token_service.get_current_user)
):
    try:
        # Проверяем, что текущий пользователь создаёт пост от своего имени
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to create post for this user")
        
        # Создаём новый пост
        repo = PostRepository(db)
        new_post = Post(
            title=post.title,
            content=post.content,
            user_id=user_id
        )
        created_post = repo.create(new_post)
        return created_post
    except Exception as e:
        print(f"Error in create_post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{user_id}/posts/", response_model=List[PostResponse])
async def get_posts_by_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(token_service.get_current_user)):
    try:
        repo = PostRepository(db)
        posts = repo.get_posts_by_user(user_id, current_user_id=current_user.id)
        print(f"Returning posts for user {user_id}: {[post.__dict__ for post in posts]}")
        return posts
    except Exception as e:
        print(f"Error in get_posts_by_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/posts/", response_model=List[PostResponse])
async def get_posts(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(token_service.get_current_user_optional)
):
    try:
        repo = PostRepository(db)
        posts = repo.get_posts(
            skip=skip,
            limit=limit,
            current_user_id=current_user.id if current_user else None
        )
        print(f"Returning posts: {[post.__dict__ for post in posts]}")
        return posts
    except Exception as e:
        print(f"Error in get_posts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(token_service.get_current_user)):
    try:
        repo = PostRepository(db)
        post = repo.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")
        post.likes_count = len(post.liked_by) if post.liked_by is not None else 0
        post.liked_by_me = any(user.id == current_user.id for user in post.liked_by) if post.liked_by else False
        return post
    except Exception as e:
        print(f"Error in get_post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(post_id: int, post_update: PostUpdate, db: Session = Depends(get_db), current_user: User = Depends(token_service.get_current_user)):
    try:
        repo = PostRepository(db)
        post = repo.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")
        if post.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this post")
        post = repo.update(post, post_update.dict(exclude_unset=True))
        return post
    except Exception as e:
        print(f"Error in update_post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/posts/{post_id}")
async def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(token_service.get_current_user)):
    try:
        repo = PostRepository(db)
        post = repo.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")
        if post.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        repo.delete(post)
        return {"message": "Post deleted"}
    except Exception as e:
        print(f"Error in delete_post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/posts/{post_id}/like", response_model=PostResponse)
async def like_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(token_service.get_current_user)
):
    try:
        repo = PostRepository(db)
        post = repo.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")
        repo.like_post(post, current_user)
        post.likes_count = len(post.liked_by) if post.liked_by is not None else 0
        post.liked_by_me = True
        return post
    except Exception as e:
        print(f"Error in like_post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/posts/{post_id}/like", response_model=PostResponse)
async def unlike_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(token_service.get_current_user)
):
    try:
        repo = PostRepository(db)
        post = repo.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail=f"Post with id {post_id} not found")
        repo.unlike_post(post, current_user)
        post.likes_count = len(post.liked_by) if post.liked_by is not None else 0
        post.liked_by_me = False
        return post
    except Exception as e:
        print(f"Error in unlike_post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@router.post("/random", response_model=List[UserResponse])
async def create_random_users(db: Session = Depends(get_db)):
    """
    Создаёт 20 случайных пользователей с русскими или английскими именами.
    """
    try:
        repo = UserRepository(db)
        created_users = []
        
        for _ in range(20):
            # Генерируем случайного пользователя
            user_data = generate_random_user()
            
            # Проверяем, что логин уникален
            existing_user = repo.get_by_login(user_data["login"])
            if existing_user:
                continue  # Пропускаем, если логин уже существует
            
            # Создаём пользователя
            new_user = User(
                login=user_data["login"],
                name=user_data["name"],
                password_hash=user_data["password_hash"],
                password_salt=user_data["password_salt"]
            )
            db.add(new_user)
            created_users.append(new_user)
        
        db.commit()
        
        # Обновляем созданных пользователей
        for user in created_users:
            db.refresh(user)
        
        return created_users
    except Exception as e:
        db.rollback()
        print(f"Error in create_random_users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")