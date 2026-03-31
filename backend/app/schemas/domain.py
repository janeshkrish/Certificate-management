from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DomainCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)


class DomainResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    certificate_count: int = 0
    created_at: datetime

