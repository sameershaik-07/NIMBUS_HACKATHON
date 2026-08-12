import { ENV, FALLBACK_CONTACT } from '../config/env';
import { ChatApiResponse, ChatMessage, ChatSource } from '../types/chat';
import { cognitoAuthService } from './cognito';

export const chatApiService = {
  /**
   * Send question to API Gateway /chat route with authenticated Bearer JWT token
   */
  async sendQuestion(question: string): Promise<ChatMessage> {
    const session = cognitoAuthService.getStoredSession();
    if (!session || !session.tokens || !session.tokens.idToken) {
      throw new Error('UNAUTHORIZED_NO_TOKEN');
    }

    const token = session.tokens.idToken;
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  }
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
