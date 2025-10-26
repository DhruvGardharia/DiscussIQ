// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { UserData } from '../context/UserContext';

// const Admin = () => {
//   const { user, isAuth } = UserData();
//   const [topic, setTopic] = useState('');
//   const [participants, setParticipants] = useState('');
//   const [discussions, setDiscussions] = useState([]);
//   const [selectedDiscussion, setSelectedDiscussion] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [results, setResults] = useState(null);

//   useEffect(() => { fetchDiscussions(); }, []);

//   const fetchDiscussions = async () => {
//     try {
//       const { data } = await axios.get('/api/discussions');
//       setDiscussions(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const createDiscussion = async () => {
//     if (!isAuth || user?.role !== 'admin') return alert('Only admin can create discussion');
//     try {
//       const payload = { topic, participants: participants ? participants.split(',').map(s => s.trim()) : [] };
//       const { data } = await axios.post('/api/discussions', payload);
//       alert('Discussion created');
//       setTopic(''); setParticipants('');
//       fetchDiscussions();
//     } catch (err) {
//       console.error(err);
//       alert('Create failed');
//     }
//   };

//   const viewDiscussion = async (discussion) => {
//     setSelectedDiscussion(discussion);
//     try {
//       const { data } = await axios.get(`/api/messages/${discussion._id}`);
//       setMessages(data);
//     } catch (err) {
//       console.error('fetch messages failed', err);
//     }
//   };

//   const evaluateDiscussion = async (discussion) => {
//     if (!messages.length) return alert('No messages to evaluate');
//     setLoading(true);
//     try {
//       const payload = {
//         topic: discussion.topic,
//         messages,
//         discussion_id: discussion._id,
//         session_id: discussion._id
//       };
//       const { data } = await axios.post('/api/discussions/evaluate', payload);
//       setResults(data);
//     } catch (err) {
//       console.error(err);
//       alert('Evaluation failed: ' + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchLeaderboard = async (discussion) => {
//     try {
//       const { data } = await axios.get(`/api/discussions/${discussion._id}/leaderboard`);
//       setResults({ leaderboard: data });
//     } catch (err) {
//       console.error('fetch leaderboard failed', err);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Admin Panel</h2>
//       <div>
//         <div><strong>Logged in as:</strong> {isAuth ? user?.name + ' (' + user?.role + ')' : 'Not logged in'}</div>
//       </div>

//       <div style={{ marginTop: 12 }}>
//         <h3>Create Discussion</h3>
//         <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic" style={{ width: '60%' }} />
//         <div style={{ marginTop: 6 }}>
//           <input value={participants} onChange={e => setParticipants(e.target.value)} placeholder="participant ids comma separated (optional)" style={{ width: '60%' }} />
//         </div>
//         <button style={{ marginTop: 8 }} onClick={createDiscussion}>Create</button>
//       </div>

//       <div style={{ marginTop: 20 }}>
//         <h3>Existing Discussions</h3>
//         <ul>
//           {discussions.map(d => (
//             <li key={d._id} style={{ marginBottom: 10 }}>
//               <strong>{d.topic}</strong> — id: {d._id} — created by: {d.createdByName}
//               <div style={{ marginTop: 6 }}>
//                 <button onClick={() => viewDiscussion(d)}>View Messages</button>
//                 <button style={{ marginLeft: 8 }} onClick={() => evaluateDiscussion(d)}>Evaluate</button>
//                 <button style={{ marginLeft: 8 }} onClick={() => viewResults(d)}>View Results</button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {selectedDiscussion && (
//         <div style={{ marginTop: 20 }}>
//           <h3>Messages for "{selectedDiscussion.topic}"</h3>
//           <ul>
//             {messages.map((m, i) => {
//               const senderName = m.sender?.name || m.sender || m.user || (m.sender?._id ? m.sender._id : 'unknown');
//               return <li key={i}><strong>{senderName}:</strong> {m.text}</li>;
//             })}
//           </ul>
//         </div>
//       )}

//       {loading && <div style={{ marginTop: 20 }}>Evaluating discussion...</div>}

//       {results && (
//         <div style={{ marginTop: 20 }}>
//           <h3>Evaluation Results</h3>
          
