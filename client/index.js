let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');
let gameData;

const socket = io();

socket.on('connect', () => {
  console.log('You are connected...');

  // receive latest game data
  socket.on('gameLogic', (user) => {
    gameData = user;
  });

  socket.on('gameOver', (text) => {
    alert(text);
    document.location.reload();
  });

  // render on canvas
  draw();
});

function drawBall() {
  if (gameData) {
    const { x, y } = gameData;

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  }
}

function drawPaddle() {
  if (gameData) {
    const { paddleX, canvasHeight, paddleHeight, paddleWidth } = gameData;

    ctx.beginPath();
    ctx.rect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  }
}

function drawBricks() {
  if (gameData) {
    const { brickColumnCount, brickRowCount, brickWidth, brickHeight, bricks } =
      gameData;

    for (var c = 0; c < brickColumnCount; c++) {
      for (var r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status == 1) {
          ctx.beginPath();
          ctx.rect(bricks[c][r].x, bricks[c][r].y, brickWidth, brickHeight);
          ctx.fillStyle = '#0095DD';
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }
}

function drawScore() {
  if (gameData) {
    const { score } = gameData;

    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Score: ' + score, 8, 20);
  }
}

function drawLives() {
  if (gameData) {
    const { lives } = gameData;

    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
  }
}

function draw() {
  // socket.emit('runGame');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();

  requestAnimationFrame(draw);
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    socket.emit('rightPressed', true);
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    socket.emit('leftPressed', true);
  }
}

function keyUpHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    socket.emit('rightPressed', false);
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    socket.emit('leftPressed', false);
  }
}

function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  socket.emit('mouseMove', relativeX);
}
