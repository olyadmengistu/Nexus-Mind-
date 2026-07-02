import React, { useState } from 'react';
import { User } from '../types';
import { feedbackApi } from '../lib/api';

interface FeedbackProps {
  user: User;
}

const Feedback: React.FC<FeedbackProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    category: 'general',
    subject: '',
    message: '',
    rating: 5,
    email: user.email || '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please provide your email for follow-up');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const feedback = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        email: formData.email,
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
        rating: formData.rating,
        timestamp: Date.now(),
      };

      // Store in localStorage as backup
      const existingFeedback = JSON.parse(localStorage.getItem('nexus_feedback') || '[]');
      localStorage.setItem('nexus_feedback', JSON.stringify([feedback, ...existingFeedback]));

      await feedbackApi.submitFeedback(feedback);
      
      setSubmitted(true);
      setFormData({ category: 'general', subject: '', message: '', rating: 5, email: user.email || '' });
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { value: 'general', label: 'General Feedback', icon: 'fa-comment', description: 'Share your thoughts about the app' },
    { value: 'bug', label: 'Bug Report', icon: 'fa-bug', description: 'Report an issue or problem' },
    { value: 'feature', label: 'Feature Request', icon: 'fa-lightbulb', description: 'Suggest new features or improvements' },
    { value: 'ui', label: 'UI/UX Issue', icon: 'fa-palette', description: 'Report design or usability problems' },
    { value: 'performance', label: 'Performance', icon: 'fa-gauge-high', description: 'Report slow loading or performance issues' },
    { value: 'security', label: 'Security', icon: 'fa-shield-halved', description: 'Report security concerns' },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-800 border-blue-200',
      bug: 'bg-red-100 text-red-800 border-red-200',
      feature: 'bg-purple-100 text-purple-800 border-purple-200',
      ui: 'bg-pink-100 text-pink-800 border-pink-200',
      performance: 'bg-orange-100 text-orange-800 border-orange-200',
      security: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto p-3 sm:p-6">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <i className="fa-solid fa-comments text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Feedback Center
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Your feedback helps us improve NexusMind. Share your thoughts, report issues, or suggest new features.
          </p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-check text-white text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-green-800 text-lg">Thank you for your feedback!</h3>
                <p className="text-green-700">We've received your submission and will review it shortly. A confirmation email has been sent to {formData.email}.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-red-500 text-xl"></i>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Main Feedback Form */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-5 sm:mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-paper-plane text-blue-600"></i>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Submit Your Feedback</h2>
          </div>
          
          <div className="space-y-8">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                What type of feedback is this?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`group relative p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                      formData.category === cat.value
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        formData.category === cat.value ? 'bg-blue-500' : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                        <i className={`fa-solid ${cat.icon} ${
                          formData.category === cat.value ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                        }`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{cat.label}</h3>
                        <p className="text-xs text-gray-500">{cat.description}</p>
                      </div>
                      {formData.category === cat.value && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <i className="fa-solid fa-check text-white text-xs"></i>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of your feedback (e.g., 'App crashes when uploading images')"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-gray-800 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">Keep it concise and descriptive</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-gray-800 placeholder-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">We'll send a confirmation and follow up if needed</p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How would you rate your experience?
              </label>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="text-4xl transition-all duration-200 hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <i
                      className={`fa-solid fa-star ${
                        star <= formData.rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-300'
                      }`}
                    ></i>
                  </button>
                ))}
                <span className="ml-3 text-lg font-semibold text-gray-700 bg-white px-4 py-2 rounded-lg">
                  {formData.rating}/5
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Detailed Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please provide detailed information about your feedback. Include steps to reproduce if reporting a bug, or specific details for feature requests..."
                rows={8}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none text-gray-800 placeholder-gray-400"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">The more details you provide, the better we can help</p>
                <span className="text-xs text-gray-400">{formData.message.length} characters</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback History */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-clock-rotate-left text-purple-600"></i>
              </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Recent Feedback</h2>
            </div>
          </div>
          
          <div id="feedback-history">
            {(() => {
              const feedbacks = JSON.parse(localStorage.getItem('nexus_feedback') || '[]');
              const userFeedbacks = feedbacks.filter((f: any) => f.userId === user.id);
              
              if (userFeedbacks.length === 0) {
                return (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-inbox text-gray-400 text-3xl"></i>
                    </div>
                    <p className="text-gray-500 text-lg">No feedback submitted yet</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to share your thoughts!</p>
                  </div>
                );
              }

              return userFeedbacks.slice(0, 5).map((feedback: any) => (
                <div key={feedback.id} className="border-b border-gray-100 py-6 last:border-b-0 hover:bg-gray-50 rounded-xl px-4 -mx-4 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(feedback.category)}`}>
                        {categories.find(c => c.value === feedback.category)?.label || feedback.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fa-solid fa-star text-sm ${
                              star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(feedback.timestamp).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">{feedback.subject}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feedback.message}</p>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-headset text-white text-xl"></i>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Need immediate help?</h3>
              <p className="text-gray-600 text-sm mb-3">
                If you're experiencing a critical issue that needs urgent attention, please contact our support team directly.
              </p>
              <a 
                href="mailto:support@nexusmind.com" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <i className="fa-solid fa-envelope"></i>
                support@nexusmind.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
