from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from .models import User, Post, likes
from .schemas import UserCreate, UserUpdate, PostCreate, PostUpdate
import hashlib
import os

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_user_by_login(self, login: str) -> User:
        return self.db.query(User).filter(User.login == login).first()

    def create_user(self, user: UserCreate) -> User:
        salt = os.urandom(32).hex()
        password_hash = hashlib.sha256((user.password + salt).encode()).hexdigest()
        db_user = User(
            login=user.login,
            password_hash=password_hash,
            password_salt=salt,
            name=user.name 
        )
        self.db.add(db_user)
        self.db.flush()
        return db_user

    def get_users(self) -> list[User]:
        return self.db.query(User).all()

    def update_user(self, user_id: int, user: UserUpdate) -> User:
        db_user = self.db.query(User).filter(User.id == user_id).first()
        if db_user and user.name:
            db_user.name = user.name
            self.db.commit()
            self.db.refresh(db_user)
        return db_user

    def delete_user(self, user_id: int) -> bool:
        db_user = self.db.query(User).filter(User.id == user_id).first()
        if db_user:
            self.db.delete(db_user)
            self.db.commit()
            return True
        return False

class PostRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_post(self, post: PostCreate, user_id: int) -> Post:
        db_post = Post(content=post.content, user_id=user_id)
        self.db.add(db_post)
        self.db.commit()
        self.db.refresh(db_post)
        return db_post

   
    def get_posts(self, skip: int = 0, limit: int = 10, current_user_id: int = None) -> list[Post]:
        query = self.db.query(Post).order_by(Post.id.desc()).offset(skip).limit(limit)
        posts = query.all()
        for post in posts:
            post.likes_count = len(post.liked_by)
            post.liked_by_me = any(user.id == current_user_id for user in post.liked_by) if current_user_id else False
        return posts

    def get_posts_by_user(self, user_id: int, current_user_id: int = None) -> list[Post]:
        query = self.db.query(Post).filter(Post.user_id == user_id).order_by(Post.id.desc())
        posts = query.all()
        for post in posts:
            post.likes_count = len(post.liked_by)
            post.liked_by_me = any(user.id == current_user_id for user in post.liked_by) if current_user_id else False
        return posts

    def get_post(self, post_id: int, current_user_id: int = None) -> Post:
        post = self.db.query(Post).filter(Post.id == post_id).first()
        if post:
            post.likes_count = len(post.liked_by)
            post.liked_by_me = any(user.id == current_user_id for user in post.liked_by) if current_user_id else False
        return post

    def update_post(self, post_id: int, post: PostUpdate) -> Post:
        db_post = self.db.query(Post).filter(Post.id == post_id).first()
        if db_post and post.content:
            db_post.content = post.content
            self.db.commit()
            self.db.refresh(db_post)
        return db_post

    def delete_post(self, post_id: int) -> bool:
        db_post = self.db.query(Post).filter(Post.id == post_id).first()
        if db_post:
            self.db.delete(db_post)
            self.db.commit()
            return True
        return False

    def like_post(self, post_id: int, user_id: int) -> bool:
        post = self.db.query(Post).filter(Post.id == post_id).first()
        user = self.db.query(User).filter(User.id == user_id).first()
        if not post or not user:
            return False
        if user not in post.liked_by:
            post.liked_by.append(user)
            self.db.commit()
            return True
        return False

    def unlike_post(self, post_id: int, user_id: int) -> bool:
        post = self.db.query(Post).filter(Post.id == post_id).first()
        user = self.db.query(User).filter(User.id == user_id).first()
        if not post or not user:
            return False
        if user in post.liked_by:
            post.liked_by.remove(user)
            self.db.commit()
            return True
        return False