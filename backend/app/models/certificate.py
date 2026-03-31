from datetime import date, datetime


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
        "file_url": document["file_url"],
        "file_public_id": document.get("file_public_id"),
        "verification_link": document["verification_link"],
        "description": document["description"],
        "visibility": document["visibility"],
        "data_hash": document["data_hash"],
        "qr_code_data_url": document["qr_code_data_url"],
        "created_at": document["created_at"],
        "updated_at": document["updated_at"],
    }

