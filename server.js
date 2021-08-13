"use stritc";

const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
/** Version 2 of socket.io is used because it only connetcs to
 *flutter app for now
*/
const io =  require('socket.io')(server);


// const { Server } = require('socket.io');
// const io = new Server(server, {
  // cors:{
    // origin: '*',
    // origin: 'http://localhost:8081',
    // origin: ['http://localhost:8080', 'http://localhost:8081'], 
    // credentials: true,
    // allowedHeaders: ["my-custom-header"],
    // methods: ["GET", "POST"]   
  // },
//   cors: true,
// });


io.on("connection", (socket)=>{
  console.log("socket connected");
  let {handshake:{headers}} = socket;
  console.log({headers});
  socket.emit("connection", Math.random().toFixed(4));
  socket.emit('flutter', Math.random().toFixed(4));
  socket.on("flutter", (data)=>{
    console.log(data);
    socket.emit('flutter', Math.random().toFixed(4));
  });
})

io.on('disconnect', () => {
  console.log('socket disconnected');
});

module.exports = {express, app, server, io};
