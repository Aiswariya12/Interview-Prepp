import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { mockTestApi, bookmarkApi } from '../../services/api';
import confetti from 'canvas-confetti';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import AIStudyCoachModal from '../../components/AIStudyCoachModal';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
  Code,
  RotateCcw,
  BookOpen
} from 'lucide-react';

const COLORS = ['#10b981', '#f43f5e', '#94a3b8']; // Correct (Emerald), Wrong (Rose), Skipped (Slate)

const MockTestResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [bookmarkedMap, setBookmarkedMap] = useState({});
  const [aiCoachOpen, setAiCoachOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL', 'INCORRECT', 'CORRECT', 'SKIPPED'

  const { data: result = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['mock-result', id],
    queryFn: async () => {
      const res = await mockTestApi.getResult(id);
      return res.data?.data || null;
    },
    enabled: !!id,
  });

  const error = queryError ? 'Failed to fetch detailed test results.' : '';

  useEffect(() => {
    if (result) {
      const bMap = {};
      result.questions?.forEach((q) => {
        if (q.isBookmarked) bMap[q.questionId] = true;
      });
      setBookmarkedMap(bMap);

      if (result.percentage >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [result]);

  const toggleBookmarkMutation = useMutation({
    mutationFn: (questionId) => bookmarkApi.toggle(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const handleToggleBookmark = async (questionId) => {
    try {
      const res = await toggleBookmarkMutation.mutateAsync(questionId);
      const isNowBookmarked = res.data?.data?.bookmarked;
      setBookmarkedMap((prev) => ({ ...prev, [questionId]: isNowBookmarked }));
      if (isNowBookmarked) {
        toast.success('Question saved to bookmarks!');
      } else {
        toast.info('Question removed from bookmarks');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update bookmark');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Synthesizing result telemetry and explanation tree...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 max-w-md">
          <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Result Not Available</h2>
          <p className="text-xs text-slate-500">{error || 'Unable to display test results.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Correct', value: result.correctCount },
    { name: 'Wrong', value: result.wrongCount },
    { name: 'Skipped', value: result.skippedCount },
  ];

  const filteredQuestions = result.questions.filter((q) => {
    if (filterMode === 'INCORRECT') return !q.isCorrect && !q.isSkipped;
    if (filterMode === 'CORRECT') return q.isCorrect;
    if (filterMode === 'SKIPPED') return q.isSkipped;
    return true;
  });

  const durationMin = Math.floor(result.timeTakenSeconds / 60);
  const durationSec = result.timeTakenSeconds % 60;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Evaluation Completed
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • {new Date(result.completedAt || result.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {result.subjectName} Mock Assessment Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Topic: {result.topicName} • Level: {result.difficulty}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setAiCoachOpen(true)}
              className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer text-center"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask AI Coach</span>
            </button>

            <Link
              to="/mock/new"
              className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer text-center"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Test</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Scorecard Hero + Doughnut Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Score Hero */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md ${
                    result.percentage >= 70
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-200'
                      : result.percentage >= 40
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-500 shadow-amber-200'
                      : 'bg-gradient-to-tr from-rose-600 to-red-500 shadow-rose-200'
                  }`}
                >
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {result.percentage >= 75
                      ? 'Outstanding Performance!'
                      : result.percentage >= 50
                      ? 'Solid Effort & Retention!'
                      : 'More Practice Recommended'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {result.percentage >= 75
                      ? 'Your technical grasp on this module qualifies for high-tier company rounds.'
                      : 'Review the detailed solution explanations below to eliminate recurring misconceptions.'}
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6">
                <p className="text-3xl font-black text-indigo-600">{result.percentage}%</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overall Score</p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
                  <span>Correct</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-extrabold text-emerald-700">{result.correctCount}</p>
                <p className="text-[10px] text-emerald-600 font-medium">+{result.correctCount} pts</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                <div className="flex items-center justify-between text-rose-800 text-xs font-semibold mb-1">
                  <span>Incorrect</span>
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-2xl font-extrabold text-rose-700">{result.wrongCount}</p>
                <p className="text-[10px] text-rose-600 font-medium">
                  {result.isNegativeMarking ? `-${result.wrongCount * 0.25} pts` : 'No penalty'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200">
                <div className="flex items-center justify-between text-slate-700 text-xs font-semibold mb-1">
                  <span>Skipped</span>
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                </div>
                <p className="text-2xl font-extrabold text-slate-800">{result.skippedCount}</p>
                <p className="text-[10px] text-slate-400 font-medium">0 pts</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <div className="flex items-center justify-between text-indigo-800 text-xs font-semibold mb-1">
                  <span>Accuracy</span>
                  <Clock className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-2xl font-extrabold text-indigo-700">{result.accuracy}%</p>
                <p className="text-[10px] text-indigo-600 font-medium">
                  {durationMin}m {durationSec}s taken
                </p>
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-3 min-w-0 overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Answer Distribution
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Total {result.totalQuestions} Questions Evaluated
            </p>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Question by Question Solution Review
              </h2>
              <p className="text-xs text-slate-500">
                Understand the conceptual rationale behind every choice. Bookmark key questions to revisit later.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 text-xs font-semibold overflow-x-auto no-scrollbar touch-scroll max-w-full">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  filterMode === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({result.questions.length})
              </button>
              <button
                onClick={() => setFilterMode('INCORRECT')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  filterMode === 'INCORRECT' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Incorrect ({result.wrongCount})
              </button>
              <button
                onClick={() => setFilterMode('CORRECT')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  filterMode === 'CORRECT' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Correct ({result.correctCount})
              </button>
              <button
                onClick={() => setFilterMode('SKIPPED')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  filterMode === 'SKIPPED' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Skipped ({result.skippedCount})
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredQuestions.map((q, idx) => {
              const isBookmarked = !!bookmarkedMap[q.questionId];
              const options = [
                { letter: 'A', text: q.optionA },
                { letter: 'B', text: q.optionB },
                { letter: 'C', text: q.optionC },
                { letter: 'D', text: q.optionD },
              ];

              return (
                <div
                  key={q.mockQuestionId}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6"
                >
                  {/* Question header info */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Question {q.questionOrder}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {q.topicName}
                      </span>
                      {q.isCorrect ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Correct (+{q.marksObtained})
                        </span>
                      ) : q.isSkipped ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Skipped (0 pts)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Incorrect ({q.marksObtained})
                        </span>
                      )}
                    </div>

                    {/* Bookmark toggle button */}
                    <button
                      onClick={() => handleToggleBookmark(q.questionId)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isBookmarked
                          ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-xs'
                          : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                      title={isBookmarked ? 'Bookmarked' : 'Bookmark this question'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Question Prompt */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                      {q.questionText}
                    </h3>

                    {q.codeSnippet && (
                      <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                        <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                          <Code className="w-3 h-3 text-indigo-400" />
                          <span>Code Snippet</span>
                        </div>
                        <pre className="leading-relaxed">{q.codeSnippet}</pre>
                      </div>
                    )}
                  </div>

                  {/* Options List with status highlights */}
                  <div className="space-y-2.5">
                    {options.map(({ letter, text }) => {
                      const isCorrectAnswer = q.correctOption === letter;
                      const isSelectedByUser = q.selectedOption === letter;

                      let rowStyle = 'border-slate-200 bg-white text-slate-700';
                      let badgeStyle = 'bg-slate-100 text-slate-600 border border-slate-200';

                      if (isCorrectAnswer) {
                        rowStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold';
                        badgeStyle = 'bg-emerald-600 text-white';
                      } else if (isSelectedByUser && !isCorrectAnswer) {
                        rowStyle = 'border-rose-400 bg-rose-50/70 text-rose-950 line-through';
                        badgeStyle = 'bg-rose-600 text-white';
                      }

                      return (
                        <div
                          key={letter}
                          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm ${rowStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                              {letter}
                            </span>
                            <span className="leading-relaxed">{text}</span>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isSelectedByUser && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isCorrectAnswer ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                                }`}
                              >
                                Your Choice {isCorrectAnswer ? '✅' : '❌'}
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                                Correct Answer ✅
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Comprehensive Explanation Box */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5">
                    <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Detailed Explanation:
                    </p>
                    <p className="text-indigo-900 leading-relaxed whitespace-pre-line">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Interview Coach Modal */}
      <AIStudyCoachModal
        isOpen={aiCoachOpen}
        onClose={() => setAiCoachOpen(false)}
        contextData={{
          score: result.score,
          percentage: result.percentage,
          weakTopics: result.questions
            .filter((q) => !q.isCorrect)
            .map((q) => ({
              topicId: null,
              topicName: q.topicName,
              subjectName: result.subjectName,
              accuracyPercentage: 0,
              recommendation: `Revise question #${q.questionOrder}: ${q.explanation.slice(0, 100)}...`,
            })),
        }}
      />
    </div>
  );
};

export default MockTestResult;
