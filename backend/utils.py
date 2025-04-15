from faker import Faker
from passlib.context import CryptContext
import random

# Инициализация Faker с поддержкой русского и английского языков
faker_ru = Faker('ru_RU')  # Для русских имён
faker_en = Faker('en_US')  # Для английских имён

# Настройка хеширования паролей (совместимо с вашим token_service)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_random_user():
    # Случайно выбираем язык (русский или английский)
    use_russian = random.choice([True, False])
    faker = faker_ru if use_russian else faker_en

    # Генерируем имя и логин
    name = faker.name()
    login = faker.user_name()
    # Убедимся, что логин уникален (добавим случайное число, если нужно)
    login = f"{login}{random.randint(1000, 9999)}"
    
    # Генерируем пароль
    password = "password123"  # Простой пароль для тестов
    password_hash = pwd_context.hash(password)
    password_salt = ""  # Оставим пустым, так как соль уже включена в bcrypt

    return {
        "login": login,
        "name": name,
        "password": password,
        "password_hash": password_hash,
        "password_salt": password_salt
    }