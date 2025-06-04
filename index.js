const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  const totalUsers = io.engine.clientsCount;

  // Broadcast to everyone (including the new user)
  io.emit("new user", {
    nickname: `Guest${totalUsers}`,
    totalUsers: totalUsers,
  });

  socket.on("set nickname", (name) => {
    socket.broadcast.emit("set nickname", {
      nickname: name,
      text: "has joined the chat",
    }); // sends new user event to all but the initiating socket
    socket.id = name; // stores the user nickname in the socket id so disconnecting prints who left
  });

  socket.on("messages", (message) => {
    console.log("messages", message);
    socket.broadcast.emit("messages", {
      message: message,
      username: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    const updatedCount = io.engine.clientsCount;
    io.emit("disconnected", {
      totalUsers: updatedCount,
      userName: socket.id,
    });
  });
});

server.listen(8080, () => {
  console.log("internally listening on *:8080, externally *:3000");
});
