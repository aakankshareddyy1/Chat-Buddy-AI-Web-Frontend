import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../UserContext';
import axios from 'axios';
import image from '../assets/login.jpg';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState(null);

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  const validateForm = () => {
    const newErrors = {};
    if (!username || username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9]+$/.test(username)) {
      newErrors.username = "Username must be 3-20 characters long and alphanumeric";
    }
    if (isLoginOrRegister === 'register') {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Invalid email address";
      }
      if (!password || password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        newErrors.password = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else {
      if (!password) {
        newErrors.password = "Password is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showPopup = (message, type) => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 3000);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) {
      const errorMessage = Object.values(errors)[0] || "Validation failed";
      showPopup(errorMessage, 'error');
      return;
    }

    const url = isLoginOrRegister === 'register' ? '/register' : '/login';
    try {
      const payload = isLoginOrRegister === 'register'
        ? { username, email, password, confirmPassword }
        : { username, password };
      const { data } = await axios.post(`http://localhost:4050${url}`, payload, { withCredentials: true });
      
      // Show server message if present
      if (data.message) {
        showPopup(data.message, data.error ? 'error' : 'success');
      }

      // Handle registration success
      if (isLoginOrRegister === 'register' && !data.error) {
        showPopup("Registration Successful! Please login to continue.", 'success');
        setTimeout(() => {
          setIsLoginOrRegister('login');
          setUsername('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }, 3000); // Delay form reset to allow popup to be seen
      } else if (!data.error) {
        // Handle login success
        setLoggedInUsername(username);
        setId(data.id);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "An error occurred";
      showPopup(errorMsg, 'error');
    }
  }

  return (
    <div
      className="min-h-screen flex justify-start items-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Animated Dots Spreading Right Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-teal-400 opacity-30"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${-10 + Math.random() * 20}%`, // Start slightly off-screen left
              animation: `spreadRight ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Welcome Chat Buddy with Earlier Animated Design */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-ping"></div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Welcome Chat Buddy
            </h1>
          </div>
        </div>
      </div>

      {/* Popup for Errors, Success Messages, and Registration Success */}
      {popup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {popup.type === 'success' ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{popup.type === 'success' ? 'Success' : 'Error'}</h3>
              <p className="text-gray-300 mb-6">{popup.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Container on Left Side */}
      <div className="bg-transparent backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <p className="text-white mb-6">
          {isLoginOrRegister === 'register' ? 'Create an Account' : 'Welcome Back'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-gray-200 text-sm mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
              placeholder="Username"
            />
          </div>

          {isLoginOrRegister === 'register' && (
            <div className="relative">
              <label className="block text-gray-200 text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
                placeholder="Email"
              />
            </div>
          )}

          <div className="relative">
            <label className="block text-gray-200 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
              placeholder="Password"
            />
          </div>

          {isLoginOrRegister === 'register' && (
            <div className="relative">
              <label className="block text-gray-200 text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(ev) => setConfirmPassword(ev.target.value)}
                className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
                placeholder="Confirm Password"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 font-semibold"
          >
            {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-400">
          {isLoginOrRegister === 'register' ? (
            <p>
              Already a member?{' '}
              <button
                onClick={() => setIsLoginOrRegister('login')}
                className="text-purple-400 hover:underline"
              >
                Login Here
              </button>
            </p>
          ) : (
            <p>
              Don’t have an account?{' '}
              <button
                onClick={() => setIsLoginOrRegister('register')}
                className="text-purple-400 hover:underline"
              >
                Register
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;

<style jsx global>{`
  @keyframes spreadRight {
    0% {
      transform: translateX(-20px); /* Start off-screen left */
    }
    100% {
      transform: translateX(120%); /* Move off-screen right */
    }
  }
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes fade-out-down {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(20px);
    }
  }
  @keyframes scale-in {
    from {
      transform: scale(0.9);
    }
    to {
      transform: scale(1);
    }
  }
  .animate-fade-in {
    animation: fade-in-up 0.3s ease-out forwards;
  }
  .animate-fade-out {
    animation: fade-out-down 0.3s ease-out forwards;
  }
  .animate-scale-in {
    animation: scale-in 0.3s ease-out forwards;
  }
`}</style>