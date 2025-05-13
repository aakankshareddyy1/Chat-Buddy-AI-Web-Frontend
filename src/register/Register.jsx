import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../UserContext';
import axios from 'axios';

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
    if (!validateForm()) return;

    const url = isLoginOrRegister === 'register' ? '/register' : '/login';
    try {
      const payload = isLoginOrRegister === 'register' 
        ? { username, email, password, confirmPassword }
        : { username, password };
      const { data } = await axios.post(url, payload);
      if (data.message) {
        showPopup(data.message, data.error ? 'error' : 'success');
      }
      if (isLoginOrRegister === 'register' && !data.error) {
        setIsLoginOrRegister('login');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else if (!data.error) {
        setLoggedInUsername(username);
        setId(data.id);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "An error occurred";
      showPopup(errorMsg, 'error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      {popup && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${popup.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {popup.message}
        </div>
      )}
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Chat Buddy</h2>
          <p className="text-gray-300">{isLoginOrRegister === 'register' ? 'Create an Account' : 'Welcome Back'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              className="w-full px-4 py-3 bg-blue-800 bg-opacity-50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
              placeholder="Username"
            />
            {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
          </div>

          {isLoginOrRegister === 'register' && (
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="w-full px-4 py-3 bg-blue-800 bg-opacity-50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
                placeholder="Email"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>
          )}

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="w-full px-4 py-3 bg-blue-800 bg-opacity-50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
              placeholder="Password"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          {isLoginOrRegister === 'register' && (
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(ev) => setConfirmPassword(ev.target.value)}
                className="w-full px-4 py-3 bg-blue-800 bg-opacity-50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
                placeholder="Confirm Password"
              />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 font-semibold"
          >
            {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-300">
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