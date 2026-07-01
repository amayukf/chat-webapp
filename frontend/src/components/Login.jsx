import { useState } from 'react';
import './Login.css';

function Login({ socket, setUser, isConnected }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine API base URL based on environment
  const API_URL = import.meta.env.DEV 
    ? 'http://localhost:5000' 
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'register' 
        ? `${API_URL}/api/register` 
        : `${API_URL}/api/login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Register the user with Socket.IO
      socket.emit('register', data.user._id);
      
      socket.once('userList', () => {
        setUser(data.user);
        setIsLoading(false);
      });

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon-wrapper">
          <div className="login-icon">💬</div>
        </div>
        <h1>Chat App</h1>
        <p className="login-subtitle">Connect with friends instantly</p>
        
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="connection-dot"></span>
          {isConnected ? 'Connected to server' : 'Connecting...'}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!isConnected || isLoading}
            maxLength={20}
            autoFocus
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!isConnected || isLoading}
            minLength={6}
          />

          {mode === 'register' && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!isConnected || isLoading}
              minLength={6}
            />
          )}

          <button 
            type="submit" 
            disabled={!username.trim() || !password || !isConnected || isLoading || (mode === 'register' && password !== confirmPassword)}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                {mode === 'register' ? 'Create Account' : 'Login'}
                <span className="arrow">➤</span>
              </>
            )}
          </button>

          <div className="toggle-mode">
            {mode === 'login' ? (
              <span>
                New here?{' '}
                <button type="button" onClick={() => setMode('register')}>
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')}>
                  Login
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
