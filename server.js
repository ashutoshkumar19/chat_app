const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

users = [];
socketList = {};

io.on('connection', (socket) => {
  socket.on('message', ({ name, message, color }) => {
    io.emit('message', { name, message, color });
  });

  socket.on('new_user', ({ oldName, name, color }) => {
    try {
      if (oldName.length > 0) {
        removeSocket(oldName);
      }

      users.push({ name: name, color: color });
      console.log(users);

      socket.username = name;
      socketList[socket.username] = socket;

      updateUsernames();
    } catch (error) {
      console.log(error);
    }
  });

  const updateUsernames = () => {
    io.emit('get_users', users);
  };

  const removeSocket = (username) => {
    console.log(username + ' disconnected');
    users = users.filter((user) => user.name !== username);
    delete socketList[username];
  };

  socket.on('disconnect', (data) => {
    removeSocket(socket.username);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
