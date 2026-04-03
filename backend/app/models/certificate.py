from datetime import date, datetime

from app.services.certificates import generate_qr_code_data_url
from app.services.storage import normalize_storage_asset


def serialize_certificate(document: dict) -> dict:
    issue_date = document.get("issue_date")
    if isinstance(issue_date, datetime):
        issue_date = issue_date.date()
    if not isinstance(issue_date, date):
        issue_date = None

    domain = document.get("domain") or {}
    domain_id = document.get("domain_id")
    if domain_id is not None and "_id" not in domain:
        domain["_id"] = domain_id

    storage_asset = normalize_storage_asset(
        file_url=document.get("file_url"),
        public_id=document.get("file_public_id"),
        resource_type=document.get("file_resource_type"),
        file_format=document.get("file_format"),
        file_version=document.get("file_version"),
    )
    qr_target = document.get("verification_link") or storage_asset["file_url"]
    stored_qr_code = document.get("qr_code_data_url")
    qr_code_data_url = stored_qr_code
    if qr_target and (not stored_qr_code or document.get("verification_link") is None):
        if qr_target != document.get("file_url") or not stored_qr_code:
            qr_code_data_url = generate_qr_code_data_url(qr_target)

    return {
        "id": str(document["_id"]),
        "certificate_number": document["certificate_number"],
        "title": document["title"],
        "domain": {
            "id": str(domain.get("_id")) if domain.get("_id") is not None else "",
            "name": domain.get("name", "Unknown"),
            "slug": domain.get("slug", ""),
        },
        "issuer": document["issuer"],
        "issue_date": issue_date,
        "file_url": storage_asset["file_url"],
        "file_public_id": storage_asset["file_public_id"],
        "file_resource_type": storage_asset["file_resource_type"],
        "file_format": storage_asset["file_format"],
        "verification_link": document.get("verification_link"),
        "description": document["description"],
        "visibility": document["visibility"],
        "data_hash": document["data_hash"],
        "qr_code_data_url": qr_code_data_url or "",
        "created_at": document["created_at"],
        "updated_at": document["updated_at"],
    }
