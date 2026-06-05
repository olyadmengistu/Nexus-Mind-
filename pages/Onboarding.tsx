import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Beyond Social Media",
    subtitle: "A New Paradigm",
    description: "NexusMind isn't just another platform to scroll through. It's a movement to transform how humanity solves problems together.",
    icon: "🌍",
    gradient: "from-blue-600 via-purple-600 to-indigo-700"
  },
  {
    id: 2,
    title: "Every Problem Has a Solver",
    subtitle: "Connect. Collaborate. Create.",
    description: "Join a global network of thinkers, innovators, and problem-solvers. Your challenge could be someone else's breakthrough.",
    icon: "🤝",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600"
  },
  {
    id: 3,
    title: "Your Ideas Matter",
    subtitle: "Impact Real Change",
    description: "Share your solutions, build your reputation, and watch your contributions ripple across the world. Meaningful connections await.",
    icon: "💡",
    gradient: "from-orange-500 via-pink-500 to-rose-600"
  },
  {
    id: 4,
    title: "Ready to Make a Difference?",
    subtitle: "Join the Movement",
    description: "Be part of something bigger. Connect with purpose. Solve together. Grow together.",
    icon: "🚀",
    gradient: "from-violet-600 via-purple-600 to-fuchsia-700"
  }
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goToAuth = () => {
    navigate('/login');
  };

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  // Auto-advance slides (optional - can be disabled)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        nextSlide();
      }
    }, 6000); // 6 seconds per slide

    return () => clearTimeout(timer);
  }, [currentSlide]);

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-12 bg-white'
                  : 'w-8 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div
          className={`bg-gradient-to-br ${slide.gradient} rounded-3xl p-8 md:p-12 shadow-2xl transform transition-all duration-500 ${
            isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="text-center">
            {/* Icon */}
            <div className="text-7xl md:text-8xl mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
              {slide.icon}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 font-medium mb-6">
              {slide.subtitle}
            </p>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto mb-10">
              {slide.description}
            </p>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
                >
                  ← Back
                </button>
              )}

              {isLastSlide ? (
                <button
                  onClick={goToAuth}
                  className="px-10 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started →
                </button>
              ) : (
                <button
                  onClick={nextSlide}
                  className="px-10 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Continue →
                </button>
              )}

              {!isLastSlide && (
                <button
                  onClick={goToAuth}
                  className="px-6 py-3 text-white/80 hover:text-white font-medium transition-all duration-300"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Slide counter */}
        <div className="text-center mt-6 text-white/60 text-sm">
          {currentSlide + 1} of {slides.length}
        </div>
      </div>

      {/* Skip button for mobile */}
      <button
        onClick={goToAuth}
        className="absolute top-6 right-6 text-white/60 hover:text-white text-sm font-medium transition-colors z-20"
      >
        Skip
      </button>
    </div>
  );
};

export default Onboarding;
