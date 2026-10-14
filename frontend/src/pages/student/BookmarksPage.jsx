import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { bookmarkApi } from '../../services/api';
import { Bookmark, Sparkles, Trash2, CheckCircle2, ChevronDown, ChevronUp, Code, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookmarksSkeleton from '../../components/skeletons/BookmarksSkeleton';

const BookmarksPage = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [showAllBookmarks, setShowAllBookmarks] = useState(false);

  const { data: bookmarks = [], isLoading: loading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await bookmarkApi.getAll();
      return res.data?.data || [];
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (questionId) => bookmarkApi.toggle(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.info('Bookmark removed from your bank');
    },
  });

  const handleRemove = async (questionId) => {
    try {
      await removeBookmarkMutation.mutateAsync(questionId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove bookmark');
    }
  };

  if (loading) {
    return <BookmarksSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-1 border border-amber-200">
              <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Saved Questions Bank</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bookmarked Questions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {bookmarks.length > 5
                ? showAllBookmarks
                  ? `Showing all ${bookmarks.length} saved questions`
                  : `Showing recent 5 of ${bookmarks.length} saved questions`
                : 'Review tricky interview questions, edge cases, and in-depth conceptual explanations.'}
            </p>
          </div>

          {bookmarks.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllBookmarks(!showAllBookmarks)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
            >
              {showAllBookmarks ? (
                <>
                  <span>Show Recent 5 Only</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>View All ({bookmarks.length})</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Bookmarks Saved Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              During any mock test or result analysis, click the bookmark icon on any question to store it here for future revision.
            </p>
            <Link
              to="/mock/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              <BookOpen className="w-4 h-4" /> Start a Mock Test
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(showAllBookmarks ? bookmarks : bookmarks.slice(0, 5)).map((b) => {
              const q = b.question;
              const isExpanded = expandedId === b.id;
              const options = [
                { letter: 'A', text: q.optionA },
                { letter: 'B', text: q.optionB },
                { letter: 'C', text: q.optionC },
                { letter: 'D', text: q.optionD },
              ];

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-4 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {q.subject?.name}
                      </span>
                      {q.topic && (
                        <span className="text-xs text-slate-500 font-medium">
                          • {q.topic.name}
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemove(q.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                    {q.questionText}
                  </h3>

                  {q.codeSnippet && (
                    <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                      <pre>{q.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Collapsible Solution View */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in">
                      <div className="space-y-2">
                        {options.map(({ letter, text }) => {
                          const isCorrect = q.correctOption === letter;
                          return (
                            <div
                              key={letter}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                                isCorrect
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                                  : 'border-slate-200 bg-slate-50/50 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {letter}
                                </span>
                                <span>{text}</span>
                              </div>
                              {isCorrect && (
                                <span className="text-[10px] font-bold text-emerald-700">Correct Answer ✅</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1">
                        <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Explanation:
                        </p>
                        <p className="text-indigo-900 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {bookmarks.length > 5 && (
              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllBookmarks(!showAllBookmarks)}
                  className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {showAllBookmarks ? (
                    <>
                      <span>Show Recent 5 Only</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>View All Saved Questions ({bookmarks.length})</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
