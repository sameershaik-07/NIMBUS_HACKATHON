import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Bot, Calendar, Globe, Cpu, Award, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

interface DashboardPageProps {
  onOpenChatWithQuery?: (query: string) => void;
  onNavigateToChat: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenChatWithQuery,
  onNavigateToChat,
}) => {
  const { user } = useAuth();

  const handleCardClick = (query: string) => {
    if (onOpenChatWithQuery) {
      onOpenChatWithQuery(query);
    } else {
      onNavigateToChat();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#1e293b]/90 border border-slate-800 p-8 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(255,153,0,0.15)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ff9900]/15 border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900] shadow-[0_0_20px_rgba(255,153,0,0.2)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#ff9900]">
                  Authenticated Member
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Welcome back!
                </h1>
              </div>
            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{user?.email}</span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Welcome to the official AWS Student Builder Group member portal. Access document-grounded AI assistance, workshop schedules, and Builder Center guidelines.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={onNavigateToChat}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-slate-950 bg-gradient-to-r from-[#ff9900] to-[#ec7211] shadow-[0_0_30px_rgba(255,153,0,0.4)] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-base"
            >
              <Bot className="w-6 h-6" />
              <span>Open Club Assistant</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ff9900]" />
            Club Knowledge Topics
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Click any topic to query the AI assistant
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Workshops */}
          <button
            onClick={() => handleCardClick('When is the next workshop?')}
            className="group text-left rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-[#ff9900]/50 p-6 space-y-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,153,0,0.15)] hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ff9900]/15 border border-[#ff9900]/30 flex items-center justify-center text-[#ff9900] group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-[#ff9900] transition-colors">
                Workshops
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Find scheduled workshop dates, topics, rooms, and levels from the club index.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#ff9900] flex items-center gap-1 opacity-80 group-hover:opacity-100">
              <span>Ask "Next Workshop"</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Builder Center */}
          <button
            onClick={() => handleCardClick('How do I publish on Builder Center?')}
            className="group text-left rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-[#ff9900]/50 p-6 space-y-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,153,0,0.15)] hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ff9900]/15 border border-[#ff9900]/30 flex items-center justify-center text-[#ff9900] group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-[#ff9900] transition-colors">
                Builder Center
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Learn publishing steps, required architecture diagrams, and tags.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#ff9900] flex items-center gap-1 opacity-80 group-hover:opacity-100">
              <span>Ask "Publish Guide"</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Bedrock & RAG */}
          <button
            onClick={() => handleCardClick('How do I get started with Bedrock?')}
            className="group text-left rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-[#ff9900]/50 p-6 space-y-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,153,0,0.15)] hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ff9900]/15 border border-[#ff9900]/30 flex items-center justify-center text-[#ff9900] group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-[#ff9900] transition-colors">
                Bedrock Starter
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Understand Amazon Bedrock, Knowledge Bases, and RAG architectures.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#ff9900] flex items-center gap-1 opacity-80 group-hover:opacity-100">
              <span>Ask "Bedrock Setup"</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Hackathon Rules */}
          <button
            onClick={() => handleCardClick('What are the hackathon rules?')}
            className="group text-left rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-[#ff9900]/50 p-6 space-y-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,153,0,0.15)] hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ff9900]/15 border border-[#ff9900]/30 flex items-center justify-center text-[#ff9900] group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-[#ff9900] transition-colors">
                Hackathon Rules
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Review team requirements, Builder Center rules, and judging criteria.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#ff9900] flex items-center gap-1 opacity-80 group-hover:opacity-100">
              <span>Ask "Hackathon Rules"</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};
