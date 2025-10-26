// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { io } from 'socket.io-client';
// import { UserData } from '../context/UserContext';

// const Chat = () => {
//   const [topic, setTopic] = useState('');
//   const [username, setUsername] = useState('guest_user');
//   const [text, setText] = useState('');
//   const [messages, setMessages] = useState([]);
//   const socketRef = useRef(null);
//   const { user, isAuth } = UserData();

//   const [discussionId, setDiscussionId] = useState('');

//   useEffect(() => {
//     // initialize socket connection (use Vite env or default to backend port 5005)
//     const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5005';
//     socketRef.current = io(backendUrl, {
//       transports: ['websocket', 'polling'],
//     });

//     const socket = socketRef.current;

//     socket.on('connect', () => {
//       console.log('socket connected', socket.id);
//       // Re-join room and fetch messages on reconnect
//       if (discussionId) {
//         socket.emit('join_discussion', discussionId);
//         fetchMessages(discussionId);
//       }
//     });

//     socket.on('receive_message', (message) => {
//       console.log('received message:', message);
//       setMessages((prev) => {
//         // Filter out any temporary version of this message
//         const filtered = message.replaces 
//           ? prev.filter(m => m._id !== message.replaces)
//           : prev;
//         return [...filtered, message];
//       });
//     });

//     // Clean up socket connection
//     return () => {
//       socket.disconnect();
//     };
//   }, [discussionId]); // Re-run when discussionId changes

//   // Auto-join if discussionId is provided in URL query params
//   useEffect(() => {
//     try {
//       const params = new URLSearchParams(window.location.search);
//       const qId = params.get('discussionId');
//       if (qId) {
//         setDiscussionId(qId);
//         // Immediately fetch messages and discussion details
//         fetchMessages(qId);
//         fetchDiscussion(qId);
        
//         // Join socket room if socket is connected
//         if (socketRef.current?.connected) {
//           socketRef.current.emit('join_discussion', qId);
//         }
//       }
//     } catch (err) {
//       console.error('auto-join parse failed', err);
//     }
//   }, []); // Run once on component mount

//   const addMessage = async () => {
//     if (!text.trim()) return;
    
//     const socket = socketRef.current;
//     if (discussionId && socket && socket.connected) {
//       try {
//         const userId = isAuth && user?._id ? user._id : null;
//         socket.emit('send_message', { 
//           discussionId, 
//           userId, 
//           text: text.trim(),
//           senderName: isAuth ? user.name : username // Include sender name
//         });
//         setText('');
//       } catch (err) {
//         console.error('Failed to send message:', err);
//         alert('Failed to send message. Please try again.');
//       }
//       return;
//     }

//     // Fallback for local testing only
//     const m = { user: username, text: text.trim() };
//     setMessages(prev => [...prev, m]);
//     setText('');
//   };

//   const evaluate = async () => {
//     if (!messages.length) return alert('Add some messages first');
//     setLoading(true);
//     try {
//       const payload = { topic, messages, session_id: 'local-test', discussion_id: discussionId };
//       const { data } = await axios.post('/api/discussions/evaluate', payload);
//       setResults(data);
//     } catch (err) {
//       console.error(err);
//       alert('Evaluation failed: ' + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMessages = async (id) => {
//     const discussionToFetch = id || discussionId;
//     if (!discussionToFetch) return;
//     try {
//       console.log('Fetching messages for discussion:', discussionToFetch);
//       const { data } = await axios.get(`/api/messages/${discussionToFetch}`);
//       setMessages(data);
//       console.log('Loaded messages:', data.length);
//     } catch (err) {
//       console.error('fetch messages failed', err);
//       alert('Failed to load messages. Please try refreshing the page.');
//     }
//   };

//   const fetchDiscussion = async (id) => {
//     const did = id || discussionId;
//     if (!did) return;
//     try {
//       const { data } = await axios.get(`/api/discussions/${did}`);
//       if (data && data.topic) setTopic(data.topic);
//     } catch (err) {
//       console.error('fetch discussion failed', err);
//     }
//   };

//   const fetchLeaderboard = async () => {
//     if (!discussionId) return;
//     try {
//       const { data } = await axios.get(`/api/discussions/${discussionId}/leaderboard`);
//       setResults({ leaderboard: data });
//     } catch (err) {
//       console.error('fetch leaderboard failed', err);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Discussion Chat (Test UI)</h2>
//       <div style={{ marginBottom: 10, padding: 10, background: '#f8f9fa', borderRadius: 4 }}>
//         <h3>Discussion Topic: {topic}</h3>
//       </div>

//       <div style={{ marginBottom: 10 }}>
//         <label>User: </label>
//         {isAuth && user ? <strong>{user.name} (logged in)</strong> : (
//           <input value={username} onChange={e => setUsername(e.target.value)} />
//         )}
//       </div>

//       <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
//         <input value={text} onChange={e => setText(e.target.value)} style={{ flex: 1 }} placeholder="Write a message" />
//         <button onClick={addMessage}>Add</button>
//       </div>

//       <div style={{ marginBottom: 12 }}>
//         <strong>Messages ({messages.length}):</strong>
//         <ul>
//           {messages.map((m, i) => {
//             const senderName = m.sender?.name || m.sender || m.user || (m.sender?._id ? m.sender._id : 'unknown');
//             return <li key={i}><strong>{senderName}:</strong> {m.text}</li>;
//           })}
//         </ul>
//       </div>

//       {/* Evaluation moved to admin panel */}
//     </div>
//   );
// };

// export default Chat;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { UserData } from '../context/UserContext';

