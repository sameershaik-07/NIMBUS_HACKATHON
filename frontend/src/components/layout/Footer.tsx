import React from 'react';
import { FALLBACK_CONTACT } from '../../config/env';
import { Mail, Phone, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#070a12]/90 py-8 px-4 text-center">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
        
        {/* Leadership Contact Badge */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-full shadow-inner">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Shield className="w-3.5 h-3.5 text-[#ff9900]" />
            <span>{FALLBACK_CONTACT.name}</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-medium">{FALLBACK_CONTACT.role}</span>
          <span className="text-slate-600">•</span>
          <a
            href={`mailto:${FALLBACK_CONTACT.email}`}
            className="flex items-center gap-1 text-[#ff9900] hover:underline transition-all"
          >
            <Mail className="w-3 h-3" />
            {FALLBACK_CONTACT.email}
          </a>
          <span className="text-slate-600">•</span>
          <a
            href={`tel:${FALLBACK_CONTACT.phone}`}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-all"
          >
            <Phone className="w-3 h-3 text-[#ff9900]" />
            {FALLBACK_CONTACT.phone}
          </a>
        </div>

        {/* Footer Brand Caption */}
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Campus AWS Student Builder Group • Built for members learning by building with AWS.
        </p>
      </div>
    </footer>
  );
};