//           {/* Individual User Results */}
//           <div style={{ marginBottom: 20 }}>
//             <h4>Individual Performance</h4>
//             {Object.entries(results.results || {}).map(([user, data]) => (
//               <div key={user} style={{ background: '#f8f9fa', padding: 15, marginBottom: 10, borderRadius: 5 }}>
//                 <h5 style={{ marginTop: 0 }}>{user}</h5>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: 10 }}>
//                   <div><strong>Score:</strong> {data.score}</div>
//                   {Object.entries(data.metrics).map(([metric, value]) => (
//                     <div key={metric}>
//                       <strong>{metric.charAt(0).toUpperCase() + metric.slice(1)}:</strong> {Math.round(value * 100)}%
//                     </div>
//                   ))}
//                 </div>
//                 <div style={{ color: '#666' }}><strong>Feedback:</strong> {data.feedback}</div>
//                 {data.stats && (
//                   <div style={{ marginTop: 10, fontSize: '0.9em', color: '#666' }}>
//                     <div>Messages: {data.stats.message_count}</div>
//                     <div>Participation Rate: {data.stats.participation_rate}%</div>
//                     <div>Avg Message Length: {data.stats.avg_message_length} words</div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Leaderboard */}
//           {results.leaderboard && results.leaderboard.length > 0 && (
//             <div>
//               <h4>Leaderboard</h4>
//               <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 5 }}>
//                 {results.leaderboard.map((entry, index) => (
//                   <div 
//                     key={index}
//                     style={{
//                       padding: '8px',
//                       marginBottom: '5px',
//                       background: index < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][index] + '20' : 'transparent',
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       alignItems: 'center'
//                     }}
//                   >
//                     <div>
//                       <strong>{index + 1}. {entry.participant}</strong>
//                     </div>
//                     <div>
//                       Score: <strong>{entry.score}</strong>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Admin;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserData } from '../context/UserContext';

