import { useState, useEffect, useRef } from 'react';
import './Chat.css';

function Chat({ socket, user, users, isConnected, setUser }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedUser]);

  // Load initial messages
  useEffect(() => {
    socket.emit('getMessages', user._id);
  }, [socket, user._id]);

  // Handle socket events
  useEffect(() => {
    const onMessageLoaded = (msgs) => setMessages(msgs);
    const onReceiveMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      setTyping(false);
    };
    const onMessageSent = (msg) => setMessages(prev => [...prev, msg]);
    const onMessagesUpdated = (msgs) => setMessages(msgs);

    socket.on('messagesLoaded', onMessageLoaded);
    socket.on('receiveMessage', onReceiveMessage);
    socket.on('messageSent', onMessageSent);
    socket.on('messagesUpdated', onMessagesUpdated);

    return () => {
      socket.off('messagesLoaded', onMessageLoaded);
      socket.off('receiveMessage', onReceiveMessage);
      socket.off('messageSent', onMessageSent);
      socket.off('messagesUpdated', onMessagesUpdated);
    };
  }, [socket]);

  // Mark messages as seen when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const userMessages = messages.filter(m => {
        const senderId = m.sender._id?.toString() || m.sender?.toString();
        const recipientId = m.recipient._id?.toString() || m.recipient?.toString();
        return senderId === selectedUser._id?.toString() && recipientId === user._id?.toString();
      });

      userMessages.forEach(m => {
        if (!m.seen) {
          socket.emit('markSeen', { messageId: m._id, userId: user._id });
        }
      });
    }
  }, [messages, selectedUser, socket, user._id]);

  // Filter users
  const filteredUsers = users.filter(u => {
    const uId = u._id?.toString() || u.$loki?.toString();
    const currentUserId = user._id?.toString() || user.$loki?.toString();
    return uId !== currentUserId;
  });

  // Calculate unread counts
  const unreadCounts = {};
  filteredUsers.forEach(u => {
    const uId = u._id?.toString() || u.$loki?.toString();
    unreadCounts[uId] = messages.filter(m => {
      const senderId = m.sender._id?.toString() || m.sender?.toString();
      const recipientId = m.recipient._id?.toString() || m.recipient?.toString();
      return senderId === uId && recipientId === user._id?.toString() && !m.seen;
    }).length;
  });

  // Filter conversation messages with selected user
  const conversationMessages = selectedUser ? messages.filter(m => {
    const senderId = m.sender._id?.toString() || m.sender?.toString();
    const recipientId = m.recipient._id?.toString() || m.recipient?.toString();
    const selectedUserId = selectedUser._id?.toString() || selectedUser.$loki?.toString();
    const currentUserId = user._id?.toString() || user.$loki?.toString();
    
    return (senderId === selectedUserId && recipientId === currentUserId) || 
           (senderId === currentUserId && recipientId === selectedUserId);
  }) : [];

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && selectedUser) {
      socket.emit('sendMessage', {
        senderId: user._id,
        recipientId: selectedUser._id,
        content: messageInput.trim()
      });
      setMessageInput('');
    }
  };

  // Delete user (admin only)
  const handleDeleteUser = async (targetUser) => {
    if (!user.isAdmin) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${targetUser.username}? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        const API_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';
        
        const response = await fetch(`${API_URL}/api/users/${targetUser._id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId: user._id })
        });
        
        if (response.ok) {
          alert('User deleted successfully!');
          setSelectedUser(null);
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete user');
      }
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  // Format time
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Group messages by date
  const groupedMessages = conversationMessages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  // Logout
  const handleLogout = () => {
    setUser(null);
    socket.disconnect();
    socket.connect();
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{user.username}</div>
              <div className="user-status">
                <span className={`online-dot ${isConnected ? 'online' : 'offline'}`}></span>
                {isConnected ? 'Online' : 'Offline'}
                {user.isAdmin && <span className="admin-badge">Admin</span>}
              </div>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
        <div className="sidebar-content">
          <h3 className="section-title">Users ({filteredUsers.length})</h3>
          <div className="user-list">
            {filteredUsers.map(u => {
              const uId = u._id?.toString() || u.$loki?.toString();
              const selectedUId = selectedUser?._id?.toString() || selectedUser?.$loki?.toString();
              
              return (
                <div
                  key={uId}
                  className={`user-item ${selectedUId === uId ? 'selected' : ''}`}
                >
                  <div
                    className="user-item-content"
                    onClick={() => setSelectedUser(u)}
                  >
                    <div className="user-avatar-small">{u.username.charAt(0).toUpperCase()}</div>
                    <div className="user-details">
                      <div className="user-name-small">
                        {u.username}
                        {u.isAdmin && <span className="admin-badge-small">Admin</span>}
                      </div>
                      <div className="user-status-small">
                        <span className={`online-dot-small ${u.online ? 'online' : 'offline'}`}></span>
                        {u.online ? 'Online' : 'Offline'}
                      </div>
                    </div>
                    {unreadCounts[uId] > 0 && (
                      <div className="unread-badge">{unreadCounts[uId]}</div>
                    )}
                  </div>
                  {user.isAdmin && (
                    <button
                      className="delete-user-button"
                      onClick={() => handleDeleteUser(u)}
                      title="Delete user"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2,0,0,1,-2,2H7a2,2,0,0,1,-2,-2V6m3,0V4a2,2,0,0,1,2,-2h4a2,2,0,0,1,2,2v2"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
            {filteredUsers.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">👋</div>
                <div className="empty-state-text">No other users yet</div>
                <div className="empty-state-subtext">Invite friends to join!</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="chat-main">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="user-avatar">{selectedUser.username.charAt(0).toUpperCase()}</div>
                <div className="user-details">
                  <div className="user-name">{selectedUser.username}</div>
                  <div className="user-status">
                    <span className={`online-dot ${selectedUser.online ? 'online' : 'offline'}`}></span>
                    {selectedUser.online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="chat-messages">
              {Object.keys(groupedMessages).length > 0 ? (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date} className="message-group">
                    <div className="date-divider">{date}</div>
                    {msgs.map((msg) => {
                      const senderId = msg.sender._id?.toString() || msg.sender?.toString();
                      const isSent = senderId === user._id?.toString();
                      
                      return (
                        <div key={msg._id?.toString() || msg.$loki?.toString()} className={`message ${isSent ? 'sent' : 'received'}`}>
                          <div className="message-bubble">
                            <div className="message-text">{msg.content}</div>
                            <div className="message-meta">
                              <span className="message-time">{formatTime(msg.createdAt)}</span>
                              {isSent && (
                                <span className="message-status">
                                  {msg.seen ? '✓✓ Seen' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <div className="empty-state-text">No messages yet</div>
                  <div className="empty-state-subtext">Send the first message!</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="chat-input">
              <form onSubmit={handleSendMessage} className="message-form">
                <input
                  type="text"
                  className="message-input"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button type="submit" className="send-button" disabled={!messageInput.trim()}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-conversation">
            <div className="welcome-icon">💬</div>
            <div className="welcome-title">Select a conversation</div>
            <div className="welcome-subtitle">Choose a user from the list to start chatting</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
