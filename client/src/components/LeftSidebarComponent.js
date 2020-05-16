import React, { useState, useEffect, Fragment } from 'react';

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
  isSidebarHidden,
  setIsSidebarHidden,
}) {
  const { userId, name, color } = userState;

  // Tell server to add new user when userId changes
  useEffect(() => {
    socket.emit('new_user', userId, name, color);
  }, [userId]);

  {
    /*useEffect(() => {
    socket.emit('change_name', name, color);
  }, [name]);*/
  }

  // Watch the socket to update userList & roomList
  useEffect(() => {
    socket.on('get_users', (users) => {
      setUserList(users);
    });

    socket.on('user_disconnected', (disconnectedUserId) => {
      setUserList((prevList) => {
        let tempUserList = prevList;
        tempUserList = prevList.filter((item) => item.userId !== disconnectedUserId);
        return tempUserList;
      });
      setChatBoxList((prevList) => {
        let tempList = prevList;
        tempList = prevList.filter((item) => {
          if (item.id === disconnectedUserId && item.status === 1) {
            setIsSidebarHidden(false);
          } else if (item.id !== disconnectedUserId) {
            return item;
          }
        });
        return tempList;
      });
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
          // setOpen((prevState) => !prevState);
          // setOpen((prevState) => !prevState);
        }
      } catch (error) {
        console.log(error);
      }
    });
  }, []);

  return (
    <Fragment>
      <div
        className={`left-sidebar-container ${isSidebarHidden && `hidden`}`}
        onClick={() => setIsSidebarHidden(true)}
      >
        <div
          className={`left-sidebar ${isSidebarHidden && `hidden`}`}
          onClick={(e) => e.stopPropagation()}
        >
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
      </div>
      <div
        className={`sidebar-toggle ${isSidebarHidden && `hidden`}`}
        onClick={() => setIsSidebarHidden(!isSidebarHidden)}
      >
        {isSidebarHidden ? (
          <span className='material-icons'>menu</span>
        ) : (
          <span className='material-icons'>arrow_back</span>
        )}
      </div>
    </Fragment>
  );
}

export default LeftSidebarComponent;
