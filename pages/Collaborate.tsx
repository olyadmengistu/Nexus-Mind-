import React, { useState, useEffect, useCallback } from 'react';
import { User, Collaboration, CollaborationApplicant } from '../types';
import { searchCollaborations, debounce } from '../lib/searchApi';

interface CollaborateProps {
  user: User;
}

const Collaborate: React.FC<CollaborateProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-projects' | 'applications' | 'create'>('browse');
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredCollaborations, setFilteredCollaborations] = useState<Collaboration[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCollaboration, setSelectedCollaboration] = useState<Collaboration | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');

  const categories = ['All', 'Technology', 'Business', 'Education', 'Health', 'Creative', 'Social'];
  const types = ['All', 'project', 'partnership', 'mentorship', 'investment'];

  useEffect(() => {
    // Load sample collaborations
    const sampleCollaborations: Collaboration[] = [
      {
        id: '1',
        creatorId: 'user1',
        creatorName: 'John Doe',
        creatorAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'AI-Powered Problem Solving Platform',
        description: 'Looking for developers and AI specialists to build an innovative problem-solving platform using machine learning.',
        category: 'Technology',
        type: 'project',
        requiredSkills: ['React', 'Python', 'Machine Learning', 'API Development'],
        status: 'open',
        applicants: [],
        timestamp: Date.now() - 86400000,
        deadline: Date.now() + 2592000000,
        budget: 50000
      },
      {
        id: '2',
        creatorId: 'user2',
        creatorName: 'Jane Smith',
        creatorAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Business Partnership Opportunity',
        description: 'Seeking strategic partners for expanding our problem-solving consultancy to international markets.',
        category: 'Business',
        type: 'partnership',
        requiredSkills: ['Business Development', 'International Relations', 'Marketing'],
        status: 'open',
        applicants: [],
        timestamp: Date.now() - 172800000,
        deadline: Date.now() + 5184000000,
        budget: 100000
      },
      {
        id: '3',
        creatorId: 'user3',
        creatorName: 'Mike Johnson',
        creatorAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Mentorship for Startup Founders',
        description: 'Experienced entrepreneur offering mentorship for early-stage startup founders in the tech space.',
        category: 'Education',
        type: 'mentorship',
        requiredSkills: ['Entrepreneurship', 'Leadership', 'Strategic Planning'],
        status: 'open',
        applicants: [],
        timestamp: Date.now() - 259200000,
        deadline: Date.now() + 7776000000
      },
      {
        id: '4',
        creatorId: 'user4',
        creatorName: 'Sarah Williams',
        creatorAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Investment Opportunity: EdTech Startup',
        description: 'Seeking investors for our educational technology startup focused on collaborative learning.',
        category: 'Business',
        type: 'investment',
        requiredSkills: ['Investment', 'Finance', 'EdTech'],
        status: 'open',
        applicants: [],
        timestamp: Date.now() - 345600000,
        deadline: Date.now() + 10368000000,
        budget: 250000
      },
      {
        id: '5',
        creatorId: 'user5',
        creatorName: 'David Brown',
        creatorAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Creative Collaboration: Design System',
        description: 'Looking for UI/UX designers to collaborate on creating a comprehensive design system for open-source projects.',
        category: 'Creative',
        type: 'project',
        requiredSkills: ['UI/UX Design', 'Figma', 'Design Systems', 'CSS'],
        status: 'open',
        applicants: [],
        timestamp: Date.now() - 432000000,
        deadline: Date.now() + 12960000000
      }
    ];

    setCollaborations(sampleCollaborations);
  }, []);

  // Debounced search function for collaborations
  const debouncedCollaborationSearch = useCallback(
    debounce(async (query: string, category: string, type: string) => {
      if (query.trim() || category !== 'All' || type !== 'All') {
        setIsSearching(true);
        try {
          const response = await searchCollaborations({ 
            query, 
            category: category === 'All' ? undefined : category, 
            type: type === 'All' ? undefined : type,
            limit: 50
          });
          setFilteredCollaborations(response.data);
        } catch (error) {
          console.error('Collaboration search error:', error);
          setFilteredCollaborations([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setFilteredCollaborations(collaborations);
      }
    }, 300),
    [collaborations]
  );

  // Trigger search when search parameters change
  useEffect(() => {
    debouncedCollaborationSearch(searchQuery, selectedCategory, selectedType);
  }, [searchQuery, selectedCategory, selectedType, debouncedCollaborationSearch]);

  // Initialize filteredCollaborations with all collaborations on mount
  useEffect(() => {
    setFilteredCollaborations(collaborations);
  }, [collaborations]);

  const handleApply = (collabId: string) => {
    if (!applicationMessage.trim()) return;

    const applicant: CollaborationApplicant = {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      message: applicationMessage,
      skills: [],
      timestamp: Date.now(),
      status: 'pending'
    };

    setCollaborations(collaborations.map(c => 
      c.id === collabId 
        ? { ...c, applicants: [...c.applicants, applicant] }
        : c
    ));
    setApplicationMessage('');
    setSelectedCollaboration(null);
  };

  const handleCreateCollaboration = () => {
    const newCollab: Collaboration = {
      id: `collab${Date.now()}`,
      creatorId: user.id,
      creatorName: user.name,
      creatorAvatar: user.avatar,
      title: 'New Collaboration Opportunity',
      description: 'Description of the collaboration opportunity',
      category: 'Technology',
      type: 'project',
      requiredSkills: [],
      status: 'open',
      applicants: [],
      timestamp: Date.now()
    };

    setCollaborations([newCollab, ...collaborations]);
    setShowCreateModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return 'fa-rocket';
      case 'partnership': return 'fa-handshake';
      case 'mentorship': return 'fa-graduation-cap';
      case 'investment': return 'fa-chart-line';
      default: return 'fa-lightbulb';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Collaborate</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
        >
          <i className="fa-solid fa-plus mr-2"></i>Create Opportunity
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('browse'); setSelectedCollaboration(null); }}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'browse' ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-compass mr-2"></i>Browse
          {activeTab === 'browse' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]"></span>}
        </button>
        <button
          onClick={() => { setActiveTab('my-projects'); setSelectedCollaboration(null); }}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'my-projects' ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-folder mr-2"></i>My Projects
          {activeTab === 'my-projects' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]"></span>}
        </button>
        <button
          onClick={() => { setActiveTab('applications'); setSelectedCollaboration(null); }}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'applications' ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-file-alt mr-2"></i>Applications
          {activeTab === 'applications' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]"></span>}
        </button>
      </div>

      {/* Collaboration Detail View */}
      {selectedCollaboration ? (
        <div>
          <button
            onClick={() => setSelectedCollaboration(null)}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>Back to Opportunities
          </button>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={selectedCollaboration.creatorAvatar} className="w-12 h-12 rounded-full" alt="" />
                <div>
                  <h2 className="text-2xl font-bold">{selectedCollaboration.title}</h2>
                  <p className="text-gray-600">Posted by {selectedCollaboration.creatorName}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedCollaboration.status)}`}>
                {selectedCollaboration.status.charAt(0).toUpperCase() + selectedCollaboration.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <span className={`px-3 py-1 rounded-full bg-blue-100 text-blue-800`}>
                <i className={`fa-solid ${getTypeIcon(selectedCollaboration.type)} mr-1`}></i>
                {selectedCollaboration.type.charAt(0).toUpperCase() + selectedCollaboration.type.slice(1)}
              </span>
              <span><i className="fa-solid fa-tag mr-1"></i>{selectedCollaboration.category}</span>
              <span><i className="fa-solid fa-clock mr-1"></i>Posted {new Date(selectedCollaboration.timestamp).toLocaleDateString()}</span>
              {selectedCollaboration.deadline && (
                <span><i className="fa-solid fa-hourglass-half mr-1"></i>Deadline: {new Date(selectedCollaboration.deadline).toLocaleDateString()}</span>
              )}
              {selectedCollaboration.budget && (
                <span><i className="fa-solid fa-dollar-sign mr-1"></i>Budget: ${selectedCollaboration.budget.toLocaleString()}</span>
              )}
            </div>
            <p className="text-gray-700 mb-6">{selectedCollaboration.description}</p>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCollaboration.requiredSkills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Applicants ({selectedCollaboration.applicants.length})</h3>
              {selectedCollaboration.applicants.length > 0 ? (
                <div className="space-y-3">
                  {selectedCollaboration.applicants.map(applicant => (
                    <div key={applicant.userId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={applicant.userAvatar} className="w-10 h-10 rounded-full" alt="" />
                        <div>
                          <p className="font-semibold">{applicant.userName}</p>
                          <p className="text-sm text-gray-500">{new Date(applicant.timestamp).toLocaleString()}</p>
                        </div>
                        <span className={`ml-auto px-2 py-1 rounded text-xs ${
                          applicant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          applicant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700">{applicant.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No applicants yet</p>
              )}
            </div>
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Apply for this Opportunity</h3>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="Tell the creator why you're interested and what you can bring to this collaboration..."
                className="w-full px-3 py-2 border rounded-lg resize-none"
                rows={4}
              />
              <button
                onClick={() => handleApply(selectedCollaboration.id)}
                className="mt-4 px-6 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
              >
                <i className="fa-solid fa-paper-plane mr-2"></i>Submit Application
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Collaboration List View */
        <div>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
              />
              {isSearching && (
                <i className="fa-solid fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#1877F2] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 mb-6">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={`fa-solid ${getTypeIcon(type)} mr-2`}></i>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Collaborations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isSearching ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
                <p>Searching opportunities...</p>
              </div>
            ) : filteredCollaborations.length > 0 ? filteredCollaborations.map(collab => (
              <div
                key={collab.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCollaboration(collab)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(collab.status)}`}>
                    {collab.status.charAt(0).toUpperCase() + collab.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800`}>
                    <i className={`fa-solid ${getTypeIcon(collab.type)} mr-1`}></i>
                    {collab.type.charAt(0).toUpperCase() + collab.type.slice(1)}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{collab.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{collab.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <img src={collab.creatorAvatar} className="w-8 h-8 rounded-full" alt="" />
                  <span className="text-sm text-gray-600">{collab.creatorName}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {collab.requiredSkills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {collab.requiredSkills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      +{collab.requiredSkills.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span><i className="fa-solid fa-users mr-1"></i>{collab.applicants.length} applicants</span>
                  <span><i className="fa-solid fa-clock mr-1"></i>{new Date(collab.timestamp).toLocaleDateString()}</span>
                </div>
                {collab.budget && (
                  <div className="mt-2 text-lg font-bold text-[#1877F2]">
                    ${collab.budget.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <i className="fa-solid fa-search text-4xl mb-4"></i>
                <p>No opportunities found. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Collaboration Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Collaboration Opportunity</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Opportunity title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows={4} placeholder="Describe the opportunity" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Technology</option>
                    <option>Business</option>
                    <option>Education</option>
                    <option>Health</option>
                    <option>Creative</option>
                    <option>Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>project</option>
                    <option>partnership</option>
                    <option>mentorship</option>
                    <option>investment</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Required Skills (comma separated)</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="React, Python, Design" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Budget (optional)</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline (optional)</label>
                  <input type="date" className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateCollaboration}
                className="w-full px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
              >
                <i className="fa-solid fa-plus mr-2"></i>Create Opportunity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collaborate;
