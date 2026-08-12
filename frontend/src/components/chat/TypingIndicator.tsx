import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 my-4 animate-fadeIn">
      <div className="w-9 h-9 rounded-xl bg-[#ff9900]/15 border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900] shrink-0 shadow-[0_0_15px_rgba(255,153,0,0.2)]">
        <Bot className="w-5 h-5" />
      </div>

      <div className="rounded-2xl rounded-tl-sm bg-slate-900/90 border border-slate-800 p-4 max-w-md shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#ff9900]">
            Searching official club knowledge base...
          </span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ff9900] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-[#ff9900] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-[#ff9900] animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};
