from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base

# Таблица для связи многие-ко-многим между пользователями и постами (лайки)
post_likes = Table(
    'post_likes',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('post_id', Integer, ForeignKey('posts.id'))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    password_hash = Column(String)
    password_salt = Column(String)
    posts = relationship("Post", back_populates="user")
    liked_posts = relationship("Post", secondary=post_likes, back_populates="liked_by")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="posts")
    liked_by = relationship("User", secondary=post_likes, back_populates="liked_posts", lazy="joined")