import React from 'react';
import { ChatSource } from '../../types/chat';
import { FileText, ChevronRight, Layers } from 'lucide-react';

export interface GroupedDocument {
  id: string;
  fileName: string;
  sectionName?: string;
  citations: ChatSource[];
}

interface SourceCardProps {
  documentGroup: GroupedDocument;
  onSelect: (docGroup: GroupedDocument) => void;
  index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ documentGroup, onSelect, index }) => {
  const { fileName, citations, sectionName } = documentGroup;
  const count = citations.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(documentGroup)}
      className="w-full text-left group relative rounded-xl bg-slate-900/90 border border-slate-800 hover:border-[#ff9900]/50 p-3.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,153,0,0.15)] hover:-translate-y-0.5 animate-fadeIn focus:outline-none focus:ring-2 focus:ring-[#ff9900]/50"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#ff9900]/10 border border-[#ff9900]/30 flex items-center justify-center shrink-0 group-hover:bg-[#ff9900]/20 transition-colors">
            <FileText className="w-4 h-4 text-[#ff9900]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-[#ff9900] transition-colors truncate">
                {fileName}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] text-[#ff9900] font-medium">
                <Layers className="w-3 h-3" />
                {count} {count === 1 ? 'citation' : 'citations'}
              </span>
              {sectionName && (
                <span className="text-[11px] text-slate-400 truncate">
                  • {sectionName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-1 rounded-md text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-colors shrink-0">
          <ChevronRight className="w-4 h-4 text-[#ff9900]" />
        </div>
      </div>
    </button>
  );
};
