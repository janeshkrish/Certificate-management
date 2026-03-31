from datetime import datetime


def serialize_user(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "email": document["email"],
        "full_name": document["full_name"],
        "role": document["role"],
        "created_at": document.get("created_at", datetime.utcnow()),
    }

