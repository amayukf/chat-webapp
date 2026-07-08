import { useState, useEffect, useRef } from 'react';
import './Chat.css';

function Chat({ socket, user, users, isConnected, setUser }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const messagesEndRef = useRef(null);
  const API_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';

  // Safe user access helper for dicebear avatar
  const getAvatar = (u) => {
    if (u?.avatar) return u.avatar;
    const name = u?.username || 'Guest';
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${name}&backgroundColor=transparent`;
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedUser]);

  useEffect(() => {
    socket.emit('getMessages', user._id);
  }, [socket, user._id]);

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

  const filteredUsers = users.filter(u => {
    const uId = u._id?.toString();
    const currentUserId = user._id?.toString();
    return uId !== currentUserId;
  });

  const unreadCounts = {};
  filteredUsers.forEach(u => {
    const uId = u._id?.toString();
    unreadCounts[uId] = messages.filter(m => {
      const senderId = m.sender._id?.toString() || m.sender?.toString();
      const recipientId = m.recipient._id?.toString() || m.recipient?.toString();
      return senderId === uId && recipientId === user._id?.toString() && !m.seen;
    }).length;
  });

  const conversationMessages = selectedUser ? messages.filter(m => {
    const senderId = m.sender._id?.toString() || m.sender?.toString();
    const recipientId = m.recipient._id?.toString() || m.recipient?.toString();
    const selectedUserId = selectedUser._id?.toString();
    const currentUserId = user._id?.toString();
    
    return (senderId === selectedUserId && recipientId === currentUserId) || 
           (senderId === currentUserId && recipientId === selectedUserId);
  }) : [];

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

  const handleDeleteUser = async (targetUser) => {
    if (!user.isAdmin) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete ${targetUser.username}?`);
    if (confirmDelete) {
      try {
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
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setAvatarPreview(null);
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);
    // Create preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
    };
  };

  const handleUploadAvatar = () => {
    if (!selectedFile || !avatarPreview) return;
    setAvatarUploading(true);
    
    const img = new Image();
    img.src = avatarPreview;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 120;
      const MAX_HEIGHT = 120;
      
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > MAX_WIDTH) { height = Math.round((height *= MAX_WIDTH / width)); width = MAX_WIDTH; }
      } else {
        if (height > MAX_HEIGHT) { width = Math.round((width *= MAX_HEIGHT / height)); height = MAX_HEIGHT; }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const base64Avatar = canvas.toDataURL('image/jpeg', 0.8);
      
      try {
        const response = await fetch(`${API_URL}/api/avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, avatar: base64Avatar })
        });
        if (response.ok) {
          const data = await response.json();
          setUser({ ...user, avatar: data.avatar });
          setIsEditingAvatar(false);
          setSelectedFile(null);
          setAvatarPreview(null);
        }
      } catch (e) {
        console.error(e);
        alert('Failed to update avatar.');
      } finally {
        setAvatarUploading(false);
      }
    };
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    else if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    else return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const groupedMessages = conversationMessages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  const handleLogout = () => {
    setUser(null);
    socket.disconnect();
    socket.connect();
  };

  return (
    <div className="chat-container">
      {/* Background Decor */}
      <div className="chat-orb orb-left" />
      <div className="chat-orb orb-right" />

      {/* Sidebar */}
      <div className={`sidebar ${selectedUser ? 'hidden-mobile' : 'show-mobile'}`}>
        <div className="sidebar-header">
          <div className="user-info-row">
            <div className="user-identity">
              <div className="avatar-wrap">
                <img src={getAvatar(user)} alt={user.username} className="avatar large" />
                <span className={`status-indicator ${isConnected ? 'online' : 'offline'}`} />
              </div>
              <div className="user-details">
                <div className="user-name">
                  {user.username}
                  {user.isAdmin && <span className="admin-badge">Admin</span>}
                </div>
                <div className={`user-status-text ${isConnected ? 'online' : ''}`}>
                  {isConnected ? 'Connected' : 'Connecting...'}
                </div>
              </div>
            </div>
            
            <div className="header-actions">
              <button 
                className="icon-btn" 
                onClick={() => setIsEditingAvatar(!isEditingAvatar)} 
                title="Edit Avatar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
              <button className="icon-btn danger" onClick={handleLogout} title="Logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Edit Avatar Dropdown */}
          {isEditingAvatar && (
            <div className="avatar-edit-box">
              <p>Change Profile Picture</p>
              <div className="avatar-upload-area">
                <div className="avatar-preview-circle">
                  <img src={avatarPreview || getAvatar(user)} alt="Preview" className="avatar large" />
                </div>
                <div className="avatar-upload-controls">
                  <label className="custom-file-upload">
                    <input type="file" accept="image/*" onChange={handleFileSelect} disabled={avatarUploading} />
                    Choose File
                  </label>
                  {selectedFile && (
                    <button 
                      className="save-avatar-btn" 
                      onClick={handleUploadAvatar} 
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? 'Saving...' : 'Upload'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-content">
          <h3 className="section-title">Direct Messages ({filteredUsers.length})</h3>
          <div className="user-list">
            {filteredUsers.map(u => {
              const uId = u._id?.toString();
              const selectedUId = selectedUser?._id?.toString();
              return (
                <div key={uId} className={`user-item ${selectedUId === uId ? 'selected' : ''}`}>
                  <div className="user-item-content" onClick={() => setSelectedUser(u)}>
                    <div className="avatar-wrap">
                      <img src={getAvatar(u)} alt={u.username} className="avatar medium" />
                      <span className={`status-indicator ${u.online ? 'online' : 'offline'}`} />
                    </div>
                    <div className="user-details">
                      <div className="user-name-small">
                        {u.username}
                        {u.isAdmin && <span className="admin-badge">Admin</span>}
                      </div>
                      <div className="user-status-small">
                        {u.online ? 'Active now' : 'Offline'}
                      </div>
                    </div>
                    {unreadCounts[uId] > 0 && <div className="unread-badge">{unreadCounts[uId]}</div>}
                  </div>

                  {user.isAdmin && (
                    <button className="delete-user-button" onClick={() => handleDeleteUser(u)} title="Delete User">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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

      {/* Main Chat Area */}
      <div className={`chat-main ${selectedUser ? 'show-mobile' : 'hidden-mobile'}`}>
        {selectedUser ? (
          <>
            <div className="chat-header">
              <button className="back-button" onClick={() => setSelectedUser(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              
              <div className="chat-user-info">
                <div className="avatar-wrap">
                  <img src={getAvatar(selectedUser)} alt={selectedUser.username} className="avatar medium" />
                  <span className={`status-indicator ${selectedUser.online ? 'online' : 'offline'}`} />
                </div>
                <div className="user-details">
                  <div className="user-name">{selectedUser.username}</div>
                  <div className={`user-status-text ${selectedUser.online ? 'online' : ''}`}>
                    {selectedUser.online ? 'Online right now' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="chat-messages">
              {Object.keys(groupedMessages).length > 0 ? (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date} className="message-group">
                    <div className="date-divider">{date}</div>
                    {msgs.map((msg) => {
                      const isSent = (msg.sender._id?.toString() || msg.sender?.toString()) === user._id?.toString();
                      return (
                        <div key={msg._id?.toString()} className={`message ${isSent ? 'sent' : 'received'}`}>
                          <div className="message-bubble">
                            <div className="message-text">{msg.content}</div>
                            <div className="message-meta">
                              <span className="message-time">{formatTime(msg.createdAt)}</span>
                              {isSent && <span className="message-status">{msg.seen ? '✓✓' : '✓'}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{margin:'auto'}}>
                  <div className="welcome-icon">👋</div>
                  <div className="empty-state-text">Say Hello!</div>
                  <div className="empty-state-subtext">Send the first message to start the conversation</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="chat-input">
              <form onSubmit={handleSendMessage} className="message-form">
                <input
                  type="text"
                  className="message-input"
                  placeholder="Write a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button type="submit" className="send-button" disabled={!messageInput.trim()}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
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
            <div className="welcome-title">Your Messages</div>
            <div className="welcome-subtitle">Select a conversation to start chatting directly</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
