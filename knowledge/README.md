# NIMBUS Knowledge Content

The Markdown documents here are the seed content loaded into the
Amazon Bedrock Knowledge Base (S3 bucket `nimbus-hackathon`). The
assistant answers **only** from these documents (strict grounding).

## Contents

| File | Purpose |
| --- | --- |
| `01-onboarding-faq.md` | Club onboarding + team contact directory |
| `02-aws-account-setup.md` | AWS account setup for members |
| `03-builder-center-publish.md` | Builder Center publishing steps/tags |
| `04-bedrock-starter.md` | Bedrock / RAG / Knowledge Base overview |
| `05-hackathon-rules.md` | Hackathon rules & judging criteria |
| `06-workshop-index.md` | Workshop schedule/sessions |
| `07-lambda-patterns.md` | Lambda patterns used in the portal |
| `08-sbg-community.md` | AWS Student Builder Groups info |
| `09-smoke-test-questions.md` | The 3-question demo smoke test |
| `event-day-briefing.md` | Event-day schedule (smoke test source) |

## How new content becomes searchable

1. **Admin console** publishes to `s3://nimbus-hackathon/admin/<name>.md`.
2. The admin Lambda triggers a Knowledge Base **ingestion job**.
3. Within ~60 seconds the new/changed content is searchable by the
   chat assistant and appears on the member dashboard (auto-refresh).

## Resyncing seed content (dev only)

If you need to push these files back into S3 (e.g. after a reset):

```bash
for f in knowledge/*.md; do
  aws s3 cp "$f" "s3://nimbus-hackathon/$(basename "$f")" \
    --profile nimbus-debug --region us-east-1
done
```

Then trigger a full ingestion job on the data source so the KB picks
up the latest versions.
