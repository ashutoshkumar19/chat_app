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
  const [state, setState] = useState({
    name: generateUsername(7),
    message: '',
    color: generateRandomColor(),
  });

  const initialRoomState = {
    id: generateRoomId(7),
    members: {},
  };

  const [chatRoom, setChatRoom] = useState(initialRoomState);

  return (
    <Fragment>
      <LeftSidebarComponent
        socket={socket}
        state={state}
        setState={setState}
        chatRoom={chatRoom}
        setChatRoom={setChatRoom}
      />

      <ChatComponent
        socket={socket}
        state={state}
        setState={setState}
        chatRoom={chatRoom}
        setChatRoom={setChatRoom}
      />
    </Fragment>
  );
}

export default App;
