import React, { useState, Fragment, useEffect } from 'react';

function CreateJoinRoom({ socket, userState, roomList, setRoomList }) {
  const { userId, name, color } = userState;

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState('');

  useEffect(() => {
    socket.on('room_created', (room) => {
      setRoomList((prevState) => [room, ...prevState]);
    });

    socket.on('room_joined', (roomId, joinedUserId, joinedUserName, room) => {
      if (joinedUserId === userId) {
        setRoomList((prevState) => [room, ...prevState]);
      } else {
        setRoomList((prevState) => {
          let roomIndex = prevState.findIndex((roomItem) => roomItem.roomId === roomId);
          const userExists = prevState[roomIndex].participants.some(
            (user) => user.userId === joinedUserId
          );
          if (!userExists) {
            prevState[roomIndex].participants.push({
              userId: joinedUserId,
              name: joinedUserName,
            });
          }
          console.log(prevState);

          return prevState;
        });
        console.log(joinedUserId + ' joined ' + roomId);
      }
    });
  }, []);

  useEffect(() => {
    console.log('Rooms : ');
    console.log(roomList);
  }, [roomList]);

  const onChange = (e) => {
    setFormData(e.target.value.trim());
  };

  const joinRoom = (e) => {
    e.preventDefault();
    socket.emit('join_room', formData);
    setFormData('');
    setShowForm(false);
    // if (window.confirm('Are you sure? You will be exited from current room!')) {
    //   try {
    //     setRoomList({ ...roomList, joinRoomId: formData });
    //     setFormData('');
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
  };

  const createRoom = (e) => {
    e.preventDefault();
    socket.emit('create_room');
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
