import React, { useEffect } from 'react';
import { ChatSource } from '../../types/chat';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { FileText, X, Sparkles, BookOpen, Layers } from 'lucide-react';

interface CitationSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  citations: ChatSource[];
}

export const CitationSidePanel: React.FC<CitationSidePanelProps> = ({
  isOpen,
  onClose,
  documentName,
  citations
}) => {
  // Handle ESC key press to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Panel Container */}
      <aside
        className="relative w-full sm:w-[500px] max-w-full bg-[#0b0f19] border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl z-10 animate-slideInRight"
        aria-label="Grounded Sources Details"
        role="dialog"
        aria-modal="true"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff9900]/15 border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Grounded Sources
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Official Document Citations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff9900]"
            aria-label="Close details panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Document Info Banner */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ff9900]/10 border border-[#ff9900]/30 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-4 h-4 text-[#ff9900]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate font-mono">
              {documentName}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-[#ff9900] font-semibold">
                <Layers className="w-3 h-3" />
                {citations.length} {citations.length === 1 ? 'citation' : 'citations'}
              </span>
            </div>
          </div>
        </div>

        {/* Citations List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {citations.map((citation, idx) => {
            const snippetText = citation.snippet || citation.content || '';
            const sectionName = citation.section || citation.title || '';

            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg space-y-3 hover:border-[#ff9900]/40 transition-colors"
              >
                {/* Citation Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ff9900]/15 text-[#ff9900] border border-[#ff9900]/30 text-[11px] font-bold">
                      Citation {idx + 1}
                    </span>
                    {sectionName && (
                      <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">
                        {sectionName}
                      </span>
                    )}
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-[#ff9900]/70" />
                </div>

                {/* Rendered Citation Markdown */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
                  {snippetText ? (
                    <MarkdownRenderer content={snippetText} />
                  ) : (
                    <p className="text-xs text-slate-400 italic">No text snippet available for this citation.</p>
                  )}
                </div>

                {/* Metadata Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Source: {documentName}</span>
                  {citation.score !== undefined && (
                    <span>Relevance: {(citation.score * 100).toFixed(0)}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-center text-xs text-slate-400">
          Grounded strict document retrieval response
        </div>
      </aside>
    </div>
  );
};
