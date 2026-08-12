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
  // Lock body scroll and add ESC key handler when modal is active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
      {/* Darkened Full Window Backdrop (hides background page completely) */}
      <div
        className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Center Modal Window (occupies whole workspace comfortably) */}
      <div
        className="relative w-full max-w-4xl bg-[#0c121e] border border-slate-800 rounded-3xl text-slate-100 max-h-[88vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 overflow-hidden animate-scaleUp"
        aria-label="Grounded Sources Details"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff9900]/15 border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900] shadow-[0_0_15px_rgba(255,153,0,0.2)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Grounded Sources Details
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Official Document Citations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff9900]"
            aria-label="Close citations modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Selected Document Header Banner */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#ff9900]/10 border border-[#ff9900]/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#ff9900]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate font-mono">
                {documentName}
              </h4>
              <p className="text-xs text-slate-400">
                Official Club Knowledge Base Item
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff9900]/10 border border-[#ff9900]/30 text-xs text-[#ff9900] font-semibold">
              <Layers className="w-3.5 h-3.5" />
              {citations.length} {citations.length === 1 ? 'citation' : 'citations'}
            </span>
          </div>
        </div>

        {/* Scrollable Citation Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {citations.map((citation, idx) => {
            const snippetText = citation.snippet || citation.content || '';
            const sectionName = citation.section || citation.title || '';

            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-xl space-y-4 hover:border-[#ff9900]/40 transition-colors"
              >
                {/* Citation Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[#ff9900]/15 text-[#ff9900] border border-[#ff9900]/30 text-xs font-bold font-mono">
                      Citation {idx + 1}
                    </span>
                    {sectionName && (
                      <span className="text-xs font-semibold text-slate-300 truncate max-w-xs sm:max-w-md">
                        {sectionName}
                      </span>
                    )}
                  </div>
                  <Sparkles className="w-4 h-4 text-[#ff9900]/70 shrink-0" />
                </div>

                {/* Rendered Citation Text with word-break to prevent text overwrite */}
                <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 text-sm text-slate-200 leading-relaxed break-words [word-break:break-word] overflow-wrap-break-word">
                  {snippetText ? (
                    <MarkdownRenderer content={snippetText} />
                  ) : (
                    <p className="text-xs text-slate-400 italic">No text snippet available for this citation.</p>
                  )}
                </div>

                {/* Metadata Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1">
                  <span className="truncate max-w-sm">Source Document: {documentName}</span>
                  {citation.score !== undefined && (
                    <span>Relevance Match: {(citation.score * 100).toFixed(0)}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-center text-xs text-slate-400 shrink-0 flex items-center justify-between px-6">
          <span>Grounded strict document retrieval response</span>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors"
          >
            Close Citation Window
          </button>
        </div>
      </div>
    </div>
  );
};
