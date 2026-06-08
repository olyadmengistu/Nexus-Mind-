import React, { useState, useEffect } from 'react';

const Mission: React.FC = () => {
  const messages = [
    "This is our first MVP",
    "Send us feedback",
    "Nexus Mind connects problem solvers worldwide",
    "Share your challenges and find innovative solutions",
    "Collaborate with experts in real-time",
    "Build your reputation as a trusted solver",
    "Join communities focused on your interests",
    "Watch live streams from industry leaders",
    "Access a marketplace of solutions and services",
    "Track your contributions and impact",
    "Our mission: Empowering collective intelligence",
    "Together, we solve what no one can solve alone"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 md:p-20 shadow-2xl border border-white/20">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            Nexus Mind
          </h1>
          <div className="min-h-[200px] flex items-center justify-center">
            <p className="text-3xl md:text-5xl font-bold text-white animate-pulse">
              {messages[currentIndex]}
            </p>
          </div>
          <div className="mt-12 flex justify-center gap-2">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white scale-125' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
          <div className="mt-8">
            <button
              onClick={() => window.location.hash = '/login'}
              className="bg-white text-purple-700 font-bold text-xl px-8 py-4 rounded-full hover:bg-purple-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mission;
