
import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  MessageSquare,
  Flag,
  Activity,
  Shield,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BarChart3,
  UserCheck,
  UserMinus,
  MessageCircle,
  BarChart2,
  PieChart
} from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

// --- Premium Theme and Colors ---
const THEME = {
  // A sophisticated, clean palette with a focus on blues and soft neutrals.
  // This provides a professional, calming feel suitable for a mental wellness platform.
  background: 'bg-zinc-50 dark:bg-zinc-950',
  card: 'bg-white dark:bg-zinc-900',
  border: 'border-zinc-200 dark:border-zinc-700',
  text: {
    primary: 'text-zinc-900 dark:text-zinc-50',
    secondary: 'text-zinc-500 dark:text-zinc-400',
    accent: 'text-blue-600 dark:text-blue-400',
    muted: 'text-zinc-400 dark:text-zinc-600',
  },
  icons: {
    primary: 'text-blue-500 dark:text-blue-400',
  },
  hover: 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
  shadow: 'shadow-lg hover:shadow-xl transition-shadow',
};

// Recharts colors for charts - adjusted to match the new theme
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [therapistApplications, setTherapistApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContentType, setSelectedContentType] = useState('posts');

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'flagged') {
      loadFlaggedContent();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'applications') {
      loadTherapistApplications();
    }
  }, [activeTab, selectedContentType]);

  const loadAdminData = async () => {
    try {
      const response = await apiService.getAdminStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFlaggedContent = async () => {
    try {
      const response = await apiService.getFlaggedContent(selectedContentType, 20, 1);
      setFlaggedContent(response.content);
    } catch (error) {
      console.error('Error loading flagged content:', error);
      toast.error('Failed to load flagged content');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers(50, 1);
      setUsers(response.users);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const loadTherapistApplications = async () => {
    try {
      const response = await apiService.getTherapistApplications();
      setTherapistApplications(response.applications);
    } catch (error) {
      console.error('Error loading therapist applications:', error);
      toast.error('Failed to load therapist applications');
    }
  };

  const handleModerateContent = async (type: 'post' | 'comment', id: string, action: 'approve' | 'delete') => {
    try {
      await apiService.moderateContent(type, id, action);
      toast.success(`Content ${action === 'approve' ? 'approved' : 'deleted'} successfully`);
      loadFlaggedContent();
      loadAdminData();
    } catch (error) {
      console.error('Error moderating content:', error);
      toast.error('Failed to moderate content');
    }
  };

  const handleApplicationAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await apiService.moderateTherapistApplication(id, action);
      toast.success(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      loadTherapistApplications();
    } catch (error) {
      console.error('Error moderating application:', error);
      toast.error('Failed to moderate application');
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${THEME.background} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  const userGrowthData = stats?.userGrowth?.map((item: any) => ({
    date: item._id,
    users: item.count
  })) || [];

  const moodDistributionData = stats?.moodDistribution?.map((item: any, index: number) => ({
    name: item._id.replace('_', ' '),
    value: item.count,
    color: CHART_COLORS[index % CHART_COLORS.length]
  })) || [];

  return (
    <div className={`min-h-screen ${THEME.background} font-sans`}>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center space-x-4 mb-10">
          <div className={`p-3 rounded-full ${THEME.text.accent} bg-blue-100`}>
            <Shield size={32} />
          </div>
          <div>
            <h1 className={`text-4xl font-extrabold ${THEME.text.primary}`}>Admin Dashboard</h1>
            <p className={`text-lg ${THEME.text.secondary}`}>Manage users, content, and platform analytics with ease.</p>
          </div>
        </div>

        {/* Tabs - Modern segmented control */}
        <div className={`flex space-x-1 p-1 rounded-xl ${THEME.background} border ${THEME.border} w-fit`}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 relative group
              ${activeTab === 'dashboard'
                ? `${THEME.card} ${THEME.text.accent} ${THEME.shadow}`
                : `${THEME.text.secondary} ${THEME.hover}`
              }`}
          >
            <BarChart2 className="inline-block mr-2" size={18} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 relative group
              ${activeTab === 'flagged'
                ? `${THEME.card} ${THEME.text.accent} ${THEME.shadow}`
                : `${THEME.text.secondary} ${THEME.hover}`
              }`}
          >
            <Flag className="inline-block mr-2" size={18} /> Flagged Content ({stats?.flaggedPosts + stats?.flaggedComments || 0})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 relative group
              ${activeTab === 'users'
                ? `${THEME.card} ${THEME.text.accent} ${THEME.shadow}`
                : `${THEME.text.secondary} ${THEME.hover}`
              }`}
          >
            <Users className="inline-block mr-2" size={18} /> Users ({stats?.totalUsers || 0})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 relative group
              ${activeTab === 'applications'
                ? `${THEME.card} ${THEME.text.accent} ${THEME.shadow}`
                : `${THEME.text.secondary} ${THEME.hover}`
              }`}
          >
            <UserCheck className="inline-block mr-2" size={18} /> Therapist Applications ({therapistApplications.length})
          </button>
        </div>

        <div className="mt-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards with subtle hover effect */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`${THEME.card} rounded-2xl ${THEME.shadow} ${THEME.border} border p-6`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-semibold uppercase ${THEME.text.secondary}`}>Total Users</p>
                      <p className={`text-4xl font-bold ${THEME.text.primary} mt-1`}>{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                      <Users className={`${THEME.text.accent}`} size={24} />
                    </div>
                  </div>
                </div>

                <div className={`${THEME.card} rounded-2xl ${THEME.shadow} ${THEME.border} border p-6`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-semibold uppercase ${THEME.text.secondary}`}>Forum Posts</p>
                      <p className={`text-4xl font-bold ${THEME.text.primary} mt-1`}>{stats?.totalPosts || 0}</p>
                    </div>
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                      <MessageCircle className="text-indigo-500" size={24} />
                    </div>
                  </div>
                </div>

                <div className={`${THEME.card} rounded-2xl ${THEME.shadow} ${THEME.border} border p-6`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-semibold uppercase ${THEME.text.secondary}`}>Mood Entries</p>
                      <p className={`text-4xl font-bold ${THEME.text.primary} mt-1`}>{stats?.totalMoods || 0}</p>
                    </div>
                    <div className="p-2 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900">
                      <Activity className="text-fuchsia-500" size={24} />
                    </div>
                  </div>
                </div>

                <div className={`${THEME.card} rounded-2xl ${THEME.shadow} ${THEME.border} border p-6`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-semibold uppercase ${THEME.text.secondary}`}>Flagged Content</p>
                      <p className={`text-4xl font-bold ${THEME.text.primary} mt-1`}>
                        {(stats?.flaggedPosts || 0) + (stats?.flaggedComments || 0)}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                      <Flag className="text-red-500" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts with improved styling */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Chart */}
                <div className={`${THEME.card} rounded-2xl ${THEME.shadow} ${THEME.border} border p-6`}>
                  <h3 className={`text-lg font-semibold ${THEME.text.primary} mb-4`}>User Growth (Last 30 Days)</h3>
                  {userGrowthData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={THEME.border.split('-').pop()} />
                          <XAxis dataKey="date" stroke={THEME.text.secondary.split('-').pop()} fontSize={12} />
                          <YAxis stroke={THEME.text.secondary.split('-').pop()} fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: `1px solid ${THEME.border.split('-').pop()}`,
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className={`h-12 w-12 ${THEME.text.muted} mx-auto mb-4`} />
                      <p className={`${THEME.text.secondary}`}>No growth data available</p>
                    </div>
                  )}
                </div>

                {/* Mood Distribution */}
                <div className={`${THEME.card} rounded-2xl ${THEME.shadow} ${THEME.border} border p-6`}>
                  <h3 className={`text-lg font-semibold ${THEME.text.primary} mb-4`}>Mood Distribution</h3>
                  {moodDistributionData.length > 0 ? (
                    <div className="h-64 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={moodDistributionData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {moodDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: `1px solid ${THEME.border.split('-').pop()}`,
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className={`h-12 w-12 ${THEME.text.muted} mx-auto mb-4`} />
                      <p className={`${THEME.text.secondary}`}>No mood data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Users - Card with list styling */}
              <div className={`${THEME.card} rounded-2xl ${THEME.shadow} ${THEME.border} border p-6`}>
                <h3 className={`text-lg font-semibold ${THEME.text.primary} mb-4`}>Recent Users</h3>
                <div className="space-y-2">
                  {stats?.recentUsers?.map((user: any, index: number) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${THEME.hover} cursor-pointer`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-sky-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`font-medium ${THEME.text.primary}`}>{user.name}</p>
                          <p className={`text-sm ${THEME.text.secondary}`}>{user.email}</p>
                        </div>
                      </div>
                      <span className={`text-sm ${THEME.text.secondary}`}>
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flagged' && (
            <div className="space-y-6">
              {/* Content Type Filter - Styled similarly to the main tabs */}
              <div className={`flex space-x-1 p-1 rounded-xl ${THEME.background} border ${THEME.border} w-fit`}>
                <button
                  onClick={() => setSelectedContentType('posts')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 relative group
                    ${selectedContentType === 'posts'
                      ? `${THEME.card} ${THEME.text.accent} ${THEME.shadow}`
                      : `${THEME.text.secondary} ${THEME.hover}`
                    }`}
                >
                  <MessageSquare className="inline-block mr-2" size={18} /> Posts ({stats?.flaggedPosts || 0})
                </button>
                <button
                  onClick={() => setSelectedContentType('comments')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 relative group
                    ${selectedContentType === 'comments'
                      ? `${THEME.card} ${THEME.text.accent} ${THEME.shadow}`
                      : `${THEME.text.secondary} ${THEME.hover}`
                    }`}
                >
                  <MessageCircle className="inline-block mr-2" size={18} /> Comments ({stats?.flaggedComments || 0})
                </button>
              </div>

              {/* Flagged Content List - Cards with specific warning styling */}
              <div className="space-y-4">
                {flaggedContent.length > 0 ? (
                  flaggedContent.map((item) => (
                    <div key={item._id} className={`${THEME.card} rounded-2xl ${THEME.shadow} p-6 border-l-4 border-red-500`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                          <div>
                            <h3 className={`font-semibold ${THEME.text.primary}`}>
                              {selectedContentType === 'posts' ? item.title : 'Comment'}
                            </h3>
                            <p className={`text-sm ${THEME.text.secondary}`}>
                              By {item.authorId?.name || 'Anonymous'} • {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleModerateContent(selectedContentType === 'posts' ? 'post' : 'comment', item._id, 'approve')}
                            className="flex items-center space-x-1 px-4 py-2 rounded-lg font-medium text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle size={16} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleModerateContent(selectedContentType === 'posts' ? 'post' : 'comment', item._id, 'delete')}
                            className="flex items-center space-x-1 px-4 py-2 rounded-lg font-medium text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 border ${THEME.border}`}>
                        <p className={`text-base ${THEME.text.primary}`}>{item.content}</p>
                      </div>

                      {item.flaggedBy && item.flaggedBy.length > 0 && (
                        <div className="mt-4 border-t pt-4 border-red-200 dark:border-red-800">
                          <h4 className={`font-medium ${THEME.text.primary} mb-2`}>Flag Reports:</h4>
                          <div className="space-y-2">
                            {item.flaggedBy.map((flag: any, index: number) => (
                              <div key={index} className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-100 dark:border-red-900">
                                <p className="text-sm text-red-700 dark:text-red-300">{flag.reason}</p>
                                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                  Flagged on {new Date(flag.flaggedAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className={`${THEME.text.secondary}`}>No flagged {selectedContentType} found</p>
                    <p className={`text-sm ${THEME.text.muted}`}>All content has been reviewed</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className={`${THEME.card} rounded-2xl ${THEME.shadow} ${THEME.border} border p-6`}>
              <h3 className={`text-lg font-semibold ${THEME.text.primary} mb-4`}>All Users</h3>
              <div className="space-y-2">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user._id} className={`flex items-center justify-between py-3 rounded-lg ${THEME.hover} transition-all duration-200 cursor-pointer`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-sky-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-xl">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`font-medium ${THEME.text.primary}`}>{user.name}</p>
                          <p className={`text-sm ${THEME.text.secondary}`}>{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm ${THEME.text.primary}`}>
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        <p className={`text-xs ${THEME.text.secondary}`}>
                          Last login: {new Date(user.lastLogin).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className={`h-12 w-12 ${THEME.text.muted} mx-auto mb-4`} />
                    <p className={`${THEME.text.secondary}`}>No users found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${THEME.text.primary}`}>Pending Therapist Applications</h2>
              <div className="space-y-4">
                {therapistApplications.length > 0 ? (
                  therapistApplications.map((app) => (
                    <div key={app._id} className={`${THEME.card} rounded-2xl ${THEME.shadow} p-6 border-l-4 border-sky-500`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`text-lg font-semibold ${THEME.text.primary}`}>{app.name}</h3>
                          <p className={`text-sm ${THEME.text.secondary}`}>{app.email}</p>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleApplicationAction(app._id, 'approve')}
                            className="flex items-center space-x-1 px-4 py-2 rounded-lg font-medium text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                          >
                            <UserCheck size={16} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleApplicationAction(app._id, 'reject')}
                            className="flex items-center space-x-1 px-4 py-2 rounded-lg font-medium text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                          >
                            <UserMinus size={16} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 border-t pt-4 border-sky-200 dark:border-sky-800">
                        <p className={`font-medium ${THEME.text.primary}`}>Bio:</p>
                        <p className={`text-sm ${THEME.text.secondary} mt-1`}>{app.profile?.bio}</p>
                        <p className={`font-medium ${THEME.text.primary} mt-3`}>Specialties:</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {app.profile?.specialties?.map((specialty: string, index: number) => (
                            <span key={index} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full">
                              {specialty}
                            </span>
                          ))}
                        </div>
                        <p className={`font-medium ${THEME.text.primary} mt-3`}>License Number:</p>
                        <p className={`text-sm ${THEME.text.secondary} mt-1`}>{app.profile?.licenseNumber}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className={`${THEME.text.secondary}`}>No pending therapist applications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
