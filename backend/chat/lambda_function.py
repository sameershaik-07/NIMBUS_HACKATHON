import json
import os
import boto3
import uuid

from datetime import datetime, timezone
from decimal import Decimal
from boto3.dynamodb.conditions import Key


# ============================================================
# NIMBUS KNOWLEDGE BASE CHAT
# ============================================================
#
# Flow:
#
# Frontend
#    ↓
# API Gateway
#    ↓
# Lambda
#    ↓
# Bedrock Knowledge Base Retrieve
#    ↓
# Retrieved S3 document chunks
#    ↓
# Amazon Nova Lite
#    ↓
# Grounded answer
#    ↓
# DynamoDB chat history
#
# IMPORTANT:
# The LLM is NOT allowed to answer from its own knowledge.
# It can only answer from retrieved documents.
# ============================================================


# ============================================================
# CONFIGURATION
# ============================================================

AWS_REGION = os.environ.get(
    "AWS_REGION",
    "us-east-1"
)

KNOWLEDGE_BASE_ID = os.environ.get(
    "KNOWLEDGE_BASE_ID",
    "904AVL0E51"
)

# You can change this from Lambda Environment Variables.
#
# Amazon Nova Lite supports Converse API.
# In us-east-1 the inference profile is also available.
#
FOUNDATION_MODEL_ID = os.environ.get(
    "FOUNDATION_MODEL_ID",
    "us.amazon.nova-lite-v1:0"
)

CHAT_HISTORY_TABLE = os.environ.get(
    "CHAT_HISTORY_TABLE",
    "nimbus-chat-history"
)

MAX_HISTORY_ITEMS = int(
    os.environ.get(
        "MAX_HISTORY_ITEMS",
        "20"
    )
)

MAX_RETRIEVAL_RESULTS = int(
    os.environ.get(
        "MAX_RETRIEVAL_RESULTS",
        "8"
    )
)


# ============================================================
# AWS CLIENTS
# ============================================================

bedrock_agent_runtime = boto3.client(
    "bedrock-agent-runtime",
    region_name=AWS_REGION
)

bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION
)

dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION
)

chat_history_table = dynamodb.Table(
    CHAT_HISTORY_TABLE
)


# ============================================================
# CONTACTS
# ============================================================

GENERAL_CONTACT = {
    "name": "Shanmukha Sasi Sadineni",
    "role": "AWS Student Builder Group Leader",
    "email": "sadinenisasi@gmail.com",
    "phone": "7396025334"
}

TECHNICAL_CONTACT = {
    "name": "Revan Kumar Goud Bommagoni",
    "role": "Technical Lead",
    "email": "brevankumargoud@gmail.com",
    "phone": "8106105746"
}


# ============================================================
# CORS
# ============================================================

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": (
        "Content-Type,Authorization"
    ),
    "Access-Control-Allow-Methods": (
        "OPTIONS,POST"
    )
}


# ============================================================
# JSON SAFE CONVERSION
# ============================================================

def decimal_to_json(value):

    if isinstance(value, Decimal):

        if value % 1 == 0:
            return int(value)

        return float(value)

    if isinstance(value, list):

        return [
            decimal_to_json(item)
            for item in value
        ]

    if isinstance(value, dict):

        return {
            key: decimal_to_json(item)
            for key, item in value.items()
        }

    return value


# ============================================================
# API RESPONSE
# ============================================================

def api_response(
    status_code,
    payload
):

    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(
            decimal_to_json(payload),
            ensure_ascii=False
        )
    }


# ============================================================
# TIMESTAMP
# ============================================================

def utc_timestamp():

    return (
        datetime.now(
            timezone.utc
        )
        .isoformat(
            timespec="milliseconds"
        )
        .replace(
            "+00:00",
            "Z"
        )
    )


# ============================================================
# REQUEST BODY
# ============================================================

