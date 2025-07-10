import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { Heart, Clock, Star, Play, CheckCircle, Filter, Search, BookOpen, Brain, Wind, Bot as Lotus, PenTool, Activity } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const categoryIcons = {
  cbt: Brain,
  mindfulness: Lotus,
  breathing: Wind,
  meditation: Lotus,
  journaling: PenTool,
  movement: Activity
};

const categoryColors = {
  cbt: 'from-purple-500 to-purple-600',
  mindfulness: 'from-green-500 to-green-600',
  breathing: 'from-blue-500 to-blue-600',
  meditation: 'from-indigo-500 to-indigo-600',
  journaling: 'from-yellow-500 to-yellow-600',
  movement: 'from-red-500 to-red-600'
};

const difficultyColors = {
  beginner: 'text-green-600 bg-green-100',
  intermediate: 'text-yellow-600 bg-yellow-100',
  advanced: 'text-red-600 bg-red-100'
};

export const ExercisePage: React.FC = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<any[]>([]);
  const [completedExercises, setCompletedExercises] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionRating, setCompletionRating] = useState(5);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    loadExercises();
    loadCompletedExercises();
  }, [selectedCategory, selectedDifficulty]);

  const loadExercises = async () => {
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const difficulty = selectedDifficulty === 'all' ? undefined : selectedDifficulty;
      const response = await apiService.getExercises(category, difficulty, 50, 1);
      setExercises(response.exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast.error('Failed to load exercises');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompletedExercises = async () => {
    try {
      const response = await apiService.getCompletedExercises(50, 1);
      setCompletedExercises(response.completedExercises);
    } catch (error) {
      console.error('Error loading completed exercises:', error);
    }
  };

  const handleCompleteExercise = async () => {
    if (!selectedExercise) return;

    setIsCompleting(true);
    try {
      await apiService.completeExercise(selectedExercise._id, {
        rating: completionRating,
        notes: completionNotes
      });

      toast.success('Exercise completed successfully!');
      setSelectedExercise(null);
      setCompletionRating(5);
      setCompletionNotes('');
      loadCompletedExercises();
    } catch (error) {
      console.error('Error completing exercise:', error);
      toast.error('Failed to complete exercise');
    } finally {
      setIsCompleting(false);
    }
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'cbt', label: 'CBT Techniques' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'breathing', label: 'Breathing' },
    { value: 'meditation', label: 'Meditation' },
    { value: 'journaling', label: 'Journaling' },
    { value: 'movement', label: 'Movement' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mental Health Exercises</h1>
          <p className="text-gray-600">Practice evidence-based techniques to improve your mental wellbeing.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'available'
                ? 'bg-white text-mint-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Available Exercises
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-mint-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({completedExercises.length})
          </button>
        </div>

        {activeTab === 'available' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-mint-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="h-4 w-4 inline mr-1" />
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search exercises..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Star className="h-4 w-4 inline mr-1" />
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedDifficulty('all');
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Exercise Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((exercise) => {
                const IconComponent = categoryIcons[exercise.category as keyof typeof categoryIcons] || BookOpen;
                const colorClass = categoryColors[exercise.category as keyof typeof categoryColors] || 'from-gray-500 to-gray-600';
                
                return (
                  <div
                    key={exercise._id}
                    className="bg-white rounded-xl shadow-sm border border-mint-100 p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`bg-gradient-to-r ${colorClass} p-3 rounded-lg`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty as keyof typeof difficultyColors]}`}>
                          {exercise.difficulty}
                        </span>
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">{exercise.duration}min</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{exercise.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{exercise.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                        {exercise.category.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => setSelectedExercise(exercise)}
                        className="bg-gradient-to-r from-mint-600 to-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:from-mint-700 hover:to-sky-700 transition-all duration-200 flex items-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredExercises.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No exercises found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-4">
            {completedExercises.map((completion, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-mint-100 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {completion.exerciseId.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{completion.exerciseId.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Completed: {new Date(completion.completedAt).toLocaleDateString()}</span>
                      <span>Duration: {completion.exerciseId.duration} minutes</span>
                      <div className="flex items-center">
                        <span className="mr-1">Rating:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < completion.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {completion.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{completion.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {completedExercises.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No completed exercises yet</p>
                <p className="text-sm text-gray-400">Start practicing to see your progress here</p>
              </div>
            )}
          </div>
        )}

        {/* Exercise Modal */}
        {selectedExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`bg-gradient-to-r ${categoryColors[selectedExercise.category as keyof typeof categoryColors]} p-3 rounded-lg`}>
                      {React.createElement(categoryIcons[selectedExercise.category as keyof typeof categoryIcons] || BookOpen, {
                        className: "h-6 w-6 text-white"
                      })}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedExercise.title}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[selectedExercise.difficulty as keyof typeof difficultyColors]}`}>
                          {selectedExercise.difficulty}
                        </span>
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">{selectedExercise.duration} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedExercise.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Instructions</h3>
                  <ol className="space-y-2">
                    {selectedExercise.instructions.map((instruction: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="bg-mint-100 text-mint-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">Complete Exercise</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How would you rate this exercise? (1-5 stars)
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setCompletionRating(rating)}
                            className="p-1"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                rating <= completionRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder="How did this exercise make you feel? Any insights?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                        rows={3}
                        maxLength={500}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedExercise(null)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCompleteExercise}
                        disabled={isCompleting}
                        className="flex-1 bg-gradient-to-r from-mint-600 to-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:from-mint-700 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isCompleting ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Completing...</span>
                          </div>
                        ) : (
                          'Mark as Completed'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};