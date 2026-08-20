/** A knowledge document surfaced on the member dashboard / admin page. */
export interface ClubDocument {
  filename: string;
  s3Key: string;
  size?: number;
  /** ISO timestamp of last modification. */
  publishedAt?: string | null;
  lastModified?: string | null;
}

/** Response shape for GET /documents. */
export interface DocumentListResponse {
  success?: boolean;
  documents?: ClubDocument[];
  count?: number;
  error?: string;
  details?: string;
}

/** Payload sent to POST /admin. Content is plain text OR base64. */
export interface PublishDocumentRequest {
  filename: string;
  content?: string;
  contentBase64?: string;
}

/** Response shape for POST /admin. */
export interface PublishDocumentResponse {
  success?: boolean;
  message?: string;
  filename?: string;
  s3Key?: string;
  publishedAt?: string;
  ingestionJobId?: string | null;
  error?: string;
  details?: string;
}
