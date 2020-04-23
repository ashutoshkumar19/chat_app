import React, { useState, useEffect } from 'react';

import { generateId } from './Functions';

const elementId = generateId(5);

function ChatComponent({ socket, userState, to_name, status }) {
  const { name, color } = userState;

  const [message, setMessage] = useState('');

  const [chat, setChat] = useState([]);

  const [chatListElements, setChatListElements] = useState('');

  // Watch the socket to update chats
  useEffect(() => {
    const temp_to_name = to_name;
    socket.on('sent_message', ({ to_name, name, message, color }) => {
      if (temp_to_name === to_name) {
        setChat((prevChats) => [...prevChats, { name, message, color }]);
      }
    });

    socket.on('received_message', ({ name, message, color }) => {
      if (name === to_name) {
        setChat((prevChats) => [...prevChats, { name, message, color }]);
      }
    });
  }, []);

  // Update chatListElements when chat changes
  useEffect(() => {
    console.log(chat);

    const all_chats = chat.map(({ name, message, color }, index) => (
      <div
        key={index}
        className={`chat-bubble ${name === userState.name ? ' right' : ''}`}
      >
        <p className='username' style={{ color: `${color}` }}>
          {name}
        </p>
        <p className='message'>{message}</p>
      </div>
    ));

    setChatListElements(all_chats);

    setTimeout(() => {
      var element = document.getElementById('chat-list-' + elementId);
      element.scrollTop = element.scrollHeight;
    }, 50);
  }, [chat]);

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  const onMessageSubmit = (e) => {
    e.preventDefault();
    const nameText = name.trim();
    const messageText = message.trim();
    if (nameText.length > 0) {
      if (messageText.length > 0) {
        socket.emit('private_message', { to_name, name, message, color });
        setMessage('');
      }
    } else {
      alert('Please enter a name !');
    }
  };

  return (
    <div
      className='chat-box-container'
      style={status === 0 ? { visibility: 'hidden' } : { visibility: 'visible' }}
    >
      <div className='chat-box'>
        <div className='chat-list-container'>
          <div className='heading'>
            <p>{to_name}</p>

            <div className='name-box'>
              {/* <p className='name'>Public Chat Room</p> */}
              {/* <p className='name'>{name}</p> */}
            </div>
          </div>

          <div className='chat-list' id={`chat-list-` + elementId}>
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
