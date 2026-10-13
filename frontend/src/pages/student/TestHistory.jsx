import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mockTestApi } from '../../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { History, BookOpen, Clock, ArrowRight, Award, TrendingUp, Calendar } from 'lucide-react';
import TestHistorySkeleton from '../../components/skeletons/TestHistorySkeleton';

const TestHistory = () => {
  const navigate = useNavigate();

  const { data: history = [], isLoading: loading } = useQuery({
    queryKey: ['test-history'],
    queryFn: async () => {
      const res = await mockTestApi.getHistory();
      return res.data?.data || [];
    },
  });

  if (loading) {
    return <TestHistorySkeleton />;
  }

  // Prep line chart data (chronological)
  const chartData = [...history]
    .reverse()
    .map((item, idx) => ({
      name: `Mock #${idx + 1}`,
      percentage: item.percentage,
      accuracy: item.accuracy,
      subject: item.subjectName,
    }));

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
              <History className="w-3.5 h-3.5" />
              <span>Performance Trajectory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mock Assessment History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Track your preparation curve and inspect past mock test examinations.
            </p>
          </div>

          <Link
            to="/mock/new"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            Take New Mock Test
          </Link>
        </div>

        {/* Progress Trend Chart */}
        {chartData.length > 1 && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Score Progress Trend (% over time)
              </h3>
              <span className="text-xs font-semibold text-emerald-600">Continuous Growth</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#4f46e5' }}
                    activeDot={{ r: 6 }}
                    name="Score %"
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    name="Accuracy %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">All Completed Mock Assessments</h3>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No mock tests completed yet</p>
              <p className="text-xs text-slate-400">Your examination records will be logged here as you take tests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Subject &amp; Scope</th>
                    <th className="px-6 py-3.5">Difficulty</th>
                    <th className="px-6 py-3.5">Questions</th>
                    <th className="px-6 py-3.5">Score</th>
                    <th className="px-6 py-3.5">Accuracy</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {history.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">{t.subjectName}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{t.topicName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {t.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {t.totalQuestions} Questions ({t.correctCount}C / {t.wrongCount}W)
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold text-sm ${
                            t.percentage >= 70
                              ? 'text-emerald-600'
                              : t.percentage >= 40
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {t.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">{t.score}/{t.maxScore} pts</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {t.accuracy}%
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/mock/results/${t.id}`)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 font-semibold transition-colors"
                        >
                          View Analysis
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestHistory;
