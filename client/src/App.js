import React, { useState, useEffect, Fragment } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

import LeftSidebarComponent from './components/LeftSidebarComponent';
import ChatComponent from './components/ChatComponent';
import ChatRoomComponent from './components/ChatRoomComponent';

import { generateUserId, generateRandomColor } from './components/Functions';

import './styles/App.scss';
import LandingComponent from './components/LandingComponent';

// const socket = io.connect('http://localhost:5000');
const socket = io.connect('/');

function App() {
  const [userState, setUserState] = useState({
    userId: generateUserId(7),
    name: '',
    color: generateRandomColor(),
  });

  const [userList, setUserList] = useState([]);

  const [roomList, setRoomList] = useState([]);

  const [chatBoxList, setChatBoxList] = useState([]);

  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  // Ping Heroku server at fixed interval to stop it from sleeping
  useEffect(() => {
    setInterval(() => {
      pingServer();
    }, 600000);
  }, []);
  const pingServer = () => {
    const res = axios.get('/api');
    console.log(res);
  };

  useEffect(() => {
    console.log('***********************');
    console.log(chatBoxList);
    console.log('***********************');
  }, [chatBoxList]);

  return (
    <div className='main-content'>
      {userState.name.length === 0 ? (
        <LandingComponent userState={userState} setUserState={setUserState} />
      ) : (
        <Fragment>
          <LeftSidebarComponent
            socket={socket}
            userList={userList}
            setUserList={setUserList}
            userState={userState}
            chatBoxList={chatBoxList}
            setChatBoxList={setChatBoxList}
            roomList={roomList}
            setRoomList={setRoomList}
            isSidebarHidden={isSidebarHidden}
            setIsSidebarHidden={setIsSidebarHidden}
          />

          {chatBoxList.map((item, index) => {
            if (item.type === 'room') {
              let currentRoom = roomList.find((room) => room.roomId === item.id);
              return (
                <ChatRoomComponent
                  key={index}
                  socket={socket}
                  userState={userState}
                  chatBoxItem={item}
                  currentRoom={currentRoom}
                  setRoomList={setRoomList}
                  setChatBoxList={setChatBoxList}
                  setIsSidebarHidden={setIsSidebarHidden}
                />
              );
            } else {
              return (
                <ChatComponent
                  key={index}
                  socket={socket}
                  userState={userState}
                  chatBoxItem={item}
                />
              );
            }
          })}
        </Fragment>
      )}
    </div>
  );
}

export default App;
