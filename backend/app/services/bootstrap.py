from datetime import UTC, datetime

from app.core.config import settings
from app.core.database import get_database
from app.core.security import get_password_hash


async def bootstrap_admin_user() -> None:
    database = get_database()
    now = datetime.now(UTC)

    await database.users.update_one(
        {"email": settings.admin_email},
        {
            "$set": {
                "email": settings.admin_email,
                "full_name": settings.admin_full_name,
                "role": "admin",
                "hashed_password": get_password_hash(settings.admin_password),
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )

