const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

// game start
let startGame = true;

//canvas
let canvasWidth;
let canvasHeight;

// ball
let ballRadius = 10;
let positionX;
let positionY;
let dx = 2;
let dy = -2;

// paddle
let paddleHeight = 10;
let paddleWidth = 75;
var paddlePositionX;
let rightPressed = false;
let leftPressed = false;

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
    paddlePositionX = (canvasWidth - paddleWidth) / 2;
  });

  socket.on('rightPressed', (bool) => (rightPressed = bool));
  socket.on('leftPressed', (bool) => (leftPressed = bool));

  // keep updating x,y,paddleX positions
  let broadcastGameLogic = setInterval(() => {
    socket.emit('gameLogic', gameLogic());

    if (!startGame) {
      socket.emit('gameState', 'GAME OVER');
    }
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

  if (positionY + dy < ballRadius) {
    dy = -dy;
  } else if (positionY + dy > canvasHeight - ballRadius) {
    if (
      positionX > paddlePositionX &&
      positionX < paddlePositionX + paddleWidth
    ) {
      dy = -dy;
    } else {
      startGame = false;
    }
  }

  if (rightPressed) {
    paddlePositionX += 7;
    if (paddlePositionX + paddleWidth > canvasWidth) {
      paddlePositionX = canvasWidth - paddleWidth;
    }
  } else if (leftPressed) {
    paddlePositionX -= 7;
    if (paddlePositionX < 0) {
      paddlePositionX = 0;
    }
  }

  return { positionX, positionY, paddlePositionX };
}

server.on('error', (err) => {
  console.error(err);
});

server.listen(3000, () => {
  console.log('Server is ready...');
});
