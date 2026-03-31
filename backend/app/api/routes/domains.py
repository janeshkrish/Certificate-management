from datetime import UTC, datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from slugify import slugify

from app.api.deps import get_current_admin, get_optional_current_user
from app.core.database import get_database
from app.models.domain import serialize_domain
from app.schemas.domain import DomainCreate, DomainResponse


router = APIRouter(prefix="/domains", tags=["domains"])


@router.get("", response_model=list[DomainResponse])
async def list_domains(user=Depends(get_optional_current_user)) -> list[DomainResponse]:
    database = get_database()
    domains = await database.domains.find().sort("name", 1).to_list(length=None)
    visibility_filter = {} if user else {"visibility": "public"}

    counts = await database.certificates.aggregate(
        [
            {"$match": visibility_filter},
            {"$group": {"_id": "$domain_id", "count": {"$sum": 1}}},
        ]
    ).to_list(length=None)
    count_map = {str(item["_id"]): item["count"] for item in counts}

    return [
        DomainResponse.model_validate(
            serialize_domain(domain, certificate_count=count_map.get(str(domain["_id"]), 0))
        )
        for domain in domains
    ]


@router.post("", response_model=DomainResponse, status_code=status.HTTP_201_CREATED)
async def create_domain(
    payload: DomainCreate,
    _admin=Depends(get_current_admin),
) -> DomainResponse:
    database = get_database()
    slug = slugify(payload.name)
    existing = await database.domains.find_one({"$or": [{"name": payload.name}, {"slug": slug}]})
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A domain with the same name already exists.",
        )

    document = {
        "name": payload.name,
        "slug": slug,
        "created_at": datetime.now(UTC),
    }
    result = await database.domains.insert_one(document)
    created = await database.domains.find_one({"_id": result.inserted_id})
    return DomainResponse.model_validate(serialize_domain(created))


@router.delete("/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_domain(domain_id: str, _admin=Depends(get_current_admin)) -> None:
    if not ObjectId.is_valid(domain_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid domain id.")

    database = get_database()
    domain_object_id = ObjectId(domain_id)
    related_certificates = await database.certificates.count_documents({"domain_id": domain_object_id})
    if related_certificates > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Delete certificates in this domain before removing the domain.",
        )

    result = await database.domains.delete_one({"_id": domain_object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found.")

