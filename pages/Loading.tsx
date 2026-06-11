
import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center animate-pulse">
        <div className="w-24 h-24 bg-[#1877F2] rounded-2xl flex items-center justify-center mb-6">
            <i className="fa-solid fa-brain text-white text-5xl"></i>
        </div>
        <h2 className="text-[#1877F2] text-4xl font-bold">NexusMind</h2>
      </div>
      
      <div className="fixed bottom-10 flex flex-col items-center text-gray-400">
        <span className="text-sm font-semibold">Connect.Solve.Grow</span>
      </div>
    </div>
  );
};

export default Loading;
