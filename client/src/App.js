import React, { useState, useEffect, Fragment } from 'react';
import io from 'socket.io-client';

import LeftSidebarComponent from './components/LeftSidebarComponent';
import ChatComponent from './components/ChatComponent';

import { generateUserId, generateRandomColor } from './components/Functions';

import './styles/App.scss';

// const socket = io.connect('http://localhost:5000');
const socket = io.connect('/');

function App() {
  const [userState, setUserState] = useState({
    userId: generateUserId(7),
    name: '',
    color: generateRandomColor(),
  });

  const [userList, setUserList] = useState([]);

  const [privateList, setPrivateList] = useState([]);

  const [roomList, setRoomList] = useState([]);

  const [roomState, setRoomState] = useState({ createRoomId: '', joinRoomId: '' });

  useEffect(() => {
    console.log('***********************');
    console.log(privateList);
    console.log('***********************');
  }, [privateList]);

  return (
    <Fragment>
      <LeftSidebarComponent
        socket={socket}
        userList={userList}
        setUserList={setUserList}
        userState={userState}
        setUserState={setUserState}
        privateList={privateList}
        setPrivateList={setPrivateList}
        roomState={roomState}
        setRoomState={setRoomState}
      />

      {privateList.map((item, index) => (
        <ChatComponent key={index} socket={socket} userState={userState} to_user={item} />
      ))}
      {/* <ChatComponent socket={socket} userState={userState} setUserState={setUserState} /> */}
    </Fragment>
  );
}

export default App;
