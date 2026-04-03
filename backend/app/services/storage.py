import io
from pathlib import PurePosixPath
from urllib.parse import quote, urlparse
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from anyio import to_thread
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


ALLOWED_UPLOAD_CONTENT_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
}
ALLOWED_UPLOAD_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
}
IMAGE_FILE_FORMATS = {"png", "jpg", "jpeg", "webp", "gif", "bmp", "svg", "avif"}


if settings.cloudinary_enabled:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


def get_supported_file_format(filename: str | None) -> str | None:
    if not filename:
        return None

    suffix = PurePosixPath(filename).suffix.lower()
    if suffix not in ALLOWED_UPLOAD_EXTENSIONS:
        return None
    if suffix == ".jpeg":
        return "jpg"
    return suffix.lstrip(".")


def _extract_asset_metadata_from_url(file_url: str | None) -> dict:
    if not file_url:
        return {}

    parsed = urlparse(file_url)
    if "res.cloudinary.com" not in parsed.netloc:
        return {}

    segments = [segment for segment in parsed.path.split("/") if segment]
    if len(segments) < 4:
        return {}

    delivery_segments = segments[3:]
    version = None
    version_index = next(
        (
            index
            for index, segment in enumerate(delivery_segments)
            if segment.startswith("v") and segment[1:].isdigit()
        ),
        None,
    )

    if version_index is not None:
        version = delivery_segments[version_index][1:]
        public_id_segments = delivery_segments[version_index + 1 :]
    else:
        public_id_segments = delivery_segments

    if not public_id_segments:
        return {"file_resource_type": segments[1]}

    last_segment = public_id_segments[-1]
    last_path = PurePosixPath(last_segment)
    file_format = last_path.suffix.lower().lstrip(".") or None
    public_id_segments[-1] = last_path.stem if last_path.suffix else last_segment

    return {
        "file_public_id": "/".join(public_id_segments),
        "file_resource_type": segments[1],
        "file_format": "jpg" if file_format == "jpeg" else file_format,
        "file_version": version,
    }


def _normalize_file_format(
    file_format: str | None,
    *,
    filename: str | None = None,
    file_url: str | None = None,
) -> str | None:
    for candidate in (
        file_format,
        get_supported_file_format(filename),
        _extract_asset_metadata_from_url(file_url).get("file_format"),
    ):
        if not candidate:
            continue

        normalized = str(candidate).strip().lower().lstrip(".")
        return "jpg" if normalized == "jpeg" else normalized

    return None


def _normalize_resource_type(
    resource_type: str | None,
    *,
    file_format: str | None = None,
    file_url: str | None = None,
) -> str:
    normalized = str(resource_type or "").strip().lower()
    if normalized not in {"image", "raw"}:
        normalized = str(
            _extract_asset_metadata_from_url(file_url).get("file_resource_type") or ""
        ).strip().lower()

    if normalized in {"image", "raw"}:
        return normalized
    if file_format == "pdf":
        return "raw"
    if file_format in IMAGE_FILE_FORMATS:
        return "image"
    return "image"


def build_public_delivery_url(
    *,
    public_id: str | None,
    resource_type: str | None,
    file_format: str | None = None,
    version: str | int | None = None,
    fallback_url: str | None = None,
) -> str:
    if not settings.cloudinary_cloud_name or not public_id:
        return fallback_url or ""

    encoded_public_id = quote(public_id, safe="/")
    version_value = str(version).strip() if version is not None else ""
    version_segment = f"v{version_value}/" if version_value else ""
    extension_segment = f".{file_format}" if file_format else ""

    return (
        f"https://res.cloudinary.com/{settings.cloudinary_cloud_name}/"
        f"{resource_type or 'image'}/upload/{version_segment}{encoded_public_id}{extension_segment}"
    )


def normalize_storage_asset(
    *,
    file_url: str | None,
    public_id: str | None,
    resource_type: str | None,
    file_format: str | None = None,
    file_version: str | int | None = None,
    filename: str | None = None,
) -> dict:
    url_metadata = _extract_asset_metadata_from_url(file_url)
    normalized_public_id = public_id or url_metadata.get("file_public_id")
    normalized_file_format = _normalize_file_format(
        file_format or url_metadata.get("file_format"),
        filename=filename,
        file_url=file_url,
    )
    normalized_resource_type = _normalize_resource_type(
        resource_type or url_metadata.get("file_resource_type"),
        file_format=normalized_file_format,
        file_url=file_url,
    )
    normalized_file_version = file_version or url_metadata.get("file_version")
    normalized_url = build_public_delivery_url(
        public_id=normalized_public_id,
        resource_type=normalized_resource_type,
        file_format=normalized_file_format,
        version=normalized_file_version,
        fallback_url=file_url,
    )

    return {
        "file_url": normalized_url,
        "file_public_id": normalized_public_id,
        "file_resource_type": normalized_resource_type,
        "file_format": normalized_file_format,
        "file_version": normalized_file_version,
    }


def _upload_bytes(content: bytes, filename: str, folder: str) -> dict:
    upload_result = cloudinary.uploader.upload(
        io.BytesIO(content),
        folder=folder,
        public_id=f"{filename.rsplit('.', 1)[0]}-{uuid4().hex}",
        resource_type="auto",
        type="upload",
        access_mode="public",
        use_filename=True,
        unique_filename=False,
        overwrite=True,
        format=None,
    )
    return normalize_storage_asset(
        file_url=upload_result.get("secure_url"),
        public_id=upload_result.get("public_id"),
        resource_type=upload_result.get("resource_type"),
        file_format=upload_result.get("format"),
        file_version=upload_result.get("version"),
        filename=filename,
    )


async def upload_file(upload: UploadFile) -> dict:
    if not settings.cloudinary_enabled:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary is not configured. Set Cloudinary environment variables first.",
        )

    content = await upload.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    return await to_thread.run_sync(
        _upload_bytes,
        content,
        upload.filename or "certificate",
        settings.cloudinary_folder,
    )


def _destroy_file(public_id: str, resource_type: str) -> None:
    cloudinary.uploader.destroy(public_id, resource_type=resource_type, invalidate=True)


async def delete_file(public_id: str | None, resource_type: str | None) -> None:
    if not public_id or not resource_type or not settings.cloudinary_enabled:
        return
    await to_thread.run_sync(_destroy_file, public_id, resource_type)