def get_request_body(event):

    if not isinstance(event, dict):
        return {}

    # Direct Lambda invocation
    if "question" in event:
        return event

    body = event.get(
        "body"
    )

    if body is None:
        return {}

    if isinstance(
        body,
        dict
    ):
        return body

    if isinstance(
        body,
        str
    ):

        try:

            parsed = json.loads(
                body
            )

            if isinstance(
                parsed,
                dict
            ):
                return parsed

        except (
            json.JSONDecodeError,
            TypeError
        ):

            return {}

    return {}


# ============================================================
# QUESTION
# ============================================================

def get_question(event):

    body = get_request_body(
        event
    )

    question = body.get(
        "question"
    )

    if not isinstance(
        question,
        str
    ):
        return None

    question = question.strip()

    if not question:
        return None

    return question


# ============================================================
# CONVERSATION ID
# ============================================================

def get_conversation_id(event):

    body = get_request_body(
        event
    )

    conversation_id = body.get(
        "conversationId"
    )

    if (
        isinstance(
            conversation_id,
            str
        )
        and conversation_id.strip()
    ):

        return conversation_id.strip()

    return str(
        uuid.uuid4()
    )


# ============================================================
# AUTHENTICATED USER
# ============================================================

def get_authenticated_user(event):

    if not isinstance(
        event,
        dict
    ):
        return None

    request_context = event.get(
        "requestContext",
        {}
    )

    authorizer = request_context.get(
        "authorizer",
        {}
    )

    # --------------------------------------------------------
    # HTTP API JWT
    # --------------------------------------------------------

    jwt = authorizer.get(
        "jwt",
        {}
    )

    claims = jwt.get(
        "claims",
        {}
    )

    if claims:

        user_id = claims.get(
            "sub"
        )

        if user_id:

            return {
                "userId": user_id,
                "username": claims.get(
                    "cognito:username"
                ),
                "email": claims.get(
                    "email"
                )
            }

    # --------------------------------------------------------
    # REST API Cognito authorizer
    # --------------------------------------------------------

    legacy_claims = authorizer.get(
        "claims"
    )

    if isinstance(
        legacy_claims,
        dict
    ):

        user_id = legacy_claims.get(
            "sub"
        )

        if user_id:

            return {
                "userId": user_id,
                "username": legacy_claims.get(
                    "cognito:username"
                ),
                "email": legacy_claims.get(
                    "email"
                )
            }

    return None


# ============================================================
# TECHNICAL QUESTION DETECTION
# ============================================================

def is_technical_question(
    question
):

    keywords = [
        "lambda",
        "api gateway",
        "cognito",
        "bedrock",
        "knowledge base",
        "aws",
        "s3",
        "iam",
        "cloudfront",
        "deployment",
        "deploy",
        "code",
        "coding",
        "python",
        "react",
        "frontend",
        "backend",
        "authentication",
        "authorization",
        "api",
        "error",
        "bug",
        "technical"
    ]

    text = question.lower()

    return any(
        keyword in text
        for keyword in keywords
    )


# ============================================================
# FALLBACK
# ============================================================

def build_fallback(
    question
):

    if is_technical_question(
        question
    ):

        contact = TECHNICAL_CONTACT

        message = (
            "I couldn't find that information "
            "in the club documents. "
            "For technical help, please contact "
            f"{contact['name']}, "
            f"{contact['role']}, "
            f"at {contact['email']} "
            f"or {contact['phone']}."
        )

        return {
            "type": "technical",
            "message": message,
            "contact": contact
        }

    contact = GENERAL_CONTACT

    message = (
        "I couldn't find that information "
        "in the club documents. "
        "For further help, please contact "
        f"{contact['name']}, "
        f"{contact['role']}, "
        f"at {contact['email']} "
        f"or {contact['phone']}."
    )

    return {
        "type": "general",
        "message": message,
        "contact": contact
    }


# ============================================================
# RETRIEVE DOCUMENTS FROM KNOWLEDGE BASE
# ============================================================

