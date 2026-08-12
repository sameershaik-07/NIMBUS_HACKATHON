import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const CodeBlock: React.FC<{ language: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl border border-slate-800 bg-[#070b14] overflow-hidden shadow-lg group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <span className="font-semibold text-[#ff9900] uppercase tracking-wider text-[11px]">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#070b14]">
        <code>{value}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content text-slate-200 text-sm leading-relaxed break-words [word-break:break-word] overflow-wrap-break-word ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const codeText = String(children).replace(/\n$/, '');
            const isBlock = Boolean(match) || codeText.includes('\n');

            if (isBlock) {
              return <CodeBlock language={match ? match[1] : ''} value={codeText} />;
            }

            return (
              <code
                className="bg-slate-800/90 text-[#ff9900] px-1.5 py-0.5 rounded font-mono text-xs border border-slate-700/80 break-all"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-slate-800 shadow-lg bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-slate-900/90 text-slate-200 font-bold border-b border-slate-800">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-slate-800/60">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-slate-900/40 transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="p-3 font-semibold text-slate-200 border-b border-slate-800">{children}</th>;
          },
          td({ children }) {
            return <td className="p-3 text-slate-300 font-sans">{children}</td>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff9900] hover:underline font-medium inline-flex items-center gap-1 transition-colors break-all"
              >
                {children}
                <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
              </a>
            );
          },
          h1({ children }) {
            return <h1 className="text-lg font-bold text-white my-3 border-b border-slate-800 pb-1.5 tracking-tight">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-base font-bold text-slate-100 my-2.5 tracking-tight">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-sm font-bold text-slate-200 my-2">{children}</h3>;
          },
          h4({ children }) {
            return <h4 className="text-xs font-bold text-slate-300 my-1.5">{children}</h4>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside space-y-1.5 my-2.5 pl-5 text-slate-200">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside space-y-1.5 my-2.5 pl-5 text-slate-200">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-slate-200 leading-relaxed font-sans">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-[#ff9900] bg-slate-900/60 pl-4 py-2.5 my-3 rounded-r-xl text-slate-300 italic font-sans">{children}</blockquote>
            );
          },
          hr() {
            return <hr className="border-slate-800 my-4" />;
          },
          p({ children }) {
            return <p className="my-2 text-slate-200 leading-relaxed break-words [word-break:break-word]">{children}</p>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
