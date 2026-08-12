export interface ChatSource {
  file?: string;
  filename?: string;
  uri?: string;
  document?: string;
  section?: string;
  title?: string;
  content?: string;
  snippet?: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: ChatSource[];
  isFallback?: boolean;
  timestamp: string;
  error?: boolean;
}

export interface ChatApiRequest {
  question: string;
}

export interface ChatApiResponse {
  answer?: string;
  response?: string;
  message?: string;
  text?: string;
  sources?: ChatSource[];
  citations?: ChatSource[];
  source_documents?: ChatSource[];
  retrieval_results?: ChatSource[];
  is_fallback?: boolean;
  isFallback?: boolean;
  error?: string;
}
