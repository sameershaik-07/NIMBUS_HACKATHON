import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { chatApiService } from '../services/api';
import { ClubDocument } from '../types/documents';
import { isCurrentUserAdmin } from '../utils/admin';
import {
  FilePlus2,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

interface AdminPageProps {
  onNavigateToChat?: () => void;
  onNavigateToDashboard?: () => void;
}

const EMPTY_CONTENT = (
  '# New document\n\nDescribe the topic here so the assistant can answer questions from it.'
);

export const AdminPage: React.FC<AdminPageProps> = ({
  onNavigateToChat,
  onNavigateToDashboard,
}) => {
  const { isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const [filename, setFilename] = useState('');
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [documents, setDocuments] = useState<ClubDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsAdmin(isAuthenticated && isCurrentUserAdmin());
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAdmin) return;
    loadDocuments();
  }, [isAdmin]);

  const loadDocuments = async () => {
    try {
      setLoadingDocs(true);
      const docs = await chatApiService.getDocuments();
      const adminDocs = docs.filter((d) => d.s3Key.startsWith('admin/'));
      setDocuments(adminDocs);
    } catch {
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setContent(String(reader.result || ''));
    };
    reader.readAsText(file);
  };

  const handlePublish = async () => {
    setStatus(null);

    const trimmedName = filename.trim();
    if (!trimmedName) {
      setStatus({ type: 'err', text: 'Please provide a document filename.' });
      return;
    }
    if (!content.trim()) {
      setStatus({ type: 'err', text: 'Document content cannot be empty.' });
      return;
    }

    setPublishing(true);
    try {
      const result = await chatApiService.publishDocument({
        filename: trimmedName,
        content,
      });
      if (result.success) {
        setStatus({
          type: 'ok',
          text: result.message || 'Document published.',
        });
        setFilename('');
        setContent(EMPTY_CONTENT);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await loadDocuments();
      } else {
        setStatus({ type: 'err', text: result.error || 'Publish failed.' });
      }
    } catch (err: any) {
      setStatus({
        type: 'err',
        text: err.message || 'Unable to publish the document.',
      });
    } finally {
      setPublishing(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-white">Admin access required</h1>
        <p className="mt-3 text-sm text-slate-400 max-w-md leading-relaxed">
          Publishing and updating club documents is restricted to club
          administrators. If you believe this is a mistake, please contact
          the AWS Student Builder Group leadership.
        </p>
        <div className="mt-8 flex gap-3">
          {onNavigateToChat && (
            <button
              onClick={onNavigateToChat}
              className="px-6 py-3 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-[#ff9900] to-[#ec7211] hover:brightness-110 transition-all"
            >
              Open Club Assistant
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ff9900]/15 border border-[#ff9900]/40 flex items-center justify-center">
            <FilePlus2 className="w-6 h-6 text-[#ff9900]" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#ff9900]">
              Admin Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Publish Club Documents
            </h1>
          </div>
        </div>
        {onNavigateToDashboard && (
          <button
            onClick={onNavigateToDashboard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        )}
      </div>

      {status && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm animate-shake ${
            status.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {status.type === 'ok' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Publisher form */}
        <div className="lg:col-span-3 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Filename
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. 10-team-roster.md"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-[#ff9900] focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                Letters, numbers, dashes, underscores and dots only. A
                <code className="text-[#ff9900]"> .md</code> extension is
                added automatically.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Content (Markdown)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-[#ff9900] transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt,text/markdown"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-[#ff9900] focus:outline-none text-sm text-slate-200 placeholder-slate-500 font-mono leading-relaxed transition-colors resize-y"
              placeholder="Paste your document markdown here…"
            />

            <div className="flex items-center justify-end gap-4 pt-1">
              <span className="text-[11px] text-slate-500">
                {content.length.toLocaleString()} characters
              </span>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-[#ff9900] to-[#ec7211] hover:brightness-110 shadow-[0_0_25px_rgba(255,153,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FilePlus2 className="w-5 h-5" />
                )}
                {publishing ? 'Publishing…' : 'Publish Document'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Published documents are stored in S3 and automatically
              re-indexed into the Knowledge Base. They usually become
              searchable in the assistant within ~60 seconds.
            </p>
          </div>
        </div>


        {/* Recently published list */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#ff9900]" />
              Published by Admin
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {documents.length}
            </span>
          </div>

          {loadingDocs ? (
            <div className="flex items-center justify-center py-10 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No admin-published documents yet.
            </p>
          ) : (
            <ul className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {documents.map((doc) => (
                <li
                  key={doc.s3Key}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#ff9900]/10 border border-[#ff9900]/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#ff9900]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono font-bold text-slate-100 truncate">
                      {doc.filename}
                    </p>
                    {doc.publishedAt && (
                      <p className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(doc.publishedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

