const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const appServer = createServer(app);
const io = new Server(appServer);
const usernames = {};

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/indexchat.html");
});

io.on('connection', (socket) => {
    console.log('User Connected...');
    
    socket.on('message', (msg) => {
        socket.to(socket.room).emit('message', msg);
    });
    
    socket.on('adduser', (username, roomname) => {
        socket.join(roomname);
        socket.room = roomname;
        socket.username = username;
        usernames[username + "_" + roomname] = username;
        io.sockets.in(socket.room).emit('updateusers', usernames);
        socket.emit('greeting', username);
    });
    
    socket.on('uploadImage', (data, username) => {
        socket.to(socket.room).emit('publishImage', data, username);
    });
    
    socket.on('uploadFile', (data, username, fileName) => {
        socket.to(socket.room).emit('publishFile', data, username, fileName);
    });
    
    socket.on('disconnect', () => {
        console.log("User Disconnected");
        delete usernames[socket.username + '_' + socket.room];
        socket.leave(socket.room);
        socket.to(socket.room).emit('updateusers', usernames);
    });
});

appServer.listen(1000, () => {
    console.log("server is running at http://localhost:1000");
});
