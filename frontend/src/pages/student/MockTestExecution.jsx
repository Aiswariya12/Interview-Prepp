import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { mockTestApi } from '../../services/api';
import {
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Flag,
  RotateCcw,
  Send,
  HelpCircle,
  Code
} from 'lucide-react';

const MockTestExecution = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [mockQuestionId]: selectedOption }
  const [reviews, setReviews] = useState({}); // { [mockQuestionId]: boolean }

  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Load test
  useEffect(() => {
    mockTestApi.getById(id)
      .then((res) => {
        const data = res.data.data;
        if (data.status === 'COMPLETED') {
          navigate(`/mock/results/${data.id}`);
          return;
        }

        setTest(data);
        const qs = data.questions || [];
        setQuestions(qs);

        // Prepopulate answers and reviews if any
        const initialAnswers = {};
        const initialReviews = {};
        qs.forEach((q) => {
          if (q.selectedOption) initialAnswers[q.mockQuestionId] = q.selectedOption;
          if (q.isMarkedForReview) initialReviews[q.mockQuestionId] = true;
        });
        setAnswers(initialAnswers);
        setReviews(initialReviews);

        // Calculate timer
        const totalSeconds = (data.durationMinutes || 15) * 60;
        setSecondsRemaining(totalSeconds);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load mock test session.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Countdown Timer
  useEffect(() => {
    if (loading || secondsRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, secondsRemaining]);

  const handleSelectOption = (mockQuestionId, optionLetter) => {
    const updated = { ...answers, [mockQuestionId]: optionLetter };
    setAnswers(updated);

    // Save answer to backend
    mockTestApi.saveAnswer(id, {
      mockQuestionId,
      selectedOption: optionLetter,
      isMarkedForReview: !!reviews[mockQuestionId],
    }).catch(console.error);
  };

  const handleClearAnswer = (mockQuestionId) => {
    const updated = { ...answers };
    delete updated[mockQuestionId];
    setAnswers(updated);

    mockTestApi.saveAnswer(id, {
      mockQuestionId,
      selectedOption: null,
      isMarkedForReview: !!reviews[mockQuestionId],
    }).catch(console.error);
  };

  const handleToggleReview = (mockQuestionId) => {
    const currentReview = !!reviews[mockQuestionId];
    const updated = { ...reviews, [mockQuestionId]: !currentReview };
    setReviews(updated);

    mockTestApi.saveAnswer(id, {
      mockQuestionId,
      selectedOption: answers[mockQuestionId] || null,
      isMarkedForReview: !currentReview,
    }).catch(console.error);
  };

  const handleAutoSubmit = () => {
    handleSubmit(true);
  };

  const handleSubmit = async (isAuto = false) => {
    if (submitting) return;
    setSubmitting(true);
    setConfirmModalOpen(false);

    try {
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

      const answerList = questions.map((q) => ({
        mockQuestionId: q.mockQuestionId,
        selectedOption: answers[q.mockQuestionId] || null,
        isMarkedForReview: !!reviews[q.mockQuestionId],
      }));

      const res = await mockTestApi.submit({
        mockTestId: parseInt(id),
        timeTakenSeconds: timeTaken,
        answers: answerList,
      });

      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['test-history'] });

      navigate(`/mock/results/${id}`, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Error submitting test. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Preparing test environment &amp; randomized questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 max-w-md">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">No Questions Found</h2>
          <p className="text-xs text-slate-500">
            No questions matched the chosen criteria. Please configure a new test with different topics or difficulty.
          </p>
          <button
            onClick={() => navigate('/mock/new')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Back to Config
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentSelectedOption = answers[currentQ.mockQuestionId];
  const isCurrentReviewed = !!reviews[currentQ.mockQuestionId];

  // Format timer MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isLowTime = secondsRemaining <= 120; // < 2 mins warning

  // Counts for summary
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(reviews).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Sticky Test Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-0 min-h-[4rem] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              {test?.subjectName}
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-slate-500 truncate max-w-xs">
              {test?.topicName} • {test?.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
            {/* Real-time Timer */}
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full font-mono text-xs sm:text-sm font-bold shadow-xs transition-colors ${
                isLowTime
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                  : 'bg-slate-900 text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{timeFormatted}</span>
            </div>

            <button
              onClick={() => setConfirmModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Testing View */}
      <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* Left 3 Columns: Active Question Card */}
        <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-8 flex flex-col justify-between min-h-[520px] sm:min-h-[560px]">
          <div className="space-y-6">
            {/* Question status tags */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  +{currentQ.marks || 1} Marks
                </span>
                {test?.isNegativeMarking && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700">
                    -0.25 Penalty
                  </span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                {currentQ.questionText}
              </h2>

              {/* Code Snippet Box if available */}
              {currentQ.codeSnippet && (
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                  <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                    <Code className="w-3 h-3 text-indigo-400" />
                    <span>Code Snippet</span>
                  </div>
                  <pre className="leading-relaxed">{currentQ.codeSnippet}</pre>
                </div>
              )}
            </div>

            {/* Multiple Choice Options (A, B, C, D) */}
            <div className="space-y-3 pt-2">
              {[
                { letter: 'A', text: currentQ.optionA },
                { letter: 'B', text: currentQ.optionB },
                { letter: 'C', text: currentQ.optionC },
                { letter: 'D', text: currentQ.optionD },
              ].map(({ letter, text }) => {
                const isSelected = currentSelectedOption === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.mockQuestionId, letter)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {letter}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium leading-relaxed pt-0.5 ${isSelected ? 'text-indigo-950 font-semibold' : 'text-slate-700'}`}>
                      {text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Navigation Footer */}
          <div className="pt-6 sm:pt-8 mt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleReview(currentQ.mockQuestionId)}
                className={`flex-1 sm:flex-none justify-center px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-center ${
                  isCurrentReviewed
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isCurrentReviewed ? 'fill-amber-600 text-amber-600' : ''}`} />
                <span>{isCurrentReviewed ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>

              {currentSelectedOption && (
                <button
                  type="button"
                  onClick={() => handleClearAnswer(currentQ.mockQuestionId)}
                  className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 disabled:opacity-40 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer text-center"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors cursor-pointer text-center"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(true)}
                  className="flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition-colors cursor-pointer text-center"
                >
                  Submit Examination <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Question Palette Navigation */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Question Palette</h3>
          </div>

          {/* Palette Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <span>Unanswered ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Review ({markedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full ring-2 ring-indigo-600 bg-white"></div>
              <span>Current</span>
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-5 gap-2 pt-2">
            {questions.map((q, idx) => {
              const hasAnswer = !!answers[q.mockQuestionId];
              const isReviewed = !!reviews[q.mockQuestionId];
              const isCurrent = currentIndex === idx;

              let style = 'bg-slate-100 text-slate-700 border-slate-200';
              if (hasAnswer && isReviewed) {
                style = 'bg-amber-500 text-white border-amber-600';
              } else if (hasAnswer) {
                style = 'bg-emerald-500 text-white border-emerald-600';
              } else if (isReviewed) {
                style = 'bg-amber-100 text-amber-800 border-amber-300';
              }

              return (
                <button
                  key={q.mockQuestionId}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center border transition-all ${style} ${
                    isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105 z-10' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setConfirmModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Finish &amp; Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Test Submission</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to end this mock test? Once submitted, the Spring Boot engine will automatically evaluate your score.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-xl shadow-2xs">
                <p className="text-lg font-bold text-emerald-600">{answeredCount}</p>
                <p className="text-[10px] text-slate-500">Answered</p>
              </div>
              <div className="p-2 bg-white rounded-xl shadow-2xs">
                <p className="text-lg font-bold text-amber-600">{markedCount}</p>
                <p className="text-[10px] text-slate-500">Marked</p>
              </div>
              <div className="p-2 bg-white rounded-xl shadow-2xs">
                <p className="text-lg font-bold text-slate-400">{unansweredCount}</p>
                <p className="text-[10px] text-slate-500">Skipped</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Resume Examination
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Yes, Submit Now</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTestExecution;
