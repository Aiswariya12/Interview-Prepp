import React, { useState } from 'react';
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

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
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

      {/* Mobile Drawer Menu & Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden animate-fade-in-up"
          />

          {/* Drawer content */}
          <div className="relative z-50 md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-3.5 pb-6 space-y-2 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto touch-scroll animate-scale-in">
            {isAuthenticated ? (
              <>
                {/* User Info & Streak Badge */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200/80 mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isAdmin ? (
                      <img
                        src={adminProfilePic}
                        alt="Admin Profile"
                        className="w-10 h-10 rounded-full object-cover object-[center_25%] border-2 border-indigo-400 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
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

                {isStudent && (
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        isActive('/dashboard')
                          ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" /> Dashboard
                    </Link>
                    <Link
                      to="/mock/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        isActive('/mock/new')
                          ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-indigo-600" /> Take Mock Test
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        isActive('/history')
                          ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <History className="w-4 h-4 text-indigo-600" /> Past Tests
                    </Link>
                    <Link
                      to="/bookmarks"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        isActive('/bookmarks')
                          ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 text-indigo-600" /> Bookmarks
                    </Link>
                    <Link
                      to="/daily-challenge"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        isActive('/daily-challenge')
                          ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-emerald-600" /> Daily Challenge
                    </Link>
                  </div>
                )}

                {isAdmin && (
                  <div className="space-y-1">
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl text-indigo-700 bg-indigo-50 shadow-xs"
                    >
                      <ShieldAlert className="w-4 h-4 text-indigo-600" /> Admin Portal
                    </Link>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setChangePasswordOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 text-left cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" /> Change Password
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 text-left cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2.5 pt-2">
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
        </>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
