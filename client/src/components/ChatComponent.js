import React, { useState, useEffect } from 'react';

import { generateUserId } from './Functions';

// const elementId = generateUserId(5);

function ChatComponent({ socket, userState, chatBoxItem }) {
  const { userId, name, color } = userState;

  const to_userId = chatBoxItem.id;
  const to_name = chatBoxItem.name;
  const status = chatBoxItem.status;

  const [message, setMessage] = useState('');

  const [chat, setChat] = useState([]);

  const [chatListElements, setChatListElements] = useState('');

  const [isConnected, setIsConnected] = useState(false);

  const [typingStatus, setTypingStatus] = useState('');

  // Watch the socket to update chats and get notified
  useEffect(() => {
    socket.on('sent_message', (sent_to_userId, from_name, from_color, message) => {
      if (sent_to_userId === to_userId) {
        setChat((prevChats) => [
          ...prevChats,
          { userId: userId, name: from_name, color: from_color, message: message },
        ]);
      }
    });

    socket.on(
      'received_message',
      (received_from_userId, received_from_name, received_from_color, message) => {
        if (received_from_userId === to_userId) {
          setChat((prevChats) => [
            ...prevChats,
            {
              userId: received_from_userId,
              name: received_from_name,
              color: received_from_color,
              message: message,
            },
          ]);
        }
      }
    );

    socket.on('join_notify', (from_userId, from_name) => {
      if (from_userId === to_userId) {
        console.log(`${from_name} (${from_userId}) joined the chat`);
        setIsConnected(true);
        socket.emit('join_notify_acknowledge', to_userId);
      }
    });
    socket.on('join_notify_acknowledge', (from_userId, from_name) => {
      if (from_userId === to_userId) {
        console.log(`${from_name} (${from_userId}) joined the chat`);
        setIsConnected(true);
      }
    });
    socket.on('leave_notify', (from_userId, from_name) => {
      if (from_userId === to_userId) {
        console.log(`${from_name} (${from_userId}) left the chat`);
        setIsConnected(false);
      }
    });
    socket.on('typing_notify', (from_userId) => {
      if (from_userId === to_userId) {
        setTypingStatus('typing...');
      }
    });
    socket.on('typing_stopped_notify', (from_userId) => {
      if (from_userId === to_userId) {
        setTypingStatus('');
      }
    });
  }, []);

  // Notify others if user join or left the chat
  useEffect(() => {
    if (status === 1) {
      document.getElementById(`message-input-` + to_userId).focus();
      socket.emit('join_notify', to_userId);
    } else {
      socket.emit('leave_notify', to_userId);
    }
  }, [status]);

  // Update chatListElements when chat changes
  useEffect(() => {
    const all_chats = chat.map(({ userId, name, color, message }, index) => (
      <div
        key={index}
        className={`chat-bubble ${userId === userState.userId ? ' right' : ''}`}
      >
        <p className='name' style={{ color: `${color}` }}>
          {name.length > 0 ? name : userId}
        </p>
        <p className='message'>{message}</p>
      </div>
    ));
    setChatListElements(all_chats);
  }, [chat]);

  useEffect(() => {
    var element = document.getElementById('chat-list-' + to_userId);
    element.scrollTop = element.scrollHeight;
  }, [chatListElements]);

  // Notify  when user is typing
  useEffect(() => {
    document
      .getElementById(`message-input-${to_userId}`)
      .addEventListener('keydown', typingNotify);
    return () => {
      document
        .getElementById(`message-input-${to_userId}`)
        .removeEventListener('keydown', typingNotify);
    };
  }, []);

  let timer = null;
  const typingNotify = () => {
    socket.emit('typing_notify', to_userId);
    clearTimeout(timer);
    timer = setTimeout(() => {
      socket.emit('typing_stopped_notify', to_userId);
    }, 1000);
  };

  // onChange
  const onChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle message submit
  const onMessageSubmit = (e) => {
    e.preventDefault();
    const messageText = message.trim();
    if (messageText.length > 0) {
      socket.emit('private_message', to_userId, message);
      setMessage('');
    }
    document.getElementById('message-input-' + to_userId).focus();
  };

  return (
    <div
      className='chat-box-container'
      id={`chat-box-container-${to_userId}`}
      style={status === 0 ? { display: 'none' } : { display: 'block' }}
    >
      <div className='chat-box'>
        <div className='chat-list-container'>
          <div className='heading'>
            <p>{to_name}</p>
            <p>{typingStatus}</p>

            <div className='details-box'>
              {isConnected ? (
                <p className='joined'>Joined</p>
              ) : (
                <p className='left'>Left</p>
              )}
            </div>
          </div>

          <div className='chat-list' id={`chat-list-` + to_userId}>
            {chatListElements}
          </div>
        </div>

        <div className='chat-form'>
          <form onSubmit={onMessageSubmit}>
            <input
              id={`message-input-` + to_userId}
              type='text'
              name='message'
              value={message}
              onChange={(e) => onChange(e)}
              placeholder='Type a message...'
              autoComplete='off'
              autoFocus
            />
            <button type='submit'>
              <span className='material-icons'>send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatComponent;
