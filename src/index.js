// Core Node Module
const path = require("path");
const http = require("http");
const { generateMessage, generateLocation } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
} = require("./utils/users");

// NPM Modules
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const messages = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

// Joinint the static files path
const publicDirectoryPath = path.join(__dirname, "../public");

// Set up the static path to render
app.use(express.static(publicDirectoryPath));

// let count = 0;

// server (emit) --> client (receive) - countUpdated
// client (emit) --> server (receive) - increment

// socket is an object, which contains all the information about new connection
io.on("connection", (socket) => {
  console.log("New WebSocket connection");
  // Every unique Connection has a unique ID associated to it, we gonna learn where that lives

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));

    //   Acknowledging to all connections except the current one that "A new user has joined!"
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });
    callback();

    // socket.emit, io.emit, socket.broadcast.emit
    // io.to.emit, socket.broadcast.to.emit
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("message", (message, callback) => {
    const { room: roomName, username } = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(roomName).emit("message", generateMessage(username, message));
    callback("Delivered!");
  });

  // //   Acknowledging to all connections except the current one that "A new user has joined!"
  // socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  //   Acknowledging to all connections except the current one that "A new user has left!"
  //   Here disconnect and connect are built in events, so we need not emit those events, we only need to handle them or receive those events
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });

  //   Fetch locations from client
  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "sendLocation",
      generateLocation(
        user.username,
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  //   when we sending and recieving data from server and clinet, we actually generating events
  //   socket.emit("countUpdated", count);
  //   socket.on("increment", () => {
  // count += 1;
  // we won't use here socket.emit("countUpdated", count), as it will only show result to that particular connection from where it is incremented, but we want to make sure all the connections could see the incrementing.
  // io.emit("countUpdated", count);
  //   });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
