import React, { useState, useEffect } from 'react';

import { generateUsername, generateRoomId, generateRandomColor } from './Functions';

function ChatComponent({ socket, state, setState, chatRoom, setChatRoom }) {
  const { name, message, color } = state;

  const [chat, setChat] = useState([]);

  const [chatListElements, setChatListElements] = useState('');

  // Watch the socket to update chats
  useEffect(() => {
    socket.on('message', ({ name, message, color }) => {
      setChat((prevChats) => [...prevChats, { name, message, color }]);
    });
  }, []);

  // Update chatListElements when chat changes
  useEffect(() => {
    const all_chats = chat.map(({ name, message, color }, index) => (
      <div key={index} className={`chat-bubble ${name === state.name ? ' right' : ''}`}>
        <p className='username' style={{ color: `${color}` }}>
          {name}
        </p>
        <p className='message'>{message}</p>
      </div>
    ));

    setChatListElements(all_chats);

    setTimeout(() => {
      var element = document.getElementById('chat-list');
      element.scrollTop = element.scrollHeight;
    }, 50);
  }, [chat]);

  const onChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onMessageSubmit = (e) => {
    e.preventDefault();
    const nameText = name.trim();
    const messageText = message.trim();
    if (nameText.length > 0) {
      if (messageText.length > 0) {
        socket.emit('message', { name, message, color });
        setState({ ...state, message: '' });
      }
    } else {
      alert('Please enter a name !');
    }
  };

  return (
    <div className='chat-box-container'>
      <div className='chat-box'>
        <div className='chat-list-container'>
          <div className='heading'>
            <p>All chats</p>

            <div className='name-box'>
              <p className='name'>Public Chat Room</p>
              {/* <p className='name'>{name}</p> */}
            </div>
          </div>

          <div className='chat-list' id='chat-list'>
            {chatListElements}
          </div>
        </div>

        <div className='chat-form'>
          <form onSubmit={onMessageSubmit}>
            <input
              type='text'
              name='message'
              value={message}
              onChange={(e) => onChange(e)}
              placeholder='Type a message...'
            />
            <button type='submit'>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatComponent;
