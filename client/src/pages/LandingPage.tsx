import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Smile,
  Activity,
  Users,
  Shield,
  Star,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Smile,
      title: 'Daily Mood Tracking',
      description: 'Monitor emotional patterns and identify triggers easily.',
    },
    {
      icon: MessageCircle,
      title: 'AI-Powered Support',
      description: 'Talk to a 24/7 AI therapist that listens with empathy.',
    },
    {
      icon: Heart,
      title: 'CBT & Mindfulness',
      description: 'Practice scientifically proven techniques for clarity.',
    },
    {
      icon: Users,
      title: 'Anonymous Community',
      description: 'Join supportive, safe peer discussions anonymously.',
    },
    {
      icon: Activity,
      title: 'Progress Insights',
      description: 'Visualize your mental journey through rich analytics.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Encrypted, anonymous, and secure — always.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'User',
      content:
        'Mantrana helped me understand my emotions better. The daily mood tracking is incredibly insightful.',
      rating: 5,
    },
    {
      name: 'Alex R.',
      role: 'User',
      content:
        'The AI chat feature is amazing. It feels like having a therapist available 24/7.',
      rating: 5,
    },
    {
      name: 'Maria L.',
      role: 'User',
      content:
        'The community forum is so supportive. I love that I can share anonymously.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50 text-gray-800">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-mint-600 to-sky-600 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">ManoSetu</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-mint-600 font-medium transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-mint-600 to-sky-600 text-white rounded-lg font-medium shadow hover:shadow-md hover:from-mint-700 hover:to-sky-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-32 text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Your Mental Health,
          <span className="block bg-gradient-to-r from-mint-600 to-sky-600 bg-clip-text text-transparent">
            Our Priority
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
          A powerful AI-driven mental health platform combining therapy tools, support systems, and community — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-mint-600 to-sky-600 text-white font-semibold hover:from-mint-700 hover:to-sky-700 shadow-lg transition"
          >
            Start Your Journey
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 border-2 border-mint-600 text-mint-600 rounded-lg font-semibold hover:bg-mint-50 transition"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">Everything You Need</h2>
          <p className="text-center text-gray-600 max-w-xl mx-auto mb-12">
            A complete set of tools and features to empower your mental wellness.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-gradient-to-br from-mint-50 to-sky-50 border hover:shadow-lg transition"
              >
                <div className="p-3 rounded-lg bg-gradient-to-r from-mint-600 to-sky-600 w-fit mb-4">
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-mint-50 to-sky-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">Loved by Our Users</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            Hear from people who found balance and healing with ManoSetu.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border hover:shadow-md transition"
              >
                <div className="flex gap-1 mb-2">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="italic text-gray-700 mb-4">"{t.content}"</p>
                <hr className="border-gray-200 mb-2" />
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-mint-600 to-sky-600 text-white text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Begin?
        </h2>
        <p className="text-lg mb-8">
          Join thousands on their journey to better mental health.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="bg-white text-mint-600 px-8 py-3 rounded-lg font-medium hover:bg-mint-100 transition shadow"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="border-2 border-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-mint-600 transition"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-mint-600 to-sky-600 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ManoSetu</span>
            </div>
            <p>
              A complete mental wellness platform powered by AI and compassion.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Features</h3>
            <ul className="space-y-1">
              <li>Mood Tracking</li>
              <li>AI Therapist</li>
              <li>CBT Exercises</li>
              <li>Community Forum</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Support</h3>
            <ul className="space-y-1">
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Resources</h3>
            <ul className="space-y-1">
              <li>Mental Health Tips</li>
              <li>Blog</li>
              <li>Research</li>
              <li>Careers</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-12 text-sm text-gray-500">
          &copy; 2024 Mantrana. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
