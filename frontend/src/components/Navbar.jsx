import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Flame,
  LayoutDashboard,
  BookOpen,
  History,
  Bookmark,
  Calendar,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  KeyRound
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import adminProfilePic from '../assets/WhatsApp Image 2026-10-14 at 4.52.51 PM.jpeg';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                  Interview<span className="text-indigo-600">Prep</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  Full Stack Assessment
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center ml-10 space-x-1">
                {isStudent && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/dashboard')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <Link
                      to="/mock/new"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/mock/new')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Take Mock Test
                    </Link>

                    <Link
                      to="/history"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/history')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <History className="w-4 h-4" />
                      Past Tests
                    </Link>

                    <Link
                      to="/bookmarks"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/bookmarks')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      Bookmarks
                    </Link>

                    <Link
                      to="/daily-challenge"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/daily-challenge')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      Daily Challenge
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    Admin Portal
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Header: Streak & Profile or Login/Register */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isStudent && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-semibold shadow-xs">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                    <span>Active Streak</span>
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    {isAdmin ? (
                      <img
                        src={adminProfilePic}
                        alt="Admin Profile"
                        className="w-8 h-8 rounded-full object-cover object-[center_25%] border border-indigo-300 shadow-xs"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="text-left text-xs">
                      <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {isAdmin ? 'Admin' : 'Student'}
                      </p>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2.5">
                        {isAdmin && (
                          <img
                            src={adminProfilePic}
                            alt="Admin Profile"
                            className="w-9 h-9 rounded-full object-cover object-[center_25%] border border-indigo-300 shadow-xs shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-[11px] text-indigo-600 font-medium truncate">{isAdmin ? 'Administrator' : 'Student Account'}</p>
                          {user?.college && (
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{user.college}</p>
                          )}
                        </div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <ShieldAlert className="w-4 h-4 text-indigo-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      {isStudent && (
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-500" />
                          Student Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setChangePasswordOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-slate-500" />
                        Change Password
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Side Menu Bar & Backdrop mounted to body via portal */}
    {typeof document !== 'undefined' &&
      createPortal(
        <div
          className={`fixed inset-0 z-[9999] md:hidden transition-all duration-300 ${
            mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className={`absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />

          {/* Slide-in Side Drawer */}
          <aside
            className={`absolute inset-y-0 right-0 w-80 max-w-[85vw] h-full h-[100dvh] bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            aria-label="Mobile Navigation Sidebar"
          >
            {/* Drawer Header */}
            <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight block">InterviewPrep</span>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Full Stack Assessment</span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="min-h-0 p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
              {isAuthenticated ? (
                <>
                  {/* User Info & Streak Badge Card */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-slate-50 to-purple-50/40 border border-indigo-100/80 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {isAdmin ? (
                        <div className="relative shrink-0">
                          <img
                            src={adminProfilePic}
                            alt="Admin Profile"
                            className="w-11 h-11 rounded-full object-cover object-[center_25%] border-2 border-indigo-500 shadow-xs"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{user?.name || 'Candidate'}</p>
                        <p className="text-[11px] text-indigo-600 font-semibold truncate">
                          {isAdmin ? 'Administrator' : user?.college || 'Student Candidate'}
                        </p>
                      </div>
                    </div>

                    {isStudent && (
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-[11px] font-bold shrink-0">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                        <span>Streak</span>
                      </div>
                    )}
                  </div>

                  {/* Navigation Links */}
                  {(!isAdmin || isStudent) && (
                    <div className="space-y-1">
                      <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Navigation</p>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                          isActive('/dashboard')
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <LayoutDashboard className={`w-4 h-4 ${isActive('/dashboard') ? 'text-white' : 'text-indigo-600'}`} />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/mock/new"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                          isActive('/mock/new')
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <BookOpen className={`w-4 h-4 ${isActive('/mock/new') ? 'text-white' : 'text-indigo-600'}`} />
                        <span>Take Mock Test</span>
                      </Link>

                      <Link
                        to="/history"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                          isActive('/history')
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <History className={`w-4 h-4 ${isActive('/history') ? 'text-white' : 'text-indigo-600'}`} />
                        <span>Past Tests</span>
                      </Link>

                      <Link
                        to="/bookmarks"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                          isActive('/bookmarks')
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isActive('/bookmarks') ? 'text-white' : 'text-indigo-600'}`} />
                        <span>Bookmarks</span>
                      </Link>

                      <Link
                        to="/daily-challenge"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                          isActive('/daily-challenge')
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Calendar className={`w-4 h-4 ${isActive('/daily-challenge') ? 'text-white' : 'text-emerald-600'}`} />
                        <span>Daily Challenge</span>
                      </Link>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="space-y-1">
                      <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Administration</p>
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                          isActive('/admin')
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <ShieldAlert className={`w-4 h-4 ${isActive('/admin') ? 'text-white' : 'text-indigo-600'}`} />
                        <span>Admin Portal</span>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3 pt-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center w-full py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer Bottom Actions */}
            {isAuthenticated && (
              <div className="shrink-0 p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 space-y-1.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setChangePasswordOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </aside>
        </div>,
        document.body
      )}

    {/* Change Password Modal */}
    <ChangePasswordModal
      isOpen={changePasswordOpen}
      onClose={() => setChangePasswordOpen(false)}
    />
  </>
);
};

export default Navbar;
