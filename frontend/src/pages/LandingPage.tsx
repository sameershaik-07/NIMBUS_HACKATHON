import React from 'react';
import { AWSLogo } from '../components/ui/AWSLogo';
import { ShieldCheck, Bot, Sparkles, ArrowRight, Lock, BookOpen, Cpu, Award } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: 'signin' | 'signup' | 'chat') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 space-y-20">
      
      {/* Hero Section */}
      <div className="text-center space-y-8 animate-fadeIn">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-[#ff9900]/40 text-xs font-semibold text-[#ff9900] shadow-[0_0_20px_rgba(255,153,0,0.15)]">
          <ShieldCheck className="w-4 h-4" />
          <span>Campus AWS Student Builder Group Official Portal</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Club Member Portal
            </span>
          </h1>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ff9900]">
            Member Login + Club Chatbot
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Your authenticated hub for accessing AWS Student Builder Group information, workshop guidance, Builder Center publishing standards, and a document-grounded AI assistant.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('signin')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-slate-950 bg-gradient-to-r from-[#ff9900] to-[#ec7211] shadow-[0_0_30px_rgba(255,153,0,0.4)] hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 text-base"
          >
            <span>Sign In to Member Portal</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all duration-300 text-base"
          >
            <span>Create Member Account</span>
          </button>
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        
        {/* Card 1 */}
        <div className="group rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-[#ff9900]/50 p-7 space-y-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,153,0,0.15)] hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#ff9900]/15 border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900] group-hover:scale-110 transition-transform">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-[#ff9900] transition-colors">
            Secure Authentication
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Protected member authorization powered by Amazon Cognito. End-to-end JWT security ensures member privacy and authorized access to club services.
          </p>
        </div>

        {/* Card 2 */}
        <div className="group rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-[#ff9900]/50 p-7 space-y-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,153,0,0.15)] hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#ff9900]/15 border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900] group-hover:scale-110 transition-transform">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-[#ff9900] transition-colors">
            Document Grounded AI
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Answers strictly derived from official starter documents via Bedrock & RAG. No AI hallucinations — every response carries verified source citations.
          </p>
        </div>

        {/* Card 3 */}
        <div className="group rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-[#ff9900]/50 p-7 space-y-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,153,0,0.15)] hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#ff9900]/15 border border-[#ff9900]/40 flex items-center justify-center text-[#ff9900] group-hover:scale-110 transition-transform">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-[#ff9900] transition-colors">
            Serverless AWS Tech
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Built on AWS API Gateway, AWS Lambda, Amazon Bedrock, Amazon S3, and Amazon Cognito for rapid, scalable student builder workflows.
          </p>
        </div>
      </div>

    </div>
  );
};
