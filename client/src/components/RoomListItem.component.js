import React, { useState, useEffect } from 'react';

function RoomListItem({ roomId, roomState, setRoomState }) {
  {
    /*const openChatWindow = () => {
    var userExists = privateList.some((item) => {
      if (item.name === user.name) {
        return true;
      }
    });
    let temp = privateList;
    if (userExists) {
      const userIndex = privateList.findIndex((element) => element.name === user.name);
      const statusIndex = privateList.findIndex((element) => element.status === 1);

      temp[statusIndex] = {
        ...temp[statusIndex],
        status: 0,
      };
      temp[userIndex] = {
        ...temp[userIndex],
        status: 1,
      };
    } else {
      const statusIndex = privateList.findIndex((element) => element.status === 1);
      if (statusIndex >= 0) {
        temp[statusIndex] = {
          ...temp[statusIndex],
          status: 0,
        };
      }
      temp.push({ name: user.name, status: 1 });
    }
    setPrivateList(temp);
    setPrivateList((prevList) => [...prevList]);
  };*/
  }

  return (
    // <li className='user-list-item' onClick={(e) => openChatWindow()}>
    <li className='room-list-item'>
      <div className='img-div'>
        <img
          src='https://viewsgain.com/wp-content/uploads/2018/08/Buy-Youtube-Subscribers.png'
          alt=''
        />
      </div>
      <div className='name-div'>
        <p>{roomId}</p>
      </div>
      <div className='status-div'>
        <div className='status-color'></div>
      </div>
    </li>
  );
}

export default RoomListItem;
