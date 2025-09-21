import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User, Trash2, Loader2 } from 'lucide-react';
import apiService  from '../services/api';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await apiService.getChatHistory(20, 1);
      const formattedMessages = response.chats.map((chat: any) => ({
        role: chat.role,
        content: chat.content,
        timestamp: chat.createdAt
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await apiService.sendMessage(inputMessage, conversationHistory);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoadingHistory) {
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-mint-100 h-[calc(100vh-12rem)]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-mint-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-mint-600 to-sky-600 p-2 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Mantrana AI Therapist</h1>
                <p className="text-sm text-gray-600">Your compassionate mental health companion</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 h-[calc(100%-8rem)]">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-mint-600 to-sky-600 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Mantrana AI</h3>
                <p className="text-gray-600 mb-4">
                  I'm here to provide compassionate mental health support and guidance. 
                  How are you feeling today?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => setInputMessage("I'm feeling anxious today")}
                    className="p-3 text-left bg-mint-50 hover:bg-mint-100 rounded-lg border border-mint-200 transition-colors"
                  >
                    <span className="text-sm text-mint-700">I'm feeling anxious today</span>
                  </button>
                  <button
                    onClick={() => setInputMessage("I need help with stress management")}
                    className="p-3 text-left bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
                  >
                    <span className="text-sm text-sky-700">I need help with stress management</span>
                  </button>
                  <button
                    onClick={() => setInputMessage("Can you teach me breathing exercises?")}
                    className="p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                  >
                    <span className="text-sm text-purple-700">Can you teach me breathing exercises?</span>
                  </button>
                  <button
                    onClick={() => setInputMessage("I'm having trouble sleeping")}
                    className="p-3 text-left bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                  >
                    <span className="text-sm text-indigo-700">I'm having trouble sleeping</span>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-mint-400 to-sky-400' 
                        : 'bg-gradient-to-r from-mint-600 to-sky-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-mint-500 to-sky-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-mint-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-3xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-mint-600 to-sky-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-mint-600" />
                      <span className="text-gray-600">Mantrana is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-mint-100 p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts or ask for support..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500 resize-none"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-mint-600 to-sky-600 text-white p-3 rounded-lg hover:from-mint-700 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-mint-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};