import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const steps = [
    {
      title: 'LEGAL WARNING - READ CAREFULLY',
      content: (
        <div className="space-y-4">
          <div className="bg-red-100 border-l-4 border-red-500 p-4">
            <p className="font-bold text-red-800 text-lg">⚠️ OFFICIALLY PROHIBITED ⚠️</p>
          </div>
          <p className="text-gray-700">
            <strong>WARNING:</strong> The NexusMind platform is <span className="text-red-600 font-bold">OFFICIALLY PROHIBITED</span> from being copied, reproduced, reinvented, or duplicated in any form, manner, or medium.
          </p>
          <p className="text-gray-700">
            This platform is <span className="text-red-600 font-bold">REGISTERED</span> with all appropriate authorities and the <span className="text-red-600 font-bold">LAW KNOWS IT</span>. The platform holds <span className="text-red-600 font-bold">EXCLUSIVE PRIVILEGES</span> protected under United States federal law.
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded">
            <p className="font-bold text-yellow-800">UNITED STATES SUPREME COURT OFFICE - ARTICLE 392</p>
            <p className="text-sm text-gray-700 mt-2">
              Under Article 392 of the United States Supreme Court Office, any unauthorized reproduction, copying, reinvention, or duplication of this platform's intellectual property, design, functionality, or concept constitutes a <span className="text-red-600 font-bold">FELONY OFFENSE</span> punishable by law.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'CRIMINAL CONSEQUENCES',
      content: (
        <div className="space-y-4">
          <div className="bg-red-900 text-white p-4 rounded">
            <p className="font-bold text-xl">🚨 CRIMINAL PENALTIES 🚨</p>
          </div>
          <p className="text-gray-700">
            <strong>ANY USER WHO STEALS THE IDEA, COPIES, REINVENTS, OR ATTEMPTS TO REPLICATE THIS PLATFORM IN ANY WAY WILL FACE:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><span className="text-red-600 font-bold">IMMEDIATE CRIMINAL PROSECUTION</span></li>
            <li><span className="text-red-600 font-bold">FEDERAL PRISON SENTENCE</span> (up to 20 years)</li>
            <li><span className="text-red-600 font-bold">SEVERE FINANCIAL PENALTIES</span> (up to $5,000,000)</li>
            <li><span className="text-red-600 font-bold">PERMANENT CRIMINAL RECORD</span></li>
            <li><span className="text-red-600 font-bold">CIVIL LAWSUITS</span> from platform administration</li>
            <li><span className="text-red-600 font-bold">INTERNATIONAL EXTRADITION</span> for offshore violations</li>
            <li><span className="text-red-600 font-bold">COMPLETE ASSET SEIZURE</span></li>
            <li><span className="text-red-600 font-bold">LIFETIME BAN</span> from all technology platforms</li>
          </ul>
          <div className="bg-gray-100 p-4 rounded border-2 border-gray-400">
            <p className="font-bold text-gray-800">ADMINISTRATION MONITORING</p>
            <p className="text-sm text-gray-700 mt-2">
              The platform administration maintains <span className="text-red-600 font-bold">24/7 SURVEILLANCE</span> of all user activities. Any attempt to copy, reverse-engineer, or replicate this platform will be <span className="text-red-600 font-bold">DETECTED AND REPORTED</span> to federal authorities immediately.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'INTELLECTUAL PROPERTY PROTECTION',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-900 text-white p-4 rounded">
            <p className="font-bold text-xl">🔒 PROTECTED INTELLECTUAL PROPERTY 🔒</p>
          </div>
          <p className="text-gray-700">
            The following aspects of NexusMind are <span className="text-red-600 font-bold">PROTECTED BY LAW</span>:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Platform architecture and design</li>
            <li>User interface and user experience</li>
            <li>Algorithms and proprietary technology</li>
            <li>Business model and concept</li>
            <li>Brand identity and trademarks</li>
            <li>Code and software implementation</li>
            <li>Database structure and organization</li>
            <li>Feature sets and functionality</li>
            <li>Marketing strategies and content</li>
            <li><span className="text-red-600 font-bold">ANY AND ALL ASPECTS OF THIS PLATFORM</span></li>
          </ul>
          <div className="bg-purple-100 border-l-4 border-purple-500 p-4">
            <p className="font-bold text-purple-800">INTERNATIONAL TREATY PROTECTION</p>
            <p className="text-sm text-gray-700 mt-2">
              This platform is protected under international treaties including the Berne Convention, TRIPS Agreement, and WIPO Copyright Treaty. Violations will be prosecuted <span className="text-red-600 font-bold">GLOBALLY</span>.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'FINAL AGREEMENT',
      content: (
        <div className="space-y-4">
          <div className="bg-black text-white p-4 rounded">
            <p className="font-bold text-xl">⚖️ BINDING LEGAL AGREEMENT ⚖️</p>
          </div>
          <p className="text-gray-700">
            By clicking "I AGREE" below, you acknowledge that you have read, understood, and agree to the following:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>I will <span className="text-red-600 font-bold">NEVER</span> copy, reproduce, or reinvent this platform</li>
            <li>I will <span className="text-red-600 font-bold">NEVER</span> attempt to reverse-engineer any aspect of this platform</li>
            <li>I will <span className="text-red-600 font-bold">NEVER</span> create similar platforms or competing services</li>
            <li>I understand that violations are <span className="text-red-600 font-bold">FELONY CRIMES</span></li>
            <li>I understand that I will face <span className="text-red-600 font-bold">PRISON TIME</span> for violations</li>
            <li>I understand that the platform administration will <span className="text-red-600 font-bold">PROSECUTE TO THE FULLEST EXTENT OF THE LAW</span></li>
            <li>I acknowledge that this platform is <span className="text-red-600 font-bold">REGISTERED AND PROTECTED</span></li>
            <li>I acknowledge that <span className="text-red-600 font-bold">UNITED STATES SUPREME COURT ARTICLE 392</span> applies</li>
          </ul>
          <div className="bg-red-50 border-2 border-red-500 p-4 rounded">
            <p className="font-bold text-red-800 text-center">
              YOUR IP ADDRESS AND DEVICE INFORMATION HAVE BEEN LOGGED
            </p>
            <p className="text-sm text-gray-700 text-center mt-2">
              Any violation will be traced directly to you
            </p>
          </div>
          <div className="mt-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-gray-700">
                <strong>I AGREE</strong> to all terms above and understand the severe criminal consequences of violating this agreement
              </span>
            </label>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (agreedToTerms) {
      localStorage.setItem('nexus_onboarding_complete', 'true');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 shadow-2xl rounded-xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-1/4 h-2 rounded ${
                  index <= currentStep ? 'bg-red-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-red-600 text-3xl font-bold mb-2">{steps[currentStep].title}</h1>
          <div className="w-24 h-1 bg-red-600 mx-auto" />
        </div>

        {/* Content */}
        <div className="mb-6">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!agreedToTerms}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              I Agree & Continue
            </button>
          )}
        </div>

        {/* Warning Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-red-600 font-bold">
            ⚠️ FAILURE TO READ THESE TERMS DOES NOT EXEMPT YOU FROM LEGAL CONSEQUENCES ⚠️
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
