import React, { useState } from 'react';
import { INTERESTS, INTEREST_CATEGORIES, Interest } from '../constants/interests';

interface InterestSelectionProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  minSelection?: number;
  maxSelection?: number;
}

const InterestSelection: React.FC<InterestSelectionProps> = ({
  selectedInterests,
  onInterestsChange,
  minSelection = 3,
  maxSelection = 10
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleInterest = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      onInterestsChange(selectedInterests.filter(id => id !== interestId));
    } else if (selectedInterests.length < maxSelection) {
      onInterestsChange([...selectedInterests, interestId]);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getSelectedCount = () => selectedInterests.length;
  const canSelectMore = () => selectedInterests.length < maxSelection;
  const meetsMinRequirement = () => selectedInterests.length >= minSelection;

  return (
    <div className="interest-selection">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Your Interests</h2>
        <p className="text-gray-600 mb-4">
          Choose topics you're interested in. We'll recommend relevant content and connect you with like-minded people.
        </p>
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
          <span className="text-sm font-medium text-blue-800">
            Selected: {getSelectedCount()} / {maxSelection}
          </span>
          <span className={`text-sm font-medium ${meetsMinRequirement() ? 'text-green-600' : 'text-orange-600'}`}>
            {meetsMinRequirement() ? '✓ Minimum met' : `Select at least ${minSelection}`}
          </span>
        </div>
      </div>

      {/* Interest Categories */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {INTEREST_CATEGORIES.map((category) => {
          const categoryInterests = INTERESTS.filter(i => i.category === category);
          const isExpanded = expandedCategory === category;
          const selectedInCategory = categoryInterests.filter(i => selectedInterests.includes(i.id)).length;

          return (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800">{category}</span>
                  {selectedInCategory > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {selectedInCategory}
                    </span>
                  )}
                </div>
                <span className="text-gray-500">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>

              {/* Interest Items */}
              {isExpanded && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.id);
                    const canSelect = canSelectMore() || isSelected;

                    return (
                      <button
                        key={interest.id}
                        onClick={() => canSelect && toggleInterest(interest.id)}
                        disabled={!canSelect}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                          }
                          ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <span className="text-2xl">{interest.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-800">{interest.name}</div>
                          <div className="text-xs text-gray-500">{interest.description}</div>
                        </div>
                        {isSelected && (
                          <span className="text-blue-500 font-bold">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Interests Summary */}
      {selectedInterests.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Your Selections:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interestId) => {
              const interest = INTERESTS.find(i => i.id === interestId);
              if (!interest) return null;
              return (
                <span
                  key={interestId}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{interest.icon}</span>
                  <span>{interest.name}</span>
                  <button
                    onClick={() => toggleInterest(interestId)}
                    className="ml-1 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestSelection;
