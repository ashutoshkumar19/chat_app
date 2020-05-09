import React, { useState, useEffect } from 'react';

import { generateUserId } from './Functions';
import UserListModal from './UserListModal.component';

const elementId = generateUserId(5);

function ChatRoomComponent({
  socket,
  userState,
  chatBoxItem,
  currentRoom,
  setRoomList,
  setChatBoxList,
}) {
  const roomId = currentRoom.roomId;
  const roomName = chatBoxItem.name;
  const status = chatBoxItem.status;

  const [message, setMessage] = useState('');

  const [chat, setChat] = useState([]);

  const [chatListElements, setChatListElements] = useState('');

  const [open, setOpen] = useState(false);

  // Watch the socket to update chats and get notified
  useEffect(() => {
    socket.on(
      'room_message',
      (from_roomId, from_userId, from_name, from_color, message) => {
        if (from_roomId === roomId) {
          setChats('message', from_userId, from_name, from_color, message);
        }
      }
    );

    socket.on('join_room_notify', (from_roomId, from_userId, from_name, notify_text) => {
      if (from_roomId === roomId && from_userId !== userState.userId) {
        setChats('notification', from_userId, from_name, '#00b518', notify_text);
        // socket.emit('join_room_notify_acknowledge', roomId, 'joined the chat');
      }
    });
    socket.on(
      'join_room_notify_acknowledge',
      (from_roomId, from_userId, from_name, notify_text) => {
        if (from_roomId === roomId && from_userId !== userState.userId) {
          setChats('notification', from_userId, from_name, '#00b518', notify_text);
        }
      }
    );
    socket.on('leave_room_notify', (from_roomId, from_userId, from_name, notify_text) => {
      if (from_roomId === roomId && from_userId !== userState.userId) {
        setChats('notification', from_userId, from_name, '#e00000', notify_text);
      }
    });

    socket.on('room_closed', (closedRoomId) => {
      try {
        setChatBoxList((prevList) => {
          let tempList = prevList;
          tempList = tempList.filter((item) => item.id !== closedRoomId);
          return tempList;
        });
        setRoomList((prevList) => {
          let tempList = prevList;
          tempList = tempList.filter((roomItem) => roomItem.roomId !== closedRoomId);
          return tempList;
        });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('left_room', (from_roomId, leftUserId) => {
      try {
        if (leftUserId === userState.userId) {
          setChatBoxList((prevList) => {
            let tempList = prevList;
            tempList = tempList.filter((item) => item.id !== from_roomId);
            return tempList;
          });
          setRoomList((prevList) => {
            let tempList = prevList;
            tempList = tempList.filter((roomItem) => roomItem.roomId !== from_roomId);
            return tempList;
          });
        } else {
          setRoomList((prevList) => {
            let tempList = prevList;
            var roomIndex = tempList.findIndex(
              (roomItem) => roomItem.roomId === from_roomId
            );
            let temp = tempList[roomIndex].participants.filter(
              (participant) => participant.userId !== leftUserId
            );
            tempList[roomIndex].participants = temp;
            return tempList;
          });
          setOpen((prevState) => !prevState);
          setOpen((prevState) => !prevState);
        }
      } catch (error) {
        console.log(error);
      }
    });
  }, []);

  const setChats = (type, from_userId, from_name, from_color, message) => {
    setChat((prevChats) => [
      ...prevChats,
      {
        type: type,
        userId: from_userId,
        name: from_name,
        color: from_color,
        message: message,
      },
    ]);
  };

  // Notify others if user joins or leaves the room
  useEffect(() => {
    if (status === 1) {
      socket.emit('join_room_notify', roomId, 'joined the chat');
    } else {
      socket.emit('leave_room_notify', roomId, 'left the chat');
    }
  }, [status]);

  // Handle close room
  const closeRoom = () => {
    if (userState.userId === currentRoom.host.userId) {
      if (
        window.confirm(
          `Do you want to close the room (${currentRoom.roomId}) ?\nThis cannot be undone..!`
        )
      ) {
        socket.emit('close_room', roomId);
      }
    }
  };

  // Handle leave room
  const leaveRoom = () => {
    if (
      window.confirm(
        `Do you want to leave the room (${currentRoom.roomId}) ?\nThis cannot be undone..!`
      )
    ) {
      socket.emit('leave_room', roomId, userState.userId);
    }
  };

  // Update chatListElements when chat changes
  useEffect(() => {
    const all_chats = chat.map(({ type, userId, name, color, message }, index) => {
      if (type === 'message') {
        return (
          <div
            key={index}
            className={`chat-bubble ${userId === userState.userId ? ' right' : ''}`}
          >
            <p className='name' style={{ color: `${color}` }}>
              {name.length > 0 ? name : userId}
            </p>
            <p className='message'>{message}</p>
          </div>
        );
      } else {
        return (
          <div key={index} className='notification-bubble'>
            <p className='notification-text' style={{ color: `${color}` }}>
              {name.length > 0 ? name : userId} {message}
            </p>
          </div>
        );
      }
    });
    setChatListElements(all_chats);
  }, [chat]);

  useEffect(() => {
    var element = document.getElementById('chat-list-' + elementId);
    element.scrollTop = element.scrollHeight;
  }, [chatListElements]);

  // onChange
  const onChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle message submit
  const onMessageSubmit = (e) => {
    e.preventDefault();
    const messageText = message.trim();
    if (messageText.length > 0) {
      socket.emit('room_message', roomId, messageText);
      setMessage('');
    }
    document.getElementById('message-input-' + elementId).focus();
  };

  return (
    <div
      className='chat-box-container'
      style={status === 0 ? { display: 'none' } : { display: 'block' }}
    >
      <div className='chat-box'>
        <div className='chat-list-container'>
          <div className='heading'>
            <p>Room ID: {roomId}</p>

            <div className='details-box'>
              <button
                className='btn-outline btn-sm btn-outline-primary'
                onClick={(e) => setOpen(true)}
              >
                View all users
              </button>
              {open && (
                <UserListModal
                  socket={socket}
                  userState={userState}
                  currentRoom={currentRoom}
                  setOpen={setOpen}
                />
              )}
              {userState.userId === currentRoom.host.userId ? (
                <button
                  className='btn-outline btn-sm btn-outline-danger'
                  onClick={() => closeRoom()}
                >
                  Close Room
                </button>
              ) : (
                <button
                  className='btn-outline btn-sm btn-outline-danger'
                  onClick={() => leaveRoom()}
                >
                  Leave Room
                </button>
              )}
            </div>
          </div>

          <div className='chat-list' id={`chat-list-` + elementId}>
            {chatListElements}
          </div>
        </div>

        <div className='chat-form'>
          <form onSubmit={onMessageSubmit}>
            <input
              id={`message-input-` + elementId}
              type='text'
              name='message'
              value={message}
              onChange={(e) => onChange(e)}
              placeholder='Type a message...'
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

export default ChatRoomComponent;
