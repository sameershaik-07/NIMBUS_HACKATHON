import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import { chatApiService } from '../services/api';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatComposer } from '../components/chat/ChatComposer';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { Bot, ShieldCheck, Sparkles, AlertCircle, RotateCcw, HelpCircle, Info } from 'lucide-react';

interface ChatPageProps {
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  onSessionExpired?: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialQuery,
  onClearInitialQuery,
  onSessionExpired
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Execute initial query if passed from Dashboard
  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  const handleSendMessage = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    setError(null);
    setLastQuestion(questionText);

    const userMessage: ChatMessageType = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const assistantMessage = await chatApiService.sendQuestion(questionText.trim());
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === '401_UNAUTHORIZED') {
        if (onSessionExpired) onSessionExpired();
        return;
      }

      let errMessage = 'We could not reach the club assistant. Please try again.';
      if (err.message === 'NETWORK_ERROR') {
        errMessage = 'Network error: Please check your internet connection and try again.';
      } else if (err.message === '403_FORBIDDEN') {
        errMessage = 'Access denied: Your account is not authorized to access this resource.';
      }

      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuestion) {
      handleSendMessage(lastQuestion);
    }
  };

  const starterSuggestions = [
    'When is the next workshop?',
    'How do I publish on Builder Center?',
    'How do I get started with Bedrock?',
    'What are the hackathon rules?',
    'What is the AWS Student Builder Group?'
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-140px)] justify-between">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 mb-6 shadow-lg backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff9900]/15 border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900] shadow-[0_0_15px_rgba(255,153,0,0.2)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Club Knowledge Assistant
            </h2>
            <p className="text-xs text-slate-400">
              Grounded strictly in the official 8 club starter documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff9900]/10 border border-[#ff9900]/30 text-xs font-semibold text-[#ff9900]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>No-Hallucination Guardrail Active</span>
        </div>
      </div>

      {/* Messages Workspace */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-6">
        
        {/* Empty Welcome State */}
        {messages.length === 0 && (
          <div className="text-center py-12 px-4 space-y-8 animate-fadeIn">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff9900]/20 to-slate-900 border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900] mx-auto shadow-[0_0_30px_rgba(255,153,0,0.25)]">
                <Bot className="w-10 h-10 animate-pulse" />
              </div>
              <Sparkles className="w-6 h-6 text-[#ff9900] absolute -top-1 -right-1 animate-spin-slow" />
            </div>

            <div className="max-w-lg mx-auto space-y-2">
              <h3 className="text-xl font-bold text-white">
                Welcome to the Club Assistant
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ask questions about AWS workshops, Builder Center publishing standards, Bedrock RAG setup, Lambda patterns, or hackathon rules. Answers are grounded in official club docs.
              </p>
            </div>

            {/* Starter Suggestions */}
            <div className="max-w-2xl mx-auto space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Suggested Questions:
              </span>
              <div className="flex flex-wrap justify-center gap-2.5">
                {starterSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-[#ff9900]/50 hover:bg-[#ff9900]/10 text-xs font-medium text-slate-300 hover:text-[#ff9900] transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing Indicator */}
        {loading && <TypingIndicator />}

        {/* Error Alert with Retry */}
        {error && (
          <div className="my-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-3 animate-shake">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>

            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Composer */}
      <ChatComposer onSendMessage={handleSendMessage} disabled={loading} />

    </div>
  );
};
