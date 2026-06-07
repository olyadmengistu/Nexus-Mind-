import React, { useState } from 'react';
import { User } from '../types';

interface FeedbackProps {
  user: User;
}

const Feedback: React.FC<FeedbackProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    category: 'general',
    subject: '',
    message: '',
    rating: 5,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const feedback = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      category: formData.category,
      subject: formData.subject,
      message: formData.message,
      rating: formData.rating,
      timestamp: Date.now(),
    };

    const existingFeedback = JSON.parse(localStorage.getItem('nexus_feedback') || '[]');
    localStorage.setItem('nexus_feedback', JSON.stringify([feedback, ...existingFeedback]));
    
    setSubmitted(true);
    setFormData({ category: 'general', subject: '', message: '', rating: 5 });
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  const categories = [
    { value: 'general', label: 'General Feedback', icon: 'fa-comment' },
    { value: 'bug', label: 'Bug Report', icon: 'fa-bug' },
    { value: 'feature', label: 'Feature Request', icon: 'fa-lightbulb' },
    { value: 'ui', label: 'UI/UX Issue', icon: 'fa-palette' },
    { value: 'performance', label: 'Performance', icon: 'fa-gauge-high' },
    { value: 'security', label: 'Security', icon: 'fa-shield-halved' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-[56px]">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Feedback</h1>
        <p className="text-gray-600 mb-8">Help us improve NexusMind by sharing your feedback</p>

        {submitted && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-check-circle"></i>
              <span>Thank you for your feedback! We appreciate your input.</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Submit Feedback</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      formData.category === cat.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className={`fa-solid ${cat.icon}`}></i>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of your feedback"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="text-3xl transition-colors"
                  >
                    <i
                      className={`fa-solid fa-star ${
                        star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    ></i>
                  </button>
                ))}
                <span className="ml-2 text-gray-600">{formData.rating}/5</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please provide detailed feedback..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Submit Feedback
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Recent Feedback</h2>
          <div id="feedback-history">
            {(() => {
              const feedbacks = JSON.parse(localStorage.getItem('nexus_feedback') || '[]');
              const userFeedbacks = feedbacks.filter((f: any) => f.userId === user.id);
              
              if (userFeedbacks.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fa-solid fa-inbox text-4xl mb-3"></i>
                    <p>No feedback submitted yet</p>
                  </div>
                );
              }

              return userFeedbacks.slice(0, 5).map((feedback: any) => (
                <div key={feedback.id} className="border-b border-gray-100 py-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {categories.find(c => c.value === feedback.category)?.label || feedback.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fa-solid fa-star text-xs ${
                              star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">{feedback.subject}</h3>
                  <p className="text-sm text-gray-600">{feedback.message}</p>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
