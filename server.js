const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('build'));

io.on('connection', (socket) => {
  console.log('user connected');
  console.log(socket.handshake.headers.referer);

  socket.on('mouseup', () => {
    console.log('mouse up');
    socket.broadcast.emit('mouseup');
  });

  socket.on('mousedown', (x, y) => {
    // console.log(`mousedown: ${x} ${y}`);
    socket.broadcast.emit('mousedown', { x, y });
  });

  socket.on('mousemove', (x, y) => {
    // console.log(`mousemove: ${x} ${y}`);
    socket.broadcast.emit('mousemove', { x, y });
  });
});

http.listen(3000, () => {
  console.log('server started at port 3000');
});
