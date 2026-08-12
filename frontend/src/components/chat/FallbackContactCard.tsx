import React from 'react';
import { FALLBACK_CONTACT } from '../../config/env';
import { ShieldCheck, Mail, Globe, HelpCircle } from 'lucide-react';

export const FallbackContactCard: React.FC = () => {
  return (
    <div className="my-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-[#ff9900]/40 p-5 shadow-[0_0_25px_rgba(255,153,0,0.12)] animate-fadeIn">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#ff9900]/15 border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900]">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Need Additional Assistance?</h4>
          <p className="text-xs text-slate-400">
            This question is outside the official club starter documents.
          </p>
        </div>
      </div>

      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ff9900]/20 flex items-center justify-center text-[#ff9900]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {FALLBACK_CONTACT.name}
            </div>
            <div className="text-xs text-[#ff9900] font-medium">
              {FALLBACK_CONTACT.role}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <a
            href={`mailto:${FALLBACK_CONTACT.email}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-[#ff9900]/15 border border-slate-800 hover:border-[#ff9900]/40 text-xs text-slate-200 hover:text-[#ff9900] transition-all group"
          >
            <Mail className="w-3.5 h-3.5 text-[#ff9900]" />
            <span className="truncate">{FALLBACK_CONTACT.email}</span>
          </a>

          <a
            href="https://aws.amazon.com/developer/community/student-builders/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 hover:text-white transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-[#ff9900]" />
            <span>AWS Student Builders</span>
          </a>
        </div>
      </div>
    </div>
  );
};
