from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import router
from database import init_db
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

app = FastAPI()

# Логирование запросов
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

# Инициализация базы данных при запуске
@app.on_event("startup")
async def startup_event():
    init_db()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://twitterclonepract.netlify.app", "https://studpract-fastapi.onrender.com"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Корневой маршрут (опционально)
@app.get("/")
async def root():
    return {"message": "Welcome to StudPract FastAPI"}