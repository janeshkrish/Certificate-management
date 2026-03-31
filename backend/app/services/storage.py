import io
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from anyio import to_thread
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


if settings.cloudinary_enabled:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


def _upload_bytes(content: bytes, filename: str, folder: str) -> dict:
    upload_result = cloudinary.uploader.upload(
        io.BytesIO(content),
        folder=folder,
        public_id=f"{filename.rsplit('.', 1)[0]}-{uuid4().hex}",
        resource_type="auto",
        use_filename=True,
        unique_filename=False,
        overwrite=True,
        format=None,
    )
    return {
        "file_url": upload_result["secure_url"],
        "file_public_id": upload_result["public_id"],
        "file_resource_type": upload_result.get("resource_type", "image"),
    }


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

