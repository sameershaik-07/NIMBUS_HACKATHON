import React, { useState, KeyboardEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatComposerProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-4 z-20 max-w-4xl mx-auto px-4 w-full"
    >
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-[#ff9900]/60 focus-within:shadow-[0_0_25px_rgba(255,153,0,0.2)] backdrop-blur-2xl p-2 transition-all duration-300">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question grounded in the official club documents..."
          rows={2}
          disabled={disabled}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm p-3 focus:outline-none resize-none min-h-[50px] max-h-[140px] font-sans"
        />

        <div className="flex items-center justify-between px-3 pb-1 border-t border-slate-800/60 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-[#ff9900]" />
            <span>Enter to send • Shift + Enter for new line</span>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              !text.trim() || disabled
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ff9900] to-[#ec7211] text-slate-950 shadow-[0_0_20px_rgba(255,153,0,0.4)] hover:brightness-110 hover:scale-105 active:scale-95'
            }`}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </form>
  );
};
