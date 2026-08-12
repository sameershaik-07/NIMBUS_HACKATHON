import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import { chatApiService } from '../services/api';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatComposer } from '../components/chat/ChatComposer';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { CitationSidePanel } from '../components/chat/CitationSidePanel';
import { GroupedDocument } from '../components/chat/SourceCard';
import {
  Bot,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Loader2,
  History,
  MessageSquare,
  PanelLeft,
  PanelLeftClose,
  ChevronRight,
  Clock
} from 'lucide-react';

interface ChatPageProps {
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  onSessionExpired?: () => void;
}

interface SessionInfo {
  id: string;
  title: string;
  timeLabel: string;
  questionCount: number;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialQuery,
  onClearInitialQuery,
  onSessionExpired
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(true);
  const [selectedDocGroup, setSelectedDocGroup] = useState<GroupedDocument | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | 'ALL'>('ALL');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat history from GET /chat/history on initial mount
  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        const { messages: historyMessages } = await chatApiService.getChatHistory();
        if (isMounted && historyMessages.length > 0) {
          setMessages(historyMessages);
        }
      } catch (err: any) {
        if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === '401_UNAUTHORIZED') {
          if (onSessionExpired) onSessionExpired();
          return;
        }
        console.error('Non-fatal error loading history:', err);
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // Track scroll position to hide composer while reading response and show when scrolled to bottom
  useEffect(() => {
    const checkScrollPosition = () => {
      const scrollableHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const currentScroll = window.scrollY;

      if (scrollableHeight <= viewportHeight + 80) {
        setShowComposer(true);
      } else {
        const isAtBottom = viewportHeight + currentScroll >= scrollableHeight - 80;
        setShowComposer(isAtBottom);
      }
    };

    checkScrollPosition();
    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
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

  // Count questions only (user queries)
  const totalQuestionCount = messages.filter((m) => m.sender === 'user').length;

  // Extract unique conversation sessions and format with friendly title and time
  const sessionsMap = new Map<string, ChatMessageType[]>();
  messages.forEach((msg) => {
    if (msg.conversationId) {
      if (!sessionsMap.has(msg.conversationId)) {
        sessionsMap.set(msg.conversationId, []);
      }
      sessionsMap.get(msg.conversationId)!.push(msg);
    }
  });

  const sessionsList: SessionInfo[] = Array.from(sessionsMap.entries()).map(([cid, msgs]) => {
    const firstUserMsg = msgs.find((m) => m.sender === 'user');
    const qCount = msgs.filter((m) => m.sender === 'user').length;

    // Friendly title from first user question or default session label
    let title = firstUserMsg ? firstUserMsg.text : 'Club Query Session';
    if (title.length > 26) {
      title = title.substring(0, 26) + '...';
    }

    // Friendly time label
    const timeLabel = firstUserMsg?.timestamp || msgs[0]?.timestamp || 'Recent';

    return {
      id: cid,
      title,
      timeLabel,
      questionCount: qCount
    };
  });

  const filteredMessages =
    selectedConversationId === 'ALL'
      ? messages
      : messages.filter((m) => m.conversationId === selectedConversationId);

  const starterSuggestions = [
    'When is the next workshop?',
    'How do I publish on Builder Center?',
    'How do I get started with Bedrock?',
    'What are the hackathon rules?',
    'What is the AWS Student Builder Group?'
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6 flex flex-col min-h-[calc(100vh-140px)] justify-between">
      
      {/* Top Header Banner with Session Sidebar Toggle */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 mb-6 shadow-lg backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Toggle Sidebar Button */}
          {sessionsList.length > 0 && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              type="button"
              className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold ${
                sidebarOpen
                  ? 'bg-[#ff9900]/15 text-[#ff9900] border-[#ff9900]/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={sidebarOpen ? 'Hide sessions sidebar' : 'Show sessions sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              <span className="hidden sm:inline">Sessions</span>
            </button>
          )}

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

        <div className="flex items-center gap-3">
          {/* Question Count Indicator */}
          {loadingHistory ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <Loader2 className="w-3.5 h-3.5 text-[#ff9900] animate-spin" />
              <span>Loading history...</span>
            </div>
          ) : totalQuestionCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
              <History className="w-3.5 h-3.5 text-[#ff9900]" />
              <span>{totalQuestionCount} {totalQuestionCount === 1 ? 'question' : 'questions'}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff9900]/10 border border-[#ff9900]/30 text-xs font-semibold text-[#ff9900]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>No-Hallucination Guardrail Active</span>
          </div>
        </div>
      </div>

      {/* Workspace Body: Left ChatGPT-Style Session Sidebar + Main Chat Container */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 items-start pb-6 relative">
        
        {/* Left ChatGPT-Style Chat Sessions Sidebar */}
        {sessionsList.length > 0 && sidebarOpen && (
          <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl p-3 flex flex-col h-auto md:max-h-[calc(100vh-220px)] sticky top-24 z-20 animate-fadeIn">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <History className="w-4 h-4 text-[#ff9900]" />
                <span>Chat Sessions</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close sessions panel"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Sessions List (Sliding up and down) */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[300px] md:max-h-none">
              {/* All Sessions Button */}
              <button
                onClick={() => setSelectedConversationId('ALL')}
                type="button"
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                  selectedConversationId === 'ALL'
                    ? 'bg-[#ff9900] text-slate-950 font-bold shadow-md'
                    : 'bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:border-[#ff9900]/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">All History ({totalQuestionCount})</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedConversationId === 'ALL' ? 'text-slate-950' : 'opacity-40 group-hover:opacity-100'}`} />
              </button>

              {/* Individual Session Buttons (Friendly Name + Time) */}
              {sessionsList.map((session) => {
                const isSelected = selectedConversationId === session.id;

                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedConversationId(session.id)}
                    type="button"
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex flex-col gap-1 group ${
                      isSelected
                        ? 'bg-slate-800 border border-[#ff9900]/60 text-white font-semibold shadow-md'
                        : 'bg-slate-950/40 border border-slate-800/60 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <span className="truncate text-xs font-medium text-slate-200 group-hover:text-white">
                        {session.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-[#ff9900] font-mono shrink-0">
                        {session.questionCount}q
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{session.timeLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Main Stream Container */}
        <div className="flex-1 w-full min-w-0 space-y-4 pb-6 relative">
          
          {/* Empty Welcome State */}
          {!loadingHistory && messages.length === 0 && (
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
                      type="button"
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

          {/* Message Thread with Conversation Session Dividers */}
          {filteredMessages.map((msg, idx) => {
            const prevMsg = filteredMessages[idx - 1];
            const showDivider =
              Boolean(msg.conversationId) &&
              prevMsg &&
              Boolean(prevMsg.conversationId) &&
              msg.conversationId !== prevMsg.conversationId;

            return (
              <React.Fragment key={msg.id}>
                {showDivider && (
                  <div className="my-6 border-b border-slate-800/80 flex items-center justify-center relative">
                    <span className="bg-[#0b0f19] px-3 text-[11px] text-[#ff9900] font-mono border border-slate-800 rounded-full py-0.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      Session: {msg.timestamp || 'Previous Conversation'}
                    </span>
                  </div>
                )}
                <ChatMessage
                  message={msg}
                  onSelectDocGroup={(docGroup) => setSelectedDocGroup(docGroup)}
                />
              </React.Fragment>
            );
          })}

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
                type="button"
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

      </div>

      {/* Full Window Citation Overlay Drawer Modal */}
      {selectedDocGroup && (
        <CitationSidePanel
          isOpen={Boolean(selectedDocGroup)}
          onClose={() => setSelectedDocGroup(null)}
          documentName={selectedDocGroup.fileName}
          citations={selectedDocGroup.citations}
        />
      )}

      {/* Floating Composer */}
      <ChatComposer
        onSendMessage={handleSendMessage}
        disabled={loading}
        visible={showComposer}
      />

    </div>
  );
};
