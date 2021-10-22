const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

//canvas
let canvasWidth;
let canvasHeight;

// ball
let ballRadius = 10;
let positionX;
let positionY;
let dx = 2;
let dy = -2;

// function defaultGame(canvas) {
//   x = canvas.width / 2;
//   y = canvas.height - 30;
//   dx = 2;
//   dy = -2;

//   return { x, y, dx, dy };
// }

io.on('connection', (socket) => {
  console.log('User connected...');

  // receive default ball x,y position
  socket.on('canvas', ({ width, height }) => {
    canvasWidth = width;
    canvasHeight = height;
    positionX = canvasWidth / 2;
    positionY = canvasHeight - 30;
  });

  // keep updating x,y position
  let broadcastGameLogic = setInterval(() => {
    socket.emit('gameLogic', gameLogic());
  }, 10);

  socket.on('disconnect', () => {
    clearInterval(broadcastGameLogic);
  });
});

function gameLogic() {
  positionX += dx;
  positionY += dy;

  if (
    positionX + dx > canvasWidth - ballRadius ||
    positionX + dx < ballRadius
  ) {
    dx = -dx;
  }
  if (
    positionY + dy > canvasHeight - ballRadius ||
    positionY + dy < ballRadius
  ) {
    dy = -dy;
  }

  return { positionX, positionY };
}

server.on('error', (err) => {
  console.error(err);
});

server.listen(3000, () => {
  console.log('Server is ready...');
});
