import { ENV, FALLBACK_CONTACT } from '../config/env';
import { ChatApiResponse, ChatHistoryResponse, ChatMessage, ChatSource, HistoryItem } from '../types/chat';
import { ClubDocument, DocumentListResponse, PublishDocumentRequest, PublishDocumentResponse } from '../types/documents';
import { cognitoAuthService } from './cognito';

export const chatApiService = {
  /**
   * Send question to API Gateway /chat route with authenticated Bearer JWT token
   */
  async sendQuestion(question: string): Promise<ChatMessage> {
    const session = cognitoAuthService.getStoredSession();
    if (!session || !session.tokens || (!session.tokens.idToken && !session.tokens.accessToken)) {
      throw new Error('UNAUTHORIZED_NO_TOKEN');
    }

    const token = session.tokens.idToken || session.tokens.accessToken;
    const endpoint = `${ENV.API_BASE_URL}/chat`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: question.trim() })
      });

      if (response.status === 401) {
        throw new Error('401_UNAUTHORIZED');
      }

      if (response.status === 403) {
        throw new Error('403_FORBIDDEN');
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(`SERVER_ERROR_${response.status}`);
      }

      const data: ChatApiResponse = await response.json();

      // Normalize answer text from various backend field names
      let answerText = data.answer || data.response || data.message || data.text || '';
      
      // Normalize sources list
      const rawSources = data.sources || data.citations || data.source_documents || data.retrieval_results || [];
      const cleanedSources = normalizeSources(rawSources);

      // Check if response indicates fallback/no-grounding
      const isFallback = Boolean(
        data.is_fallback ||
        data.isFallback ||
        answerText.toLowerCase().includes('could not find') ||
        answerText.toLowerCase().includes('insufficient evidence') ||
        (answerText === '' && cleanedSources.length === 0)
      );

      if (isFallback && !answerText) {
        answerText = FALLBACK_CONTACT.message;
      }

      return {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        sender: 'assistant',
        text: answerText,
        sources: cleanedSources,
        isFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conversationId: data.conversationId
      };

    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === '401_UNAUTHORIZED') {
        throw err;
      }
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('NETWORK_ERROR');
      }
      throw err;
    }
  },

  /**
   * Retrieve member chat history from API Gateway GET /chat/history route
   */
  async getChatHistory(): Promise<{ messages: ChatMessage[]; rawHistory: HistoryItem[] }> {
    const session = cognitoAuthService.getStoredSession();
    if (!session || !session.tokens) {
      throw new Error('UNAUTHORIZED_NO_TOKEN');
    }

    const token = session.tokens.accessToken || session.tokens.idToken;
    if (!token) {
      throw new Error('UNAUTHORIZED_NO_TOKEN');
    }

    const endpoint = `${ENV.API_BASE_URL}/chat/history`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        throw new Error('401_UNAUTHORIZED');
      }

      if (response.status === 403) {
        throw new Error('403_FORBIDDEN');
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`History API Error ${response.status}:`, errorText);
        throw new Error(`SERVER_ERROR_${response.status}`);
      }

      const data: ChatHistoryResponse = await response.json();
      const rawHistory: HistoryItem[] = Array.isArray(data.history)
        ? data.history
        : Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.messages)
        ? data.messages
        : [];

      const messages: ChatMessage[] = rawHistory.map((item, idx) => {
        const sender: 'user' | 'assistant' =
          item.role === 'user' || item.sender === 'user' ? 'user' : 'assistant';

        const text = item.message || item.text || item.content || item.answer || item.response || '';

        const rawSources =
          item.sources ||
          item.citations ||
          item.metadata?.sources ||
          item.metadata?.citations ||
          item.metadata?.retrieval_results ||
          [];
        const cleanedSources = normalizeSources(rawSources);

        const isFallback = Boolean(
          item.metadata?.fallbackUsed ||
          item.metadata?.is_fallback ||
          item.metadata?.isFallback
        );

        let formattedTime = '';
        if (item.timestamp) {
          try {
            const d = new Date(item.timestamp);
            if (!isNaN(d.getTime())) {
              formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
              formattedTime = item.timestamp;
            }
          } catch {
            formattedTime = item.timestamp;
          }
        }
        if (!formattedTime) {
          formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        return {
          id: item.conversationId ? `hist_${item.conversationId}_${idx}` : `hist_${Date.now()}_${idx}`,
          sender,
          text,
          sources: cleanedSources,
          isFallback,
          timestamp: formattedTime,
          conversationId: item.conversationId
        };
      });

      return { messages, rawHistory };
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === '401_UNAUTHORIZED') {
        throw err;
      }
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('NETWORK_ERROR');
      }
      throw err;
    }
  },

  /**
   * Fetch the list of knowledge documents backing the chat.
   * Used by the member dashboard (polled, no full-page reload).
   */
  async getDocuments(): Promise<ClubDocument[]> {
    const session = cognitoAuthService.getStoredSession();
    if (!session || !session.tokens) {
      throw new Error('UNAUTHORIZED_NO_TOKEN');
    }

    const token = session.tokens.accessToken || session.tokens.idToken;
    if (!token) {
      throw new Error('UNAUTHORIZED_NO_TOKEN');
    }

    const endpoint = `${ENV.API_BASE_URL}/documents`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        throw new Error('401_UNAUTHORIZED');
      }
      if (response.status === 403) {
        throw new Error('403_FORBIDDEN');
      }
      if (!response.ok) {
        throw new Error(`SERVER_ERROR_${response.status}`);
      }

      const data: DocumentListResponse = await response.json();
      return Array.isArray(data.documents) ? data.documents : [];
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === '401_UNAUTHORIZED') {
        throw err;
      }
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('NETWORK_ERROR');
      }
      throw err;
    }
  },

  /**
   * Publish (create or update) a knowledge document as an ADMIN.
   * Content may be plain text or base64-encoded.
   */
  async publishDocument(request: PublishDocumentRequest): Promise<PublishDocumentResponse> {
    const session = cognitoAuthService.getStoredSession();
    if (!session || !session.tokens) {
      throw new Error('UNAUTHORIZED_NO_TOKEN');
    }

    const token = session.tokens.idToken || session.tokens.accessToken;
    if (!token) {
      throw new Error('UNAUTHORIZED_NO_TOKEN');
    }

    const endpoint = `${ENV.API_BASE_URL}/admin`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      if (response.status === 401) {
        throw new Error('401_UNAUTHORIZED');
      }
      if (response.status === 403) {
        throw new Error('403_FORBIDDEN');
      }

      const data: PublishDocumentResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `SERVER_ERROR_${response.status}`);
      }

      return data;
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === '401_UNAUTHORIZED' || err.message === '403_FORBIDDEN') {
        throw err;
      }
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('NETWORK_ERROR');
      }
      throw err;
    }
  },
};

/**
 * Format raw S3 URI into human-readable filename and clean metadata
 */
function normalizeSources(rawSources: any[]): ChatSource[] {
  if (!Array.isArray(rawSources)) return [];

  return rawSources.map((item) => {
    let fileName = '';
    let sectionName = '';
    let snippet = '';

    if (typeof item === 'string') {
      fileName = extractFilename(item);
      snippet = item;
    } else if (typeof item === 'object' && item !== null) {
      const rawFile = item.file || item.filename || item.uri || item.document || '';
      fileName = extractFilename(rawFile);
      sectionName = item.section || item.title || '';
      snippet = item.snippet || item.content || item.text || '';
    }

    // Default cleanup if still empty
    if (!fileName) {
      fileName = 'Club Knowledge Document';
    }

    return {
      file: fileName,
      section: sectionName,
      snippet: snippet.trim()
    };
  });
}

function extractFilename(pathStr: string): string {
  if (!pathStr) return '';
  // Convert s3://bucket-name/03-builder-center-publish.md to 03-builder-center-publish.md
  let clean = pathStr.split('/').pop() || pathStr;
  clean = clean.split('?')[0]; // Remove query params if any
  return clean;
}
