from datetime import datetime


def serialize_domain(document: dict, certificate_count: int = 0) -> dict:
    return {
        "id": str(document["_id"]),
        "name": document["name"],
        "slug": document["slug"],
        "certificate_count": certificate_count,
        "created_at": document.get("created_at", datetime.utcnow()),
    }

