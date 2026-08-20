import json
import os
import re
import base64
import email.utils

import boto3
from botocore.exceptions import ClientError


# ============================================================
# ENVIRONMENT CONFIGURATION
# ============================================================

DOCUMENT_BUCKET = os.environ.get(
    "DOCUMENT_BUCKET",
    "nimbus-hackathon"
)

KNOWLEDGE_BASE_ID = os.environ.get(
    "KNOWLEDGE_BASE_ID",
    "904AVL0E51"
)

DATA_SOURCE_ID = os.environ.get(
    "DATA_SOURCE_ID",
    "6MRVYBBUJK"
)

# Documents published through the admin service are stored here.
ADMIN_PREFIX = "admin/"

# A single flat filename is required. This rejects path traversal
# ("..", "/", "\"), absolute paths, and hidden/reserved names.
SAFE_FILENAME_RE = re.compile(
    r"^[A-Za-z0-9][A-Za-z0-9 _\-\.]*$"
)

# Maximum acceptable size for pasted content (in characters).
MAX_CONTENT_CHARS = 200_000

REGION = os.environ.get(
    "AWS_REGION",
    "us-east-1"
)


# ============================================================
# AWS CLIENTS
# ============================================================

s3 = boto3.client(
    "s3",
    region_name=REGION
)

bedrock_agent = boto3.client(
    "bedrock-agent",
    region_name=REGION
)


# ============================================================
# AUTHENTICATION (Cognito JWT)
# ============================================================

def get_authenticated_user(event):

    if not isinstance(event, dict):
        return None

    request_context = event.get(
        "requestContext",
        {}
    )

    authorizer = request_context.get(
        "authorizer",
        {}
    )

    jwt = authorizer.get(
        "jwt",
        {}
    )

    claims = jwt.get(
        "claims",
        {}
    )

    if not claims:
        return None

    user_id = claims.get("sub")

    if not user_id:
        return None

    groups = claims.get(
        "cognito:groups",
        []
    )

    if isinstance(groups, str):
        groups = [groups]

    return {
        "userId": user_id,
        "username": claims.get(
            "cognito:username"
        ),
        "email": claims.get(
            "email"
        ),
        "groups": groups
    }


# ============================================================
# RESPONSE HELPER
# ============================================================

def response(status_code, body):

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": (
                "Content-Type,Authorization"
            ),
            "Access-Control-Allow-Methods": (
                "OPTIONS,GET,POST"
            )
        },
        "body": json.dumps(body)
    }


# ============================================================
# FILENAME VALIDATION
# ============================================================

def sanitize_filename(raw_filename):

    if not isinstance(raw_filename, str):
        return None

    filename = raw_filename.strip().strip("/")

    if not filename:
        return None

    # Reject path traversal & absolute paths.
    if (
        ".." in filename
        or "/" in filename
        or "\\" in filename
        or filename.startswith(".")
    ):
        return None

    # Normalise to lowercase .md extension.
    base = filename

    if not base.lower().endswith(".md"):
        base = f"{base}.md"

    if not SAFE_FILENAME_RE.match(base):
        return None

    return base


# ============================================================
# PUBLISH DOCUMENT
# ============================================================

def publish_document(user, body):

    filename = sanitize_filename(
        body.get("filename")
    )

    if not filename:

        return response(
            400,
            {
                "success": False,
                "error": (
                    "Invalid filename. Use a plain name with "
                    "letters, numbers, dashes, underscores, or "
                    "dots only (e.g. 10-team-roster.md)."
                ),
                "details": (
                    "Path separators and '..' are not allowed."
                )
            }
        )

    # Accept either plain text ("content") or base64 ("contentBase64")
    # so both pasted and uploaded files work.
    content = body.get("content")

    if content is None:
        encoded = body.get("contentBase64")

        if isinstance(encoded, str):
            try:
                content = base64.b64decode(
                    encoded,
                    validate=False
                ).decode("utf-8")
            except Exception as error:
                return response(
                    400,
                    {
                        "success": False,
                        "error": (
                            "Uploaded file could not be decoded. "
                            "Ensure it is base64 UTF-8 text."
                        ),
                        "details": str(error)
                    }
                )

    if not isinstance(content, str) or not content.strip():

        return response(
            400,
            {
                "success": False,
                "error": (
                    "Document content is required and cannot "
                    "be empty."
                )
            }
        )

    if len(content) > MAX_CONTENT_CHARS:

        return response(
            413,
            {
                "success": False,
                "error": (
                    "Document is too large. The maximum is "
                    f"{MAX_CONTENT_CHARS:,} characters."
                )
            }
        )

    s3_key = f"{ADMIN_PREFIX}{filename}"

    try:

        s3.put_object(
            Bucket=DOCUMENT_BUCKET,
            Key=s3_key,
            Body=content.encode("utf-8"),
            ContentType="text/markdown",
            Metadata={
                "publishedBy": user.get("userId", "unknown"),
                "publishedAt": email.utils.formatdate(
                    usegmt=True
                )
            }
        )

    except ClientError as error:

        print(
            "S3 publish error:",
            str(error)
        )

        return response(
            500,
            {
                "success": False,
                "error": (
                    "Unable to save the document. "
                    "Please try again."
                ),
                "details": str(error)
            }
        )

    # Trigger Knowledge Base re-index so the new or updated
    # content becomes searchable (~30-60s on a managed KB).
    ingestion_job_id = trigger_ingestion()

    return response(
        200,
        {
            "success": True,
            "message": (
                "Document published. It will be searchable "
                "within about 60 seconds."
            ),
            "filename": filename,
            "s3Key": s3_key,
            "publishedAt": email.utils.formatdate(
                usegmt=True
            ),
            "ingestionJobId": ingestion_job_id
        }
    )


