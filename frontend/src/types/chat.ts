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
  conversationId?: string;
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
  conversationId?: string;
  error?: string;
}

export interface HistoryItem {
  message?: string;
  text?: string;
  content?: string;
  response?: string;
  answer?: string;
  role?: string;
  sender?: string;
  conversationId?: string;
  userId?: string;
  timestamp?: string;
  metadata?: {
    username?: string;
    email?: string;
    citationCount?: number;
    fallbackUsed?: boolean;
    is_fallback?: boolean;
    isFallback?: boolean;
    sourceCount?: number;
    sources?: ChatSource[];
    citations?: ChatSource[];
    [key: string]: any;
  };
  sources?: ChatSource[];
  citations?: ChatSource[];
  [key: string]: any;
}

export interface ChatHistoryResponse {
  success?: boolean;
  userId?: string;
  history?: HistoryItem[];
  items?: HistoryItem[];
  messages?: HistoryItem[];
}

