import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  MessageSquare, 
  Flag, 
  TrendingUp, 
  Activity,
  Shield,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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

  const handleModerateContent = async (type: 'post' | 'comment', id: string, action: 'approve' | 'delete') => {
    try {
      await apiService.moderateContent(type, id, action);
      toast.success(`Content ${action === 'approve' ? 'approved' : 'deleted'} successfully`);
      loadFlaggedContent();
      loadAdminData(); // Refresh stats
    } catch (error) {
      console.error('Error moderating content:', error);
      toast.error('Failed to moderate content');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 to-sky-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600"></div>
        </div>
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
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-sky-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="h-8 w-8 text-mint-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, content, and platform analytics</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-white text-mint-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'flagged'
                ? 'bg-white text-mint-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Flagged Content ({stats?.flaggedPosts + stats?.flaggedComments || 0})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-mint-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Users ({stats?.totalUsers || 0})
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  </div>
                  <div className="bg-mint-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-mint-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Forum Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalPosts || 0}</p>
                  </div>
                  <div className="bg-sky-100 p-3 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-sky-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mood Entries</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalMoods || 0}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Flagged Content</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(stats?.flaggedPosts || 0) + (stats?.flaggedComments || 0)}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Flag className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Growth Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 30 Days)</h3>
                {userGrowthData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No growth data available</p>
                  </div>
                )}
              </div>

              {/* Mood Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Distribution</h3>
                {moodDistributionData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moodDistributionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {moodDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No mood data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
              <div className="space-y-3">
                {stats?.recentUsers?.map((user: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-mint-400 to-sky-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flagged' && (
          <div className="space-y-6">
            {/* Content Type Filter */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setSelectedContentType('posts')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedContentType === 'posts'
                    ? 'bg-white text-mint-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Posts ({stats?.flaggedPosts || 0})
              </button>
              <button
                onClick={() => setSelectedContentType('comments')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedContentType === 'comments'
                    ? 'bg-white text-mint-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Comments ({stats?.flaggedComments || 0})
              </button>
            </div>

            {/* Flagged Content List */}
            <div className="space-y-4">
              {flaggedContent.map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedContentType === 'posts' ? item.title : 'Comment'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          By {item.authorId?.name || 'Anonymous'} • {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModerateContent(
                          selectedContentType === 'posts' ? 'post' : 'comment',
                          item._id,
                          'approve'
                        )}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleModerateContent(
                          selectedContentType === 'posts' ? 'post' : 'comment',
                          item._id,
                          'delete'
                        )}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700">{item.content}</p>
                  </div>

                  {item.flaggedBy && item.flaggedBy.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Flag Reports:</h4>
                      <div className="space-y-2">
                        {item.flaggedBy.map((flag: any, index: number) => (
                          <div key={index} className="bg-red-50 p-3 rounded-lg">
                            <p className="text-sm text-red-700">{flag.reason}</p>
                            <p className="text-xs text-red-500 mt-1">
                              Flagged on {new Date(flag.flaggedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {flaggedContent.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No flagged {selectedContentType} found</p>
                  <p className="text-sm text-gray-400">All content has been reviewed</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Users</h3>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-mint-400 to-sky-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last login: {new Date(user.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};