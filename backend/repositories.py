from sqlalchemy.orm import Session
from models import User, Post
from typing import Optional, List

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_login(self, login: str) -> Optional[User]:
        return self.db.query(User).filter(User.login == login).first()

    def get(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_all(self, skip: int = 0, limit: int = 10, sort_by: Optional[str] = None, search: Optional[str] = None) -> List[User]:
        query = self.db.query(User)
        if search:
            query = query.filter(User.name.ilike(f"%{search}%"))
        if sort_by:
            if sort_by == "id":
                query = query.order_by(User.id.asc())
            elif sort_by == "id_desc":
                query = query.order_by(User.id.desc())
            elif sort_by == "name":
                query = query.order_by(User.name.asc())
            elif sort_by == "name_desc":
                query = query.order_by(User.name.desc())
        query = query.offset(skip).limit(limit)
        users = query.all()
        return users

    def update(self, user: User, user_update: dict) -> User:
        try:
            for key, value in user_update.items():
                setattr(user, key, value)
            self.db.commit()
            self.db.refresh(user)
            return user
        except Exception as e:
            self.db.rollback()
            print(f"Error in update user: {str(e)}")
            raise

    def delete(self, user: User):
        try:
            self.db.delete(user)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"Error in delete user: {str(e)}")
            raise

class PostRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, post: Post):
        try:
            self.db.add(post)
            self.db.commit()
            self.db.refresh(post)
            return post
        except Exception as e:
            self.db.rollback()
            print(f"Error in create post: {str(e)}")
            raise

    def get(self, post_id: int) -> Optional[Post]:
        return self.db.query(Post).filter(Post.id == post_id).first()

    def get_posts(self, skip: int, limit: int, current_user_id: Optional[int] = None) -> List[Post]:
        try:
            query = self.db.query(Post).order_by(Post.id.desc())
            query = query.offset(skip).limit(limit)
            posts = query.all()
            for post in posts:
                post.likes_count = len(post.liked_by) if post.liked_by is not None else 0
                post.liked_by_me = any(user.id == current_user_id for user in post.liked_by) if current_user_id and post.liked_by else False
            return posts
        except Exception as e:
            print(f"Error in get_posts: {str(e)}")
            raise

    def get_posts_by_user(self, user_id: int, current_user_id: Optional[int] = None) -> List[Post]:
        try:
            query = self.db.query(Post).filter(Post.user_id == user_id).order_by(Post.id.desc())
            posts = query.all()
            for post in posts:
                post.likes_count = len(post.liked_by) if post.liked_by is not None else 0
                post.liked_by_me = any(user.id == current_user_id for user in post.liked_by) if current_user_id and post.liked_by else False
            return posts
        except Exception as e:
            print(f"Error in get_posts_by_user: {str(e)}")
            raise

    def update(self, post: Post, post_update: dict) -> Post:
        try:
            for key, value in post_update.items():
                setattr(post, key, value)
            self.db.commit()
            self.db.refresh(post)
            return post
        except Exception as e:
            self.db.rollback()
            print(f"Error in update post: {str(e)}")
            raise

    def delete(self, post: Post):
        try:
            self.db.delete(post)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"Error in delete post: {str(e)}")
            raise

    def like_post(self, post: Post, user: User):
        try:
            if user not in post.liked_by:
                post.liked_by.append(user)
                self.db.commit()
                self.db.refresh(post)
        except Exception as e:
            self.db.rollback()
            print(f"Error in like_post: {str(e)}")
            raise

    def unlike_post(self, post: Post, user: User):
        try:
            if user in post.liked_by:
                post.liked_by.remove(user)
                self.db.commit()
                self.db.refresh(post)
        except Exception as e:
            self.db.rollback()
            print(f"Error in unlike_post: {str(e)}")
            raise