const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

users = [];
socketList = {};

io.on('connection', (socket) => {
  socket.on('new_user', (oldName, name, color) => {
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

  // Update Usernames on clients
  const updateUsernames = () => {
    io.emit('get_users', users);
  };

  socket.on('message', (name, message, color) => {
    io.emit('message', name, message, color);
  });

  socket.on('private_message', (to_name, name, message, color) => {
    try {
      socketList[name.toString()].emit('sent_message', to_name, name, message, color);
      socketList[to_name.toString()].emit('received_message', name, message, color);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('join_notify', (to_name, name) => {
    try {
      socketList[to_name.toString()].emit('join_notify', name);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on('join_notify_acknowledge', (to_name, name) => {
    try {
      socketList[to_name.toString()].emit('join_notify_acknowledge', name);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on('leave_notify', (to_name, name) => {
    try {
      socketList[to_name.toString()].emit('leave_notify', name);
    } catch (error) {
      console.log(error);
    }
  });

  // Remove socket on server
  const removeSocket = (username) => {
    try {
      users = users.filter((user) => user.name !== username);
      delete socketList[username];
      console.log(username + ' disconnected');
      io.emit('leave_notify', username);
    } catch (error) {
      console.log(error);
    }
  };

  socket.on('disconnect', (data) => {
    removeSocket(socket.username);
  });
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
