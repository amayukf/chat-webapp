import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';

// Determine the socket URL based on environment
const socketUrl = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : window.location.origin;

const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
});

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('chat_app_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Persist user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('chat_app_user', JSON.stringify(user));
      if (socket.connected) {
        socket.emit('register', user._id);
      }
    } else {
      localStorage.removeItem('chat_app_user');
    }
  }, [user]);

  useEffect(() => {
    const onConnect = () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
      // Automatically register the user if they were saved in localStorage
      if (user) {
        socket.emit('register', user._id);
      }
    };
    
    const onDisconnect = () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    };
    
    const onUserList = (usersList) => {
      console.log('📋 Received user list:', usersList);
      setUsers(usersList);
    };

    // Attach event listeners first
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('userList', onUserList);

    // Then connect if not already connected
    if (!socket.connected) {
      console.log('🔄 Attempting to connect...');
      socket.connect();
    } else if (user) {
      // If already connected on mount, ensure registered
      socket.emit('register', user._id);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('userList', onUserList);
    };
  }, [user]);

  return (
    <div className="app">
      {user ? (
        <Chat socket={socket} user={user} users={users} isConnected={isConnected} setUser={setUser} />
      ) : (
        <Login socket={socket} setUser={setUser} isConnected={isConnected} />
      )}
    </div>
  );
}

export default App;