# ============================================================
# RE-INDEX KNOWLEDGE BASE
# ============================================================

def trigger_ingestion():

    try:

        result = bedrock_agent.start_ingestion_job(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            dataSourceId=DATA_SOURCE_ID,
            description=(
                "Admin document publish triggered re-index"
            )
        )

        job = result.get(
            "ingestionJob",
            {}
        )

        job_id = job.get("ingestionJobId")

        print(
            "Started ingestion job:",
            job_id,
            "status:",
            job.get("status")
        )

        return job_id

    except ClientError as error:

        print(
            "Ingestion trigger error:",
            str(error)
        )

        return None


# ============================================================
# LIST ADMIN-PUBLISHED DOCUMENTS
# ============================================================

def list_admin_documents():

    documents = []

    continuation_token = None

    try:

        while True:

            request = {
                "Bucket": DOCUMENT_BUCKET,
                "Prefix": ADMIN_PREFIX
            }

            if continuation_token:
                request["ContinuationToken"] = continuation_token

            result = s3.list_objects_v2(**request)

            for item in result.get("Contents", []):

                key = item.get("Key")

                if not key or key == ADMIN_PREFIX:
                    continue

                filename = key[len(ADMIN_PREFIX):]

                last_modified = item.get(
                    "LastModified"
                )

                documents.append({
                    "filename": filename,
                    "s3Key": key,
                    "size": item.get("Size", 0),
                    "publishedAt": (
                        last_modified.isoformat()
                        if last_modified
                        else None
                    )
                })

            if not result.get("IsTruncated", False):
                break

            continuation_token = result.get(
                "NextContinuationToken"
            )

            if not continuation_token:
                break

        documents.sort(
            key=lambda document: (
                document.get("publishedAt") or ""
            ),
            reverse=True
        )

        return response(
            200,
            {
                "success": True,
                "documents": documents,
                "count": len(documents)
            }
        )

    except ClientError as error:

        print(
            "S3 list error:",
            str(error)
        )

        return response(
            500,
            {
                "success": False,
                "error": (
                    "Unable to retrieve published documents."
                ),
                "details": str(error)
            }
        )


# ============================================================
# LAMBDA HANDLER
# ============================================================

def lambda_handler(event, context):

    user = get_authenticated_user(event)

    if not user:

        return response(
            401,
            {
                "success": False,
                "error": "Authentication required."
            }
        )

    groups = user.get("groups", [])

    if "ADMIN" not in groups:

        return response(
            403,
            {
                "success": False,
                "error": "Administrator access required."
            }
        )

    request_context = event.get("requestContext", {})

    http = request_context.get("http", {})

    method = http.get(
        "method",
        event.get("httpMethod", "")
    ).upper()

    if method == "OPTIONS":

        return response(
            200,
            {
                "success": True
            }
        )

    if method == "GET":

        return list_admin_documents()

    if method == "POST":

        body = event.get("body")

        if isinstance(body, str):

            try:
                body = json.loads(body or "{}")
            except json.JSONDecodeError:
                return response(
                    400,
                    {
                        "success": False,
                        "error": (
                            "Request body must be valid JSON."
                        )
                    }
                )

        if not isinstance(body, dict):

            return response(
                400,
                {
                    "success": False,
                    "error": (
                        "Request body must be a JSON object."
                    )
                }
            )

        return publish_document(user, body)

    return response(
        405,
        {
            "success": False,
            "error": "Method not allowed."
        }
    )

