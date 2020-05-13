import React, { useState, useEffect } from 'react';

// import 'emoji-mart/css/emoji-mart.css';
// import { Picker, Emoji } from 'emoji-mart';
// import Smiley from '../images/smiley.svg';

import UserListModal from './UserListModal.component';

function ChatRoomComponent({
  socket,
  userState,
  chatBoxItem,
  currentRoom,
  setRoomList,
  setChatBoxList,
  setIsSidebarHidden,
}) {
  const roomId = currentRoom.roomId;
  const roomName = chatBoxItem.name;
  const status = chatBoxItem.status;

  const [message, setMessage] = useState('');

  const [chat, setChat] = useState([]);

  const [chatListElements, setChatListElements] = useState('');

  const [typingStatus, setTypingStatus] = useState('');

  const [menuVisible, setMenuVisible] = useState(false);
  const [open, setOpen] = useState(false);

  // const [emojiPicker, setEmojiPicker] = useState(false);

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
    socket.on('removed_from_room_notify', (from_roomId, from_userId, from_name) => {
      if (from_roomId === roomId && from_userId !== userState.userId) {
        let notify_text = `${
          currentRoom.host.userId === userState.userId
            ? `You`
            : `${currentRoom.host.name} (Host)`
        } removed ${from_name}`;
        setChats('host_notification', from_userId, from_name, '#e00000', notify_text);
      }
    });
    socket.on('typing_room_notify', (from_roomId, from_userId, from_name) => {
      if (from_roomId === roomId && from_userId !== userState.userId) {
        setTypingStatus(
          `${from_name ? from_name.split(' ')[0] : from_userId} is typing...`
        );
      }
    });
    socket.on('typing_stopped_room_notify', (from_roomId, from_userId) => {
      if (from_roomId === roomId && from_userId !== userState.userId) {
        setTypingStatus('');
      }
    });

    socket.on('room_closed', (closedRoomId) => {
      try {
        setIsSidebarHidden(false);
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
          setIsSidebarHidden(false);
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
      socket.emit('leave_room_notify', roomId, 'left the room');
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
      } else if (type === 'notification') {
        return (
          <div key={index} className='notification-bubble'>
            <p className='notification-text' style={{ color: `${color}` }}>
              {name.length > 0 ? name : userId} {message}
            </p>
          </div>
        );
      } else if (type === 'host_notification') {
        return (
          <div key={index} className='notification-bubble'>
            <p className='notification-text' style={{ color: `${color}` }}>
              {message}
            </p>
          </div>
        );
      }
    });
    setChatListElements(all_chats);
  }, [chat]);

  useEffect(() => {
    var element = document.getElementById('chat-list-' + roomId);
    element.scrollTop = element.scrollHeight;
  }, [chatListElements]);

  // Notify in room when user is typing
  useEffect(() => {
    document
      .getElementById(`message-input-${roomId}`)
      .addEventListener('keydown', typingNotify);
    return () => {
      document
        .getElementById(`message-input-${roomId}`)
        .removeEventListener('keydown', typingNotify);
    };
  }, []);

  let timer = null;
  const typingNotify = () => {
    socket.emit('typing_room_notify', roomId);
    clearTimeout(timer);
    timer = setTimeout(() => {
      socket.emit('typing_stopped_room_notify', roomId);
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
      socket.emit('room_message', roomId, messageText);
      setMessage('');
    }
    document.getElementById('message-input-' + roomId).focus();
  };

  return (
    <div
      className='chat-box-container'
      id={`chat-box-container-${roomId}`}
      style={status === 0 ? { display: 'none' } : { display: 'block' }}
    >
      <div className='chat-box'>
        <div className='chat-list-container'>
          <div className='heading'>
            <p>RoomID: {roomId}</p>
            <p>{typingStatus}</p>

            <div className='details-box'>
              <button
                className='btn-outline btn-sm btn-outline-primary btn-top'
                onClick={(e) => setOpen(true)}
              >
                View Users
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
                  className='btn-outline btn-sm btn-outline-danger btn-top'
                  onClick={() => closeRoom()}
                >
                  Close Room
                </button>
              ) : (
                <button
                  className='btn-outline btn-sm btn-outline-danger btn-top'
                  onClick={() => leaveRoom()}
                >
                  Leave Room
                </button>
              )}
            </div>

            <div className='menu' onClick={() => setMenuVisible(!menuVisible)}>
              <span className='material-icons'>more_vert</span>
            </div>
          </div>

          <div className={`menu-container ${menuVisible && `visible`}`}>
            <div
              className='menu-item'
              onClick={(e) => {
                setOpen(true);
                setMenuVisible(false);
              }}
            >
              View Users
            </div>
            {userState.userId === currentRoom.host.userId ? (
              <div
                className='menu-item'
                onClick={() => {
                  setMenuVisible(false);
                  closeRoom();
                }}
              >
                Close Room
              </div>
            ) : (
              <div
                className='menu-item'
                onClick={() => {
                  setMenuVisible(false);
                  leaveRoom();
                }}
              >
                Leave Room
              </div>
            )}
          </div>

          <div className='chat-list' id={`chat-list-` + roomId}>
            {chatListElements}
          </div>
        </div>

        <div className='chat-form'>
          {/* {emojiPicker && (
            <div className={`emoji-picker ${!emojiPicker && `hidden`}`}>
              <Picker
                title='Pick your emoji…'
                set={'google'}
                emojiSize={30}
                perLine={8}
                // emoji={'smiley'}
                showPreview={false}
                onSelect={(emoji) => {
                  console.log(emoji);
                  let newMessage = message;
                  newMessage = newMessage + emoji.native;
                  setMessage(newMessage);
                }}
                style={{ width: '100' }}
              />
              <Emoji emoji={{ id: 'smile, skin: 1, set: 'apple' }} size={24} />
            </div>
          )} */}
          <form onSubmit={onMessageSubmit}>
            {/* <div
              className='emoji-picker-btn'
              onClick={() => setEmojiPicker(!emojiPicker)}
            >
              <span className={`fas fa-${emojiPicker ? `keyboard` : `smile`}`}></span>
            </div> */}
            <input
              id={`message-input-` + roomId}
              type='text'
              name='message'
              value={message}
              // onClick={() => setEmojiPicker(false)}
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

export default ChatRoomComponent;
