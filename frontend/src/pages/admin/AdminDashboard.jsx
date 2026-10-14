import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { adminApi, subjectApi, questionApi } from '../../services/api';
import {
  ShieldAlert,
  Users,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Code,
  Sparkles,
  Layers,
  AlertCircle,
  Award,
  Calendar,
  Filter,
  ExternalLink,
  GraduationCap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  Zap,
  Target,
  KeyRound,
  FileText,
  Link2
} from 'lucide-react';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import AdminDashboardSkeleton from '../../components/skeletons/AdminDashboardSkeleton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('interviews'); // 'interviews', 'students', 'questions', 'subjects'
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Interview Filters
  const [interviewStudentFilter, setInterviewStudentFilter] = useState('');
  const [interviewSubjectFilter, setInterviewSubjectFilter] = useState('');
  const [interviewDifficultyFilter, setInterviewDifficultyFilter] = useState('');
  const [interviewSearch, setInterviewSearch] = useState('');

  // Question Filter & Pagination
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  // Question Modal State
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [qFormTopics, setQFormTopics] = useState([]);
  const [qForm, setQForm] = useState({
    subjectId: '',
    topicId: '',
    difficulty: 'MEDIUM',
    questionText: '',
    codeSnippet: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    explanation: '',
    marks: 1.0,
    negativeMarks: 0.25,
    active: true,
  });

  // Subject & Topic Modal State
  const [newSubject, setNewSubject] = useState({ name: '', description: '', icon: 'Code2', color: '#4f46e5' });
  const [selectedSubForTopic, setSelectedSubForTopic] = useState(null);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });

  // Subject Notes State
  const [selectedSubForNote, setSelectedSubForNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', url: '', description: '' });
  const [addingNote, setAddingNote] = useState(false);

  const [feedback, setFeedback] = useState('');

  // TanStack React Query Hooks for caching and high performance
  const { data: stats = null, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminApi.getDashboard();
      return res.data?.data || null;
    },
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await subjectApi.getAllActive();
      return res.data?.data || [];
    },
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      const res = await adminApi.getStudents();
      return res.data?.data || [];
    },
  });

  const { data: interviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ['admin-interviews'],
    queryFn: async () => {
      const res = await adminApi.getInterviews();
      return res.data?.data || [];
    },
  });

  const { data: questionPageData = { content: [], totalPages: 1 }, refetch: refetchQuestions } = useQuery({
    queryKey: ['admin-questions', page, filterSubjectId, filterDifficulty],
    queryFn: async () => {
      const params = {
        page,
        size: 8,
      };
      if (filterSubjectId) params.subjectId = filterSubjectId;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (searchQuery) params.search = searchQuery;

      const res = await questionApi.getQuestions(params);
      return res.data?.data || { content: [], totalPages: 1 };
    },
  });

  const questions = questionPageData.content || [];
  const totalPages = questionPageData.totalPages || 1;
  const loading = statsLoading || subjectsLoading || studentsLoading || interviewsLoading;

  useEffect(() => {
    if (subjects.length > 0) {
      if (!selectedSubForTopic) setSelectedSubForTopic(subjects[0].id);
      if (!selectedSubForNote) setSelectedSubForNote(subjects[0].id);
    }
  }, [subjects, selectedSubForTopic, selectedSubForNote]);

  const loadInitialAdminData = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    queryClient.invalidateQueries({ queryKey: ['subjects'] });
    queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    queryClient.invalidateQueries({ queryKey: ['admin-interviews'] });
  };

  const loadQuestions = () => {
    refetchQuestions();
    queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
  };

  // 1. Subject-wise performance and interview count for graphs
  const subjectChartData = useMemo(() => {
    if (!interviews || interviews.length === 0) {
      return subjects.map(s => ({
        subject: s.name,
        interviews: 0,
        avgScore: 0,
        topScore: 0
      }));
    }
    const map = {};
    interviews.forEach(test => {
      const sub = test.subjectName || 'General';
      if (!map[sub]) {
        map[sub] = { subject: sub, interviews: 0, totalScore: 0, topScore: 0 };
      }
      map[sub].interviews += 1;
      const pct = Number(test.percentage || 0);
      map[sub].totalScore += pct;
      if (pct > map[sub].topScore) map[sub].topScore = pct;
    });

    return Object.values(map).map(item => ({
      subject: item.subject,
      interviews: item.interviews,
      avgScore: Math.round((item.totalScore / item.interviews) * 10) / 10,
      topScore: Math.round(item.topScore * 10) / 10
    })).sort((a, b) => b.interviews - a.interviews);
  }, [interviews, subjects]);

  // 2. Score Performance Tiers (Donut Chart)
  const scoreTierData = useMemo(() => {
    if (!interviews || interviews.length === 0) return [];
    let distinction = 0;
    let proficient = 0;
    let average = 0;
    let needsPractice = 0;

    interviews.forEach(t => {
      const p = Number(t.percentage || 0);
      if (p >= 85) distinction++;
      else if (p >= 70) proficient++;
      else if (p >= 50) average++;
      else needsPractice++;
    });

    return [
      { name: 'Distinction (85-100%)', count: distinction, color: '#10b981' },
      { name: 'Proficient (70-84%)', count: proficient, color: '#6366f1' },
      { name: 'Average (50-69%)', count: average, color: '#f59e0b' },
      { name: 'Needs Practice (<50%)', count: needsPractice, color: '#f43f5e' },
    ].filter(item => item.count > 0);
  }, [interviews]);

  // 3. Chronological Interview Trend Data (Area Chart)
  const trendChartData = useMemo(() => {
    if (!interviews || interviews.length === 0) return [];
    const list = [...interviews].reverse();
    return list.map((test, index) => ({
      id: `#${index + 1}`,
      student: test.studentName || 'Student',
      subject: test.subjectName || 'General',
      score: Math.round(Number(test.percentage || 0)),
      accuracy: Math.round(Number(test.accuracy || test.percentage || 0))
    }));
  }, [interviews]);

  // 4. Difficulty Breakdown Data
  const difficultyData = useMemo(() => {
    if (!interviews || interviews.length === 0) return [];
    const diffs = {
      EASY: { count: 0, total: 0, color: 'bg-emerald-500' },
      MEDIUM: { count: 0, total: 0, color: 'bg-indigo-500' },
      HARD: { count: 0, total: 0, color: 'bg-rose-500' }
    };
    interviews.forEach(t => {
      const d = (t.difficulty || 'MEDIUM').toUpperCase();
      if (!diffs[d]) diffs[d] = { count: 0, total: 0, color: 'bg-slate-500' };
      diffs[d].count++;
      diffs[d].total += Number(t.percentage || 0);
    });

    return Object.keys(diffs).map(key => ({
      difficulty: key,
      attempts: diffs[key].count,
      avgScore: diffs[key].count > 0 ? Math.round((diffs[key].total / diffs[key].count) * 10) / 10 : 0,
      color: diffs[key].color
    }));
  }, [interviews]);

  // Top Subject and Top Interview
  const topSubject = useMemo(() => {
    if (!subjectChartData || subjectChartData.length === 0) return 'N/A';
    return [...subjectChartData].sort((a, b) => b.avgScore - a.avgScore)[0]?.subject || 'N/A';
  }, [subjectChartData]);

  const topInterview = useMemo(() => {
    if (!interviews || interviews.length === 0) return null;
    return [...interviews].sort((a, b) => Number(b.percentage || 0) - Number(a.percentage || 0))[0];
  }, [interviews]);

  // Load topics when question form subject changes
  useEffect(() => {
    if (qForm.subjectId) {
      subjectApi.getTopics(qForm.subjectId)
        .then((res) => setQFormTopics(res.data.data || []))
        .catch(() => setQFormTopics([]));
    } else {
      setQFormTopics([]);
    }
  }, [qForm.subjectId]);

  const openAddQuestionModal = () => {
    setEditingQuestion(null);
    const defaultSub = subjects.length > 0 ? subjects[0].id : '';
    setQForm({
      subjectId: defaultSub,
      topicId: '',
      difficulty: 'MEDIUM',
      questionText: '',
      codeSnippet: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      explanation: '',
      marks: 1.0,
      negativeMarks: 0.25,
      active: true,
    });
    setQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q) => {
    setEditingQuestion(q);
    setQForm({
      subjectId: q.subject?.id || '',
      topicId: q.topic?.id || '',
      difficulty: q.difficulty || 'MEDIUM',
      questionText: q.questionText || '',
      codeSnippet: q.codeSnippet || '',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctOption: q.correctOption || 'A',
      explanation: q.explanation || '',
      marks: q.marks || 1.0,
      negativeMarks: q.negativeMarks || 0.25,
      active: q.active !== false,
    });
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...qForm,
        subjectId: parseInt(qForm.subjectId),
        topicId: qForm.topicId ? parseInt(qForm.topicId) : null,
        marks: parseFloat(qForm.marks),
        negativeMarks: parseFloat(qForm.negativeMarks),
      };

      if (editingQuestion) {
        await adminApi.updateQuestion(editingQuestion.id, payload);
        showToast('Question updated successfully!');
      } else {
        await adminApi.createQuestion(payload);
        showToast('New question added to bank!');
      }

      setQuestionModalOpen(false);
      loadQuestions();
      loadInitialAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question permanently?')) return;
    try {
      await adminApi.deleteQuestion(id);
      showToast('Question deleted.');
      loadQuestions();
      loadInitialAdminData();
    } catch (err) {
      alert('Failed to delete question.');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.name) return;
    try {
      await adminApi.createSubject(newSubject);
      setNewSubject({ name: '', description: '', icon: 'Code2', color: '#4f46e5' });
      showToast('Subject created!');
      loadInitialAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!selectedSubForTopic || !newTopic.name) return;
    try {
      await adminApi.createTopic(selectedSubForTopic, newTopic);
      setNewTopic({ name: '', description: '' });
      showToast('Topic added under subject!');
      loadInitialAdminData();
    } catch (err) {
      alert('Failed to create topic');
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!selectedSubForNote || !newNote.title.trim() || !newNote.url.trim()) return;
    setAddingNote(true);
    try {
      await adminApi.createSubjectNote(selectedSubForNote, {
        title: newNote.title.trim(),
        url: newNote.url.trim(),
        description: newNote.description.trim(),
      });
      setNewNote({ title: '', url: '', description: '' });
      showToast('Note link added successfully!');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add note link');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to remove this note link?')) return;
    try {
      await adminApi.deleteSubjectNote(noteId);
      showToast('Note link removed');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    } catch (err) {
      alert('Failed to delete note link');
    }
  };

  const showToast = (msg) => {
    setFeedback(msg);
    toast.success(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Admin Header */}
      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Administrator Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              InterviewPrep Management Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage question banks, subjects, topics, explanations, and monitor student performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="flex-1 sm:flex-none justify-center px-3 sm:px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs text-center"
            >
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Password</span>
            </button>
            <button
              onClick={openAddQuestionModal}
              className="flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer text-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Platform Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div
            onClick={() => setActiveTab('students')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer hover:border-indigo-400 hover:shadow-md card-hover transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">Total Students</span>
              <Users className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.totalStudents || students.length || 0}</p>
          </div>

          <div
            onClick={() => setActiveTab('questions')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer hover:border-emerald-400 hover:shadow-md card-hover transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">Total Questions</span>
              <HelpCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600">{stats?.totalQuestions || questions.length || 0}</p>
          </div>

          <div
            onClick={() => { setActiveTab('interviews'); setInterviewStudentFilter(''); }}
            className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer hover:border-violet-400 hover:shadow-md card-hover transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-violet-600 transition-colors">Completed Interviews</span>
              <BookOpen className="w-4 h-4 text-violet-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-violet-600">{interviews.length || stats?.totalMockTests || 0}</p>
          </div>

          <div
            onClick={() => setActiveTab('subjects')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer hover:border-sky-400 hover:shadow-md card-hover transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-sky-600 transition-colors">Active Tracks</span>
              <Layers className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.totalSubjects || subjects.length || 0}</p>
          </div>

          <div
            onClick={() => setActiveTab('analytics')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs col-span-2 sm:col-span-1 cursor-pointer hover:border-amber-400 hover:shadow-md card-hover transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-amber-600 transition-colors">Platform Avg</span>
              <TrendingUp className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-amber-600">{stats?.averagePlatformScore || 0}%</p>
            <p className="text-[10px] text-indigo-600 font-semibold mt-0.5 flex items-center gap-0.5 group-hover:underline">
              View Visual Graphs <ArrowUpRight className="w-3 h-3" />
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Smooth Swipe on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-scroll pb-3 border-b border-slate-200 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-300 scale-[1.02]'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Performance Analytics &amp; Graphs
          </button>
          <button
            onClick={() => { setActiveTab('interviews'); setInterviewStudentFilter(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'interviews'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-300 scale-[1.02]'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Student Interviews ({interviews.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-300 scale-[1.02]'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Registered Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'questions'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-300 scale-[1.02]'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Question Bank
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'subjects'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-300 scale-[1.02]'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Subjects &amp; Topics
          </button>
        </div>

        {/* TAB 0: PERFORMANCE ANALYTICS & GRAPHS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Analytics Hero / Insight Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-3">
                    <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Live Intelligence &amp; Performance Visualizer</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    Assessment Analytics &amp; Visual Distributions
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                    Accurate graphical representations of student mock scores, subject proficiency, score tiers, and progression timelines.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 shrink-0">
                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <p className="text-[11px] text-slate-300 font-medium">Top Subject</p>
                    <p className="text-base font-extrabold text-white mt-0.5">{topSubject}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <p className="text-[11px] text-slate-300 font-medium">Peak Mock Score</p>
                    <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                      {topInterview ? `${topInterview.percentage}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphs Grid: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GRAPH 1: Subject-wise Performance & Attempts */}
              <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 card-hover min-w-0 overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      Subject Performance &amp; Test Volume
                    </h3>
                    <p className="text-xs text-slate-500">Average score (%) vs total student interviews per track</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                    {subjectChartData.length} Subjects
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '11px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                        }}
                        formatter={(val, name) => [
                          name === 'Avg Score (%)' ? `${val}%` : `${val} Tests`,
                          name
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="avgScore" name="Avg Score (%)" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="interviews" name="Interviews Taken" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GRAPH 2: Score Tier Distribution */}
              <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 card-hover min-w-0 overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-violet-600" />
                      Candidate Score Tier Distribution
                    </h3>
                    <p className="text-xs text-slate-500">Breakdown of student performance across score brackets</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
                    {interviews.length} Tests
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 pt-2">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={scoreTierData}
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="count"
                        >
                          {scoreTierData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '11px',
                          }}
                          formatter={(value, name) => [`${value} Interviews`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tier Legend */}
                  <div className="space-y-2.5 pr-2">
                    {scoreTierData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-semibold text-slate-700">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {item.count} ({interviews.length > 0 ? Math.round((item.count / interviews.length) * 100) : 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GRAPH 3: Chronological Score Progression Trend */}
              <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 card-hover lg:col-span-2 min-w-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Mock Interview Progression Trend
                    </h3>
                    <p className="text-xs text-slate-500">Sequential score trajectory across all completed student assessments</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                      Platform Mean: <strong className="text-amber-600">{stats?.averagePlatformScore || 0}%</strong>
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="id" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '11px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                        }}
                        formatter={(val, name, item) => [
                          `${val}% (${item.payload.student} - ${item.payload.subject})`,
                          'Score'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        fill="url(#scoreTrendGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARD 4: Difficulty Matrix & Benchmarks */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 card-hover lg:col-span-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600" />
                      Assessment Difficulty Breakdown &amp; Benchmark Metrics
                    </h3>
                    <p className="text-xs text-slate-500">Evaluation difficulty tiers and candidate performance averages</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {difficultyData.map((d, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 tracking-wide">{d.difficulty} TIER</span>
                        <span className="text-[11px] font-semibold text-slate-500">{d.attempts} Mocks</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500 font-medium">Avg Score:</span>
                        <span className="text-xl font-extrabold text-slate-900">{d.avgScore}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.color} transition-all duration-500`}
                          style={{ width: `${Math.min(d.avgScore, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: QUESTION BANK MANAGEMENT */}
        {activeTab === 'questions' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            {/* Search and Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadQuestions()}
                  placeholder="Search questions by keyword and press Enter..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <select
                value={filterSubjectId}
                onChange={(e) => {
                  setFilterSubjectId(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => {
                  setFilterDifficulty(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Questions List */}
            <div className="divide-y divide-slate-100">
              {questions.map((q) => (
                <div key={q.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {q.subject?.name}
                      </span>
                      {q.topic && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {q.topic.name}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          q.difficulty === 'EASY'
                            ? 'bg-emerald-50 text-emerald-700'
                            : q.difficulty === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Correct: <strong className="text-emerald-600">Option {q.correctOption}</strong>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-900">{q.questionText}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-500">
                      <span className={q.correctOption === 'A' ? 'text-emerald-700 font-semibold' : ''}>A: {q.optionA}</span>
                      <span className={q.correctOption === 'B' ? 'text-emerald-700 font-semibold' : ''}>B: {q.optionB}</span>
                      <span className={q.correctOption === 'C' ? 'text-emerald-700 font-semibold' : ''}>C: {q.optionC}</span>
                      <span className={q.correctOption === 'D' ? 'text-emerald-700 font-semibold' : ''}>D: {q.optionD}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditQuestionModal(q)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 transition-colors"
                      title="Edit Question"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-rose-400 text-slate-600 hover:text-rose-600 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 font-semibold"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUBJECTS & TOPICS */}
        {activeTab === 'subjects' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Subject Form */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Add New Subject</h3>
              <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    placeholder="e.g. System Design"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                    placeholder="Scalability, Load Balancing, Caching, Sharding..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brand Color</label>
                    <input
                      type="color"
                      value={newSubject.color}
                      onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-300 p-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Icon Key</label>
                    <select
                      value={newSubject.icon}
                      onChange={(e) => setNewSubject({ ...newSubject, icon: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Coffee">Coffee (Java)</option>
                      <option value="Leaf">Leaf (Spring)</option>
                      <option value="Atom">Atom (React)</option>
                      <option value="Code2">Code2 (JS)</option>
                      <option value="Database">Database (SQL)</option>
                      <option value="Server">Server (Backend)</option>
                      <option value="Cpu">Cpu (OS)</option>
                      <option value="Brain">Brain (Aptitude)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                >
                  Save Subject
                </button>
              </form>
            </div>

            {/* Create Topic Form */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Add Sub-Topic to Subject</h3>
              <form onSubmit={handleCreateTopic} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Subject</label>
                  <select
                    value={selectedSubForTopic || ''}
                    onChange={(e) => setSelectedSubForTopic(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic Name</label>
                  <input
                    type="text"
                    required
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    placeholder="e.g. Garbage Collection & Heap"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic Description</label>
                  <textarea
                    rows={2}
                    value={newTopic.description}
                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    placeholder="Key concepts covered in this topic..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                >
                  Add Topic to Subject
                </button>
              </form>
            </div>
          </div>

          {/* Subject Notes & Reference Links Manager */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Study Materials &amp; External Notes</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Subject Notes &amp; Reference Links Manager
                </h3>
                <p className="text-xs text-slate-500">
                  Add one or more study notes, cheat sheets, or documentation links for each subject. These will immediately appear on the student dashboard.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 shrink-0">Subject:</label>
                <select
                  value={selectedSubForNote || ''}
                  onChange={(e) => setSelectedSubForNote(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.notes?.length || 0} notes)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form to Add Note Link */}
              <div className="lg:col-span-5 bg-slate-50/60 rounded-2xl border border-slate-200/90 p-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    Add Note Link to {subjects.find((s) => String(s.id) === String(selectedSubForNote))?.name || 'Subject'}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">Multiple links supported</span>
                </div>

                <form onSubmit={handleCreateNote} className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Note Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="e.g. Concurrency & Multithreading Cheatsheet"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Resource Link URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={newNote.url}
                      onChange={(e) => setNewNote({ ...newNote, url: e.target.value })}
                      placeholder="https://example.com/notes.pdf or docs"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Brief Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={newNote.description}
                      onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                      placeholder="What candidates should review from this link..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addingNote}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {addingNote ? (
                      <span>Adding...</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Note Link</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* List of Configured Note Links for this Subject */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-indigo-600" />
                    Active Notes for {subjects.find((s) => String(s.id) === String(selectedSubForNote))?.name || 'Selected Subject'}
                  </h4>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {(subjects.find((s) => String(s.id) === String(selectedSubForNote))?.notes || []).length} Links
                  </span>
                </div>

                {(() => {
                  const currentNotes = subjects.find((s) => String(s.id) === String(selectedSubForNote))?.notes || [];
                  if (currentNotes.length === 0) {
                    return (
                      <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">No notes links added yet for this subject</p>
                        <p className="text-[11px] text-slate-400">Use the form on the left to add one or more notes links for students.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {currentNotes.map((note, idx) => (
                        <div
                          key={note.id || idx}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-start justify-between gap-3 group"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                #{idx + 1}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 truncate">
                                {note.title}
                              </h5>
                            </div>
                            {note.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 pl-7">
                                {note.description}
                              </p>
                            )}
                            <div className="pl-7 pt-1">
                              <a
                                href={note.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                              >
                                <span className="truncate">{note.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            title="Delete note link"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* TAB: REGISTERED STUDENTS */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Registered Student Directory</h3>
                <p className="text-xs text-slate-500">Track candidates, college backgrounds, practice streaks, and interview activity</p>
              </div>
              <button
                onClick={() => { setActiveTab('interviews'); setInterviewStudentFilter(''); }}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <BookOpen className="w-3.5 h-3.5" />
                View All Interviews ({interviews.length})
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">Student ID</th>
                    <th className="px-6 py-3.5">College / Institution</th>
                    <th className="px-6 py-3.5">Degree &amp; Branch</th>
                    <th className="px-6 py-3.5">Streak</th>
                    <th className="px-6 py-3.5 text-center">Interviews</th>
                    <th className="px-6 py-3.5 text-center">Avg Score</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {s.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{s.name}</p>
                            <p className="text-[10px] text-slate-400">Class of {s.graduationYear || '2025'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono font-medium">#{String(s.id || '').padStart(4, '0')}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{s.college || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {s.degree} {s.branch ? `(${s.branch})` : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                          🔥 {s.streakDays || 0}d
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold">
                          {s.totalTests !== undefined && s.totalTests > 0 ? s.totalTests : interviews.filter(i => i.studentId === s.id).length} tests
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-800">
                        {s.averageScore > 0 ? (
                          <span className={`px-2 py-0.5 rounded-full ${s.averageScore >= 75 ? 'bg-emerald-50 text-emerald-700' : s.averageScore >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                            {s.averageScore}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setInterviewStudentFilter(String(s.id));
                            setActiveTab('interviews');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 font-semibold text-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Interviews</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                        No students registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: STUDENT INTERVIEWS */}
        {activeTab === 'interviews' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Mock Assessments &amp; Interviews</h3>
                <p className="text-xs text-slate-500">Live evaluation records, candidate scores, accuracy, and test completion data</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  Total: {interviews.length} Records
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={interviewSearch}
                  onChange={(e) => setInterviewSearch(e.target.value)}
                  placeholder="Search student or topic..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <select
                value={interviewStudentFilter}
                onChange={(e) => setInterviewStudentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="">All Students ({students.length})</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (#{String(s.id).padStart(4, '0')})</option>
                ))}
              </select>

              <select
                value={interviewSubjectFilter}
                onChange={(e) => setInterviewSubjectFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="">All Tracks / Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                ))}
              </select>

              <select
                value={interviewDifficultyFilter}
                onChange={(e) => setInterviewDifficultyFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Interviews Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Candidate / Student</th>
                    <th className="px-6 py-3.5">Interview Track</th>
                    <th className="px-6 py-3.5">Topic &amp; Level</th>
                    <th className="px-6 py-3.5">Score</th>
                    <th className="px-6 py-3.5">Percentage</th>
                    <th className="px-6 py-3.5">Accuracy</th>
                    <th className="px-6 py-3.5">Breakdown</th>
                    <th className="px-6 py-3.5">Time</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {interviews
                    .filter((item) => {
                      if (interviewStudentFilter && String(item.studentId) !== String(interviewStudentFilter)) return false;
                      if (interviewSubjectFilter && item.subjectName !== interviewSubjectFilter) return false;
                      if (interviewDifficultyFilter && item.difficulty !== interviewDifficultyFilter) return false;
                      if (interviewSearch) {
                        const q = interviewSearch.toLowerCase();
                        const matchName = item.studentName && item.studentName.toLowerCase().includes(q);
                        const matchSubject = item.subjectName && item.subjectName.toLowerCase().includes(q);
                        const matchTopic = item.topicName && item.topicName.toLowerCase().includes(q);
                        if (!matchName && !matchSubject && !matchTopic) return false;
                      }
                      return true;
                    })
                    .map((item) => {
                      const pct = Math.round(item.percentage || 0);
                      const isHigh = pct >= 75;
                      const isMed = pct >= 50 && pct < 75;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-slate-900">{item.studentName || 'Student Candidate'}</p>
                              {item.studentCollege && (
                                <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{item.studentCollege}</p>
                              )}
                              <span className="inline-block text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5">
                                #{String(item.studentId || item.id).padStart(4, '0')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold inline-flex items-center gap-1.5">
                              {item.subjectName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">{item.topicName || 'All Topics'}</p>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block ${
                                item.difficulty === 'EASY'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.difficulty === 'HARD'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {item.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-900">
                            {item.score !== undefined ? item.score : 0} / {item.maxScore || 10}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold ${
                                isHigh
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isMed
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700">
                            {Math.round(item.accuracy || 0)}%
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            <span className="text-emerald-600 font-bold">✔ {item.correctCount || 0}</span>{' '}
                            <span className="text-rose-500 font-bold ml-1">✘ {item.wrongCount || 0}</span>{' '}
                            {item.skippedCount > 0 && (
                              <span className="text-slate-400 font-bold ml-1">⏭ {item.skippedCount}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {Math.floor((item.timeTakenSeconds || 0) / 60)}m {(item.timeTakenSeconds || 0) % 60}s
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {item.completedAt
                              ? new Date(item.completedAt).toLocaleDateString()
                              : item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : 'Recent'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {item.status || 'COMPLETED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  {interviews.length === 0 && (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center text-slate-400">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No mock test interviews recorded yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Interviews completed by students will appear here automatically.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT QUESTION MODAL */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingQuestion ? 'Edit Interview Question' : 'Add New Interview Question'}
              </h3>
              <button
                onClick={() => setQuestionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    required
                    value={qForm.subjectId}
                    onChange={(e) => setQForm({ ...qForm, subjectId: e.target.value, topicId: '' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic</label>
                  <select
                    value={qForm.topicId}
                    onChange={(e) => setQForm({ ...qForm, topicId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">General / All</option>
                    {qFormTopics.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty *</label>
                  <select
                    value={qForm.difficulty}
                    onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Prompt *</label>
                <textarea
                  rows={2}
                  required
                  value={qForm.questionText}
                  onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                  placeholder="Enter the technical question..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={2}
                  value={qForm.codeSnippet}
                  onChange={(e) => setQForm({ ...qForm, codeSnippet: e.target.value })}
                  placeholder="Optional code block for output prediction questions..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Option A *</label>
                  <input
                    type="text"
                    required
                    value={qForm.optionA}
                    onChange={(e) => setQForm({ ...qForm, optionA: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Option B *</label>
                  <input
                    type="text"
                    required
                    value={qForm.optionB}
                    onChange={(e) => setQForm({ ...qForm, optionB: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Option C *</label>
                  <input
                    type="text"
                    required
                    value={qForm.optionC}
                    onChange={(e) => setQForm({ ...qForm, optionC: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Option D *</label>
                  <input
                    type="text"
                    required
                    value={qForm.optionD}
                    onChange={(e) => setQForm({ ...qForm, optionD: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correct Option *</label>
                  <select
                    value={qForm.correctOption}
                    onChange={(e) => setQForm({ ...qForm, correctOption: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-emerald-50 font-bold text-emerald-900"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    value={qForm.marks}
                    onChange={(e) => setQForm({ ...qForm, marks: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Negative Marks</label>
                  <input
                    type="number"
                    step="0.05"
                    value={qForm.negativeMarks}
                    onChange={(e) => setQForm({ ...qForm, negativeMarks: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Explanation *</label>
                <textarea
                  rows={3}
                  required
                  value={qForm.explanation}
                  onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                  placeholder="Explain why the correct answer is right and why others are wrong..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200"
                >
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
