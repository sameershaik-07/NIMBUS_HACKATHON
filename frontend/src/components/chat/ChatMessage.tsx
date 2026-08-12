import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types/chat';
import { SourceCard } from './SourceCard';
import { FallbackContactCard } from './FallbackContactCard';
import { Bot, User, ShieldCheck } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-3 my-5 ${isUser ? 'flex-row-reverse' : ''} animate-fadeIn`}>
      
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-slate-800 text-slate-200 border border-slate-700'
            : 'bg-[#ff9900]/15 text-[#ff9900] border border-[#ff9900]/40 shadow-[0_0_15px_rgba(255,153,0,0.2)]'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Bubble / Content */}
      <div className={`max-w-2xl w-full ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Header Label */}
        <div className={`flex items-center gap-2 mb-1.5 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-slate-300">
            {isUser ? 'You (Member)' : 'Club Assistant'}
          </span>
          {!isUser && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ff9900]/10 text-[10px] font-bold text-[#ff9900] border border-[#ff9900]/30">
              <ShieldCheck className="w-3 h-3" />
              Grounded
            </span>
          )}
          <span className="text-[10px] text-slate-500 font-mono">
            {message.timestamp}
          </span>
        </div>

        {/* Message Text Container */}
        <div
          className={`rounded-2xl p-5 leading-relaxed text-sm shadow-xl transition-all ${
            isUser
              ? 'rounded-tr-sm bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 text-slate-100'
              : 'rounded-tl-sm bg-[#0e1626]/90 border border-slate-800 text-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
          }`}
        >
          {/* Format Paragraphs */}
          <div className="whitespace-pre-wrap font-sans space-y-2">
            {message.text}
          </div>

          {/* Fallback Contact Card */}
          {message.isFallback && <FallbackContactCard />}

          {/* Sources Section */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ff9900]">
                  Grounded Sources ({message.sources.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Official Starter Docs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {message.sources.map((source, idx) => (
                  <SourceCard key={idx} source={source} index={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
