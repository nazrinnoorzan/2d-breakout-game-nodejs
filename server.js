const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const NodeCache = require('node-cache');

const cache = new NodeCache();
const app = express();

app.use(express.static(`${__dirname}/client`));

const server = http.createServer(app);
const io = socketio(server);

// constants
const canvasWidth = 480;
const canvasHeight = 320;
const paddleHeight = 10;
const paddleWidth = 75;
const brickColumnCount = 5;
const brickRowCount = 3;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// bricks layout
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
    let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
    bricks[c][r] = { x: brickX, y: brickY, status: 1 };
  }
}

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
  brickRowCount,
  brickColumnCount,
  brickWidth,
  brickHeight,
  bricks,
  score: 0,
  lives: 3,
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

  socket.on('mouseMove', (mouseX) => {
    if (mouseX > 0 && mouseX < canvasWidth) {
      const user = cache.get(socket.id);
      cache.set(socket.id, { ...user, paddleX: mouseX - paddleWidth / 2 });
    }
  });

  socket.on('disconnect', () => {
    cache.del(socket.id);
  });
});

function gameLogic(token) {
  const user = cache.get(token);
  let {
    ballRadius,
    x,
    y,
    dx,
    dy,
    rightPressed,
    leftPressed,
    paddleX,
    score,
    lives,
  } = user;

  x += dx;
  y += dy;

  cache.set(token, { ...user, x, y });

  collisionDetection(token);

  if (score == brickRowCount * brickColumnCount) {
    io.to(token).emit('gameOver', 'YOU WIN, CONGRATULATIONS!');
  }

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
      lives--;
      if (!lives) {
        io.to(token).emit('gameOver', 'GAME OVER');
      } else {
        cache.set(token, {
          ...user,
          x: canvasWidth / 2,
          y: canvasHeight - 30,
          dx: 2,
          dy: -2,
          paddleX: (canvasWidth - paddleWidth) / 2,
          lives,
        });
      }
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

function collisionDetection(token) {
  const user = cache.get(token);
  let { bricks, x, y, dy, brickWidth, brickHeight, score } = user;

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status == 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          bricks[c][r] = { ...bricks[c][r], status: 0 };
          score++;
          cache.set(token, { ...user, dy, bricks, score });
        }
      }
    }
  }
}

server.on('error', (err) => {
  console.error(err);
});

server.listen(3000, () => {
  console.log('Server is ready...');
});