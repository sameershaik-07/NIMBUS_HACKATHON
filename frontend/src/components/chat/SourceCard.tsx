import React, { useState } from 'react';
import { ChatSource } from '../../types/chat';
import { FileText, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface SourceCardProps {
  source: ChatSource;
  index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => {
  const [expanded, setExpanded] = useState(false);

  const filename = source.file || source.filename || 'Club Knowledge Document';
  const section = source.section || source.title || 'Official Starter Document';
  const snippet = source.snippet || '';

  return (
    <div
      className="group relative rounded-xl bg-slate-900/90 border border-slate-800 hover:border-[#ff9900]/50 p-3.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,153,0,0.15)] hover:-translate-y-0.5 animate-fadeIn"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff9900]/10 border border-[#ff9900]/30 flex items-center justify-center shrink-0 group-hover:bg-[#ff9900]/20 transition-colors">
            <FileText className="w-4 h-4 text-[#ff9900]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-[#ff9900] transition-colors">
                {filename}
              </span>
              <Sparkles className="w-3 h-3 text-[#ff9900]/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {section && (
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {section}
              </p>
            )}
          </div>
        </div>

        {snippet && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={expanded ? 'Hide Snippet' : 'View Excerpt'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Expanded Excerpt Drawer */}
      {expanded && snippet && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-2.5 rounded-lg">
          <span className="text-[10px] uppercase font-bold text-[#ff9900] tracking-wider block mb-1">
            Grounded Excerpt:
          </span>
          "{snippet}"
        </div>
      )}
    </div>
  );
};
