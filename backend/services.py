from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
import jwt

class TokenService:
    def __init__(self):
        self.secret_key = "your-secret-key"
        self.algorithm = "HS256"

    def create_token(self, login: str) -> str:
        payload = {"sub": login}
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()), db: Session = Depends(get_db)):
        token = credentials.credentials
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            login = payload.get("sub")
            if login is None:
                raise HTTPException(status_code=401, detail="Invalid token")
            return login
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    def get_current_user_optional(self, credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()), db: Session = Depends(get_db)):
        try:
            token = credentials.credentials
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            login = payload.get("sub")
            if login is None:
                return None
            user = db.query(User).filter(User.login == login).first()
            return user if user else None
        except (jwt.PyJWTError, AttributeError):
            return None