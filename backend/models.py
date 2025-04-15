from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base

# Таблица для связи "многие-ко-многим" между пользователями и постами (лайки)
likes = Table(
    "likes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    login = Column(String, unique=True, index=True)
    password_hash = Column(String)
    password_salt = Column(String)
    token = Column(String, nullable=True)

    posts = relationship("Post", back_populates="user")
    liked_posts = relationship("Post", secondary=likes, back_populates="liked_by")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="posts")
    liked_by = relationship("User", secondary=likes, back_populates="liked_posts")