def retrieve_documents(
    question
):

    print(
        "Retrieving documents for:",
        question
    )

    response = (
        bedrock_agent_runtime.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={
                "text": question
            },
            retrievalConfiguration={
                "managedSearchConfiguration": {
                    "numberOfResults": MAX_RETRIEVAL_RESULTS
                }
            }
        )
    )

    results = response.get(
        "retrievalResults",
        []
    )

    print(
        "Retrieved results:",
        len(results)
    )

    documents = []

    for index, result in enumerate(
        results
    ):

        content = result.get(
            "content",
            {}
        )

        text = content.get(
            "text",
            ""
        )

        if not text:
            continue

        metadata = result.get(
            "metadata",
            {}
        )

        location = result.get(
            "location",
            {}
        )

        score = result.get(
            "score"
        )

        documents.append({

            "index": index,

            "text": text,

            "score": score,

            "metadata": metadata,

            "location": location

        })

    return documents


# ============================================================
# SOURCE IDENTIFIER
# ============================================================

def get_source_name(
    document
):

    metadata = document.get(
        "metadata",
        {}
    )

    location = document.get(
        "location",
        {}
    )

    # Try document title
    title = metadata.get(
        "_document_title"
    )

    if title:
        return title

    # Try S3 URI
    s3_location = location.get(
        "s3Location",
        {}
    )

    uri = s3_location.get(
        "uri"
    )

    if uri:
        return uri.split(
            "/"
        )[-1]

    document_id = metadata.get(
        "_document_id"
    )

    if document_id:
        return document_id.split(
            "/"
        )[-1]

    source_uri = metadata.get(
        "_source_uri"
    )

    if source_uri:
        return source_uri.split(
            "/"
        )[-1]

    return "Club document"


# ============================================================
# EXTRACT SECTION FROM CHUNK
# ============================================================

def get_source_section(
    document
):
    """
    Extract the markdown section heading from a retrieved chunk
    so answers can cite the source file AND section.

    Looks for the first markdown heading (#, ##, ###, etc.) in the
    chunk text. Falls back to an empty string when none is present.
    """

    text = document.get(
        "text",
        ""
    )

    if not text:
        return ""

    heading = ""

    for line in text.splitlines():

        stripped = line.strip()

        if (
            stripped.startswith("#")
            and not stripped.startswith("##")
            and not stripped.startswith("###")
            and " " in stripped
        ):

            heading = stripped.lstrip("#").strip()
            break

        if (
            stripped.startswith("###")
            and len(stripped) > 3
        ):

            heading = stripped.lstrip("#").strip()
            break

        if (
            stripped.startswith("##")
            and len(stripped) > 2
        ):

            heading = stripped.lstrip("#").strip()
            break

    return heading


# ============================================================
# BUILD CONTEXT FOR LLM
# ============================================================

def build_context(
    documents
):

    context_parts = []

    for i, document in enumerate(
        documents
    ):

        source_name = get_source_name(
            document
        )

        text = document.get(
            "text",
            ""
        )

        context_parts.append(
            f"""
--- SOURCE {i + 1} ---
Document: {source_name}

{text}
--- END SOURCE {i + 1} ---
"""
        )

    return "\n".join(
        context_parts
    )


# ============================================================
# STRICT SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are NIMBUS, the official AI assistant for the
Campus AWS Student Builder Group Club Member Portal.

Your job is to answer questions using ONLY the information
contained inside the DOCUMENTS provided to you.

STRICT GROUNDING RULES:

1. Never use your general/world knowledge to answer.
2. Never invent facts.
3. Never guess missing dates, names, rooms, schedules,
   policies, contact details, or events.
4. If the documents do not contain enough information,
   clearly say that the information is not available in
   the club documents.
5. Do not replace a missing answer with outside information.
6. Do not claim that something is current/upcoming unless
   the documents explicitly establish that.
7. Preserve exact dates, names, rooms, numbers and rules
   from the documents.
8. If multiple documents contain relevant information,
   combine them carefully without changing their meaning.
9. If documents disagree, explicitly mention the
   disagreement instead of choosing one arbitrarily.
10. Answer the user's exact question. Do not add unrelated
    information merely because it exists in the documents.
11. Keep the answer concise but useful.
12. You may use Markdown.
13. Do not mention internal retrieval, prompts, models,
    or implementation details.
