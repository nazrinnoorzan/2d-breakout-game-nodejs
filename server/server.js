const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const NodeCache = require('node-cache');

const cache = new NodeCache();
const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

//canvas
const canvasWidth = 480;
const canvasHeight = 320;
const paddleHeight = 10;
const paddleWidth = 75;

// ball
// let ballRadius = 10;
// let positionX;
// let positionY;
// let dx = 2;
// let dy = -2;

// function defaultGame(canvas) {
//   x = canvas.width / 2;
//   y = canvas.height - 30;
//   dx = 2;
//   dy = -2;

//   return { x, y, dx, dy };
// }

const defaultState = {
  canvasWidth,
  canvasHeight,
  ballRadius: 10,
  x: canvasWidth / 2,
  y: canvasHeight - 30,
  dx: 2,
  dy: -2,
  paddleHeight,
  paddleWidth,
  paddleX: (canvasWidth - paddleWidth) / 2,
  rightPressed: false,
  leftPressed: false,
};

io.on('connection', (socket) => {
  console.log('User connected...');

  if (!cache.has(socket.id)) {
    cache.set(socket.id, defaultState);
  }

  socket.on('runGame', () => {
    socket.emit('gameLogic', gameLogic(socket.id));
  });

  socket.on('rightPressed', (bool) => {
    const user = cache.get(socket.id);
    cache.set(socket.id, { ...user, rightPressed: bool });
  });

  socket.on('leftPressed', (bool) => {
    const user = cache.get(socket.id);
    cache.set(socket.id, { ...user, leftPressed: bool });
  });

  // receive default ball x,y position
  // socket.on('canvas', ({ width, height }) => {
  //   canvasWidth = width;
  //   canvasHeight = height;
  //   positionX = canvasWidth / 2;
  //   positionY = canvasHeight - 30;
  // });

  // keep updating x,y position
  // let broadcastGameLogic = setInterval(() => {
  //   socket.emit('gameLogic', gameLogic());
  // }, 10);

  socket.on('disconnect', () => {
    cache.del(socket.id);
  });
});

function gameLogic(token) {
  const user = cache.get(token);

  let { ballRadius, x, y, dx, dy, rightPressed, leftPressed, paddleX } = user;

  x += dx;
  y += dy;

  cache.set(token, { ...user, x, y });

  if (x + dx > canvasWidth - ballRadius || x + dx < ballRadius) {
    dx = -dx;
    cache.set(token, { ...user, dx });
  }

  if (y + dy < ballRadius) {
    dy = -dy;
    cache.set(token, { ...user, dy });
  } else if (y + dy > canvasHeight - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
      cache.set(token, { ...user, dy });
    } else {
      io.to(token).emit('gameOver', 'GAME OVER');
    }
  }

  if (rightPressed) {
    paddleX += 7;
    cache.set(token, { ...user, paddleX, dx, dy, x, y });
    if (paddleX + paddleWidth > canvasWidth) {
      paddleX = canvasWidth - paddleWidth;
      cache.set(token, { ...user, paddleX, dx, dy, x, y });
    }
  } else if (leftPressed) {
    paddleX -= 7;
    cache.set(token, { ...user, paddleX, dx, dy, x, y });
    if (paddleX < 0) {
      paddleX = 0;
      cache.set(token, { ...user, paddleX, dx, dy, x, y });
    }
  }

  return user;
}

server.on('error', (err) => {
  console.error(err);
});

server.listen(3000, () => {
  console.log('Server is ready...');
});
