import React from 'react';
import { Shield, ExternalLink, Globe, BookOpen, Cpu, Terminal, LayoutDashboard } from 'lucide-react';

export const Footer: React.FC = () => {
  const awsLinks = [
    {
      label: 'AWS Student Builders',
      url: 'https://aws.amazon.com/developer/community/student-builders/',
      icon: Globe
    },
    {
      label: 'AWS Builder Center',
      url: 'https://builder.aws.com',
      icon: LayoutDashboard
    },
    {
      label: 'AWS Management Console',
      url: 'https://console.aws.com',
      icon: Terminal
    },
    {
      label: 'AWS Bedrock',
      url: 'https://aws.amazon.com/bedrock/',
      icon: Cpu
    },
    {
      label: 'AWS Documentation',
      url: 'https://docs.aws.com',
      icon: BookOpen
    }
  ];

  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#070a12]/90 py-8 px-4 text-center">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
        
        {/* Official Chapter Badge */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-5 py-2.5 rounded-full shadow-inner">
          <div className="flex items-center gap-2 font-semibold text-slate-100">
            <Shield className="w-4 h-4 text-[#ff9900]" />
            <span>AWS Student Builder Group</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-medium">Official Campus Chapter</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-medium">Powered by AWS Cloud & Amazon Bedrock</span>
        </div>

        {/* Official AWS Direct Links List */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {awsLinks.map((link) => {
            const IconComp = link.icon;
            return (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-[#ff9900]/40 text-xs font-medium text-slate-300 hover:text-[#ff9900] transition-all duration-200"
              >
                <IconComp className="w-3.5 h-3.5 text-[#ff9900]" />
                <span>{link.label}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            );
          })}
        </div>

        {/* Footer Brand Caption */}
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Official Campus AWS Student Builder Group • Built for members learning by building on AWS.
        </p>
      </div>
    </footer>
  );
};
