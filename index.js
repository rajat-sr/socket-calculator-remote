const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const PORT = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let calculations = [];

if (fs.existsSync('./calculation-data.json')) {
  calculations = require('./calculation-data.json');
}

io.on('connection', socket => {
  console.log('New client connected');
  io.emit('logs', { calculations });

  socket.on('new calculation', data => {
    calculations.push(data);

    const size = calculations.length;
    if (size > 10) {
      calculations = calculations.slice(size - 10, size);
    }

    fs.writeFile('./calculation-data.json', JSON.stringify(calculations), err => {
      console.log('Unable to write to the file.');
    });

    io.emit('logs', { calculations });
  });

  socket.on('disconnect', () => console.log('Client disconnected'));
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
