import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Shield,
  Activity,
  Heart,
  MessageSquare
} from 'lucide-react';
import { authService } from '../services/auth';
import apiService from '../services/api';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    profile: {
      age: user?.profile?.age || '',
      gender: user?.profile?.gender || '',
      preferences: user?.profile?.preferences || []
    }
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const [moodStats, exerciseStats] = await Promise.all([
        apiService.getMoodStats(30),
        apiService.getExerciseStats(30)
      ]);
      
      setStats({
        mood: moodStats.stats,
        exercise: exerciseStats.stats
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await authService.updateProfile(formData);
      updateUser(response.user);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      profile: {
        age: user?.profile?.age || '',
        gender: user?.profile?.gender || '',
        preferences: user?.profile?.preferences || []
      }
    });
    setIsEditing(false);
  };

  const genderOptions = [
    { value: '', label: 'Prefer not to say' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];

  const preferenceOptions = [
    'Anxiety Support',
    'Depression Support',
    'Stress Management',
    'Mindfulness',
    'CBT Techniques',
    'Meditation',
    'Sleep Improvement',
    'Relationship Support'
  ];

  const togglePreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        preferences: prev.profile.preferences.includes(preference)
          ? prev.profile.preferences.filter(p => p !== preference)
          : [...prev.profile.preferences, preference]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-sky-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-mint-100 text-mint-700 px-3 py-2 rounded-lg hover:bg-mint-200 transition-colors flex items-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-mint-600 to-sky-600 text-white px-3 py-2 rounded-lg hover:from-mint-700 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isLoading ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-mint-400 to-sky-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    {user?.isAdmin && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Shield className="h-4 w-4 text-mint-600" />
                        <span className="text-sm text-mint-600 font-medium">Administrator</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    <p className="text-gray-900 py-2">{user?.email}</p>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.profile.age}
                        onChange={(e) => setFormData({
                          ...formData,
                          profile: { ...formData.profile, age: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                        min="13"
                        max="120"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user?.profile?.age || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    {isEditing ? (
                      <select
                        value={formData.profile.gender}
                        onChange={(e) => setFormData({
                          ...formData,
                          profile: { ...formData.profile, gender: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                      >
                        {genderOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">
                        {genderOptions.find(opt => opt.value === user?.profile?.gender)?.label || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mental Health Interests
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {preferenceOptions.map(preference => (
                        <button
                          key={preference}
                          type="button"
                          onClick={() => togglePreference(preference)}
                          className={`p-2 rounded-lg border text-sm font-medium transition-colors text-left ${
                            formData.profile.preferences.includes(preference)
                              ? 'bg-mint-100 border-mint-300 text-mint-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {preference}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user?.profile?.preferences && user.profile.preferences.length > 0 ? (
                        user.profile.preferences.map((preference: string) => (
                          <span
                            key={preference}
                            className="bg-mint-100 text-mint-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {preference}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No preferences selected</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Account Info */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Member since</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(user?.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last login</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(user?.lastLogin || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Activity Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-mint-600" />
                    <span className="text-sm text-gray-600">Mood Entries</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {stats?.mood?.totalEntries || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Exercises Completed</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {stats?.exercise?.totalCompleted || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-sky-600" />
                    <span className="text-sm text-gray-600">Average Mood</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {stats?.mood?.averageMood ? `${stats.mood.averageMood.toFixed(1)}/5` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-mint-50 border border-mint-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-mint-800 mb-2">Privacy & Security</h3>
              <p className="text-sm text-mint-700 mb-3">
                Your data is encrypted and secure. We prioritize your privacy and never share personal information.
              </p>
              <ul className="text-sm text-mint-600 space-y-1">
                <li>• All forum posts can be anonymous</li>
                <li>• Chat history is private to you</li>
                <li>• Mood data is encrypted</li>
                <li>• Account deletion available on request</li>
              </ul>
            </div>

            {/* Support */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-sky-800 mb-2">Need Help?</h3>
              <p className="text-sm text-sky-700 mb-3">
                If you're experiencing a mental health crisis, please reach out for immediate support.
              </p>
              <div className="space-y-2 text-sm text-sky-600">
                <p>• Crisis Text Line: Text HOME to 741741</p>
                <p>• National Suicide Prevention Lifeline: 988</p>
                <p>• Emergency Services: 911</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};