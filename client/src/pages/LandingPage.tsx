import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Smile, Activity, Users, Shield, Star, Check } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Smile,
      title: 'Daily Mood Tracking',
      description: 'Monitor your emotional patterns and identify triggers with our intuitive mood tracking system.',
    },
    {
      icon: MessageCircle,
      title: 'AI-Powered Support',
      description: 'Chat with our compassionate AI therapist for 24/7 mental health support and guidance.',
    },
    {
      icon: Heart,
      title: 'CBT & Mindfulness',
      description: 'Access evidence-based therapeutic exercises and mindfulness practices.',
    },
    {
      icon: Users,
      title: 'Anonymous Community',
      description: 'Connect with others in a safe, anonymous environment for peer support.',
    },
    {
      icon: Activity,
      title: 'Progress Tracking',
      description: 'Visualize your mental health journey with detailed analytics and insights.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is encrypted and secure. Complete anonymity in community features.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'User',
      content: 'ManoSetu has helped me understand my emotions better. The daily mood tracking is incredibly insightful.',
      rating: 5,
    },
    {
      name: 'Alex R.',
      role: 'User',
      content: 'The AI chat feature is amazing. It feels like having a therapist available 24/7.',
      rating: 5,
    },
    {
      name: 'Maria L.',
      role: 'User',
      content: 'The community forum is so supportive. I love that I can share anonymously.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-mint-600 to-sky-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ManoSetu</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-mint-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-mint-600 to-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:from-mint-700 hover:to-sky-700 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Mental Health,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-mint-600 to-sky-600">
              Our Priority
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            ManoSetu is a comprehensive mental health platform that combines AI-powered support, 
            mood tracking, therapeutic exercises, and community connection to help you on your wellness journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-gradient-to-r from-mint-600 to-sky-600 text-white px-8 py-3 rounded-lg font-medium hover:from-mint-700 hover:to-sky-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Your Journey
            </Link>
            <Link
              to="/login"
              className="bg-white text-mint-600 px-8 py-3 rounded-lg font-medium border-2 border-mint-600 hover:bg-mint-50 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Mental Health Support
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform offers a complete suite of tools designed to support your mental wellbeing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-mint-50 to-sky-50 p-6 rounded-xl border border-mint-100 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="bg-gradient-to-r from-mint-600 to-sky-600 p-3 rounded-lg w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-mint-50 to-sky-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from people who've transformed their mental health journey with ManoSetu.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-mint-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div className="border-t pt-4">
                  <p className="font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-mint-600 to-sky-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl text-mint-100 mb-8">
            Join thousands of users who have already taken the first step towards better mental health.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-mint-600 px-8 py-3 rounded-lg font-medium hover:bg-mint-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-transparent text-white px-8 py-3 rounded-lg font-medium border-2 border-white hover:bg-white hover:text-mint-600 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-mint-600 to-sky-600 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">ManoSetu</span>
              </div>
              <p className="text-gray-400">
                Comprehensive mental health support platform for your wellness journey.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Mood Tracking</li>
                <li>AI Chat Support</li>
                <li>CBT Exercises</li>
                <li>Community Forum</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Mental Health Tips</li>
                <li>Crisis Resources</li>
                <li>Research</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ManoSetu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};