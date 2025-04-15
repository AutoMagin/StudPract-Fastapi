from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import router
from database import init_db

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
    print("Starting up database...")
    try:
        init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Failed to initialize database: {e}")
        raise e
    
# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://twitterclonepract.netlify.app"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Корневой маршрут (опционально)
@app.get("/")
async def root():
    return {"message": "Welcome to StudPract FastAPI"}