import React, { useState, useEffect } from 'react';

import GroupIcon from '../images/group.png';

function RoomListItem({ room, userState, chatBoxList, setChatBoxList }) {
  const [currentItemStatus, setCurrentItemStatus] = useState(0);

  useEffect(() => {
    try {
      const index = chatBoxList.findIndex((item) => item.id === room.roomId);
      const currentStatus = chatBoxList[index].status;
      setCurrentItemStatus(currentStatus);
    } catch (error) {
      console.log(error);
    }
  }, [chatBoxList]);

  // Open chat box
  const openChatWindow = () => {
    var roomExists = chatBoxList.some((item) => {
      if (item.id === room.roomId) {
        return true;
      }
    });
    let temp = chatBoxList;
    if (roomExists) {
      const roomIndex = chatBoxList.findIndex((item) => item.id === room.roomId);
      const statusIndex = chatBoxList.findIndex((item) => item.status === 1);

      const currentStatus = temp[roomIndex].status;

      temp[statusIndex] = {
        ...temp[statusIndex],
        status: 0,
      };
      temp[roomIndex] = {
        ...temp[roomIndex],
        name: room.roomId,
        status: currentStatus === 0 ? 1 : 0,
      };
    } else {
      const statusIndex = chatBoxList.findIndex((item) => item.status === 1);
      if (statusIndex >= 0) {
        temp[statusIndex] = {
          ...temp[statusIndex],
          status: 0,
        };
      }
      temp.push({ id: room.roomId, name: room.roomId, type: 'room', status: 1 });
    }
    setChatBoxList(temp);
    setChatBoxList((prevList) => [...prevList]);
  };

  return (
    <li
      className={`room-list-item ${currentItemStatus === 1 && `active`}`}
      onClick={(e) => openChatWindow()}
    >
      <div className='img-div'>
        <img src={GroupIcon} alt='' />
      </div>
      <div className='name-div'>
        <p>{room.roomId}</p>
        {room.host.userId === userState.userId && (
          <span className='material-icons host' title='Host'>
            account_circle
          </span>
        )}
      </div>
      <div className='status-div'>
        <div className='status-color'></div>
      </div>
    </li>
  );
}

export default RoomListItem;
