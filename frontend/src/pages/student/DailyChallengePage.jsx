import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dailyChallengeApi } from '../../services/api';
import confetti from 'canvas-confetti';
import { Calendar, Flame, CheckCircle2, XCircle, Sparkles, Code, ArrowRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import DailyChallengeSkeleton from '../../components/skeletons/DailyChallengeSkeleton';

const DailyChallengePage = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const { data: challenge = null, isLoading: loading } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: async () => {
      const res = await dailyChallengeApi.getToday();
      return res.data?.data || null;
    },
  });

  const handleSelect = (qId, option) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qId]: option });
  };

  const handleSubmit = () => {
    if (!challenge) return;
    let correct = 0;
    challenge.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOption) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);

    if (correct >= 3) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  if (loading) {
    return <DailyChallengeSkeleton />;
  }

  const questions = challenge?.questions || [];

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-100">
            <Calendar className="w-4 h-4" />
            <span>Daily Sprint • {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{challenge?.title || 'Daily Technical Challenge'}</h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl">
            {challenge?.description || 'Sharpen technical memory with 5 curated questions. Maintain your daily streak.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
              <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
              +50 Streak Bonus Points
            </span>
            <span className="text-xs text-emerald-100 font-medium">5 Questions • Immediate Solutions</span>
          </div>
        </div>

        {/* Score banner after submission */}
        {submitted && (
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shrink-0">
                {score}/5
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {score >= 4 ? 'Brilliant Streak Master!' : 'Good Effort!'}
                </h3>
                <p className="text-xs text-slate-500">
                  You scored {score} out of 5 correct. Review the solutions below to solidify your knowledge.
                </p>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
            >
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userChoice = selectedAnswers[q.id];
            const isCorrect = userChoice === q.correctOption;
            const options = [
              { letter: 'A', text: q.optionA },
              { letter: 'B', text: q.optionB },
              { letter: 'C', text: q.optionC },
              { letter: 'D', text: q.optionD },
            ];

            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Question {idx + 1} of {questions.length}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {q.topic ? q.topic.name : q.subject?.name}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                  {q.questionText}
                </h3>

                {q.codeSnippet && (
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                    <pre>{q.codeSnippet}</pre>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-2.5 pt-1">
                  {options.map(({ letter, text }) => {
                    const isSelected = userChoice === letter;
                    const isAnswer = q.correctOption === letter;

                    let style = 'border-slate-200 hover:border-slate-300 bg-white text-slate-700';
                    let badgeStyle = 'bg-slate-100 text-slate-600';

                    if (submitted) {
                      if (isAnswer) {
                        style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                        badgeStyle = 'bg-emerald-600 text-white';
                      } else if (isSelected && !isAnswer) {
                        style = 'border-rose-400 bg-rose-50 text-rose-950 line-through';
                        badgeStyle = 'bg-rose-600 text-white';
                      }
                    } else if (isSelected) {
                      style = 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 text-emerald-950 font-semibold';
                      badgeStyle = 'bg-emerald-600 text-white';
                    }

                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={submitted}
                        onClick={() => handleSelect(q.id, letter)}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 text-xs sm:text-sm transition-all ${style}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}>
                            {letter}
                          </span>
                          <span>{text}</span>
                        </div>
                        {submitted && isAnswer && (
                          <span className="text-[10px] font-bold text-emerald-700">Correct ✅</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation revealed on submission */}
                {submitted && (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1 mt-3 animate-in fade-in">
                    <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Explanation:
                    </p>
                    <p className="text-indigo-900 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        {!submitted && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 flex items-center gap-2 transition-all hover:scale-[1.01]"
            >
              Submit Daily Sprint ({Object.keys(selectedAnswers).length}/{questions.length} Answered)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallengePage;
