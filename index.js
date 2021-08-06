const http = require('http');
const express = require("express");
const app = express();
const server = http.createServer(app);

const io =require('socket.io')(server);

io.on('connection', (socket)=>{
  console.log('connected');
  socket.on("flutter", (data)=>{
    console.log(data);
    socket.emit('flutter', Math.random().toFixed(4));
  });

  socket.emit('flutter', Math.random().toFixed(4));
})

io.on('disconect', ()=>{
  console.log("socket disconnected");
})

app.get('/', (req,res)=>{
  console.log("working fine");
  res.status(200).json({success:true});
})


server.listen(5555, ()=>{
  console.log("severd");
})