import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { expertiseApi } from '../lib/firebaseApi';
import { EXPERTISE_DOMAINS } from '../constants/expertise';

interface Expert {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  score: number;
  problemsSolved: number;
  solutionsProvided: number;
  helpfulVotes: number;
}

interface FindExpertPageProps {
  user: User;
}

const FindExpertPage: React.FC<FindExpertPageProps> = ({ user }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('technology');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadExperts = async () => {
      try {
        setLoading(true);
        const data = await expertiseApi.getExpertsByDomain(selectedDomain, 20);
        setExperts(data.experts);
      } catch (error) {
        console.error('Error loading experts:', error);
        setExperts([]);
      } finally {
        setLoading(false);
      }
    };

    loadExperts();
  }, [selectedDomain]);

  const getDomainInfo = (domainId: string) => {
    return EXPERTISE_DOMAINS.find(d => d.id === domainId);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="max-w-[800px] mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Find an Expert</h1>
          <p className="text-gray-600">Discover top experts in various domains and connect with them.</p>
        </div>

        {/* Domain Selector */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="font-bold mb-4">Select Domain</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EXPERTISE_DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedDomain === domain.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{domain.icon}</div>
                <div className="font-semibold text-sm">{domain.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Experts List */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl">
              {getDomainInfo(selectedDomain)?.icon} {getDomainInfo(selectedDomain)?.name} Experts
            </h2>
            <span className="text-sm text-gray-500">{experts.length} experts found</span>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : experts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No experts found in this domain yet.</p>
              <p className="text-sm mt-2">Be the first to build expertise in {getDomainInfo(selectedDomain)?.name}!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {experts.map((expert, index) => (
                <div
                  key={expert.userId}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img src={expert.avatar} className="w-12 h-12 rounded-full" alt={expert.name} />
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{expert.name}</h3>
                    <p className="text-sm text-gray-500">@{expert.username}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{expert.score}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                  
                  <div className="text-right text-xs text-gray-600">
                    <div>📝 {expert.problemsSolved}</div>
                    <div>💡 {expert.solutionsProvided}</div>
                    <div>👍 {expert.helpfulVotes}</div>
                  </div>
                  
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How Expertise Works */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">How Expertise Works</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-semibold">Score Calculation</p>
                <p className="text-sm">Expertise is calculated based on problems solved, solutions provided, and helpful votes received.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold">Levels</p>
                <p className="text-sm">Progress from Novice to Grandmaster as you build your expertise in each domain.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold">Domain-Specific</p>
                <p className="text-sm">Build expertise in 8 different domains including Technology, Science, Engineering, and more.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindExpertPage;
