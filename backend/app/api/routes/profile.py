from fastapi import APIRouter

from app.core.config import settings
from app.core.database import get_database
from app.models.certificate import serialize_certificate
from app.models.domain import serialize_domain
from app.schemas.certificate import CertificateResponse
from app.schemas.domain import DomainResponse
from app.schemas.profile import ProfileResponse, ProfileStats


router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
async def get_public_profile() -> ProfileResponse:
    database = get_database()
    certificates = await database.certificates.aggregate(
        [
            {"$match": {"visibility": "public"}},
            {
                "$lookup": {
                    "from": "domains",
                    "localField": "domain_id",
                    "foreignField": "_id",
                    "as": "domain",
                }
            },
            {"$unwind": "$domain"},
            {"$sort": {"issue_date": -1, "created_at": -1}},
        ]
    ).to_list(length=None)

    domains = await database.domains.find().sort("name", 1).to_list(length=None)
    counts = await database.certificates.aggregate(
        [
            {"$match": {"visibility": "public"}},
            {"$group": {"_id": "$domain_id", "count": {"$sum": 1}}},
        ]
    ).to_list(length=None)
    count_map = {str(item["_id"]): item["count"] for item in counts}

    return ProfileResponse(
        owner_name=settings.profile_owner_name,
        headline=settings.profile_headline,
        bio=settings.profile_bio,
        stats=ProfileStats(
            total_certificates=len(certificates),
            public_certificates=len(certificates),
            domains=len(domains),
        ),
        domains=[
            DomainResponse.model_validate(
                serialize_domain(domain, certificate_count=count_map.get(str(domain["_id"]), 0))
            )
            for domain in domains
        ],
        certificates=[
            CertificateResponse.model_validate(serialize_certificate(certificate))
            for certificate in certificates
        ],
    )
