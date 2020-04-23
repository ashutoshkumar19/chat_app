import React, { useState, useEffect } from 'react';

function UserListItem({ user, privateList, setPrivateList }) {
  const openChatWindow = () => {
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
  };

  return (
    <li className='user-list-item' onClick={(e) => openChatWindow()}>
      <div className='img-div'>
        <img
          src='https://www.nicepng.com/png/detail/780-7805650_generic-user-image-male-man-cartoon-no-eyes.png'
          alt=''
        />
      </div>
      <div className='name-div'>
        <p>{user.name}</p>
      </div>
      <div className='status-div'>
        <div className='status-color'></div>
      </div>
    </li>
  );
}

export default UserListItem;
