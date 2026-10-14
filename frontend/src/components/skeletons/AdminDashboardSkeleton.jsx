import React from 'react';

export const AdminDashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 animate-fade-in-up">
      {/* Top Banner / Admin Welcome Skeleton */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 py-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl skeleton-shimmer-subtle shrink-0" />
              <div className="space-y-2.5">
                <div className="w-36 h-6 rounded-full skeleton-shimmer-subtle" />
                <div className="w-72 sm:w-96 h-8 rounded-xl skeleton-shimmer-subtle" />
                <div className="w-64 sm:w-80 h-4 rounded-lg skeleton-shimmer-subtle" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32 h-10 rounded-xl skeleton-shimmer-subtle" />
              <div className="w-36 h-10 rounded-xl skeleton-shimmer-subtle" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* 5 Metric Stat Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-20 h-3 rounded skeleton-shimmer" />
                <div className="w-5 h-5 rounded-lg skeleton-shimmer" />
              </div>
              <div className="w-16 h-7 rounded-lg skeleton-shimmer" />
              <div className="w-24 h-2.5 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>

        {/* Navigation Tabs Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-36 sm:w-44 h-9 rounded-xl skeleton-shimmer shrink-0" />
          ))}
        </div>

        {/* Analytics Hero / Insight Banner Skeleton */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="w-48 h-6 rounded-full skeleton-shimmer-subtle" />
              <div className="w-64 sm:w-80 h-7 rounded-xl skeleton-shimmer-subtle" />
              <div className="w-full h-4 rounded skeleton-shimmer-subtle" />
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="w-32 h-20 rounded-2xl skeleton-shimmer-subtle" />
              <div className="w-32 h-20 rounded-2xl skeleton-shimmer-subtle" />
            </div>
          </div>
        </div>

        {/* 2 Graphs Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 1 Skeleton: Bar Chart */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="w-48 h-4 rounded skeleton-shimmer" />
                <div className="w-64 h-3 rounded skeleton-shimmer" />
              </div>
              <div className="w-20 h-6 rounded-full skeleton-shimmer" />
            </div>
            <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4">
              <div className="w-full h-36 rounded-t-xl skeleton-shimmer" />
              <div className="w-full h-48 rounded-t-xl skeleton-shimmer" />
              <div className="w-full h-28 rounded-t-xl skeleton-shimmer" />
              <div className="w-full h-56 rounded-t-xl skeleton-shimmer" />
              <div className="w-full h-40 rounded-t-xl skeleton-shimmer" />
              <div className="w-full h-32 rounded-t-xl skeleton-shimmer" />
            </div>
          </div>

          {/* Graph 2 Skeleton: Distribution / Donut */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="w-44 h-4 rounded skeleton-shimmer" />
                <div className="w-56 h-3 rounded skeleton-shimmer" />
              </div>
              <div className="w-20 h-6 rounded-full skeleton-shimmer" />
            </div>
            <div className="h-64 flex items-center justify-center gap-8">
              <div className="w-40 h-40 rounded-full skeleton-shimmer shrink-0" />
              <div className="space-y-3">
                <div className="w-28 h-3.5 rounded skeleton-shimmer" />
                <div className="w-24 h-3.5 rounded skeleton-shimmer" />
                <div className="w-32 h-3.5 rounded skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table / List Placeholder Skeleton */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="w-64 h-10 rounded-xl skeleton-shimmer" />
            <div className="flex items-center gap-2">
              <div className="w-28 h-10 rounded-xl skeleton-shimmer" />
              <div className="w-28 h-10 rounded-xl skeleton-shimmer" />
            </div>
          </div>

          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg skeleton-shimmer shrink-0" />
                  <div className="space-y-1.5">
                    <div className="w-40 sm:w-60 h-4 rounded skeleton-shimmer" />
                    <div className="w-24 h-3 rounded skeleton-shimmer" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-6 rounded-full skeleton-shimmer" />
                  <div className="w-16 h-6 rounded-full skeleton-shimmer hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;
