from datetime import UTC, date, datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from pydantic import ValidationError

from app.api.deps import get_current_admin, get_optional_current_user
from app.core.database import get_database
from app.models.certificate import serialize_certificate
from app.schemas.certificate import (
    CertificateCreatePayload,
    CertificateResponse,
    CertificateUpdatePayload,
)
from app.services.certificates import (
    build_certificate_hash_payload,
    compute_sha256,
    generate_qr_code_data_url,
    generate_unique_certificate_number,
    normalize_issue_date,
    parse_object_id,
)
from app.services.storage import delete_file, upload_file


router = APIRouter(prefix="/certificates", tags=["certificates"])


def _validate_upload(upload: UploadFile | None, required: bool = False) -> None:
    if required and upload is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="File is required.")
    if upload is None:
        return

    allowed_types = {
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
    }
    if upload.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, PNG, JPG, and WEBP files are supported.",
        )


async def _fetch_domain(domain_id: str) -> dict:
    database = get_database()
    try:
        object_id = parse_object_id(domain_id, "domain_id")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    domain = await database.domains.find_one({"_id": object_id})
    if domain is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found.")
    return domain


async def _get_certificate_or_404(certificate_id: str) -> dict:
    if not ObjectId.is_valid(certificate_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid certificate id.")

    database = get_database()
    certificate = await database.certificates.find_one({"_id": ObjectId(certificate_id)})
    if certificate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found.")
    return certificate


@router.get("", response_model=list[CertificateResponse])
async def list_certificates(
    domain: str | None = Query(default=None),
    search: str | None = Query(default=None),
    visibility: str | None = Query(default=None),
    user=Depends(get_optional_current_user),
) -> list[CertificateResponse]:
    database = get_database()
    filters: dict = {}

    if user is None:
        filters["visibility"] = "public"
    elif visibility in {"public", "private"}:
        filters["visibility"] = visibility

    if domain:
        domain_doc = await database.domains.find_one({"slug": domain})
        if domain_doc is None:
            return []
        filters["domain_id"] = domain_doc["_id"]

    if search:
        filters["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"issuer": {"$regex": search, "$options": "i"}},
            {"certificate_number": {"$regex": search, "$options": "i"}},
        ]

    pipeline = [
        {"$match": filters},
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
    certificates = await database.certificates.aggregate(pipeline).to_list(length=None)
    return [CertificateResponse.model_validate(serialize_certificate(certificate)) for certificate in certificates]


@router.post("", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
async def create_certificate(
    title: str = Form(...),
    domain_id: str = Form(...),
    issuer: str = Form(...),
    issue_date: date = Form(...),
    verification_link: str = Form(...),
    description: str = Form(...),
    visibility: str = Form("public"),
    file: UploadFile = File(...),
    _admin=Depends(get_current_admin),
) -> CertificateResponse:
    _validate_upload(file, required=True)

    try:
        payload = CertificateCreatePayload.model_validate(
            {
                "title": title,
                "domain_id": domain_id,
                "issuer": issuer,
                "issue_date": issue_date,
                "verification_link": verification_link,
                "description": description,
                "visibility": visibility,
            }
        )
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.errors()) from exc

    domain_record = await _fetch_domain(payload.domain_id)
    storage_result = await upload_file(file)
    certificate_number = await generate_unique_certificate_number()
    hash_payload = build_certificate_hash_payload(
        title=payload.title,
        domain_name=domain_record["name"],
        issuer=payload.issuer,
        issue_date=payload.issue_date,
        verification_link=str(payload.verification_link),
        description=payload.description,
        visibility=payload.visibility.value,
        certificate_number=certificate_number,
    )

    now = datetime.now(UTC)
    document = {
        "certificate_number": certificate_number,
        "title": payload.title,
        "domain_id": domain_record["_id"],
        "issuer": payload.issuer,
        "issue_date": normalize_issue_date(payload.issue_date),
        "file_url": storage_result["file_url"],
        "file_public_id": storage_result["file_public_id"],
        "file_resource_type": storage_result["file_resource_type"],
        "verification_link": str(payload.verification_link),
        "description": payload.description,
        "visibility": payload.visibility.value,
        "data_hash": compute_sha256(hash_payload),
        "qr_code_data_url": generate_qr_code_data_url(str(payload.verification_link)),
        "created_at": now,
        "updated_at": now,
    }

    database = get_database()
    result = await database.certificates.insert_one(document)
    created = await database.certificates.aggregate(
        [
            {"$match": {"_id": result.inserted_id}},
            {
                "$lookup": {
                    "from": "domains",
                    "localField": "domain_id",
                    "foreignField": "_id",
                    "as": "domain",
                }
            },
            {"$unwind": "$domain"},
        ]
    ).to_list(length=1)

    return CertificateResponse.model_validate(serialize_certificate(created[0]))


@router.put("/{certificate_id}", response_model=CertificateResponse)
async def update_certificate(
    certificate_id: str,
    title: str | None = Form(default=None),
    domain_id: str | None = Form(default=None),
    issuer: str | None = Form(default=None),
    issue_date: date | None = Form(default=None),
    verification_link: str | None = Form(default=None),
    description: str | None = Form(default=None),
    visibility: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    _admin=Depends(get_current_admin),
) -> CertificateResponse:
    _validate_upload(file)
    certificate = await _get_certificate_or_404(certificate_id)

    try:
        payload = CertificateUpdatePayload.model_validate(
            {
                "title": title,
                "domain_id": domain_id,
                "issuer": issuer,
                "issue_date": issue_date,
                "verification_link": verification_link,
                "description": description,
                "visibility": visibility,
            }
        )
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.errors()) from exc

    updated_fields: dict = {"updated_at": datetime.now(UTC)}

    if payload.domain_id:
        active_domain = await _fetch_domain(payload.domain_id)
        updated_fields["domain_id"] = active_domain["_id"]
    else:
        active_domain = await _fetch_domain(str(certificate["domain_id"]))

    if payload.title is not None:
        updated_fields["title"] = payload.title
    if payload.issuer is not None:
        updated_fields["issuer"] = payload.issuer
    if payload.issue_date is not None:
        updated_fields["issue_date"] = normalize_issue_date(payload.issue_date)
    if payload.verification_link is not None:
        updated_fields["verification_link"] = str(payload.verification_link)
    if payload.description is not None:
        updated_fields["description"] = payload.description
    if payload.visibility is not None:
        updated_fields["visibility"] = payload.visibility.value

    if file is not None:
        storage_result = await upload_file(file)
        updated_fields["file_url"] = storage_result["file_url"]
        updated_fields["file_public_id"] = storage_result["file_public_id"]
        updated_fields["file_resource_type"] = storage_result["file_resource_type"]

    merged = {**certificate, **updated_fields}
    issue_date_value = merged["issue_date"]
    if isinstance(issue_date_value, datetime):
        issue_date_value = issue_date_value.date()

    verification_link_value = str(merged["verification_link"])
    hash_payload = build_certificate_hash_payload(
        title=merged["title"],
        domain_name=active_domain["name"],
        issuer=merged["issuer"],
        issue_date=issue_date_value,
        verification_link=verification_link_value,
        description=merged["description"],
        visibility=merged["visibility"],
        certificate_number=merged["certificate_number"],
    )
    updated_fields["data_hash"] = compute_sha256(hash_payload)
    updated_fields["qr_code_data_url"] = generate_qr_code_data_url(verification_link_value)

    database = get_database()
    await database.certificates.update_one(
        {"_id": certificate["_id"]},
        {"$set": updated_fields},
    )

    if file is not None:
        await delete_file(certificate.get("file_public_id"), certificate.get("file_resource_type"))

    updated_document = await database.certificates.aggregate(
        [
            {"$match": {"_id": certificate["_id"]}},
            {
                "$lookup": {
                    "from": "domains",
                    "localField": "domain_id",
                    "foreignField": "_id",
                    "as": "domain",
                }
            },
            {"$unwind": "$domain"},
        ]
    ).to_list(length=1)

    return CertificateResponse.model_validate(serialize_certificate(updated_document[0]))


@router.delete("/{certificate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certificate(
    certificate_id: str,
    _admin=Depends(get_current_admin),
) -> None:
    certificate = await _get_certificate_or_404(certificate_id)
    database = get_database()
    await database.certificates.delete_one({"_id": certificate["_id"]})
    await delete_file(certificate.get("file_public_id"), certificate.get("file_resource_type"))

