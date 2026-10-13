import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { subjectApi, mockTestApi } from '../../services/api';
import {
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Code2,
  Database,
  Coffee,
  Leaf,
  Atom,
  Server,
  Cpu,
  Network,
  Binary,
  Brain
} from 'lucide-react';

const iconMap = {
  Coffee: Coffee,
  Leaf: Leaf,
  Atom: Atom,
  Code2: Code2,
  Database: Database,
  Binary: Binary,
  Server: Server,
  Cpu: Cpu,
  Network: Network,
  Brain: Brain,
};

const MockTestConfig = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [negativeMarking, setNegativeMarking] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Cached subjects query via TanStack React Query
  const { data: subjects = [], isLoading: loading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await subjectApi.getAllActive();
      return res.data?.data || [];
    },
  });

  // Cached topics query per selected subject
  const { data: topics = [] } = useQuery({
    queryKey: ['topics', selectedSubjectId],
    queryFn: async () => {
      if (!selectedSubjectId) return [];
      const res = await subjectApi.getTopics(selectedSubjectId);
      return res.data?.data || [];
    },
    enabled: !!selectedSubjectId,
  });

  // Handle URL params or default to first subject once subjects load
  useEffect(() => {
    if (subjects.length > 0 && selectedSubjectId === null) {
      const paramSubId = searchParams.get('subjectId');
      const paramTopicId = searchParams.get('topicId');

      if (paramSubId) {
        const found = subjects.find((s) => s.id === parseInt(paramSubId));
        if (found) {
          setSelectedSubjectId(found.id);
          if (paramTopicId) setSelectedTopicId(paramTopicId);
        }
      } else {
        setSelectedSubjectId(subjects[0].id);
      }
    }
  }, [subjects, selectedSubjectId, searchParams]);

  const handleStart = async () => {
    if (!selectedSubjectId) {
      setError('Please select a subject to begin.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        subjectId: selectedSubjectId,
        topicId: selectedTopicId ? parseInt(selectedTopicId) : null,
        difficulty: difficulty,
        numberOfQuestions: parseInt(numberOfQuestions),
        durationMinutes: parseInt(durationMinutes),
        negativeMarking: negativeMarking,
      };

      const res = await mockTestApi.start(payload);
      const testData = res.data.data;
      navigate(`/mock/session/${testData.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to initialize mock test session.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Configurable Mock Examination</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Configure Your Mock Test
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Customize subjects, difficulty parameters, timer duration, and penalty marking.
            The Spring Boot backend will select an unpredictable, randomized pool of questions from the database.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Configuration Controls */}
          <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            {/* 1. Subject Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                1. Select Subject Focus
              </label>
              {loading ? (
                <div className="grid grid-cols-2 gap-3 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {subjects.map((sub) => {
                    const IconComp = iconMap[sub.icon] || Code2;
                    const isSelected = selectedSubjectId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(sub.id);
                          setSelectedTopicId('');
                        }}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: sub.color || '#4f46e5' }}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                            {sub.name}
                          </p>
                          <span className="text-[10px] text-slate-400">Random Pool</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Topic Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                2. Sub-Topic Target (Optional)
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-indigo-600 focus:outline-none bg-white"
              >
                <option value="">All Topics (Comprehensive Coverage)</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Difficulty Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                3. Difficulty Spectrum
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      difficulty === level
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Number of Questions & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  4. Question Count
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNumberOfQuestions(num)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        numberOfQuestions === num
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  5. Time Limit
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDurationMinutes(min)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        durationMinutes === min
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Negative Marking Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">
                    Enable Negative Marking (-0.25 penalty per incorrect answer)
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Recommended for realistic simulation of corporate aptitude and technical rounds.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Test Summary & Launch Side Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Examination Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Selected Subject</span>
                <span className="font-bold text-slate-900">{selectedSubject?.name || 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Topic Scope</span>
                <span className="font-bold text-slate-900">
                  {selectedTopicId ? topics.find((t) => t.id === parseInt(selectedTopicId))?.name : 'All Topics'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Difficulty</span>
                <span className="font-bold text-slate-900">{difficulty}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Questions</span>
                <span className="font-bold text-indigo-600">{numberOfQuestions} Questions</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Test Duration</span>
                <span className="font-bold text-slate-900">{durationMinutes} Minutes</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Negative Penalty</span>
                <span className={`font-bold ${negativeMarking ? 'text-amber-600' : 'text-slate-500'}`}>
                  {negativeMarking ? '-0.25 Marks' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-[11px] leading-relaxed">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Exam Rules:
              </p>
              Once launched, the timer will count down in real-time. Unfinished tests are auto-submitted on timer expiration.
            </div>

            <button
              onClick={handleStart}
              disabled={submitting || !selectedSubjectId}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Launch Examination
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestConfig;
