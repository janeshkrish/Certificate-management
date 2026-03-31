from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class VisibilityEnum(str, Enum):
    public = "public"
    private = "private"


class DomainSummary(BaseModel):
    id: str
    name: str
    slug: str


class CertificateCreatePayload(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    domain_id: str = Field(..., min_length=1)
    issuer: str = Field(..., min_length=2, max_length=120)
    issue_date: date
    verification_link: HttpUrl
    description: str = Field(..., min_length=10, max_length=2000)
    visibility: VisibilityEnum = VisibilityEnum.public


class CertificateUpdatePayload(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=120)
    domain_id: str | None = None
    issuer: str | None = Field(default=None, min_length=2, max_length=120)
    issue_date: date | None = None
    verification_link: HttpUrl | None = None
    description: str | None = Field(default=None, min_length=10, max_length=2000)
    visibility: VisibilityEnum | None = None


class CertificateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    certificate_number: str
    title: str
    domain: DomainSummary
    issuer: str
    issue_date: date | None
    file_url: str
    file_public_id: str | None = None
    verification_link: str
    description: str
    visibility: VisibilityEnum
    data_hash: str
    qr_code_data_url: str
    created_at: datetime
    updated_at: datetime

