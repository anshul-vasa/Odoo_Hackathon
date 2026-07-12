import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """
    Base Configuration
    """

    # -----------------------------
    # Flask Configuration
    # -----------------------------
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "change-this-secret-key"
    )

    DEBUG = os.getenv(
        "DEBUG",
        "False"
    ).lower() == "true"

    # -----------------------------
    # Database Configuration
    # -----------------------------
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///transitops.db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # -----------------------------
    # JWT Configuration
    # -----------------------------
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "change-this-jwt-secret"
    )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    JWT_TOKEN_LOCATION = ["headers"]

    JWT_HEADER_NAME = "Authorization"

    JWT_HEADER_TYPE = "Bearer"

    # -----------------------------
    # Upload Configuration
    # -----------------------------
    BASE_DIR = os.path.abspath(
        os.path.dirname(os.path.dirname(__file__))
    )

    UPLOAD_FOLDER = os.path.join(
        BASE_DIR,
        "uploads"
    )

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB

    ALLOWED_EXTENSIONS = {
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "doc",
        "docx",
        "xls",
        "xlsx"
    }

    # -----------------------------
    # Pagination
    # -----------------------------
    DEFAULT_PAGE = 1

    DEFAULT_PAGE_SIZE = 10

    MAX_PAGE_SIZE = 100

    # -----------------------------
    # Application
    # -----------------------------
    APP_NAME = "TransitOps"

    APP_VERSION = "1.0.0"

    # -----------------------------
    # CORS
    # -----------------------------
    CORS_HEADERS = "Content-Type"

    # -----------------------------
    # Logging
    # -----------------------------
    LOG_LEVEL = "INFO"


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True

    SQLALCHEMY_DATABASE_URI = "sqlite:///test.db"


class ProductionConfig(Config):
    DEBUG = False


config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}