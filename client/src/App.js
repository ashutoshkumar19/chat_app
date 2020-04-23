import React, { useState, useEffect, Fragment } from 'react';
import io from 'socket.io-client';

import LeftSidebarComponent from './components/LeftSidebarComponent';
import ChatComponent from './components/ChatComponent';
import {
  generateUsername,
  generateRoomId,
  generateRandomColor,
} from './components/Functions';

import './styles/App.scss';

const socket = io.connect('http://localhost:5000');

function App() {
  const [userState, setUserState] = useState({
    name: generateUsername(7),
    color: generateRandomColor(),
  });

  const [privateList, setPrivateList] = useState([]);

  useEffect(() => {
    console.log('***********************');
    console.log(privateList);
    console.log('***********************');
  }, [privateList]);

  return (
    <Fragment>
      <LeftSidebarComponent
        socket={socket}
        userState={userState}
        setUserState={setUserState}
        privateList={privateList}
        setPrivateList={setPrivateList}
      />

      {privateList.map((item, index) => (
        <ChatComponent
          key={index}
          socket={socket}
          userState={userState}
          // setUserState={setUserState}
          to_name={item.name}
          status={item.status}
        />
      ))}
      {/* <ChatComponent socket={socket} userState={userState} setUserState={setUserState} /> */}
    </Fragment>
  );
}

export default App;
