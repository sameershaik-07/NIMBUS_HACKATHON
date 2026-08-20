import json
import os
import boto3
from botocore.exceptions import ClientError


# ============================================================
# AWS CLIENT
# ============================================================

s3 = boto3.client("s3")


# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

DOCUMENT_BUCKET = os.environ.get(
    "DOCUMENT_BUCKET"
)

# Documents published through the admin service
ADMIN_PREFIX = "admin/"


# ============================================================
# COMMON RESPONSE
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
                "OPTIONS,GET"
            )
        },

        "body": json.dumps(body)
    }


# ============================================================
# LIST DOCUMENTS
# ============================================================

def is_knowledge_document(key):
    """
    Include markdown documents that the Knowledge Base indexes:
    the root starter pack and admin-published docs. Exclude
    non-markdown assets and any temp/sync artifacts.
    """
    if not key:
        return False

    if not key.lower().endswith(".md"):
        return False

    # Skip hidden/reserved files.
    basename = key.split("/")[-1]
    if basename.startswith("."):
        return False

    return True


def list_documents():

    try:

        documents = []

        continuation_token = None

        # Scan the whole bucket (the Knowledge Base syncs all
        # markdown, so this mirrors what chat can actually answer
        # from). Documents are returned newest first.
        while True:

            request = {
                "Bucket": DOCUMENT_BUCKET
            }

            if continuation_token:
                request[
                    "ContinuationToken"
                ] = continuation_token

            result = s3.list_objects_v2(
                **request
            )

            for item in result.get(
                "Contents",
                []
            ):

                key = item.get(
                    "Key"
                )

                if not is_knowledge_document(key):
                    continue

                # Display the plain filename, stripping the admin/
                # prefix if present.
                filename = key

                if key.startswith(ADMIN_PREFIX):
                    filename = key[len(ADMIN_PREFIX):]

                last_modified = item.get(
                    "LastModified"
                )

                documents.append(
                    {
                        "filename": filename,

                        "s3Key": key,

                        "size": item.get(
                            "Size",
                            0
                        ),

                        "lastModified": (
                            last_modified.isoformat()
                            if last_modified
                            else None
                        )
                    }
                )

            if not result.get(
                "IsTruncated",
                False
            ):
                break

            continuation_token = result.get(
                "NextContinuationToken"
            )

            if not continuation_token:
                break

        # Newest documents first
        documents.sort(
            key=lambda document: (
                document.get(
                    "lastModified"
                ) or ""
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
            "S3 error:",
            str(error)
        )

        return response(
            500,
            {
                "success": False,
                "error": (
                    "Unable to retrieve "
                    "documents."
                )
            }
        )

    except Exception as error:

        print(
            "Unexpected error:",
            str(error)
        )

        return response(
            500,
            {
                "success": False,
                "error": (
                    "Unexpected error while "
                    "retrieving documents."
                )
            }
        )


# ============================================================
# LAMBDA HANDLER
# ============================================================

def lambda_handler(event, context):

    print(
        "Received documents request"
    )

    # --------------------------------------------------------
    # Configuration check
    # --------------------------------------------------------

    if not DOCUMENT_BUCKET:

        return response(
            500,
            {
                "success": False,
                "error": (
                    "DOCUMENT_BUCKET environment "
                    "variable is not configured."
                )
            }
        )

    # --------------------------------------------------------
    # HTTP method
    # --------------------------------------------------------

    request_context = event.get(
        "requestContext",
        {}
    )

    http = request_context.get(
        "http",
        {}
    )

    method = http.get(
        "method",
        event.get(
            "httpMethod",
            ""
        )
    )

    # --------------------------------------------------------
    # CORS preflight
    # --------------------------------------------------------

    if method == "OPTIONS":

        return response(
            200,
            {
                "success": True
            }
        )

    # --------------------------------------------------------
    # Only GET is allowed
    # --------------------------------------------------------

    if method != "GET":

        return response(
            405,
            {
                "success": False,
                "error": (
                    "Method not allowed."
                )
            }
        )

    # --------------------------------------------------------
    # Get documents
    # --------------------------------------------------------

    return list_documents()