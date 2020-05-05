import React, { useState, useEffect } from 'react';

import CreateJoinRoom from './CreateJoinRoom.component';
import UserListItem from './UserListItem.component';
import { generateRandomColor } from './Functions';
import RoomListItem from './RoomListItem.component';

function LeftSidebarComponent({
  socket,
  userList,
  setUserList,
  userState,
  setUserState,
  privateList,
  setPrivateList,
  roomState,
  setRoomState,
}) {
  const { userId, name, color } = userState;

  const { createRoomId, joinRoomId } = roomState;

  const [isNameForm, setIsNameForm] = useState(false);
  const [formData, setFormData] = useState(name);

  const [userListElements, setUserListElements] = useState('');
  const [roomListElements, setRoomListElements] = useState('');

  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  // Tell server to add new user when userId changes
  useEffect(() => {
    socket.emit('new_user', userId, name, color);
  }, [userId]);

  useEffect(() => {
    socket.emit('change_name', name, color);
  }, [name]);

  // Watch the socket to update userList
  useEffect(() => {
    socket.on('get_users', (users) => {
      setUserList(users);
    });
  }, []);

  // Update userListElements when userList changes
  useEffect(() => {
    const elements = userList.map(
      (user, index) =>
        user.userId !== userId && (
          <UserListItem
            key={index}
            user={user}
            privateList={privateList}
            setPrivateList={setPrivateList}
          />
        )
    );
    setUserListElements(elements);
  }, [userList]);

  // Handle name change
  const onNameSubmit = (e) => {
    e.preventDefault();
    let name_text = formData.trim();
    if (name_text !== name) {
      setUserState({ ...userState, name: name_text, color: generateRandomColor() });
    }
    setIsNameForm(false);
    setFormData(name_text);
  };

  return (
    <div className={`left-sidebar ${isSidebarHidden && `hidden`}`}>
      <div
        className={`sidebar-toggle ${isSidebarHidden && `menu-btn`}`}
        onClick={() => setIsSidebarHidden(!isSidebarHidden)}
      >
        {isSidebarHidden ? (
          <span className='material-icons'>menu</span>
        ) : (
          <span className='material-icons'>arrow_back</span>
        )}
      </div>

      <div className='current-user' id='current-user'>
        {isNameForm ? (
          <div className='name-box'>
            <form onSubmit={onNameSubmit}>
              <label htmlFor='name'>Name</label>
              <input
                type='text'
                name='name'
                autoFocus
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
              />
              <button type='submit'>Done</button>
            </form>
          </div>
        ) : (
          <>
            {name.length > 0 ? (
              <div style={{ display: 'flex' }}>
                <p className='name'>{name}</p>
                <span className='link sm' onClick={(e) => setIsNameForm(true)}>
                  Change Name
                </span>
              </div>
            ) : (
              <div className='name link' onClick={(e) => setIsNameForm(true)}>
                Please enter your name
              </div>
            )}
          </>
        )}

        <p className='userId'>
          User Id: <span>{userId}</span>
        </p>
      </div>

      <div className='btn-container' id='btn-container'>
        <CreateJoinRoom
          socket={socket}
          userState={userState}
          setUserState={setUserState}
          roomState={roomState}
          setRoomState={setRoomState}
        />
      </div>

      <div className='user-list-container'>
        <p className='heading'>Online users and rooms</p>
        <ul className='user-list'>
          {createRoomId.length > 0 && (
            <RoomListItem
              roomId={createRoomId}
              roomState={roomState}
              setRoomState={setRoomState}
            />
          )}
          {joinRoomId.length > 0 && (
            <RoomListItem
              roomId={joinRoomId}
              roomState={roomState}
              setRoomState={setRoomState}
            />
          )}
          {userListElements}
        </ul>
      </div>
    </div>
  );
}

export default LeftSidebarComponent;
