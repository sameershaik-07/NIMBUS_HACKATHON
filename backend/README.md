# NIMBUS Backend (AWS Lambda)

This folder holds the **source of truth** for the NIMBUS serverless
backend. These handlers live in AWS as Lambda functions; the files
here are deployed from this repo.

## Layout

```
backend/
├── chat/            → nimbus-chat-handler
│   └── lambda_function.py
├── admin/           → nimbus-admin-handler  (publish documents)
│   └── lambda_function.py
├── documents/       → nimbus-documents-handler  (list knowledge docs)
│   └── lambda_function.py
└── scripts/
    └── deploy.py    → helper to zip + push a handler to AWS
```

## Architecture

```
Frontend (Vite/React, Amplify)
   │  Cognito JWT (Bearer)
   ▼
API Gateway (HTTP API "nimbus-chat-api")
   │
   ├─ POST /chat          → nimbus-chat-handler
   ├─ GET  /chat/history  → nimbus-chat-handler
   ├─ POST /admin         → nimbus-admin-handler  (ADMIN group only)
   ├─ GET  /admin         → nimbus-admin-handler  (ADMIN group only)
   └─ GET  /documents     → nimbus-documents-handler
```

Knowledge flow (managed Knowledge Base `nimbus-hackathon-kb`):

- Documents live in S3 bucket `nimbus-hackathon` (root starter pack
  plus `admin/*` for admin-published docs).
- `bedrock-agent-runtime.retrieve` uses **`managedSearchConfiguration`**
  (required for MANAGED knowledge bases).
- Because the account does not yet have a paid foundation model
  enabled, chat falls back to an **extractive RAG** answer built from
  the retrieved chunks when Converse is blocked
  (`ValidationException: Operation not allowed`). The answer always
  cites the source file **and** the markdown section.

## Deploying

```bash
# Deploy all handlers
python3 backend/scripts/deploy.py --profile nimbus-debug

# Deploy a single handler
python3 backend/scripts/deploy.py admin --profile nimbus-debug

# Validate without uploading
python3 backend/scripts/deploy.py --dry-run --profile nimbus-debug
```

The IAM user needs `AWSLambda_FullAccess` (or equivalent) to run
`update-function-code`.

### Environment variables expected by handlers

**nimbus-chat-handler**
| Variable | Default |
| --- | --- |
| `KNOWLEDGE_BASE_ID` | `904AVL0E51` |
| `FOUNDATION_MODEL_ID` | `us.amazon.nova-lite-v1:0` |
| `CHAT_HISTORY_TABLE` | `nimbus-chat-history` |

**nimbus-admin-handler**
| Variable | Default |
| --- | --- |
| `DOCUMENT_BUCKET` | `nimbus-hackathon` |
| `KNOWLEDGE_BASE_ID` | `904AVL0E51` |
| `DATA_SOURCE_ID` | `6MRVYBBUJK` |

**nimbus-documents-handler**
| Variable | Default |
| --- | --- |
| `DOCUMENT_BUCKET` | `nimbus-hackathon` |

### IAM notes for the admin handler

`nimbus-admin-handler` additionally needs:
- `s3:PutObject` and `s3:ListBucket` / `s3:GetObject` on
  `nimbus-hackathon`
- `bedrock:StartIngestionJob` on the Knowledge Base to re-index
  after publish
- `bedrock:GetIngestionJob` to poll ingestion status (optional)

## Smoke test (30%-demo checklist)

`09-smoke-test-questions.md` defines three questions that must cite
`event-day-briefing.md`:

1. What room are judging and final demos in? → **Hall B, Room 204**
2. What time is lunch today? → **1:30 PM**
3. What time are final demos? → **4:00 PM**
