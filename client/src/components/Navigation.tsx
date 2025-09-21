import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  MessageCircle,
  Smile,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Stethoscope,
  LayoutDashboard,
  Video,
  ChevronDown,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Main navigation items for desktop
  const mainNavigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/mood', label: 'Mood Tracker', icon: Smile },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/exercises', label: 'Exercises', icon: Heart },
    { path: '/forum', label: 'Community', icon: Users },
  ];

  // Items for the 'More' dropdown
  const moreNavigationItems = [
    user?.isTherapist && { path: '/my-sessions', label: 'My Sessions', icon: Video },
    !user?.isTherapist && { path: '/therapists', label: 'Find a Therapist', icon: Stethoscope },
    !user?.isTherapist && { path: '/my-sessions', label: 'My Sessions', icon: Video },
    { path: '/profile', label: 'Profile', icon: Settings },
  ].filter(Boolean); // Filter out any false/undefined values

  // Admin link is always top-level for visibility
  const adminLink = user?.isAdmin ? { path: '/admin', label: 'Admin Panel', icon: Shield } : null;

  const isLinkActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-zinc-950 text-sm shadow-sm border-b border-zinc-200 dark:border-zinc-800 font-sans">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-gradient-to-tr from-blue-500 to-teal-400 p-2 rounded-xl transform transition-transform hover:scale-105">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 hidden sm:block">
              Mantrana
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {mainNavigationItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                  ${isLinkActive(path)
                    ? 'bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </Link>
            ))}
            
            {/* Admin Panel Link */}
            {adminLink && (
              <Link
                key={adminLink.path}
                to={adminLink.path}
                className={`flex items-center px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                  ${isLinkActive(adminLink.path)
                    ? 'bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <adminLink.icon className="h-5 w-5 mr-2" />
                {adminLink.label}
              </Link>
            )}

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                className="flex items-center px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                  text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                More
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isMoreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl py-2 border border-zinc-200 dark:border-zinc-700 z-50">
                  {moreNavigationItems.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setIsMoreDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-red-500 w-full text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Desktop User Profile - Simplified */}
          <div className="hidden md:flex items-center">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-lg">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-md transition-colors duration-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-7 w-7 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="h-7 w-7 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 animate-fade-in-down">
          <div className="px-2 py-4 space-y-2">
            {mainNavigationItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300
                  ${isLinkActive(path)
                    ? 'bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <Icon className="h-6 w-6" />
                <span>{label}</span>
              </Link>
            ))}
            
            {/* Admin Link for Mobile */}
            {adminLink && (
              <Link
                key={adminLink.path}
                to={adminLink.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300
                  ${isLinkActive(adminLink.path)
                    ? 'bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <adminLink.icon className="h-6 w-6" />
                <span>{adminLink.label}</span>
              </Link>
            )}

            {/* More Items for Mobile */}
            {moreNavigationItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Icon className="h-6 w-6" />
                <span>{label}</span>
              </Link>
            ))}

            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 w-full text-left transition-colors"
            >
              <LogOut className="h-6 w-6" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};