const Chat = () => {
  const [topic, setTopic] = useState('');
  const [username, setUsername] = useState('guest_user');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { user, isAuth } = UserData();

  const [discussionId, setDiscussionId] = useState('');

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // initialize socket connection
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5005';
    socketRef.current = io(backendUrl, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('socket connected', socket.id);
      if (discussionId) {
        socket.emit('join_discussion', discussionId);
        fetchMessages(discussionId);
      }
    });

    socket.on('receive_message', (message) => {
      console.log('received message:', message);
      setMessages((prev) => {
        const filtered = message.replaces 
          ? prev.filter(m => m._id !== message.replaces)
          : prev;
        return [...filtered, message];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [discussionId]);

  // Auto-join if discussionId is provided in URL query params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get('discussionId');
      if (qId) {
        setDiscussionId(qId);
        fetchMessages(qId);
        fetchDiscussion(qId);
        
        if (socketRef.current?.connected) {
          socketRef.current.emit('join_discussion', qId);
        }
      }
    } catch (err) {
      console.error('auto-join parse failed', err);
    }
  }, []);

  const addMessage = async () => {
    if (!text.trim()) return;
    
    const socket = socketRef.current;
    if (discussionId && socket && socket.connected) {
      try {
        const userId = isAuth && user?._id ? user._id : null;
        socket.emit('send_message', { 
          discussionId, 
          userId, 
          text: text.trim(),
          senderName: isAuth ? user.name : username
        });
        setText('');
      } catch (err) {
        console.error('Failed to send message:', err);
        alert('Failed to send message. Please try again.');
      }
      return;
    }

    // Fallback for local testing only
    const m = { user: username, text: text.trim() };
    setMessages(prev => [...prev, m]);
    setText('');
  };

  const fetchMessages = async (id) => {
    const discussionToFetch = id || discussionId;
    if (!discussionToFetch) return;
    try {
      console.log('Fetching messages for discussion:', discussionToFetch);
      const { data } = await axios.get(`/api/messages/${discussionToFetch}`);
      setMessages(data);
      console.log('Loaded messages:', data.length);
    } catch (err) {
      console.error('fetch messages failed', err);
      alert('Failed to load messages. Please try refreshing the page.');
    }
  };

  const fetchDiscussion = async (id) => {
    const did = id || discussionId;
    if (!did) return;
    try {
      const { data } = await axios.get(`/api/discussions/${did}`);
      if (data && data.topic) setTopic(data.topic);
    } catch (err) {
      console.error('fetch discussion failed', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#C5D0E6] shadow-sm">
        <div className="container mx-auto px-6 py-6 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="inline-block mb-2 px-3 py-1 bg-[#C5D0E6]/40 text-[#1E40AF] text-xs font-semibold tracking-wider uppercase rounded-full">
                Live Discussion
              </div>
              <h1 
                className="text-3xl font-bold text-[#0F172A]"
                style={{fontFamily: 'Outfit, sans-serif'}}
              >
                {topic || 'Discussion Chat'}
              </h1>
            </div>
            
            {/* User Badge */}
            <div className="flex items-center gap-3 px-5 py-3 bg-[#F5F6FA] border border-[#C5D0E6] rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E40AF] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                {isAuth && user ? (
                  <>
                    <div 
                      className="text-[#0F172A] font-semibold text-sm"
                      style={{fontFamily: 'Inter, sans-serif'}}
                    >
                      {user.name}
                    </div>
                    <div className="text-[#1E40AF] text-xs font-medium">Authenticated</div>
                  </>
                ) : (
                  <input 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Your name"
                    className="w-32 px-2 py-1 bg-white border border-[#C5D0E6] rounded text-[#0F172A] text-sm focus:outline-none focus:border-[#1E40AF] focus:ring-1 focus:ring-[#1E40AF]/20"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="container mx-auto px-6 py-6 max-w-5xl">
        <div className="bg-white rounded-2xl border border-[#C5D0E6] shadow-sm overflow-hidden flex flex-col" style={{height: 'calc(100vh - 220px)'}}>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#F5F6FA] flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#C5D0E6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p 
                  className="text-gray-500 text-lg mb-2"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  No messages yet
                </p>
                <p 
                  className="text-gray-400 text-sm"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  Start the conversation by sending a message below
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => {
                  const senderName = m.sender?.name || m.sender || m.user || (m.sender?._id ? m.sender._id : 'unknown');
                  const isCurrentUser = isAuth ? senderName === user?.name : senderName === username;
                  
                  return (
                    <div 
                      key={i} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                        <div 
                          className="text-xs font-semibold mb-1 px-1"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        >
                          <span className={isCurrentUser ? 'text-[#1E40AF]' : 'text-gray-500'}>
                            {senderName}
                          </span>
                        </div>
                        <div 
                          className={`px-4 py-3 rounded-xl ${
                            isCurrentUser 
                              ? 'bg-gradient-to-r from-[#0F172A] to-[#1E40AF] text-white' 
                              : 'bg-[#F5F6FA] text-[#111827] border border-[#C5D0E6]'
                          }`}
                        >
                          <p 
                            className="text-sm leading-relaxed"
                            style={{fontFamily: 'Inter, sans-serif'}}
                          >
                            {m.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input Area */}
          <div className="border-t border-[#C5D0E6] px-6 py-4 bg-[#F5F6FA]">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Press Enter to send)"
                  rows="2"
                  className="w-full px-4 py-3 bg-white border border-[#C5D0E6] rounded-xl text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 transition-all resize-none"
                  style={{fontFamily: 'Inter, sans-serif'}}
                />
              </div>
              <button
                onClick={addMessage}
                disabled={!text.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#0F172A] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#0F172A] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {/* Message Count */}
            <div className="mt-3 text-center">
              <span 
                className="text-xs text-gray-500"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;