const Admin = () => {
  const { user, isAuth } = UserData();
  const [topic, setTopic] = useState('');
  const [participants, setParticipants] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => { fetchDiscussions(); }, []);

  const fetchDiscussions = async () => {
    try {
      const { data } = await axios.get('/api/discussions');
      setDiscussions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const createDiscussion = async () => {
    if (!isAuth || user?.role !== 'admin') return alert('Only admin can create discussion');
    try {
      const payload = { topic, participants: participants ? participants.split(',').map(s => s.trim()) : [] };
      const { data } = await axios.post('/api/discussions', payload);
      alert('Discussion created');
      setTopic(''); setParticipants('');
      fetchDiscussions();
    } catch (err) {
      console.error(err);
      alert('Create failed');
    }
  };

  const viewDiscussion = async (discussion) => {
    setSelectedDiscussion(discussion);
    try {
      const { data } = await axios.get(`/api/messages/${discussion._id}`);
      setMessages(data);
    } catch (err) {
      console.error('fetch messages failed', err);
    }
  };

  const evaluateDiscussion = async (discussion) => {
    if (!messages.length) return alert('No messages to evaluate');
    setLoading(true);
    try {
      const payload = {
        topic: discussion.topic,
        messages,
        discussion_id: discussion._id,
        session_id: discussion._id
      };
      const { data } = await axios.post('/api/discussions/evaluate', payload);
      setResults(data);
    } catch (err) {
      console.error(err);
      alert('Evaluation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const viewResults = (discussion) => {
    // Navigate to results page with discussion ID
    window.location.href = `/results?discussionId=${discussion._id}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#C5D0E6] shadow-sm">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="mb-4">
            <span className="inline-block px-4 py-1.5 bg-[#C5D0E6]/40 text-[#1E40AF] text-xs font-semibold tracking-wider uppercase rounded-full">
              Admin Control Center
            </span>
          </div>
          <h1 
            className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight"
            style={{fontFamily: 'Outfit, sans-serif'}}
          >
            Administration Panel
          </h1>
          
          {/* User Info */}
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-[#F5F6FA] border border-[#C5D0E6] rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E40AF] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="text-[#111827] font-semibold" style={{fontFamily: 'Inter, sans-serif'}}>
                {isAuth ? user?.name : 'Not logged in'}
              </div>
              {isAuth && user?.role && (
                <div className="text-[#1E40AF] text-xs font-medium uppercase tracking-wide">
                  {user.role}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Create Discussion Section */}
        <div className="mb-8 bg-white rounded-2xl border border-[#C5D0E6] shadow-sm">
          <div className="px-8 py-6 border-b border-[#C5D0E6]">
            <h2 
              className="text-2xl font-bold text-[#0F172A] flex items-center gap-3"
              style={{fontFamily: 'Outfit, sans-serif'}}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F172A] to-[#1E40AF] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              Create New Discussion
            </h2>
          </div>
          <div className="px-8 py-8 space-y-6">
            <div>
              <label 
                className="block text-[#0F172A] text-sm font-semibold mb-2 tracking-wide"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                Discussion Topic
              </label>
              <input 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                placeholder="Enter discussion topic..." 
                className="w-full px-4 py-3.5 bg-[#F5F6FA] border border-[#C5D0E6] rounded-xl text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 transition-all"
                style={{fontFamily: 'Inter, sans-serif'}}
              />
            </div>
            <div>
              <label 
                className="block text-[#0F172A] text-sm font-semibold mb-2 tracking-wide"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                Participant IDs <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input 
                value={participants} 
                onChange={e => setParticipants(e.target.value)} 
                placeholder="Comma-separated IDs (e.g., user1, user2, user3)" 
                className="w-full px-4 py-3.5 bg-[#F5F6FA] border border-[#C5D0E6] rounded-xl text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 transition-all"
                style={{fontFamily: 'Inter, sans-serif'}}
              />
            </div>
            <button 
              onClick={createDiscussion}
              className="px-8 py-3.5 bg-gradient-to-r from-[#0F172A] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#0F172A] text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              style={{fontFamily: 'Inter, sans-serif'}}
            >
              Create Discussion
            </button>
          </div>
        </div>

        {/* Existing Discussions */}
        <div className="mb-8 bg-white rounded-2xl border border-[#C5D0E6] shadow-sm">
          <div className="px-8 py-6 border-b border-[#C5D0E6]">
            <h2 
              className="text-2xl font-bold text-[#0F172A] flex items-center gap-3"
              style={{fontFamily: 'Outfit, sans-serif'}}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F172A] to-[#1E40AF] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              Existing Discussions
            </h2>
          </div>
          <div className="px-8 py-8">
            {discussions.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F5F6FA] mb-4">
                  <svg className="w-8 h-8 text-[#C5D0E6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>No discussions available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {discussions.map(d => (
                  <div 
                    key={d._id} 
                    className="bg-[#F5F6FA] border border-[#C5D0E6] hover:border-[#1E40AF] rounded-xl p-6 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="mb-4">
                      <h3 
                        className="text-[#0F172A] font-bold text-lg mb-2"
                        style={{fontFamily: 'Outfit, sans-serif'}}
                      >
                        {d.topic}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600" style={{fontFamily: 'Inter, sans-serif'}}>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-[#1E40AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-gray-500">ID:</span> {d._id}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-[#1E40AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-500">Created by:</span> {d.createdByName}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => viewDiscussion(d)}
                        className="px-5 py-2.5 bg-white border border-[#C5D0E6] hover:border-[#1E40AF] text-[#0F172A] font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                        style={{fontFamily: 'Inter, sans-serif'}}
                      >
                        View Messages
                      </button>
                      <button 
                        onClick={() => evaluateDiscussion(d)}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#0F172A] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#0F172A] text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                        style={{fontFamily: 'Inter, sans-serif'}}
                      >
                        Evaluate
                      </button>
                      <button 
                        onClick={() => fetchLeaderboard(d)}
                        className="px-5 py-2.5 bg-white border border-[#C5D0E6] hover:border-[#1E40AF] text-[#1E40AF] font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                        style={{fontFamily: 'Inter, sans-serif'}}
                      >
                        View Leaderboard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Section */}
        {selectedDiscussion && (
          <div className="mb-8 bg-white rounded-2xl border border-[#C5D0E6] shadow-sm">
            <div className="px-8 py-6 border-b border-[#C5D0E6]">
              <h3 
                className="text-xl font-bold text-[#0F172A]"
                style={{fontFamily: 'Outfit, sans-serif'}}
              >
                Messages for "{selectedDiscussion.topic}"
              </h3>
            </div>
            <div className="px-8 py-6 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>
                  No messages yet
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m, i) => {
                    const senderName = m.sender?.name || m.sender || m.user || (m.sender?._id ? m.sender._id : 'unknown');
                    return (
                      <div key={i} className="bg-[#F5F6FA] border border-[#C5D0E6] rounded-lg p-4">
                        <div className="text-[#1E40AF] font-semibold text-sm mb-2" style={{fontFamily: 'Inter, sans-serif'}}>
                          {senderName}
                        </div>
                        <div className="text-[#111827] leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-8 bg-white rounded-2xl border border-[#C5D0E6] shadow-sm p-10">
            <div className="flex items-center justify-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-[#1E40AF] rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="w-2.5 h-2.5 bg-[#1E40AF] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2.5 h-2.5 bg-[#1E40AF] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
              <span className="text-[#0F172A] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>
                Evaluating discussion...
              </span>
            </div>
          </div>
        )}

        {/* Evaluation Results */}
        {results && (
          <div className="bg-white rounded-2xl border border-[#C5D0E6] shadow-sm">
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
                Evaluation Results
              </h2>
            </div>
            
            <div className="px-8 py-8 space-y-8">
              {/* Individual Performance */}
              {results.results && Object.keys(results.results).length > 0 && (
                <div>
                  <h3 
                    className="text-xl font-bold text-[#0F172A] mb-6"
                    style={{fontFamily: 'Outfit, sans-serif'}}
                  >
                    Individual Performance
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(results.results).map(([user, data]) => (
                      <div 
                        key={user} 
                        className="bg-[#F5F6FA] border border-[#C5D0E6] rounded-xl p-6"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h4 
                            className="text-lg font-bold text-[#0F172A]"
                            style={{fontFamily: 'Outfit, sans-serif'}}
                          >
                            {user}
                          </h4>
                          <div className="px-6 py-3 bg-gradient-to-r from-[#0F172A] to-[#1E40AF] text-white font-bold rounded-lg text-xl shadow-sm">
                            {data.score}
                          </div>
                        </div>
                        
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {Object.entries(data.metrics).map(([metric, value]) => (
                            <div 
                              key={metric} 
                              className="bg-white border border-[#C5D0E6] rounded-lg p-4"
                            >
                              <div 
                                className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide"
                                style={{fontFamily: 'Inter, sans-serif'}}
                              >
                                {metric.charAt(0).toUpperCase() + metric.slice(1)}
                              </div>
                              <div 
                                className="text-[#1E40AF] font-bold text-2xl"
                                style={{fontFamily: 'Outfit, sans-serif'}}
                              >
                                {Math.round(value * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Feedback */}
                        <div className="bg-white border border-[#C5D0E6] rounded-lg p-5 mb-4">
                          <div 
                            className="text-[#0F172A] text-sm font-semibold mb-2 uppercase tracking-wide"
                            style={{fontFamily: 'Inter, sans-serif'}}
                          >
                            Feedback
                          </div>
                          <div 
                            className="text-[#111827] leading-relaxed"
                            style={{fontFamily: 'Inter, sans-serif'}}
                          >
                            {data.feedback}
                          </div>
                        </div>

                        {/* Stats */}
                        {data.stats && (
                          <div 
                            className="flex flex-wrap gap-6 text-sm text-gray-600"
                            style={{fontFamily: 'Inter, sans-serif'}}
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-semibold text-[#0F172A]">Messages:</span>
                              {data.stats.message_count}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="font-semibold text-[#0F172A]">Participation:</span>
                              {data.stats.participation_rate}%
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="font-semibold text-[#0F172A]">Avg Length:</span>
                              {data.stats.avg_message_length} words
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              {results.leaderboard && results.leaderboard.length > 0 && (
                <div>
                  <h3 
                    className="text-xl font-bold text-[#0F172A] mb-6"
                    style={{fontFamily: 'Outfit, sans-serif'}}
                  >
                    Leaderboard
                  </h3>
                  <div className="bg-[#F5F6FA] border border-[#C5D0E6] rounded-xl overflow-hidden">
                    {results.leaderboard.map((entry, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-5 border-b border-[#C5D0E6] last:border-b-0 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E40AF] text-white font-bold flex items-center justify-center"
                            style={{fontFamily: 'Outfit, sans-serif'}}
                          >
                            {index + 1}
                          </div>
                          <div 
                            className="text-[#0F172A] font-semibold text-lg"
                            style={{fontFamily: 'Outfit, sans-serif'}}
                          >
                            {entry.participant}
                          </div>
                        </div>
                        <div 
                          className="px-5 py-2 bg-[#C5D0E6]/40 text-[#1E40AF] font-bold rounded-lg"
                          style={{fontFamily: 'Outfit, sans-serif'}}
                        >
                          {entry.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;