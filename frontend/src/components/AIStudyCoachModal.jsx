import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Brain, BookOpen, CheckCircle, ArrowRight, X, AlertTriangle, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIStudyCoachModal = ({ isOpen, onClose, contextData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('insights');

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const weakTopics = contextData?.weakTopics || [];
  const score = contextData?.score;
  const percentage = contextData?.percentage;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto overscroll-contain bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex flex-col justify-center items-center">
        <div
          className="relative bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full m-auto shadow-2xl border border-indigo-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-400 flex items-center justify-center text-slate-900 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI Interview Coach</h3>
              <p className="text-xs text-indigo-200">Personalized Technical Evaluation &amp; Curriculum Diagnostics</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4 pt-3 border-t border-indigo-700/50">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'insights' ? 'bg-white text-indigo-900 shadow-xs' : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Diagnostic Insights
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'roadmap' ? 'bg-white text-indigo-900 shadow-xs' : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Tailored 3-Step Action Plan
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {activeTab === 'insights' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                <Brain className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">Intelligent Pattern Analysis</h4>
                  <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                    {percentage !== undefined
                      ? percentage >= 80
                        ? `Exceptional accuracy (${percentage}%). Your core fundamentals are solid. Let's sharpen edge cases and concurrency locks.`
                        : percentage >= 50
                        ? `Solid foundation (${percentage}%). You are demonstrating good retention, but certain advanced topics are lowering your overall yield.`
                        : `Current accuracy is ${percentage}%. You will benefit significantly from breaking down multi-step problem patterns into foundational modules.`
                      : 'We continuously synthesize your mock test submissions to pinpoint micro-deficiencies in topic recall.'}
                  </p>
                </div>
              </div>

              {/* Weak areas list */}
              {weakTopics.length > 0 ? (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Identified Attention Areas
                  </h4>
                  <div className="space-y-2.5">
                    {weakTopics.map((topic, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{topic.topicName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-rose-100 text-rose-700">
                              {topic.accuracyPercentage}% Accuracy
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">({topic.subjectName})</span>
                          </div>
                          <p className="text-xs text-slate-600">{topic.recommendation}</p>
                        </div>
                        <button
                          onClick={() => {
                            onClose();
                            navigate(`/mock/new?subjectId=${topic.subjectId}&topicId=${topic.topicId}`);
                          }}
                          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors"
                        >
                          Target Quiz
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800">No Critical Weaknesses Detected!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Keep taking subject-wise mock tests to maintain your high accuracy streak.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recommended Study Protocol
              </h4>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">Concept Deep-Dive</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Review question explanations in your past test history. Pay special attention to why the incorrect distractors were invalid.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">Topic-Specific Drill (10 Questions)</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Launch a focused mock test isolating only the weak topic under strict 10-minute timer conditions.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">Daily Challenge Streak</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Complete today's Daily Tech Sprint to strengthen multi-subject agility and unlock platform mastery badges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            AI recommendations update dynamically after each completed test
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Coach
          </button>
        </div>
      </div>
    </div>
  </div>,
  document.body
);
};

export default AIStudyCoachModal;
