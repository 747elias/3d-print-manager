import os

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production")
DATABASE_PATH = os.getenv("DATABASE_PATH", "/app/data/prints.db")
UPLOAD_FOLDER = "/app/uploads"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480