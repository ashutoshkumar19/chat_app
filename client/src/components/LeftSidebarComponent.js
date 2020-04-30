import React, { useState, useEffect } from 'react';

import CreateJoinRoom from './CreateJoinRoom.component';
import UserListItem from './UserListItem.component';
import { generateUsername, generateRoomId, generateRandomColor } from './Functions';

function LeftSidebarComponent({
  socket,
  userList,
  setUserList,
  userState,
  setUserState,
  privateList,
  setPrivateList,
}) {
  const { name, color } = userState;

  const [oldName, setOldName] = useState('');

  const [formData, setFormData] = useState(name);

  const [userListElements, setUserListElements] = useState('');

  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  // Tell server to add new user and remove old user when Username changes
  useEffect(() => {
    socket.emit('new_user', oldName, name, color);
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
        user.name !== name && (
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

  const onNameSubmit = (e) => {
    e.preventDefault();
    if (formData.length > 0 && formData !== name) {
      var userExists = userList.some((user) => {
        if (user.name === formData) {
          return true;
        }
      });
      if (userExists) {
        alert('This username already exists !\nPlease choose another username...');
      } else {
        setOldName(name);
        setUserState({ ...userState, name: formData, color: generateRandomColor() });
      }
    }
  };

  return (
    <div className={`left-sidebar ${isSidebarHidden && `hidden`}`}>
      <div
        className={`sidebar-toggle ${isSidebarHidden && `menu-btn`}`}
        onClick={() => setIsSidebarHidden(!isSidebarHidden)}
      >
        {isSidebarHidden ? (
          <span class='material-icons'>menu</span>
        ) : (
          <span class='material-icons'>arrow_back</span>
        )}
      </div>
      <div className='current-user' id='current-user'>
        <p className='username'>{name}</p>
        <div className='name-box'>
          <form onSubmit={onNameSubmit}>
            <label htmlFor='name'>Name</label>
            <input
              type='text'
              name='name'
              value={formData}
              onChange={(e) => setFormData(e.target.value)}
            />
            <button type='submit'>Login</button>
          </form>
        </div>
      </div>

      <div className='btn-container' id='btn-container'>
        <CreateJoinRoom
          socket={socket}
          userState={userState}
          setUserState={setUserState}
        />
      </div>

      <div className='user-list-container'>
        <p className='heading'>Online users</p>
        <ul className='user-list'>{userListElements}</ul>
      </div>
    </div>
  );
}

export default LeftSidebarComponent;
