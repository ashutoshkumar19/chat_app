const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const functions = require('./Functions');

users = [];
socketList = {};

rooms = {};

io.on('connection', (socket) => {
  // Add new users and their sockets
  socket.on('new_user', (userId, name, color) => {
    try {
      users.push({ userId: userId, name: name, color: color });

      socket.userId = userId;
      socket.name = name;
      socket.color = color;
      socketList[userId] = socket;

      console.log('\nNew user added...');
      console.log(users);
      // console.log('Socket.Name: ' + socket.name + '\nSocket.color: ' + socket.color);

      updateUsernames();
    } catch (error) {
      console.log(error);
    }
  });

  // Change name of user
  {
    /*
    socket.on('change_name', (name, color) => {
      try {
        for (let i = 0; i < users.length; i++) {
          if (users[i].userId === socket.userId) {
            users[i].name = name;
            users[i].color = color;
            break;
          }
        }
        socket.name = name;
        socket.color = color;

        updateUsernames();

        console.log('\nName Changed...');
        console.log(users);
      } catch (error) {
        console.log(error);
      }
    });
  */
  }

  // Update name on clients
  const updateUsernames = () => {
    io.emit('get_users', users);
  };

  /**************************************************/
  /*                Private Chats                   */
  /**************************************************/

  // Send private message to specified client
  socket.on('private_message', (to_userId, message) => {
    try {
      socket.emit('sent_message', to_userId, socket.name, socket.color, message);
      socketList[to_userId.toString()].emit(
        'received_message',
        socket.userId,
        socket.name,
        socket.color,
        message
      );
    } catch (error) {
      console.log(error);
    }
  });

  // Notify when someone joins the chat
  socket.on('join_notify', (to_userId) => {
    try {
      socketList[to_userId.toString()].emit('join_notify', socket.userId, socket.name);
    } catch (error) {
      console.log(error);
    }
  });
  // Acknowledge that other client received the notification
  socket.on('join_notify_acknowledge', (to_userId) => {
    try {
      socketList[to_userId.toString()].emit(
        'join_notify_acknowledge',
        socket.userId,
        socket.name
      );
    } catch (error) {
      console.log(error);
    }
  });

  // Notify when someone leaves the chat
  socket.on('leave_notify', (to_userId) => {
    try {
      socketList[to_userId.toString()].emit('leave_notify', socket.userId, socket.name);
    } catch (error) {
      console.log(error);
    }
  });

  // Notify when user is typing
  socket.on('typing_notify', (to_userId) => {
    try {
      socketList[to_userId.toString()].emit('typing_notify', socket.userId);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on('typing_stopped_notify', (to_userId) => {
    try {
      socketList[to_userId.toString()].emit('typing_stopped_notify', socket.userId);
    } catch (error) {
      console.log(error);
    }
  });

  /**************************************************/
  /*                 Chat Rooms                     */
  /**************************************************/

  // Create room
  socket.on('create_room', () => {
    try {
      if (socket.userId !== undefined) {
        const roomId = functions.generateRoomId(7);

        socket.join(roomId);

        let room = {
          host: { userId: socket.userId, name: socket.name },
          participants: [],
        };
        rooms[roomId] = room;

        room = { roomId: roomId, ...room };

        socket.emit('room_created', room);

        // console.log(room);
        console.log('---------------------------ROOMS---------------------------');
        for (let i = 0; i < Object.keys(rooms).length; i++) {
          let roomId = Object.keys(rooms)[i];
          console.log(rooms[roomId]);
        }
        console.log('-----------------------------------------------------------');
      }
    } catch (error) {
      console.log(error);
    }
  });

  // Join room
  socket.on('join_room', (roomId) => {
    try {
      if (rooms[roomId] !== undefined) {
        var userExists = rooms[roomId].participants.some(
          (participant) => participant.userId === socket.userId
        );
        if (rooms[roomId].host.userId !== socket.userId && !userExists) {
          socket.join(roomId);

          rooms[roomId].participants.push({ userId: socket.userId, name: socket.name });

          let room = rooms[roomId];
          room = { roomId: roomId, ...room };

          io.to(roomId).emit('room_joined', roomId, socket.userId, socket.name, room);

          io.to(roomId).emit(
            'join_room_notify',
            roomId,
            socket.userId,
            socket.name,
            'joined the room'
          );

          console.log(`\n${socket.userId} joined room ${roomId}...`);
          console.log(room);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  // Close room
  socket.on('close_room', (roomId) => {
    try {
      if (rooms[roomId].host.userId === socket.userId) {
        io.to(roomId).emit('room_closed', roomId);

        rooms[roomId].participants.map((participant) => {
          socketList[participant.userId].leave(roomId);
        });

        socket.leave(roomId);

        delete rooms[roomId];

        console.log(rooms);
      }
    } catch (error) {
      console.log(error);
    }
  });

  // Leave room
  socket.on('leave_room', (roomId, userId) => {
    try {
      let temp = rooms[roomId].participants.filter((item) => item.userId !== userId);
      rooms[roomId].participants = temp;

      io.to(roomId).emit('left_room', roomId, userId);

      socketList[userId].leave(roomId);

      console.log('\n~~~~~~~~~~User Left the Room~~~~~~~~~~~~~~');
      console.log(rooms[roomId]);
      console.log('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    } catch (error) {
      console.log(error);
    }
  });

  // Send message to specified room
  socket.on('room_message', (roomId, message) => {
    try {
      // socket.emit('sent_room_message', roomId, socket.name, socket.color, message);
      io.to(roomId).emit(
        'room_message',
        roomId,
        socket.userId,
        socket.name,
        socket.color,
        message
      );
    } catch (error) {
      console.log(error);
    }
  });

  // Notify in room when someone joins the chat
  socket.on('join_room_notify', (roomId, notify_text) => {
    try {
      io.to(roomId).emit(
        'join_room_notify',
        roomId,
        socket.userId,
        socket.name,
        notify_text
      );
    } catch (error) {
      console.log(error);
    }
  });
  // Acknowledge to room that other client received the notification
  socket.on('join_room_notify_acknowledge', (roomId, notify_text) => {
    try {
      io.to(roomId).emit(
        'join_room_notify_acknowledge',
        roomId,
        socket.userId,
        socket.name,
        notify_text
      );
    } catch (error) {
      console.log(error);
    }
  });

  // Notify in room when someone leaves the chat
  socket.on('leave_room_notify', (roomId, notify_text) => {
    try {
      io.to(roomId).emit(
        'leave_room_notify',
        roomId,
        socket.userId,
        socket.name,
        notify_text
      );
    } catch (error) {
      console.log(error);
    }
  });

  // Notify in room when host removes any participant
  socket.on('removed_from_room_notify', (roomId, userId) => {
    try {
      io.to(roomId).emit(
        'removed_from_room_notify',
        roomId,
        userId,
        socketList[userId].name
      );
    } catch (error) {
      console.log(error);
    }
  });

  // Notify in room when user is typing
  socket.on('typing_room_notify', (roomId) => {
    try {
      io.to(roomId).emit('typing_room_notify', roomId, socket.userId, socket.name);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on('typing_stopped_room_notify', (roomId) => {
    try {
      io.to(roomId).emit('typing_stopped_room_notify', roomId, socket.userId);
    } catch (error) {
      console.log(error);
    }
  });

  // Remove socket from all rooms
  const removeSocketFromRooms = (socket) => {
    try {
      let roomsToDelete = [];
      const roomCount = Object.keys(rooms).length;

      for (let i = 0; i < roomCount; i++) {
        let roomId = Object.keys(rooms)[i];

        if (rooms[roomId].host.userId === socket.userId) {
          console.log(rooms[roomId]);
          io.to(roomId).emit('room_closed', roomId);

          rooms[roomId].participants.map((participant) => {
            socketList[participant.userId].leave(roomId);
          });

          socket.leave(roomId);
          roomsToDelete.push(roomId);
        } else {
          rooms[roomId].participants.map((participant, index) => {
            if (participant.userId === socket.userId) {
              rooms[roomId].participants.splice(index, 1);

              io.to(roomId).emit('left_room', roomId, socket.userId);

              io.to(roomId).emit(
                'leave_room_notify',
                roomId,
                socket.userId,
                socket.name,
                'left the room'
              );

              socketList[socket.userId].leave(roomId);
            }
          });
        }
      }
      // Delete all rooms created by disconnected host
      for (let i = 0; i < roomsToDelete.length; i++) {
        delete rooms[roomsToDelete[i]];
      }
      // console.log('---------------------------ROOMS---------------------------');
      // for (let i = 0; i < Object.keys(rooms).length; i++) {
      //   let roomId = Object.keys(rooms)[i];
      //   console.log(rooms[roomId]);
      // }
      // console.log('-----------------------------------------------------------');
    } catch (error) {
      console.log(error);
    }
  };

  // Remove socket on server
  const removeSocket = (socket) => {
    try {
      users = users.filter((user) => user.userId !== socket.userId);
      delete socketList[socket.userId];
      io.emit('leave_notify', socket.userId, socket.name);
      io.emit('user_disconnected', socket.userId);
      // updateUsernames();
      console.log(`\n${socket.name} (${socket.userId}) disconnected`);
    } catch (error) {
      console.log(error);
    }
  };

  // Remove socket when client disconnects
  socket.on('disconnect', (data) => {
    removeSocketFromRooms(socket);
    removeSocket(socket);
  });
});

/***************************************************************************/

app.get('/api', (req, res) => {
  console.log('PING RECEIVED');
  res.send('success');
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

/***************************************************************************/
