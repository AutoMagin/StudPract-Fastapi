from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import router
from .middleware import ExceptionHandlerMiddleware
import uvicorn

app = FastAPI()

# Создание таблиц
Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware для обработки ошибок
app.add_middleware(ExceptionHandlerMiddleware)

# Роутеры
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)