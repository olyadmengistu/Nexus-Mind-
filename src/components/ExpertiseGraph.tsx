import React, { useState, useEffect } from 'react';
import { ExpertiseScore } from '../types';
import { expertiseApi } from '../lib/backendApi';
import { EXPERTISE_DOMAINS, getExpertiseLevel, getExpertiseProgress } from '../constants/expertise';

interface ExpertiseGraphProps {
  userId: string;
  showUpdateButton?: boolean;
}

const ExpertiseGraph: React.FC<ExpertiseGraphProps> = ({ userId, showUpdateButton = false }) => {
  const [expertiseScores, setExpertiseScores] = useState<ExpertiseScore[]>([]);
  const [overallExpertise, setOverallExpertise] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadExpertise = async () => {
      try {
        setLoading(true);
        const data = await expertiseApi.getUserExpertise(userId);
        setExpertiseScores(data.expertiseScores);
        setOverallExpertise(data.overallExpertise);
      } catch (error) {
        console.error('Error loading expertise:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpertise();
  }, [userId]);

  const handleUpdateExpertise = async () => {
    try {
      setUpdating(true);
      const data = await expertiseApi.updateExpertise(userId);
      setExpertiseScores(data.expertiseScores);
      setOverallExpertise(data.overallExpertise);
    } catch (error) {
      console.error('Error updating expertise:', error);
      alert('Failed to update expertise scores');
    } finally {
      setUpdating(false);
    }
  };

  const getDomainInfo = (domainId: string) => {
    return EXPERTISE_DOMAINS.find(d => d.id === domainId);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Expertise Graph</h2>
        {showUpdateButton && (
          <button
            onClick={handleUpdateExpertise}
            disabled={updating}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            {updating ? 'Updating...' : 'Update Expertise'}
          </button>
        )}
      </div>

      {/* Overall Expertise */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Overall Expertise</p>
            <p className="text-3xl font-bold text-blue-600">{overallExpertise}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Level</p>
            <p className="text-2xl font-bold">{getExpertiseLevel(overallExpertise).icon} {getExpertiseLevel(overallExpertise).name}</p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
            style={{ width: `${getExpertiseProgress(overallExpertise)}%` }}
          />
        </div>
      </div>

      {/* Domain Expertise */}
      <div className="space-y-4">
        {expertiseScores.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No expertise data yet. Start solving problems to build your expertise!
          </p>
        ) : (
          expertiseScores.map((score) => {
            const domain = getDomainInfo(score.domainId);
            const level = getExpertiseLevel(score.score);
            const progress = getExpertiseProgress(score.score);

            return (
              <div key={score.domainId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{domain?.icon}</span>
                    <div>
                      <p className="font-semibold">{domain?.name}</p>
                      <p className="text-sm text-gray-500">{level.icon} {level.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{score.score}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full transition-all"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: domain?.color || '#3B82F6'
                    }}
                  />
                </div>

                <div className="flex gap-4 text-xs text-gray-600">
                  <span>📝 {score.problemsSolved} problems</span>
                  <span>💡 {score.solutionsProvided} solutions</span>
                  <span>👍 {score.helpfulVotes} helpful votes</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExpertiseGraph;
