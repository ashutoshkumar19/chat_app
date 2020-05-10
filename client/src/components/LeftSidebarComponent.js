import React, { useState, useEffect } from 'react';

import Avatar from '../images/avatar.png';

import CreateJoinRoom from './CreateJoinRoom.component';
import UserListItem from './UserListItem.component';
import RoomListItem from './RoomListItem.component';

function LeftSidebarComponent({
  socket,
  userList,
  setUserList,
  userState,
  chatBoxList,
  setChatBoxList,
  roomList,
  setRoomList,
}) {
  const { userId, name, color } = userState;

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
        <div className='avatar'>
          <img src={Avatar} alt='' />
        </div>
        <div className='details'>
          {name.length > 0 && (
            <div style={{ display: 'flex' }}>
              <p className='name' title={name}>
                {name}
              </p>
            </div>
          )}
          <p className='userId'>
            User Id: <span>{userId}</span>
          </p>
        </div>
      </div>

      <div className='btn-container' id='btn-container'>
        <CreateJoinRoom
          socket={socket}
          userState={userState}
          roomList={roomList}
          setRoomList={setRoomList}
        />
      </div>

      <div className='user-list-container'>
        <p className='heading'>Online users and rooms</p>

        <ul className='user-list'>
          {roomList.map((room, index) => (
            <RoomListItem
              key={index}
              room={room}
              userState={userState}
              chatBoxList={chatBoxList}
              setChatBoxList={setChatBoxList}
              setIsSidebarHidden={setIsSidebarHidden}
            />
          ))}

          {userList.map(
            (user, index) =>
              user.userId !== userId && (
                <UserListItem
                  key={index}
                  user={user}
                  chatBoxList={chatBoxList}
                  setChatBoxList={setChatBoxList}
                  setIsSidebarHidden={setIsSidebarHidden}
                />
              )
          )}
        </ul>
      </div>
    </div>
  );
}

export default LeftSidebarComponent;
