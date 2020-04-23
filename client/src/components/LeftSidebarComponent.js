import React, { useState, useEffect } from 'react';

import CreateJoinRoom from './CreateJoinRoom.component';
import UserListItem from './UserListItem';
import { generateUsername, generateRoomId, generateRandomColor } from './Functions';

function LeftSidebarComponent({
  socket,
  userState,
  setUserState,
  privateList,
  setPrivateList,
}) {
  const { name, color } = userState;

  const [oldName, setOldName] = useState('');

  const [formData, setFormData] = useState(name);

  const [userList, setUserList] = useState([]);

  const [userListElements, setUserListElements] = useState('');

  // Tell server to add new user and remove old user when Username changes
  useEffect(() => {
    socket.emit('new_user', { oldName, name, color });
  }, [name]);

  // Watch the socket to update userList
  useEffect(() => {
    socket.on('get_users', (users) => {
      setUserList(users);

      // let temp_list = privateList;
      // temp_list.splice(0, temp_list.length);

      // users.map((user) => {
      //   if (user.name !== name) {
      //     temp_list.push({ name: user.name, status: 0 });
      //   }
      // });

      // console.log('privateList:\n');
      // console.log(privateList);

      // console.log('Temp List:\n');
      // console.log(temp_list);

      // setPrivateList(temp_list);
      // setPrivateList((prevList) => [...prevList]);
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
    if (formData !== name) {
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
    <div className='left-sidebar'>
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
