from pydantic import BaseModel

from app.schemas.certificate import CertificateResponse
from app.schemas.domain import DomainResponse


class ProfileStats(BaseModel):
    total_certificates: int
    public_certificates: int
    domains: int


class ProfileResponse(BaseModel):
    owner_name: str
    headline: str
    bio: str
    stats: ProfileStats
    domains: list[DomainResponse]
    certificates: list[CertificateResponse]
