import base64
import hashlib
import json
import secrets
from datetime import UTC, date, datetime, time
from io import BytesIO

import qrcode
from bson import ObjectId

from app.core.database import get_database


def normalize_issue_date(value: date) -> datetime:
    return datetime.combine(value, time.min, tzinfo=UTC)


def build_certificate_hash_payload(
    *,
    title: str,
    domain_name: str,
    issuer: str,
    issue_date: date,
    verification_link: str,
    description: str,
    visibility: str,
    certificate_number: str,
) -> dict:
    return {
        "certificate_number": certificate_number,
        "title": title,
        "domain": domain_name,
        "issuer": issuer,
        "issue_date": issue_date.isoformat(),
        "verification_link": verification_link,
        "description": description,
        "visibility": visibility,
    }


def compute_sha256(payload: dict) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def generate_qr_code_data_url(value: str) -> str:
    qr_image = qrcode.make(value)
    buffer = BytesIO()
    qr_image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


async def generate_unique_certificate_number() -> str:
    database = get_database()

    while True:
        candidate = f"CERT-{datetime.now(UTC):%Y%m%d}-{secrets.token_hex(3).upper()}"
        existing = await database.certificates.find_one({"certificate_number": candidate})
        if existing is None:
            return candidate


def parse_object_id(value: str, field_name: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise ValueError(f"Invalid {field_name}.")
    return ObjectId(value)

