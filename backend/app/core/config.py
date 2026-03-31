import json
from functools import lru_cache
from typing import Annotated

from pydantic import EmailStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "AI-Powered Certificate Management System"
    api_v1_prefix: str = "/api"
    mongo_uri: str = "mongodb://mongodb:27017"
    mongo_db: str = "certificate_management"
    jwt_secret_key: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480
    cors_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    admin_email: EmailStr = "admin@example.com"
    admin_password: str = "Admin@123456"
    admin_full_name: str = "System Administrator"

    frontend_url: str = "http://localhost:5173"
    profile_owner_name: str = "Your Name"
    profile_headline: str = "AI & Software Certifications"
    profile_bio: str = (
        "A curated portfolio of certifications, achievements, and verified learning milestones."
    )

    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None
    cloudinary_folder: str = "certificate-management"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return []
            if value.startswith("["):
                parsed_value = json.loads(value)
                if isinstance(parsed_value, list):
                    return [str(origin).strip() for origin in parsed_value if str(origin).strip()]
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return []

    @property
    def cloudinary_enabled(self) -> bool:
        return bool(
            self.cloudinary_cloud_name and self.cloudinary_api_key and self.cloudinary_api_secret
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
