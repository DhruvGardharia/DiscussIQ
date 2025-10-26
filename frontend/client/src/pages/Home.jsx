// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { UserData } from '../context/UserContext';
// import { useNavigate } from 'react-router-dom';

// const Home = () => {
//   const { user, isAuth } = UserData();
//   const [discussions, setDiscussions] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!isAuth) return;
//     fetchDiscussions();
//   }, [isAuth]);

//   const fetchDiscussions = async () => {
//     try {
//       const { data } = await axios.get('/api/discussions');
//       setDiscussions(data);
//     } catch (err) {
//       console.error('fetch discussions failed', err);
//     }
//   };

//   const joinDiscussion = (id) => {
//     if (!id) return;
//     // navigate to chat and pass discussion id as query param
//     navigate(`/chat?discussionId=${id}`);
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Welcome{isAuth && user ? `, ${user.name}` : ''}</h1>

//       <div style={{ marginTop: 20 }}>
//         <h3>Available Discussions</h3>
//         {discussions.length === 0 ? (
//           <div>No discussions available.</div>
//         ) : (
//           <ul>
//             {discussions.map(d => (
//               <li key={d._id} style={{ marginBottom: 8 }}>
//                 <strong>{d.topic}</strong> — id: {d._id} — created by: {d.createdByName}
//                 <div style={{ marginTop: 6 }}>
//                   <button onClick={() => joinDiscussion(d._id)}>Join</button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserData } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, isAuth } = UserData();
  const [discussions, setDiscussions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) return;
    fetchDiscussions();
  }, [isAuth]);

  const fetchDiscussions = async () => {
    try {
      const { data } = await axios.get('/api/discussions');
      setDiscussions(data);
    } catch (err) {
      console.error('fetch discussions failed', err);
    }
  };

  const joinDiscussion = (id) => {
    if (!id) return;
    navigate(`/chat?discussionId=${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#C5D0E6] shadow-sm">
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-1.5 bg-[#C5D0E6]/40 text-[#1E40AF] text-xs font-semibold tracking-wider uppercase rounded-full">
              Academic Discussion Platform
            </div>
            <h1 
              className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-4 tracking-tight"
              style={{fontFamily: 'Outfit, sans-serif'}}
            >
              Welcome{isAuth && user ? (
                <span className="text-[#1E40AF]">, {user.name}</span>
              ) : ''}
            </h1>
            <p 
              className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed"
              style={{fontFamily: 'Inter, sans-serif'}}
            >
              Join intelligent discussions and collaborate with the academic community
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10 max-w-6xl">
        {/* Discussions Section */}
        <div className="bg-white rounded-2xl border border-[#C5D0E6] shadow-sm">
          {/* Section Header */}
          <div className="px-8 py-6 border-b border-[#C5D0E6]">
            <h2 
              className="text-2xl font-bold text-[#0F172A] flex items-center gap-3"
              style={{fontFamily: 'Outfit, sans-serif'}}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F172A] to-[#1E40AF] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              Available Discussions
            </h2>
          </div>

          {/* Discussions List */}
          <div className="px-8 py-8">
            {discussions.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F5F6FA] mb-4">
                  <svg className="w-10 h-10 text-[#C5D0E6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p 
                  className="text-gray-500 text-lg mb-2"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  No discussions available yet.
                </p>
                <p 
                  className="text-gray-400 text-sm"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  Check back soon for new conversations
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {discussions.map((d) => (
                  <div
                    key={d._id}
                    className="bg-[#F5F6FA] border border-[#C5D0E6] hover:border-[#1E40AF] rounded-xl p-6 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-[#0F172A] font-bold text-lg mb-3"
                          style={{fontFamily: 'Outfit, sans-serif'}}
                        >
                          {d.topic}
                        </h3>
                        <div 
                          className="flex flex-wrap gap-4 text-sm text-gray-600"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        >
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
                      <button
                        onClick={() => joinDiscussion(d._id)}
                        className="px-8 py-3 bg-gradient-to-r from-[#0F172A] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#0F172A] text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow whitespace-nowrap"
                        style={{fontFamily: 'Inter, sans-serif'}}
                      >
                        Join Discussion →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 text-center">
          <div 
            className="inline-flex items-center gap-3 px-5 py-3 bg-white border border-[#C5D0E6] rounded-xl shadow-sm"
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1E40AF]"></div>
              <span className="text-gray-600 font-medium">
                {discussions.length} active {discussions.length === 1 ? 'discussion' : 'discussions'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;