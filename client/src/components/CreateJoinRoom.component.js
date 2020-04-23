import React, { useState, Fragment } from 'react';

import { generateRoomId } from './Functions';

function CreateJoinRoom({ socket, userState, setUserState }) {
  const [btnState, setBtnState] = useState('');

  const [formData, setFormData] = useState({ createRoomId: '', joinRoomId: '' });
  const { createRoomId, joinRoomId } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
  };

  const createRoom = (e) => {
    e.preventDefault();

    console.log(createRoomId);
    setBtnState('');
  };

  const joinRoom = (e) => {
    e.preventDefault();
    console.log(joinRoomId);
    setBtnState('');
  };

  return (
    <div>
      <div className='row1'>
        <button className='btn btn-sm btn-primary' onClick={(e) => setBtnState('create')}>
          Create Room
        </button>
        <button className='btn btn-sm btn-primary' onClick={(e) => setBtnState('join')}>
          Join Room
        </button>
      </div>
      {btnState.length > 0 && (
        <div className='row2'>
          {btnState === 'create' ? (
            <form onSubmit={createRoom}>
              <input
                type='text'
                name='createRoomId'
                placeholder='Create a unique room id'
                value={createRoomId}
                onChange={onChange}
              />
              <button className='btn btn-sm btn-dark' type='submit'>
                Create
              </button>
            </form>
          ) : (
            <form onSubmit={joinRoom}>
              <input
                type='text'
                name='joinRoomId'
                placeholder='Enter room id'
                value={joinRoomId}
                onChange={onChange}
              />
              <button className='btn btn-sm btn-dark'>Join</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateJoinRoom;
