from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, certificates, domains, profile
from app.core.config import settings
from app.core.database import mongo_manager
from app.services.bootstrap import bootstrap_admin_user


@asynccontextmanager
async def lifespan(_: FastAPI):
    await mongo_manager.connect()
    await bootstrap_admin_user()
    yield
    await mongo_manager.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(domains.router, prefix=settings.api_v1_prefix)
app.include_router(certificates.router, prefix=settings.api_v1_prefix)
app.include_router(profile.router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def healthcheck() -> dict:
    return {"status": "ok", "service": settings.app_name}

