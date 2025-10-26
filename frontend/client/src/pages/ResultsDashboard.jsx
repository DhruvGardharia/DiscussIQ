import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ResultsDashboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [discussionInfo, setDiscussionInfo] = useState(null);
  
  // Get discussionId from URL
  const discussionId = new URLSearchParams(window.location.search).get('discussionId');

  useEffect(() => {
    const fetchScores = async () => {
      if (!discussionId) {
        console.error('No discussion ID provided');
        return;
      }
      
      setLoading(true);
      try {
        const url = `/api/discussions/${discussionId}/leaderboard`;
        const { data } = await axios.get(url);
        
        // Extract scores and discussion info
        setScores(data.scores || []);
        setDiscussionInfo(data.discussion || null);
        
        console.log('Fetched leaderboard data:', data); // Debug log
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        alert('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [discussionId]);

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#C5D0E6] shadow-sm">
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          <div className="inline-block mb-4 px-4 py-1.5 bg-[#C5D0E6]/40 text-[#1E40AF] text-xs font-semibold tracking-wider uppercase rounded-full">
            Performance Analytics
          </div>
          <h1 
            className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-2 tracking-tight"
            style={{fontFamily: 'Outfit, sans-serif'}}
          >
            Results Dashboard
          </h1>
          <p 
            className="text-gray-600 text-lg"
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            {discussionId ? 'Discussion-specific leaderboard' : 'Overall participant rankings'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10 max-w-5xl">
        <div className="bg-white rounded-2xl border border-[#C5D0E6] shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="px-8 py-6 border-b border-[#C5D0E6]">
            <h2 
              className="text-2xl font-bold text-[#0F172A] flex items-center gap-3"
              style={{fontFamily: 'Outfit, sans-serif'}}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F172A] to-[#1E40AF] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Leaderboard
            </h2>
          </div>

          {/* Content Area */}
          <div className="px-8 py-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 bg-[#1E40AF] rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-3 h-3 bg-[#1E40AF] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-[#1E40AF] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span 
                  className="text-[#0F172A] font-medium"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  Loading results...
                </span>
              </div>
            ) : !discussionId ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F5F6FA] mb-4">
                  <svg className="w-10 h-10 text-[#C5D0E6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p 
                  className="text-gray-500 text-lg mb-2"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  No discussion selected
                </p>
                <p 
                  className="text-gray-400 text-sm"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  Please select a discussion from the admin panel
                </p>
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F5F6FA] mb-4">
                  <svg className="w-10 h-10 text-[#C5D0E6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p 
                  className="text-gray-500 text-lg mb-2"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  No scores available for this discussion
                </p>
                <p 
                  className="text-gray-400 text-sm"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  The discussion needs to be evaluated first
                </p>
                <button 
                  onClick={() => window.location.href = '/admin'} 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Admin Panel
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((s, i) => {
                  const isTopThree = i < 3;
                  const rankColors = [
                    'from-yellow-50 to-yellow-100 border-yellow-300',
                    'from-gray-50 to-gray-100 border-gray-300',
                    'from-orange-50 to-orange-100 border-orange-300'
                  ];
                  
                  return (
                    <div 
                      key={i}
                      className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                        isTopThree 
                          ? `bg-gradient-to-r ${rankColors[i]}` 
                          : 'bg-[#F5F6FA] border-[#C5D0E6] hover:border-[#1E40AF]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Badge */}
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            isTopThree
                              ? 'bg-gradient-to-br from-[#0F172A] to-[#1E40AF] text-white shadow-lg'
                              : 'bg-white border-2 border-[#C5D0E6] text-[#0F172A]'
                          }`}
                          style={{fontFamily: 'Outfit, sans-serif'}}
                        >
                          {i + 1}
                        </div>
                        
                        {/* Participant Info */}
                        <div>
                          <h3 
                            className="text-[#0F172A] font-bold text-lg"
                            style={{fontFamily: 'Outfit, sans-serif'}}
                          >
                            {s.participantName || s.participant}
                          </h3>
                          {isTopThree && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-2xl">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                              </span>
                              <span 
                                className="text-xs font-semibold text-gray-600"
                                style={{fontFamily: 'Inter, sans-serif'}}
                              >
                                {i === 0 ? 'First Place' : i === 1 ? 'Second Place' : 'Third Place'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Score Display */}
                      <div className="text-right flex items-end flex-col">
                        <div 
                          className="text-3xl font-black text-[#0F172A] mb-1"
                          style={{fontFamily: 'Outfit, sans-serif'}}
                        >
                          {s.totalScore}
                        </div>
                        <div 
                          className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        >
                          Total Score
                        </div>
                        {/* Score Breakdown */}
                        {s.scores && (
                          <div className="flex gap-3 text-xs">
                            {Object.entries(s.scores).map(([key, value]) => (
                              <div key={key} className="text-center">
                                <div className="font-bold text-[#1E40AF]">{value}</div>
                                <div className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {scores.length > 0 && (
            <div className="px-8 py-6 bg-[#F5F6FA] border-t border-[#C5D0E6]">
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold text-[#0F172A] mb-1"
                    style={{fontFamily: 'Outfit, sans-serif'}}
                  >
                    {scores.length}
                  </div>
                  <div 
                    className="text-gray-600 font-medium"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  >
                    Total Participants
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold text-[#1E40AF] mb-1"
                    style={{fontFamily: 'Outfit, sans-serif'}}
                  >
                    {Math.max(...scores.map(s => s.totalScore || 0))}
                  </div>
                  <div 
                    className="text-gray-600 font-medium"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  >
                    Highest Score
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold text-[#0F172A] mb-1"
                    style={{fontFamily: 'Outfit, sans-serif'}}
                  >
                    {Math.round(scores.reduce((acc, s) => acc + (s.totalScore || 0), 0) / scores.length)}
                  </div>
                  <div 
                    className="text-gray-600 font-medium"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  >
                    Average Score
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;