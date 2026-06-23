import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    localStorage.setItem('nexus_welcome_seen', 'true');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <i className="fa-solid fa-brain text-white text-5xl"></i>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              NexusMind
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-2">
              Connect. Solve. Grow Together.
            </p>
          </div>

          {/* Mission Statement */}
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A global problem-solving network where people post challenges, receive solutions from around the world, and build meaningful connections.
          </p>

          {/* Scroll indicator */}
          <div className="mt-8">
            <i className="fa-solid fa-chevron-down text-gray-400 text-2xl"></i>
          </div>
        </div>
      </section>

      {/* How NexusMind Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
            How NexusMind Works
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto text-lg">
            Simple steps to transform your challenges into opportunities
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-lightbulb text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Post a Problem</h3>
              <p className="text-gray-600">Share any challenge from your startup, studies, health, or career with the global community.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-globe text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Connect Globally</h3>
              <p className="text-gray-600">Reach experts, scientists, mentors, and problem-solvers from every corner of the world.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-hand-holding-heart text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Get Solutions</h3>
              <p className="text-gray-600">Receive practical solutions, research, ideas, and guidance from people who care.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-star text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Help Others</h3>
              <p className="text-gray-600">Share your knowledge, build reputation, and create meaningful impact in others' lives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Example Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <i className="fa-solid fa-quote-left text-4xl text-blue-600 mr-4"></i>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                  Real-World Impact
                </h2>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 md:p-8 mb-6">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed italic">
                  "Imagine you post a challenge about your startup, studies, health, or career. Someone from the United States, Europe, Africa, Asia, or any corner of the globe can discover your post and suggest a solution. A scientist may share research, a designer may offer ideas, and a mentor may guide you forward. At the same time, your own experience could help someone else solve their problem."
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <i className="fa-solid fa-rocket mr-2"></i>Startups
                </span>
                <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <i className="fa-solid fa-graduation-cap mr-2"></i>Education
                </span>
                <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <i className="fa-solid fa-heart-pulse mr-2"></i>Health
                </span>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <i className="fa-solid fa-briefcase mr-2"></i>Career
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
            Opportunities Await
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto text-lg">
            Discover the value you can gain from NexusMind
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Opportunity 1 */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                <i className="fa-solid fa-earth-americas text-blue-600 text-2xl group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Global Knowledge</h3>
              <p className="text-gray-600">Access expertise and insights from people across different cultures, backgrounds, and experiences.</p>
            </div>

            {/* Opportunity 2 */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors duration-300">
                <i className="fa-solid fa-bolt text-purple-600 text-2xl group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Faster Solutions</h3>
              <p className="text-gray-600">Solve problems quicker through community collaboration and collective intelligence.</p>
            </div>

            {/* Opportunity 3 */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-pink-300 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 transition-colors duration-300">
                <i className="fa-solid fa-book-open text-pink-600 text-2xl group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Real Learning</h3>
              <p className="text-gray-600">Learn from real experiences and practical solutions shared by people who've been there.</p>
            </div>

            {/* Opportunity 4 */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-green-300 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors duration-300">
                <i className="fa-solid fa-users text-green-600 text-2xl group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Meaningful Connections</h3>
              <p className="text-gray-600">Build a network of genuine connections based on shared challenges and growth.</p>
            </div>

            {/* Opportunity 5 */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-600 transition-colors duration-300">
                <i className="fa-solid fa-compass text-yellow-600 text-2xl group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">New Opportunities</h3>
              <p className="text-gray-600">Discover career, business, and learning opportunities through your contributions.</p>
            </div>

            {/* Opportunity 6 */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-red-300 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors duration-300">
                <i className="fa-solid fa-seedling text-red-600 text-2xl group-hover:text-white transition-colors duration-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Impact & Growth</h3>
              <p className="text-gray-600">Contribute to a community that values real impact and personal growth over distraction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Different from Social Media Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <i className="fa-solid fa-shield-halved text-6xl mb-6 opacity-90"></i>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for Purpose, Not Distraction
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed opacity-90 mb-8">
            NexusMind is different from traditional social media. We're not here to waste your time—we're here to help you solve problems, grow, collaborate, and create real value.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <i className="fa-solid fa-check text-2xl mb-2"></i>
              <p className="font-semibold">Problem-Focused</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <i className="fa-solid fa-check text-2xl mb-2"></i>
              <p className="font-semibold">Solution-Driven</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <i className="fa-solid fa-check text-2xl mb-2"></i>
              <p className="font-semibold">Impact-Oriented</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Your Next Breakthrough Starts Here
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Your next breakthrough could begin with one question. Join NexusMind and become part of a global community built for meaningful solutions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold"
            >
              <i className="fa-solid fa-rocket mr-2"></i>
              Get Started
            </button>
          </div>

          <p className="mt-8 text-gray-500 text-sm">
            Free to join. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <i className="fa-solid fa-brain text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold">NexusMind</span>
          </div>
          <p className="text-gray-400 text-sm">
            Connect. Solve. Grow Together.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
