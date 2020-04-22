import React, { useState, useEffect } from 'react';

import CreateJoinRoom from './CreateJoinRoom.component';
import { generateUsername, generateRoomId, generateRandomColor } from './Functions';

function LeftSidebarComponent({ socket, state, setState, chatRoom, setChatRoom }) {
  const { name, message, color } = state;

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
      console.log('someone joined the chat');
      console.log(users);
      setUserList(users);
    });
  }, []);

  // Update userListElements when userList changes
  useEffect(() => {
    const elements = userList.map(
      (item, index) =>
        item.name !== name && (
          <li key={index} className='user-list-item'>
            <div className='img-div'>
              <img
                src='https://www.nicepng.com/png/detail/780-7805650_generic-user-image-male-man-cartoon-no-eyes.png'
                alt=''
              />
            </div>
            <div className='name-div'>
              <p>{item.name}</p>
            </div>
            <div className='status-div'>
              <div className='status-color'></div>
            </div>
          </li>
        )
    );

    setUserListElements(elements);
  }, [userList]);

  const onNameSubmit = (e) => {
    e.preventDefault();
    if (formData !== name) {
      var userExists = userList.some((item) => {
        if (item.name === formData) {
          return true;
        }
      });
      if (userExists) {
        alert('This username already exists !\nPlease choose another username...');
      } else {
        setOldName(name);
        setState({ ...state, name: formData, color: generateRandomColor() });
      }
    }
  };

  return (
    <div className='left-sidebar'>
      <div className='current-user' id='current-user'>
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
          state={state}
          setState={setState}
          chatRoom={chatRoom}
          setChatRoom={setChatRoom}
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
