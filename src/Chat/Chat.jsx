// Chat.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { UserContext } from '../UserContext';
import Logout from './Logout';
import ContactUs from './ContactUs';

function Chat() {
  const { username, setUsername, setId } = useContext(UserContext);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState(() => {
    try {
      const savedChats = localStorage.getItem('chatHistory');
      return savedChats ? JSON.parse(savedChats) : [];
    } catch (err) {
      console.error('Error parsing chat history from localStorage:', err);
      return [];
    }
  });
  const [currentTitle, setCurrentTitle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const chatEndRef = useRef(null);

  const uniqueTitles = Array.from(new Set(previousChats.map(chat => chat.title)));
  const currentChat = previousChats.filter(chat => chat.title === currentTitle);

  const createNewChat = () => {
    setMessage(null);
    setValue('');
    setCurrentTitle(null);
    setError(null);
    setShowWelcome(true);
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setError(null);
    setShowWelcome(false);
  };

  const getMessages = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    const options = {
      method: "POST",
      body: JSON.stringify({ message: value }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    };
    try {
      const res = await fetch('http://localhost:4050/completions', options);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error.message || 'API error');
      }
      const newMessage = data.choices && data.choices.length > 0 && data.choices[0].message
        ? data.choices[0].message
        : { role: 'assistant', content: 'No response' };
      if (!newMessage.content) {
        throw new Error('Assistant response is empty');
      }
      setMessage(newMessage);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err.message || 'Failed to get response from server');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && value.trim()) {
      getMessages();
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:4050/profile', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setUserProfile(data);
      setUsername(data.username);
      setId(data.userId);
    } catch (err) {
      console.error('Profile Fetch Error:', err);
      setError(err.message || 'Failed to fetch profile');
    }
  };

  const handleLogoutClick = () => {
    setShowPopup(true);
  };

  const confirmLogout = () => {
    fetch('http://localhost:4050/logout', { method: 'POST', credentials: 'include' })
      .then(res => res.json())
      .then(() => {
        setId(null);
        setUsername(null);
        setShowPopup(false);
      })
      .catch(err => console.error('Logout Error:', err));
  };

  const cancelLogout = () => {
    setShowPopup(false);
  };

  const openContactUs = () => {
    setShowContactUs(true);
  };

  const closeContactUs = () => {
    setShowContactUs(false);
  };

  const clearChatHistory = () => {
    setPreviousChats([]);
    setCurrentTitle(null);
    setMessage(null);
    setValue('');
    setShowWelcome(true);
    localStorage.removeItem('chatHistory');
  };

  useEffect(() => {
    fetchProfile();
  }, [setUsername, setId]);

  useEffect(() => {
    if (!currentTitle && value && message && message.content) {
      setCurrentTitle(value);
      setShowWelcome(false);
    }
    if (currentTitle && message && message.content) {
      const userMessage = { title: currentTitle, role: username, content: value };
      const assistantMessage = { title: currentTitle, role: message.role, content: message.content };
      setPreviousChats(prevChats => {
        const updatedChats = [...prevChats, userMessage, assistantMessage];
        try {
          localStorage.setItem('chatHistory', JSON.stringify(updatedChats));
        } catch (err) {
          console.error('Error saving chat history to localStorage:', err);
        }
        return updatedChats;
      });
      setValue('');
    }
  }, [message, currentTitle, username]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat]);

  return (
    <div className="flex h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0F2027, #203A43, #2C5364)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle Star Effect */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(100)].map((_, i) => (
          <span
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-br from-[#1C2E3D] via-[#2A4050] to-[#3A5570] bg-opacity-95 backdrop-blur-lg text-white flex flex-col z-10 border-r border-[#3A5570] shadow-lg">
        <div className="p-4 border-b border-[#3A5570]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-cyan-300">Chat Buddy</h2>
              <p className="text-xs text-gray-400">Welcome, {username || 'Guest'}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={createNewChat}
          className="mx-4 my-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {uniqueTitles.length > 0 ? (
            uniqueTitles.map((uniqueTitle, index) => (
              <div
                key={index}
                onClick={() => handleClick(uniqueTitle)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  currentTitle === uniqueTitle 
                    ? 'bg-[#2E3B4E] border border-cyan-400/30'
                    : 'bg-[#2E3B4E]/50 hover:bg-[#3B4A5E]/60'
                } shadow-sm`}
              >
                <p className="text-sm truncate">{uniqueTitle}</p>
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-400 text-sm text-center">No chats yet</div>
          )}
        </div>
        
        <div className="p-4 border-t border-[#3A5570] space-y-3">
          <Logout onLogoutClick={handleLogoutClick} />
          <button
            onClick={openContactUs}
            className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Contact Us
          </button>
          <button
            onClick={clearChatHistory}
            className="w-full py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear Chat History
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col z-0">
        <div className="flex-1 overflow-y-auto p-6">
          {!currentTitle && showWelcome ? (
            <div className="text-center text-white h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Hello, {username || 'Guest'}!
              </h1>
              <p className="text-gray-300 max-w-md">
                Start a new conversation with your AI companion. Ask anything!
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {currentChat.reduce((acc, chatMessage, index) => {
                if (index % 2 === 0) {
                  const userMessage = chatMessage;
                  const assistantMessage = currentChat[index + 1] || null;
                  return [
                    ...acc,
                    <li key={`user-${index}`} className="flex justify-end animate-fade-in">
                      <div className="max-w-3xl p-4 rounded-lg bg-gradient-to-r from-cyan-500/80 to-blue-500/80 text-white shadow-md">
                        <p className="font-semibold text-sm mb-1">You</p>
                        <p>{userMessage.content}</p>
                      </div>
                    </li>,
                    assistantMessage && (
                      <li key={`assistant-${index}`} className="flex justify-start animate-fade-in">
                        <div className="max-w-3xl p-4 rounded-lg bg-[#1A2634] text-gray-100 shadow-md">
                          <p className="font-semibold text-sm mb-1">Chat Buddy</p>
                          <p>{assistantMessage.content}</p>
                        </div>
                      </li>
                    ),
                  ].filter(Boolean);
                }
                return acc;
              }, [])}
              <div ref={chatEndRef} />
            </ul>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#2E3B4E]">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-600/80 text-white rounded-lg text-center shadow-md">
                {error}
              </div>
            )}
            
            <div className="flex items-center bg-[#1A2634] rounded-lg border border-[#2E3B4E] focus-within:ring-2 focus-within:ring-cyan-500/50 transition-all shadow-md">
              <input
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-4 bg-transparent text-white focus:outline-none placeholder-gray-500"
                placeholder="Type your message..."
                disabled={loading}
              />
              <button
                onClick={getMessages}
                className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-r-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </div>
            
            <p className="text-center text-gray-500 text-xs mt-3">
              Chat Buddy may produce inaccurate information. Please verify important facts.
            </p>
          </div>
        </div>
      </div>

      {/* Logout Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to leave?</h3>
              <p className="text-gray-300 mb-6">We'll miss you! Your chats will be saved for next time.</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmLogout}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={cancelLogout}
                  className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Popup */}
      <ContactUs isOpen={showContactUs} onClose={closeContactUs} />
    </div>
  );
}

export default Chat;