import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { 
  Smile, 
  MessageCircle, 
  Heart, 
  Users, 
  TrendingUp, 
  Activity,
  Calendar,
  Clock
} from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [todayMood, setTodayMood] = useState<any>(null);
  const [moodStats, setMoodStats] = useState<any>(null);
  const [exerciseStats, setExerciseStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [todayMoodRes, moodStatsRes, exerciseStatsRes] = await Promise.all([
          apiService.getTodayMood(),
          apiService.getMoodStats(7), // Last 7 days
          apiService.getExerciseStats(7)
        ]);

        setTodayMood(todayMoodRes.mood);
        setMoodStats(moodStatsRes.stats);
        setExerciseStats(exerciseStatsRes.stats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const moodEmojis = {
    very_sad: '😢',
    sad: '😔',
    neutral: '😐',
    happy: '😊',
    very_happy: '😄'
  };

  const quickActions = [
    {
      title: 'Track Mood',
      description: 'Log your current mood and feelings',
      icon: Smile,
      link: '/mood',
      color: 'from-mint-500 to-mint-600',
      bgColor: 'bg-mint-50',
      textColor: 'text-mint-700'
    },
    {
      title: 'Chat with AI',
      description: 'Get support from our AI therapist',
      icon: MessageCircle,
      link: '/chat',
      color: 'from-sky-500 to-sky-600',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-700'
    },
    {
      title: 'Practice Exercises',
      description: 'Try CBT and mindfulness exercises',
      icon: Heart,
      link: '/exercises',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Community',
      description: 'Connect with others anonymously',
      icon: Users,
      link: '/forum',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-sky-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Welcome back to your mental wellness dashboard.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Mood */}
          <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Mood</p>
                <div className="flex items-center space-x-2 mt-2">
                  {todayMood ? (
                    <>
                      <span className="text-2xl">{moodEmojis[todayMood.mood as keyof typeof moodEmojis]}</span>
                      <span className="text-lg font-semibold text-gray-900 capitalize">
                        {todayMood.mood.replace('_', ' ')}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500">Not logged yet</span>
                  )}
                </div>
              </div>
              <div className="bg-mint-100 p-3 rounded-lg">
                <Smile className="h-6 w-6 text-mint-600" />
              </div>
            </div>
          </div>

          {/* Mood Average */}
          <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">7-Day Average</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {moodStats?.averageMood ? moodStats.averageMood.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-sm text-gray-500">out of 5</span>
                </div>
              </div>
              <div className="bg-sky-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </div>

          {/* Exercises Completed */}
          <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exercises This Week</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {exerciseStats?.totalCompleted || 0}
                  </span>
                  <span className="text-sm text-gray-500">completed</span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`${action.bgColor} rounded-xl p-6 hover:shadow-md transition-shadow duration-200 group`}
              >
                <div className={`bg-gradient-to-r ${action.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-105 transition-transform duration-200`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-lg font-semibold ${action.textColor} mb-2`}>
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trends</h3>
            {moodStats?.moodTrend && moodStats.moodTrend.length > 0 ? (
              <div className="space-y-3">
                {moodStats.moodTrend.slice(0, 5).map((entry: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{moodEmojis[entry.mood as keyof typeof moodEmojis]}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {entry.mood.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mr-1 ${
                              i < entry.value ? 'bg-mint-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{entry.value}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No mood entries yet</p>
                <Link
                  to="/mood"
                  className="text-mint-600 hover:text-mint-700 font-medium text-sm"
                >
                  Track your first mood →
                </Link>
              </div>
            )}
          </div>

          {/* Exercise Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Categories</h3>
            {exerciseStats?.categoryBreakdown && Object.keys(exerciseStats.categoryBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(exerciseStats.categoryBreakdown).map(([category, count]: [string, any]) => (
                  <div key={category} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-mint-400 to-sky-400 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{count} completed</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No exercises completed yet</p>
                <Link
                  to="/exercises"
                  className="text-mint-600 hover:text-mint-700 font-medium text-sm"
                >
                  Start your first exercise →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};