# MongoDB Schema

## Database

- `certificate_management`

## Collections

### `users`

```json
{
  "_id": "ObjectId",
  "email": "string",
  "full_name": "string",
  "role": "admin",
  "hashed_password": "bcrypt hash",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Indexes:

- `email` unique
- `role`

### `domains`

```json
{
  "_id": "ObjectId",
  "name": "string",
  "slug": "string",
  "created_at": "datetime"
}
```

Indexes:

- `name` unique
- `slug` unique

### `certificates`

```json
{
  "_id": "ObjectId",
  "certificate_number": "string",
  "title": "string",
  "domain_id": "ObjectId",
  "issuer": "string",
  "issue_date": "datetime",
  "file_url": "string",
  "file_public_id": "string",
  "file_resource_type": "string",
  "verification_link": "string",
  "description": "string",
  "visibility": "public | private",
  "data_hash": "sha256 hex string",
  "qr_code_data_url": "base64 png data url",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Indexes:

- `certificate_number` unique
- `domain_id`
- `visibility`
- `issue_date`

