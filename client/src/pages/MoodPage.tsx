import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { 
  Smile, 
  Calendar, 
  TrendingUp, 
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

const moodOptions = [
  { value: 'very_sad', label: 'Very Sad', emoji: '😢', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  { value: 'sad', label: 'Sad', emoji: '😔', color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { value: 'happy', label: 'Happy', emoji: '😊', color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { value: 'very_happy', label: 'Very Happy', emoji: '😄', color: 'text-mint-500', bgColor: 'bg-mint-50', borderColor: 'border-mint-200' },
];

const factorOptions = [
  'sleep', 'exercise', 'social', 'work', 'weather', 'health', 'other'
];

export const MoodPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState('');
  const [moodValue, setMoodValue] = useState(3);
  const [notes, setNotes] = useState('');
  const [factors, setFactors] = useState<string[]>([]);
  const [todayMood, setTodayMood] = useState<any>(null);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [moodStats, setMoodStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    try {
      const [todayRes, historyRes, statsRes] = await Promise.all([
        apiService.getTodayMood(),
        apiService.getMoodHistory(30, 1),
        apiService.getMoodStats(30)
      ]);

      setTodayMood(todayRes.mood);
      setMoodHistory(historyRes.moods);
      setMoodStats(statsRes.stats);

      // Pre-fill form if mood exists for today
      if (todayRes.mood) {
        setSelectedMood(todayRes.mood.mood);
        setMoodValue(todayRes.mood.moodValue);
        setNotes(todayRes.mood.notes || '');
        setFactors(todayRes.mood.factors || []);
      }
    } catch (error) {
      console.error('Error loading mood data:', error);
      toast.error('Failed to load mood data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.logMood({
        mood: selectedMood,
        moodValue,
        notes,
        factors
      });

      toast.success(todayMood ? 'Mood updated successfully!' : 'Mood logged successfully!');
      loadMoodData();
    } catch (error) {
      console.error('Error logging mood:', error);
      toast.error('Failed to log mood');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFactor = (factor: string) => {
    setFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const getMoodOption = (moodType: string) => {
    return moodOptions.find(option => option.value === moodType);
  };

  const chartData = moodStats?.moodTrend?.map((entry: any) => ({
    date: format(new Date(entry.date), 'MMM dd'),
    mood: entry.value,
    fullDate: entry.date
  })) || [];

  if (isLoadingData) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mood Tracker</h1>
          <p className="text-gray-600">Track your daily emotions and identify patterns in your mental wellbeing.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mood Logging Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {todayMood ? 'Update Today\'s Mood' : 'How are you feeling today?'}
              </h2>
              
              <form onSubmit={handleMoodSubmit} className="space-y-6">
                {/* Mood Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select your mood</label>
                  <div className="grid grid-cols-1 gap-2">
                    {moodOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedMood(option.value);
                          setMoodValue(moodOptions.indexOf(option) + 1);
                        }}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                          selectedMood === option.value
                            ? `${option.bgColor} ${option.borderColor} ${option.color}`
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Factors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What might have influenced your mood? (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {factorOptions.map((factor) => (
                      <button
                        key={factor}
                        type="button"
                        onClick={() => toggleFactor(factor)}
                        className={`p-2 rounded-lg border text-sm font-medium transition-colors capitalize ${
                          factors.includes(factor)
                            ? 'bg-mint-100 border-mint-300 text-mint-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {factor}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How was your day? What happened?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={!selectedMood || isLoading}
                  className="w-full bg-gradient-to-r from-mint-600 to-sky-600 text-white py-3 px-4 rounded-lg font-medium hover:from-mint-700 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-mint-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>{todayMood ? 'Update Mood' : 'Save Mood'}</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Mood Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Mood</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {moodStats?.averageMood ? moodStats.averageMood.toFixed(1) : '0.0'}
                    </p>
                    <p className="text-xs text-gray-500">out of 5.0</p>
                  </div>
                  <div className="bg-mint-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-mint-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Entries</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {moodStats?.totalEntries || 0}
                    </p>
                    <p className="text-xs text-gray-500">this month</p>
                  </div>
                  <div className="bg-sky-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-sky-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Most Common</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {moodStats?.moodDistribution && Object.keys(moodStats.moodDistribution).length > 0 ? (
                        (() => {
                          const mostCommon = Object.entries(moodStats.moodDistribution)
                            .sort(([,a], [,b]) => (b as number) - (a as number))[0];
                          const moodOption = getMoodOption(mostCommon[0]);
                          return (
                            <>
                              <span className="text-xl">{moodOption?.emoji}</span>
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {mostCommon[0].replace('_', ' ')}
                              </span>
                            </>
                          );
                        })()
                      ) : (
                        <span className="text-sm text-gray-500">No data</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Smile className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mood Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trend (Last 30 Days)</h3>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis 
                        domain={[1, 5]}
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="url(#colorGradient)" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#059669' }}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No mood data available yet</p>
                  <p className="text-sm text-gray-400">Start tracking your mood to see trends</p>
                </div>
              )}
            </div>

            {/* Recent Mood History */}
            <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mood Entries</h3>
              {moodHistory.length > 0 ? (
                <div className="space-y-3">
                  {moodHistory.slice(0, 10).map((entry: any, index: number) => {
                    const moodOption = getMoodOption(entry.mood);
                    return (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{moodOption?.emoji}</span>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {entry.mood.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(entry.date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full mr-1 ${
                                  i < entry.moodValue ? 'bg-mint-400' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{entry.moodValue}/5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Smile className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No mood entries yet</p>
                  <p className="text-sm text-gray-400">Start tracking your mood to see your history</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};