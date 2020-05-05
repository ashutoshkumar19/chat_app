import React, { useState, Fragment, useEffect } from 'react';

import { generateRoomId } from './Functions';

function CreateJoinRoom({ socket, userState, setUserState, roomState, setRoomState }) {
  const { userId, name, color } = userState;

  const { createRoomId, joinRoomId } = roomState;

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState('');

  useEffect(() => {
    console.log('createRoomId: ' + createRoomId);
  }, [createRoomId]);
  useEffect(() => {
    console.log('joinRoomId: ' + joinRoomId);
  }, [joinRoomId]);

  const onChange = (e) => {
    setFormData(e.target.value.trim());
  };

  const joinRoom = (e) => {
    e.preventDefault();
    socket.emit('join_room', formData);
    setRoomState({ ...roomState, joinRoomId: formData });
    setFormData('');
    // if (window.confirm('Are you sure? You will be exited from current room!')) {
    //   try {
    //     setRoomState({ ...roomState, joinRoomId: formData });
    //     setFormData('');
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
  };

  const createRoom = (e) => {
    e.preventDefault();
    let roomId = generateRoomId(10);
    socket.emit('create_room', roomId);
    setRoomState({ ...roomState, createRoomId: roomId });
    if (showForm) {
      setShowForm(false);
    }
  };

  return (
    <div>
      <div className='row1'>
        <button className='btn btn-sm btn-primary' onClick={(e) => createRoom(e)}>
          Create Room
        </button>
        <button className='btn btn-sm btn-primary' onClick={() => setShowForm(!showForm)}>
          Join Room
        </button>
      </div>
      {showForm && (
        <div className='row2'>
          <form onSubmit={joinRoom}>
            <input
              type='text'
              name='joinRoomId'
              placeholder='Enter room id'
              autoFocus
              value={formData}
              onChange={onChange}
            />
            <button className='btn btn-sm btn-dark'>Join</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CreateJoinRoom;
