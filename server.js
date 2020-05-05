const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

users = [];
socketList = {};

rooms = {};

io.on('connection', (socket) => {
  // Create room
  socket.on('create_room', (roomId) => {
    try {
      if (roomId.length > 0 && socket.userId !== undefined) {
        socket.join(roomId);

        var temp = {
          host: socket.userId,
          participants: [],
        };
        rooms[roomId] = temp;

        console.log(`\nRoom ${roomId} created...`);
        console.log(rooms);

        // var temp = {
        //   roomId: roomId,
        //   host: socket.userId,
        //   participants: [],
        // };
        // rooms.push(temp);
      }
    } catch (error) {
      console.log(error);
    }
  });

  // Create room
  socket.on('join_room', (roomId) => {
    try {
      if (
        rooms[roomId].host !== socket.userId &&
        !rooms[roomId].participants.includes(socket.userId)
      ) {
        socket.join(roomId);

        rooms[roomId].participants.push(socket.userId);

        console.log(`\n${socket.userId} joined room ${roomId}...`);
        console.log(rooms[roomId]);
      }
    } catch (error) {
      console.log(error);
    }
  });

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

      console.log('\nName Changed...');
      console.log(users);
      // console.log('Socket.Name: ' + socket.name + '\nSocket.color: ' + socket.color);

      updateUsernames();
    } catch (error) {
      console.log(error);
    }
  });

  // Update Usernames on clients
  const updateUsernames = () => {
    io.emit('get_users', users);
  };

  socket.on('message', (name, message, color) => {
    io.emit('message', name, message, color);
  });

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

  // Notify clients when someone joins the chat
  socket.on('join_notify', (to_userId) => {
    try {
      socketList[to_userId.toString()].emit('join_notify', socket.userId, socket.name);
    } catch (error) {
      console.log(error);
    }
  });
  // Acknowledge client that other client received the notification
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

  // Notify clients when someone leaves the chat
  socket.on('leave_notify', (to_userId) => {
    try {
      socketList[to_userId.toString()].emit('leave_notify', socket.userId, socket.name);
    } catch (error) {
      console.log(error);
    }
  });

  // Remove socket on server
  const removeSocket = (socket) => {
    try {
      users = users.filter((user) => user.userId !== socket.userId);
      delete socketList[socket.userId];
      io.emit('leave_notify', socket.userId, socket.name);
      console.log(`\n${socket.name} (${socket.userId}) disconnected`);
    } catch (error) {
      console.log(error);
    }
  };

  // Remove socket when client disconnects
  socket.on('disconnect', (data) => {
    removeSocket(socket);
  });
});

/***************************************************************************/
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
