import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, dailyChallengeApi, subjectApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AIStudyCoachModal from '../../components/AIStudyCoachModal';
import {
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  TrendingUp,
  Clock,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Layers,
  BarChart3,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  KeyRound,
  FileText,
  ExternalLink,
  Link2
} from 'lucide-react';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import StudentDashboardSkeleton from '../../components/skeletons/StudentDashboardSkeleton';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedSubjectNoteFilter, setSelectedSubjectNoteFilter] = useState('ALL');
  const [aiCoachOpen, setAiCoachOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [showAllRecentTests, setShowAllRecentTests] = useState(false);

  const {
    data: dashboard = null,
    isLoading: dashLoading,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ['student-dashboard', user?.id || 'current'],
    queryFn: async () => {
      const res = await analyticsApi.getStudentDashboard();
      return res.data?.data || null;
    },
    enabled: !!user || !!localStorage.getItem('interviewprep_token'),
    staleTime: 1000 * 30, // 30 seconds freshness
    retry: 2,
    refetchOnMount: true,
  });

  const { data: dailyChallenge = null } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: async () => {
      try {
        const res = await dailyChallengeApi.getToday();
        return res.data?.data || null;
      } catch (err) {
        console.warn('Daily challenge fetch error:', err);
        return null;
      }
    },
    enabled: !!user || !!localStorage.getItem('interviewprep_token'),
    staleTime: 1000 * 60 * 5,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      try {
        const res = await subjectApi.getAllActive();
        return res.data?.data || [];
      } catch (err) {
        console.warn('Subjects fetch error:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (user?.id || localStorage.getItem('interviewprep_token')) {
      refetchDashboard();
    }
  }, [user?.id, refetchDashboard]);

  const loading = dashLoading && !dashboard;

  if (loading) {
    return <StudentDashboardSkeleton />;
  }

  const weakTopics = dashboard?.weakTopics || [];
  const recentTests = dashboard?.recentTests || [];
  const subjectPerformances = dashboard?.subjectPerformances || [];

  // Flatten notes across subjects
  const allNotes = [];
  const subjectsWithNotes = subjects.filter((s) => s.notes && s.notes.length > 0);
  subjects.forEach((s) => {
    if (s.notes && s.notes.length > 0) {
      s.notes.forEach((n) => {
        allNotes.push({
          ...n,
          subjectId: s.id,
          subjectName: s.name,
          subjectColor: s.color || '#4f46e5',
        });
      });
    }
  });

  const displayedNotes = selectedSubjectNoteFilter === 'ALL'
    ? allNotes
    : allNotes.filter((n) => String(n.subjectId) === String(selectedSubjectNoteFilter));

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Banner / Student Welcome */}
      <div className="bg-gradient-to-r from-white via-indigo-50/30 to-white border-b border-slate-200/80 py-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/90 px-3 py-1 rounded-full border border-indigo-200/80 shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Candidate Workspace
                </span>
                <span className="text-xs text-slate-500 font-medium">• {user?.college || 'Computer Science'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.name || 'Candidate'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Continuous mock evaluation and real-time accuracy diagnostics for technical placements.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={() => setChangePasswordOpen(true)}
                className="flex-1 sm:flex-none justify-center px-3 sm:px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer text-center"
              >
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>Password</span>
              </button>

              <button
                onClick={() => setAiCoachOpen(true)}
                className="flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-200 hover:shadow-indigo-300 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>AI Coach</span>
              </button>

              <Link
                to="/mock/new"
                className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-200 hover:shadow-indigo-300 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center"
              >
                <BookOpen className="w-4 h-4" />
                <span>Start Mock Test</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 animate-fade-in-up">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs card-hover group hover:border-indigo-400">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">Total Tests</span>
              <BookOpen className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{dashboard?.totalTests || 0}</p>
            <p className="text-[11px] text-slate-400 mt-1">Completed Mocks</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs card-hover group hover:border-emerald-400">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">Average Score</span>
              <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600">{dashboard?.averageScore || 0}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Overall Mean</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs card-hover group hover:border-sky-400">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-sky-600 transition-colors">Accuracy</span>
              <CheckCircle2 className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-sky-600">{dashboard?.accuracy || 0}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Correct / Attempted</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs card-hover group hover:border-violet-400">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-violet-600 transition-colors">Questions</span>
              <BarChart3 className="w-4 h-4 text-violet-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{dashboard?.questionsSolved || 0}</p>
            <p className="text-[11px] text-slate-400 mt-1">Attempted in Tests</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs card-hover group hover:border-amber-400">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-amber-600 transition-colors">Best Score</span>
              <Trophy className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-amber-600">{dashboard?.bestScore || 0}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Personal Record</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs card-hover group hover:border-rose-400">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-rose-600 transition-colors">Active Streak</span>
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-rose-600">{dashboard?.streakDays || 1} Days</p>
            <p className="text-[11px] text-slate-400 mt-1">Continuous Practice</p>
          </div>
        </div>

        {/* Weak Topic Detection Alert Card */}
        {weakTopics.length > 0 && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent border border-amber-200/80 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    ⚠ Weak Topic Detection Alert
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Needs Attention
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    The platform diagnosed sub-topics where your accuracy is below 70%. Take targeted quizzes to convert them into strengths.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiCoachOpen(true)}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 shrink-0"
              >
                View Diagnostic Recommendations <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {weakTopics.slice(0, 3).map((wt, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white border border-amber-200/60 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{wt.topicName}</span>
                      <span className="text-[11px] font-bold text-rose-600">{wt.accuracyPercentage}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">{wt.subjectName}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{wt.recommendation}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/mock/new?subjectId=${wt.subjectId}&topicId=${wt.topicId}`)}
                    className="mt-3 w-full py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Take Topic Quiz <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Challenge Card */}
        {dailyChallenge && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>Today's Daily Challenge</span>
              </div>
              <h3 className="text-xl font-bold">{dailyChallenge.title}</h3>
              <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
                {dailyChallenge.description} Earn +50 streak bonus points and unlock the "Daily Grinder" achievement.
              </p>
            </div>
            <Link
              to="/daily-challenge"
              className="px-6 py-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all shrink-0 text-center"
            >
              Start 5-Minute Challenge &rarr;
            </Link>
          </div>
        )}

        {/* Subject Notes & Reference Materials Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Subject Notes &amp; Preparation Resources
                  </h3>
                  <p className="text-xs text-slate-500">
                    Handpicked reference notes, cheat sheets, and official documentation curated by administrators.
                  </p>
                </div>
              </div>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-scroll pb-1 max-w-full -mx-2 px-2 sm:mx-0 sm:px-0">
              <button
                type="button"
                onClick={() => setSelectedSubjectNoteFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  selectedSubjectNoteFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Subjects ({allNotes.length})
              </button>
              {subjectsWithNotes.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubjectNoteFilter(String(sub.id))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    selectedSubjectNoteFilter === String(sub.id)
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub.name} ({sub.notes?.length || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {displayedNotes.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No notes links found</p>
              <p className="text-xs text-slate-400">Notes links added by administrators will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedNotes.map((note, idx) => (
                <div
                  key={note.id || idx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${note.subjectColor}15`,
                          color: note.subjectColor,
                        }}
                      >
                        {note.subjectName || note.subject?.name || 'Subject'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Curated'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {note.title}
                    </h4>

                    {note.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {note.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[150px]">
                      {note.url.replace(/^https?:\/\//, '')}
                    </span>
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all shrink-0 cursor-pointer"
                    >
                      <span>Open Notes</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Section: Subject Accuracy Breakdown + Recent Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subject Performance Bars */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Subject Performance
              </h3>
              <span className="text-xs text-slate-400 font-medium">Accuracy %</span>
            </div>

            {subjectPerformances.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Take your first mock test to generate subject-level accuracy telemetry.
              </p>
            ) : (
              <div className="space-y-4">
                {subjectPerformances.map((sp) => (
                  <div key={sp.subjectId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{sp.subjectName}</span>
                      <span className="font-bold text-slate-700">
                        {sp.accuracyPercentage}%{' '}
                        <span className="text-[10px] text-slate-400 font-normal">({sp.testsTaken} tests)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(sp.accuracyPercentage, 5)}%`,
                          backgroundColor:
                            sp.accuracyPercentage >= 75
                              ? '#10b981'
                              : sp.accuracyPercentage >= 50
                              ? '#3b82f6'
                              : '#f59e0b',
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Mock Tests History */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Recent Mock Assessments
                </h3>
                {recentTests.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {showAllRecentTests
                      ? `Showing all ${recentTests.length} assessments`
                      : `Showing recent ${Math.min(5, recentTests.length)} of ${recentTests.length} assessments`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {recentTests.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllRecentTests(!showAllRecentTests)}
                    className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {showAllRecentTests ? (
                      <>
                        <span>Show Recent 5</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>View All ({recentTests.length})</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
                <Link to="/history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Full History &rarr;
                </Link>
              </div>
            </div>

            {recentTests.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No mock tests attempted yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Start your first mock test to experience randomized question selection, timer simulation, and automated scoring.
                </p>
                <Link
                  to="/mock/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  Configure Test Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {(showAllRecentTests ? recentTests : recentTests.slice(0, 5)).map((t) => (
                    <div key={t.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="text-sm font-bold text-slate-900">{t.subjectName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
                            {t.topicName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-indigo-50 text-indigo-700">
                            {t.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {new Date(t.createdAt).toLocaleDateString()} • {t.totalQuestions} Questions • {t.timeTakenSeconds}s taken
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span
                            className={`text-sm font-extrabold ${
                              t.percentage >= 70
                                ? 'text-emerald-600'
                                : t.percentage >= 40
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {t.percentage}%
                          </span>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {t.score}/{t.maxScore} pts
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/mock/results/${t.id}`)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          View Analysis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {recentTests.length > 5 && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllRecentTests(!showAllRecentTests)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                    >
                      {showAllRecentTests ? (
                        <>
                          <span>Show Recent 5 Only</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>View All Recent Assessments ({recentTests.length})</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Interview Coach Modal */}
      <AIStudyCoachModal
        isOpen={aiCoachOpen}
        onClose={() => setAiCoachOpen(false)}
        contextData={{
          weakTopics,
          score: dashboard?.averageScore,
          percentage: dashboard?.accuracy,
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
};

export default StudentDashboard;