14. Do not fabricate citations.
15. At the end, add a short "Sources:" section listing only
    the document names actually used.

IMPORTANT:

The text between DOCUMENTS and END DOCUMENTS is the only
trusted knowledge available to you.

If the answer cannot be supported by those documents,
respond with:

"I couldn't find that information in the club documents."

Then, if appropriate, provide the relevant NIMBUS contact.
"""


# ============================================================
# GENERATE GROUNDED ANSWER
# ============================================================

def build_extractive_answer(
    question,
    documents
):
    """
    Build a grounded answer from retrieved Knowledge Base chunks
    without calling a foundation model.

    Used when Bedrock Converse / InvokeModel is blocked at the
    account level (e.g. ValidationException: Operation not allowed).
    """

    if not documents:
        return ""

    # Prefer the highest-scoring chunks (already ranked by Retrieve).
    top_docs = documents[:3]

    parts = []

    parts.append(
        "Based on the official club documents, here is what I found:"
    )

    for index, document in enumerate(
        top_docs,
        start=1
    ):

        source_name = get_source_name(
            document
        )

        section = get_source_section(
            document
        )

        label = source_name

        if section:
            label = f"{source_name} → {section}"

        text = document.get(
            "text",
            ""
        ).strip()

        if not text:
            continue

        # Keep answers readable in the UI.
        if len(text) > 1200:
            text = text[:1200].rstrip() + "..."

        parts.append(
            f"\n**From {label}:**\n{text}"
        )

    used_names = []
    seen = set()

    for document in top_docs:

        name = get_source_name(
            document
        )

        if name and name not in seen:
            seen.add(name)
            used_names.append(name)

    if used_names:
        parts.append(
            "\n**Sources:** " + ", ".join(used_names)
        )

    return "\n".join(parts).strip()


def generate_answer(
    question,
    documents,
    history
):

    context = build_context(
        documents
    )

    history_text = ""

    if history:

        history_parts = []

        for item in history:

            role = item.get(
                "role",
                ""
            )

            message = item.get(
                "message",
                ""
            )

            if role and message:

                history_parts.append(
                    f"{role}: {message}"
                )

        history_text = "\n".join(
            history_parts[-10:]
        )

    user_prompt = f"""
DOCUMENTS

{context}

END DOCUMENTS


RECENT CONVERSATION

{history_text}

END RECENT CONVERSATION


USER QUESTION

{question}

END USER QUESTION


Answer the user's question now.

Use only the documents above.

