# Studa Practe

## Описание проекта

Studa Practe — это социальная сеть, где пользователи могут регистрироваться, создавать посты, лайкать их, редактировать профиль и просматривать посты других пользователей. Проект состоит из бэкенда (FastAPI, PostgreSQL) и фронтенда (React, Material-UI).

### Основные функции:

- Регистрация и авторизация пользователей с использованием JWT-токенов.
- Создание, редактирование и удаление постов.
- Лайки постов.
- Просмотр списка пользователей с пагинацией (5, 20, 100 пользователей на странице) и сортировкой по ID или имени (русские и английские имена).
- Генерация случайных пользователей через API для тестирования.

## Технологии

- **Бэкенд**:
  - FastAPI (Python) — для создания API.
  - PostgreSQL — база данных с поддержкой русской локализации.
  - SQLAlchemy — ORM для работы с базой данных.
  - Faker — для генерации случайных данных.
- **Фронтенд**:
  - React — библиотека для интерфейса.
  - Material-UI — для компонентов интерфейса.
  - React Router — для маршрутизации.
  - Axios — для HTTP-запросов.
  - Roboto — шрифт с поддержкой кириллицы.

## Установка и запуск (локально)

### Требования

- Python 3.11 или выше
- Node.js 18 или выше
- PostgreSQL 15 или выше

### 1. Клонирование репозитория

```bash
git clone https://github.com/AutoMagin/StudPract-Fastapi
cd studa_practe
```

### 2. Настройка бэкенда

1. **Создайте и активируйте виртуальное окружение**:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Для Windows
   # или source .venv/bin/activate  # Для Linux/Mac
   ```

2. **Установите зависимости**:

   ```bash
   pip install -r requirements.txt
   ```

   Зависимости (`requirements.txt`)

3. **Настройте PostgreSQL**:

   - Установите PostgreSQL: PostgreSQL Downloads.

   - Создайте базу данных с русской локализацией:

     ```bash
     psql -U postgres
     CREATE DATABASE studa_practe WITH ENCODING 'UTF8' LC_COLLATE 'ru_RU.UTF-8' LC_CTYPE 'ru_RU.UTF-8' TEMPLATE template0;
     ```

     Если `ru_RU.UTF-8` недоступен, используйте:

     ```bash
     CREATE DATABASE studa_practe WITH ENCODING 'UTF8' LC_COLLATE 'C.UTF-8' LC_CTYPE 'C.UTF-8' TEMPLATE template0;
     ```

   - Обновите `backend/database.py`:

     ```python
     SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://postgres:your_password@localhost:5432/studa_practe"
     ```

     Замените `your_password` на ваш пароль для пользователя `postgres`.

4. **Запустите бэкенд**:

   ```bash
   uvicorn backend.main:app --reload
   ```

   Сервер запустится на `http://localhost:8000`. Документация API доступна по адресу `http://localhost:8000/docs`.

### 3. Настройка фронтенда

1. **Перейдите в папку фронтенда**:

   ```bash
   cd frontend
   ```

2. **Установите зависимости**:

   ```bash
   npm install
   ```

   Зависимости (`package.json`)

3. **Запустите фронтенд**:

   ```bash
   npm start
   ```

   Фронтенд запустится на `http://localhost:3000`.

### 4. Использование

- Откройте `http://localhost:3000` в браузере.
- Зарегистрируйтесь (`/sign`) или войдите (`/auth`).
- Создавайте посты, лайкайте их, редактируйте профиль.
- Просматривайте список пользователей (`/users`) с пагинацией (5, 20, 100 пользователей на странице) и сортировкой по ID или имени.

### 5. Генерация случайных пользователей

Для тестирования вы можете создать случайных пользователей через API:

1. Откройте `http://localhost:8000/docs`.
2. Найдите маршрут `POST /users/random`.
3. Это создаст указанное количество случайных пользователей с русскими или английскими именами.
   - Логин: случайный (например, `johnsmith1234` или `ivanov5678`).
   - Имя: случайное (например, `John Smith` или `Иванов Сергей`).
   - Пароль: `password123` (для всех пользователей).



## Структура проекта

```
studa_practe/
├── backend/
│   ├── main.py           # Точка входа для FastAPI
│   ├── database.py       # Настройка базы данных
│   ├── models.py         # Модели SQLAlchemy
│   ├── schemas.py        # Схемы Pydantic
│   ├── routers.py        # Маршруты API
│   ├── repositories.py   # Логика работы с базой данных
│   ├── token_service.py  # Логика JWT-токенов
│   ├── utils.py          # Утилиты (генерация случайных пользователей)
│   ├── requirements.txt  # Зависимости бэкенда
│   └── Procfile          # Конфигурация для Heroku
├── frontend/
│   ├── src/
│   │   ├── components/   # Компоненты React
│   │   ├── contexts/     # Контексты (авторизация, загрузка)
│   │   ├── services/     # Сервисы для API-запросов
│   │   └── App.js        # Главный компонент приложения
│   └── package.json      # Зависимости фронтенда
└── README.md             # Документация проекта
```

## API-эндпоинты

| Метод | Эндпоинт | Описание | Требуется авторизация |
| --- | --- | --- | --- |
| GET | `/users/` | Получить список пользователей | Нет |
| POST | `/users/` | Создать пользователя | Нет |
| GET | `/users/{user_id}` | Получить пользователя по ID | Да |
| PUT | `/users/{user_id}` | Обновить пользователя | Да (только свой) |
| DELETE | `/users/{user_id}` | Удалить пользователя | Да (только свой) |
| POST | `/users/login` | Вход пользователя | Нет |
| POST | `/users/random` | Создать случайных пользователей | Нет |
| POST | `/users/{user_id}/posts/` | Создать пост | Да (только свой) |
| GET | `/users/{user_id}/posts/` | Получить посты пользователя | Да |
| GET | `/users/posts/` | Получить все посты | Нет |
| GET | `/users/posts/{post_id}` | Получить пост по ID | Да |
| PUT | `/users/posts/{post_id}` | Обновить пост | Да (только свой) |
| DELETE | `/users/posts/{post_id}` | Удалить пост | Да (только свой) |
| POST | `/users/posts/{post_id}/like` | Лайкнуть пост | Да |
| DELETE | `/users/posts/{post_id}/like` | Убрать лайк | Да |

## Дополнительно

- Для управления миграциями базы данных используйте **Alembic**:

  ```bash
  pip install alembic
  cd backend
  alembic init migrations
  ```

  Настройте `alembic.ini` и `migrations/env.py` для работы с вашими моделями.
