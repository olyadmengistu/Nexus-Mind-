import React from 'react';

const Help: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center mb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-[#1877F2] font-semibold"
          >
            <i className="fa-solid fa-arrow-left text-xl"></i>
            <span>Back</span>
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Help & Support</h1>
        
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="border border-gray-200 rounded-lg p-4">
              <summary className="font-medium cursor-pointer">How do I create a post?</summary>
              <p className="mt-2 text-gray-600">Click the "What's on your mind?" box at the top of your feed to create a new post. You can add text, images, and tag other users.</p>
            </details>
            <details className="border border-gray-200 rounded-lg p-4">
              <summary className="font-medium cursor-pointer">How do I save posts?</summary>
              <p className="mt-2 text-gray-600">Click the bookmark icon on any post to save it to your collection. You can view all saved posts from your profile menu.</p>
            </details>
            <details className="border border-gray-200 rounded-lg p-4">
              <summary className="font-medium cursor-pointer">How do I change my privacy settings?</summary>
              <p className="mt-2 text-gray-600">Go to Settings from your profile menu, then navigate to Privacy Settings to control who can see your profile and contact you.</p>
            </details>
            <details className="border border-gray-200 rounded-lg p-4">
              <summary className="font-medium cursor-pointer">How do I delete my account?</summary>
              <p className="mt-2 text-gray-600">You can delete your account from the profile menu under Account Actions. Note that this action is irreversible.</p>
            </details>
          </div>
        </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                placeholder="Describe your issue in detail"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => alert('Support ticket submitted! We will get back to you soon.')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit Ticket
            </button>
          </div>
        </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <i className="fa-solid fa-book text-blue-500 text-2xl mb-2"></i>
              <h3 className="font-medium">User Guide</h3>
              <p className="text-sm text-gray-500">Learn how to use all features</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <i className="fa-solid fa-video text-blue-500 text-2xl mb-2"></i>
              <h3 className="font-medium">Video Tutorials</h3>
              <p className="text-sm text-gray-500">Watch step-by-step guides</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <i className="fa-solid fa-users text-blue-500 text-2xl mb-2"></i>
              <h3 className="font-medium">Community Forum</h3>
              <p className="text-sm text-gray-500">Connect with other users</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <i className="fa-solid fa-comments text-blue-500 text-2xl mb-2"></i>
              <h3 className="font-medium">Live Chat</h3>
              <p className="text-sm text-gray-500">Chat with support team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