If the answer is not explicitly supported by the documents,
do not guess.
"""

    print(
        "Calling Bedrock model:",
        FOUNDATION_MODEL_ID
    )

    try:

        response = bedrock_runtime.converse(

            modelId=FOUNDATION_MODEL_ID,

            system=[
                {
                    "text": SYSTEM_PROMPT
                }
            ],

            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "text": user_prompt
                        }
                    ]
                }
            ],

            inferenceConfig={
                "maxTokens": 1200,
                "temperature": 0.0,
                "topP": 0.1
            }
        )

        output = response.get(
            "output",
            {}
        )

        message = output.get(
            "message",
            {}
        )

        content = message.get(
            "content",
            []
        )

        answer_parts = []

        for item in content:

            if "text" in item:

                answer_parts.append(
                    item["text"]
                )

        answer = "\n".join(
            answer_parts
        ).strip()

        return answer

    except Exception as error:

        error_text = str(error)

        print(
            "Bedrock Converse failed:",
            error_text
        )

        # Account-level model block (common on some student /
        # marketplace-restricted accounts): still return a
        # grounded answer from retrieved Knowledge Base chunks.
        if (
            "Operation not allowed" in error_text
            or "AccessDeniedException" in error_text
            or "AccessDenied" in error_text
        ):

            print(
                "Falling back to extractive RAG answer "
                "from retrieved documents."
            )

            return build_extractive_answer(
                question,
                documents
            )

        # Unexpected model errors: re-raise so the top-level
        # handler returns a 500 with details.
        raise


# ============================================================
# REMOVE DUPLICATE SOURCES
# ============================================================

def deduplicate_sources(
    documents
):

    unique = []

    seen = set()

    for document in documents:

        source_name = get_source_name(
            document
        )

        text = document.get(
            "text",
            ""
        )

        key = (
            source_name,
            text
        )

        if key in seen:
            continue

        seen.add(
            key
        )

        unique.append(
            document
        )

    return unique


# ============================================================
# FORMAT SOURCES
# ============================================================

def format_sources(
    documents
):

    sources = []

    for index, document in enumerate(
        documents
    ):

        metadata = document.get(
            "metadata",
            {}
        )

        location = document.get(
            "location",
            {}
        )

        sources.append({

            "index": index,

            "document": get_source_name(
                document
            ),

            "section": get_source_section(
                document
            ),

            "score": document.get(
                "score"
            ),

            "text": document.get(
                "text",
                ""
            ),

            "mimeType": document.get(
                "contentType"
            ) or document.get(
                "metadata",
                {}
            ).get(
                "_file_type"
            ),

            "metadata": metadata,

            "location": location

        })

    return sources


# ============================================================
# SAVE CHAT MESSAGE
# ============================================================

def save_chat_message(
    user_id,
    conversation_id,
    role,
    message,
    metadata=None
):

    if not user_id:
        return

    item = {

        "userId": user_id,

        "timestamp": utc_timestamp(),

        "conversationId": conversation_id,

        "role": role,

        "message": message

    }

    if metadata:

        item["metadata"] = metadata

    try:

        chat_history_table.put_item(
            Item=item
        )

        print(
            f"Saved {role} message "
            f"for user {user_id}"
        )

    except Exception as error:

        # Chat must continue even if
        # DynamoDB temporarily fails.

        print(
            "DynamoDB save error:",
            str(error)
        )


# ============================================================
# GET CHAT HISTORY
# ============================================================

def get_chat_history(
    user_id,
    conversation_id
):

    if not user_id:
        return []

    try:

        response = chat_history_table.query(

            KeyConditionExpression=(
                Key("userId").eq(
                    user_id
                )
            ),

            ScanIndexForward=False,

            Limit=MAX_HISTORY_ITEMS

        )

        items = response.get(
            "Items",
            []
        )

        # Keep only this conversation
        conversation_items = [
            item
            for item in items
            if item.get(
                "conversationId"
            ) == conversation_id
        ]

        conversation_items.reverse()

        return conversation_items

    except Exception as error:

        print(
            "DynamoDB history error:",
            str(error)
        )

        return []


# ============================================================
# DETERMINE IF ANSWER IS UNSUPPORTED
# ============================================================

def answer_is_unsupported(
    answer
):

    if not answer:
        return True

    text = answer.lower().strip()

    unsupported = [

        "i couldn't find that information "
        "in the club documents",

        "i could not find that information "
        "in the club documents",

        "not available in the club documents",

        "not contained in the club documents",

        "not found in the club documents"

    ]

    return any(
        phrase in text
        for phrase in unsupported
    )


# ============================================================
# LAMBDA HANDLER
# ============================================================

def lambda_handler(
    event,
    context
):

    print(
        "========== NIMBUS CHAT REQUEST =========="
    )

    try:

        # ====================================================
        # 1. QUESTION
        # ====================================================

        question = get_question(
            event
        )

        if not question:

            return api_response(
                400,
                {
                    "success": False,
                    "error": (
                        "Question is required."
                    )
                }
            )


        # ====================================================
        # 2. CONVERSATION
        # ====================================================

        conversation_id = (
            get_conversation_id(
                event
            )
        )


        # ====================================================
        # 3. USER
        # ====================================================

        authenticated_user = (
            get_authenticated_user(
                event
            )
        )

        if authenticated_user:

            user_id = (
                authenticated_user.get(
                    "userId"
                )
            )

        else:

            # ------------------------------------------------
            # Direct Lambda testing only.
            #
            # API Gateway production requests should use
            # Cognito JWT user ID.
            # ------------------------------------------------

            body = get_request_body(
                event
            )

            user_id = body.get(
                "userId"
            )

            if not user_id:

                user_id = (
                    "anonymous"
                )


        # ====================================================
        # 4. CHAT HISTORY
        # ====================================================

        history = get_chat_history(

            user_id,

            conversation_id

        )


        # ====================================================
        # 5. SAVE USER QUESTION
        # ====================================================

        save_chat_message(

            user_id,

            conversation_id,

            "user",

            question

        )


        # ====================================================
        # 6. KNOWLEDGE BASE RETRIEVAL
        # ====================================================

        documents = retrieve_documents(
            question
        )

        documents = deduplicate_sources(
            documents
        )


        # ====================================================
        # 7. NO DOCUMENTS
        # ====================================================

        if not documents:

            fallback = build_fallback(
                question
            )

            answer = fallback[
                "message"
            ]

            save_chat_message(

                user_id,

                conversation_id,

                "assistant",

                answer,

                {
                    "type": "fallback",
                    "contact": fallback[
                        "contact"
                    ]
                }

            )

            return api_response(

                200,

                {

                    "success": True,

                    "userId": user_id,

                    "conversationId": (
                        conversation_id
                    ),

                    "question": question,

                    "answer": answer,

                    "citations": [],

                    "sources": [],

                    "fallback": fallback

                }

            )


        # ====================================================
        # 8. GENERATE GROUNDED ANSWER
        # ====================================================

        answer = generate_answer(

            question,

            documents,

            history

        )


        # ====================================================
        # 9. EMPTY ANSWER
        # ====================================================

        if not answer:

            fallback = build_fallback(
                question
            )

            answer = fallback[
                "message"
            ]


        # ====================================================
        # 10. FALLBACK IF UNSUPPORTED
        # ====================================================

        fallback_used = (
            answer_is_unsupported(
                answer
            )
        )

        fallback = None

        if fallback_used:

            fallback = build_fallback(
                question
            )

            answer = fallback[
                "message"
            ]


        # ====================================================
        # 11. FORMAT SOURCES
        # ====================================================

        sources = format_sources(
            documents
        )


        # ====================================================
        # 12. CITATION OBJECTS
        #
        # We do not fabricate character-level citations.
        #
        # Instead, every source returned here is a real
        # Knowledge Base retrieval result.
        # ====================================================

        citations = []

        for source in sources:

            citations.append({

                "sourceIndex": source[
                    "index"
                ],

                "document": source[
                    "document"
                ],

                "score": source[
                    "score"
                ]

            })


        # ====================================================
        # 13. SAVE ASSISTANT MESSAGE
        # ====================================================

        metadata = {

            "knowledgeBaseId": (
                KNOWLEDGE_BASE_ID
            ),

            "modelId": (
                FOUNDATION_MODEL_ID
            ),

            "sourceCount": len(
                sources
            ),

            "fallback": fallback_used

        }

        if fallback:

            metadata[
                "contact"
            ] = fallback[
                "contact"
            ]

        save_chat_message(

            user_id,

            conversation_id,

            "assistant",

            answer,

            metadata

        )


        # ====================================================
        # 14. FINAL RESPONSE
        # ====================================================

        result = {

            "success": True,

            "userId": user_id,

            "conversationId": (
                conversation_id
            ),

            "question": question,

            "answer": answer,

            "citations": citations,

            "sources": sources,

            "fallback": fallback_used

        }

        if fallback:

            result[
                "contact"
            ] = fallback[
                "contact"
            ]


        print(
            "========== NIMBUS CHAT SUCCESS =========="
        )

        return api_response(
            200,
            result
        )


    # ========================================================
    # ERROR HANDLING
    # ========================================================

    except Exception as error:

        print(
            "========== NIMBUS CHAT ERROR =========="
        )

        print(
            str(error)
        )

        return api_response(

            500,

            {

                "success": False,

                "error": (
                    "Unable to process your "
                    "question right now."
                ),

                "details": str(
                    error
                )

            }

        )