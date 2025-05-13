import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../UserContext';
import Logout from './Logout';

function Chat() {
  const { username } = useContext(UserContext);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const createNewChat = () => {
    console.log('Creating new chat...');
    setMessage(null);
    setValue('');
    setCurrentTitle(null);
    setPreviousChats([]);
    setError(null);
    setShowWelcome(true);
  };

  const handleClick = (uniqueTitle) => {
    console.log('Switching to chat:', uniqueTitle);
    setCurrentTitle(uniqueTitle);
    setError(null);
    setShowWelcome(false);
  };

  const getMessages = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    console.log('Sending message:', value);
    const options = {
      method: "POST",
      body: JSON.stringify({ message: value }),
      headers: { 'Content-Type': "application/json" },
    };
    try {
      const res = await fetch('http://localhost:4050/completions', options);
      const data = await res.json();
      console.log('API Response:', data);
      if (data.error) {
        throw new Error(data.error);
      }
      const newMessage = data.choices && data.choices.length > 0 && data.choices[0].message
        ? data.choices[0].message
        : { role: 'assistant', content: 'No response' };
      console.log('Setting message:', newMessage);
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

  useEffect(() => {
    console.log('useEffect triggered');
    console.log('Message:', message);
    console.log('Current Title:', currentTitle);
    console.log('Value:', value);
    if (!currentTitle && value && message && message.content) {
      console.log('Setting currentTitle to:', value);
      setCurrentTitle(value);
      setShowWelcome(false);
    }
    if (currentTitle && message && message.content) {
      console.log('Updating previousChats');
      const userMessage = { title: currentTitle, role: username, content: value };
      const assistantMessage = { title: currentTitle, role: message.role, content: message.content };
      setPreviousChats(prevChats => {
        const updatedChats = [...prevChats, userMessage, assistantMessage];
        console.log('Updated previousChats:', updatedChats);
        return updatedChats;
      });
      setValue(''); // Clear input after adding to chat
    }
  }, [message, currentTitle]);

  const currentChat = previousChats.filter(chat => chat.title === currentTitle);
  const uniqueTitles = Array.from(new Set(previousChats.map(chat => chat.title)));
  console.log('Current Chat:', currentChat);
  console.log('Unique Titles:', uniqueTitles);

  return (
    <div className="flex h-screen bg-blue-900">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-800 to-blue-800 text-white flex flex-col lg:w-64 md:w-48 sm:w-full sm:h-auto sm:bg-purple-800">
        <div className="p-4 border-b border-purple-600">
          <h2 className="text-xl font-semibold">Chat Buddy</h2>
          <p className="text-sm text-gray-200">Welcome, {username}</p>
        </div>
        <button
          onClick={createNewChat}
          className="mx-4 my-2 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-all sm:mx-2"
        >
          + New Chat
        </button>
        <ul className="flex-1 overflow-y-auto p-4 space-y-2 sm:p-2">
          {uniqueTitles.length > 0 ? (
            uniqueTitles.map((uniqueTitle, index) => (
              <li
                key={index}
                onClick={() => handleClick(uniqueTitle)}
                className={`p-3 rounded-lg cursor-pointer ${
                  currentTitle === uniqueTitle ? 'bg-purple-600' : 'bg-blue-700 hover:bg-blue-600'
                } transition-all sm:p-2 sm:text-sm`}
              >
                {uniqueTitle}
              </li>
            ))
          ) : (
            <li className="p-3 text-gray-400 sm:p-2 sm:text-sm">No chats yet</li>
          )}
        </ul>
        <div className="p-4 border-t border-purple-600 sm:p-2">
          <Logout />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-blue-800">
        <div className="flex-1 overflow-y-auto p-6 sm:p-4">
          {!currentTitle && showWelcome ? (
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4 sm:text-2xl">Hello, {username}!</h1>
              <p className="text-gray-200 sm:text-sm">Start a new conversation!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {currentChat.length > 0 ? (
                currentChat.map((chatMessage, index) => (
                  <li
                    key={index}
                    className={`flex ${
                      chatMessage.role === username ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-lg p-4 rounded-lg ${
                        chatMessage.role === username
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-gray-800'
                      } sm:p-3 sm:max-w-xs`}
                    >
                      <p className="font-semibold sm:text-sm">{chatMessage.role}</p>
                      <p className="sm:text-sm">{chatMessage.content}</p>
                    </div>
                  </li>
                ))
              ) : (
                <div className="text-center text-gray-200 sm:text-sm">
                  No messages in this chat yet.
                </div>
              )}
            </ul>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-purple-600 sm:p-2">
          <div className="flex items-center max-w-3xl mx-auto sm:max-w-full">
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-3 bg-blue-700 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 sm:p-2 sm:text-sm"
              placeholder="Type your message..."
              disabled={loading}
            />
            <button
              onClick={getMessages}
              className="p-3 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 disabled:bg-purple-400 transition-all sm:p-2"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 sm:h-4 sm:w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                '➢'
              )}
            </button>
          </div>
          {error && (
            <div className="mt-2 p-3 bg-red-600 text-white rounded-lg shadow-lg text-center">
              {error}
            </div>
          )}
          <p className="text-center text-gray-200 text-sm mt-2 sm:text-xs">
            Free Research Preview. Chat Buddy may produce inaccurate information. v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chat;