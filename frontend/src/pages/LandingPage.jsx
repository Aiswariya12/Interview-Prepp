import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { subjectApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  Brain,
  Code2,
  Database,
  Coffee,
  Leaf,
  Atom,
  Server,
  Cpu,
  Network,
  Binary,
  Users,
  HelpCircle,
} from 'lucide-react';
import bgVideo from '../assets/background video.mp4';

const iconMap = {
  Coffee, Leaf, Atom, Code2, Database, Binary, Server, Cpu, Network, Brain,
};

const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: subjects = [], isLoading: loading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await subjectApi.getAllActive();
      return res.data?.data || [];
    },
  });

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ═══════════════════════════════════════════════
          HERO SECTION — Premium Responsive Hero with High-Definition Video Showcase
      ═══════════════════════════════════════════════ */}
      <section className="relative border-b border-slate-200/90 bg-gradient-to-b from-[#eef5fe] via-[#f4f8fe] to-slate-50 min-h-[calc(100vh-4rem)] flex items-center overflow-hidden py-8 sm:py-12 lg:py-14">
        {/* Soft Ambient Radial Lights */}
        <div className="absolute -top-28 -left-28 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 -right-28 -translate-y-1/2 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">

            {/* Left Column (Mobile: 100%, Desktop: 7 cols) */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-4 sm:space-y-5 text-left">

              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-indigo-100/90 text-indigo-700 text-[11px] sm:text-xs font-semibold shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Full Stack Mock Assessment &amp; Interview Analytics</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-[3.15rem] font-black text-slate-900 tracking-tight leading-[1.14]">
                Master Technical
                <br />
                Interviews with{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Data-Driven Precision
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-[14px] lg:text-[15px] xl:text-base text-slate-600 leading-relaxed max-w-lg lg:max-w-xl">
                Simulated exam environments for Java, Spring Boot, React, MySQL, DSA &amp; CS Fundamentals.
                Randomized question generation, instant grading, in-depth explanations, and AI-driven weak
                topic detection.
              </p>

              {/* MOBILE ONLY Video Showcase Card (Clean, uncropped, 100% visible mascot) */}
              <div className="block lg:hidden my-4 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-indigo-100/90 bg-white aspect-video group">
                  <video
                    ref={(el) => { if (el) el.muted = true; }}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover"
                  >
                    <source src={bgVideo} type="video/mp4" />
                  </video>
                  {/* Floating Badge on Mobile Video */}
                  <div className="absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs text-[10px] font-bold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>AI Mock System</span>
                  </div>
                </div>
              </div>

              {/* Trust Checkmarks */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-600 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Dynamic 30m Countdown
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  AI Weakness Radar
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  100% Free Practice
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                {isAuthenticated ? (
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all text-sm sm:text-base group text-center"
                  >
                    Go to {isAdmin ? 'Admin Portal' : 'Student Dashboard'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all text-sm sm:text-base group text-center"
                    >
                      Start Free Mock Practice
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-300 hover:border-indigo-300 hover:bg-white text-slate-800 font-semibold shadow-xs hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all text-sm sm:text-base text-center"
                    >
                      Live Demo Login
                    </Link>
                  </>
                )}
              </div>

              {/* Metric Stat Cards */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 pt-2 max-w-lg lg:max-w-xl">
                {/* Card 1: 10+ Core Tech Subjects */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-sm border border-slate-100/90 hover:border-indigo-200 flex items-center gap-2.5 sm:gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 group">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 flex items-center justify-center shrink-0 shadow-xs transition-transform">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm sm:text-lg font-black text-slate-900 leading-tight">10+</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">Core Tech Subjects</p>
                  </div>
                </div>

                {/* Card 2: 1,000+ Vetted Questions */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-sm border border-slate-100/90 hover:border-sky-200 flex items-center gap-2.5 sm:gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 group">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-105 flex items-center justify-center shrink-0 shadow-xs transition-transform">
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm sm:text-lg font-black text-slate-900 leading-tight">1,000+</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">Vetted Questions</p>
                  </div>
                </div>

                {/* Card 3: 100% Detailed Solutions */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-sm border border-slate-100/90 hover:border-emerald-200 flex items-center gap-2.5 sm:gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 group">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 flex items-center justify-center shrink-0 shadow-xs transition-transform">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm sm:text-lg font-black text-emerald-600 leading-tight">100%</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">Detailed Solutions</p>
                  </div>
                </div>

                {/* Card 4: AI Coach Weak Area Radar */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-sm border border-slate-100/90 hover:border-violet-200 flex items-center gap-2.5 sm:gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 group">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-violet-50 text-violet-600 group-hover:scale-105 flex items-center justify-center shrink-0 shadow-xs transition-transform">
                    <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm sm:text-lg font-black text-violet-600 leading-tight">AI Coach</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">Weak Area Radar</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Desktop Only: 5 cols interactive visual showcase) */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative items-center justify-center select-none">
              
              {/* Ambient Radial Backlight Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 via-violet-500/15 to-sky-400/20 blur-3xl rounded-full pointer-events-none" />

              {/* Floating Pill: Tech Stack Chips (Top Right) */}
              <div className="absolute -top-3 right-2 xl:-right-2 z-20 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md text-xs font-bold text-slate-700 animate-float">
                <span className="text-indigo-600">☕ Java</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600">🍃 Spring</span>
                <span className="text-slate-300">•</span>
                <span className="text-sky-600">⚛️ React</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600">🗄️ MySQL</span>
              </div>

              {/* Video Visual Wrapper */}
              <div className="relative z-10 w-full rounded-3xl overflow-hidden shadow-2xl border border-indigo-100/90 bg-white group">
                <video
                  ref={(el) => { if (el) el.muted = true; }}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                >
                  <source src={bgVideo} type="video/mp4" />
                </video>

                {/* Floating Glass Card: 82% Diagnostic Accuracy (Top Left) */}
                <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-indigo-100 flex items-center gap-3 animate-float [animation-delay:0.5s]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-900">82%</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">↑ 12%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Diagnostic Accuracy</p>
                  </div>
                </div>

                {/* Floating Glass Card: AI Weakness Radar (Bottom Right) */}
                <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-violet-100 flex items-center gap-3 animate-float [animation-delay:1.8s]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">AI Coach Radar</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Targeted Concept Drills</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PLACEMENT TARGET COMPANIES STRIP (Social Proof)
      ═══════════════════════════════════════════════ */}
      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xs py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 text-center md:text-left">
              Tailored For Top Placement Drives &amp; Tech Assessments
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {[
                { name: 'Amazon', role: 'SDE-1' },
                { name: 'Google', role: 'SWE' },
                { name: 'Microsoft', role: 'Dev' },
                { name: 'TCS Digital', role: 'Digital / Prime' },
                { name: 'Infosys', role: 'Specialist' },
                { name: 'Cognizant', role: 'GenC Next' },
                { name: 'Product Startups', role: 'Full Stack' },
              ].map((co, idx) => (
                <div
                  key={idx}
                  className="px-2.5 sm:px-3 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 text-[11px] sm:text-xs text-slate-700 font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>{co.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({co.role})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          FEATURE HIGHLIGHTS
      ═══════════════════════════════════════════════ */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Platform Capabilities</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Engineered for Technical Mastery</p>
          <p className="text-sm text-slate-600 mt-2">
            Every feature is architected to mirror high-stakes campus and product company placement assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Feature 1: Dynamic Mock Engine */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-2xs">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Dynamic Mock Engine</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Randomizes questions dynamically based on selected subjects, topics, and difficulty levels.
                Includes real-time countdown timer, question navigation palette, and auto-submit on timeout.
              </p>
            </div>
            {/* Interactive Preview Widget */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1 font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} /> 28:45
              </div>
              <div className="flex items-center gap-1">
                <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">1✓</span>
                <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">2⏳</span>
                <span className="w-5 h-5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center">3⚑</span>
                <span className="w-5 h-5 rounded bg-slate-100 text-slate-400 text-[10px] font-bold flex items-center justify-center">4</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Granular Performance Analytics */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-2xs">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Granular Performance Analytics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instant evaluation with configurable negative marking, accuracy calculations, time analytics,
                and interactive Recharts donut and bar breakdowns.
              </p>
            </div>
            {/* Interactive Preview Widget */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Evaluation Accuracy</span>
                <span className="font-bold text-emerald-600">88.5%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style={{ width: '88.5%' }}></div>
              </div>
            </div>
          </div>

          {/* Feature 3: Weak Topic Diagnostic Radar */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-violet-300 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-2xs">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">Weak Topic Diagnostic Radar</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Identifies sub-topics where accuracy falls below 65%. Automatically suggests targeted drills
                and curated revision strategies to close conceptual gaps.
              </p>
            </div>
            {/* Interactive Preview Widget */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Concurrency: 45% (Drill)
              </span>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Spring REST: 92%
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SUBJECT TRACKS SHOWCASE
      ═══════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Curriculum Spectrum</h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">Explore Examination Modules</p>
            </div>
            <Link
              to="/mock/new"
              className="mt-4 md:mt-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 group"
            >
              Configure Custom Mock Test <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((sub) => {
                const IconComponent = iconMap[sub.icon] || Code2;
                return (
                  <div
                    key={sub.id}
                    className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: sub.color || '#4f46e5' }}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                          {sub.topics ? `${sub.topics.length} Subtopics` : 'Curated Track'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{sub.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">Randomized Bank</span>
                      <button
                        onClick={() => navigate(`/mock/new?subjectId=${sub.id}`)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        Start Test <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PRODUCTION ARCHITECTURE BANNER
      ═══════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Ambient light blob */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
                Enterprise Full-Stack Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Built to Impress Technical Recruiters
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                Featuring decoupled Vite+React frontend, Spring Boot 3 layered REST APIs, BCrypt &amp;
                JWT stateless security, Spring Data JPA / Hibernate ORM, and MySQL schema design.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Controller-Service-Repo Layers</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Stateless JWT Filter Chains</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> OpenAPI / Swagger UI Ready</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Cloud Deploy Ready</div>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-slate-700/80 font-mono text-xs text-slate-300 space-y-2.5 shadow-2xl overflow-x-auto">
              <div className="flex items-center justify-between text-slate-400 pb-2.5 border-b border-slate-700/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] ml-2 text-slate-400">system-architecture.json</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  ● 200 OK
                </span>
              </div>
              <p className="text-indigo-400 font-semibold">// Live Production Flow</p>
              <p><span className="text-purple-400">React Frontend</span> &rarr; Vercel Deployment</p>
              <p><span className="text-sky-400">Spring Boot API</span> &rarr; Render / Railway Host</p>
              <p><span className="text-emerald-400">MySQL Database</span> &rarr; Managed Cloud Engine</p>
              <p><span className="text-amber-400">Security</span> &rarr; Role-Based Authorization (Student/Admin)</p>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Latency: &lt;150ms</span>
                <span>Stateless: Bearer JWT</span>
                <span>Uptime: 99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
