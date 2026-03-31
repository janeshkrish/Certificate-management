from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings


class MongoManager:
    def __init__(self) -> None:
        self.client: AsyncIOMotorClient | None = None
        self.database: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        self.client = AsyncIOMotorClient(settings.mongo_uri)
        self.database = self.client[settings.mongo_db]
        await self.ensure_indexes()

    async def close(self) -> None:
        if self.client is not None:
            self.client.close()
            self.client = None
            self.database = None

    async def ensure_indexes(self) -> None:
        if self.database is None:
            return

        await self.database.users.create_index("email", unique=True)
        await self.database.users.create_index("role")

        await self.database.domains.create_index("name", unique=True)
        await self.database.domains.create_index("slug", unique=True)

        await self.database.certificates.create_index("certificate_number", unique=True)
        await self.database.certificates.create_index("domain_id")
        await self.database.certificates.create_index("visibility")
        await self.database.certificates.create_index("issue_date")

    def get_database(self) -> AsyncIOMotorDatabase:
        if self.database is None:
            raise RuntimeError("Database has not been initialized.")
        return self.database


mongo_manager = MongoManager()


def get_database() -> AsyncIOMotorDatabase:
    return mongo_manager.get_database()

