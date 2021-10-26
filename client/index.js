let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');
let gameData;
let startGame = false;
let loading = true;
let loadingText = 'Loading';

const paddleWidth = 75;
const paddleHeight = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

const socket = io();

socket.on('connect', () => {
  console.log('You are connected...');

  // receive latest game data
  socket.on('gameLogic', (user) => {
    gameData = user;
    startGame = true;
    console.log('server to client', new Date().toLocaleTimeString());
  });

  // socket.on('collideWallX', (value) => {
  //   dx = value;
  // });

  // socket.on('collideWallY', (value) => {
  //   dy = value;
  // });

  socket.on('resetGame', () => {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;
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
  // if (gameData) {
  //   const { paddleX, canvasHeight } = gameData;

  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
  // }
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

function drawLoading() {
  ctx.fillStyle = '#FFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '15pt Arial';
  ctx.fillStyle = '#000';
  ctx.fillText(loadingText, 200, 200);
  if (loadingText == 'Loading.....') {
    loadingText = 'Loading';
  }
  loadingText = loadingText + '.';
}

function draw() {
  console.log('client to server', new Date().toLocaleTimeString());
  socket.emit('runGame', new Date().toLocaleTimeString());
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (startGame) {
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();

    // x += dx;
    // y += dy;

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
      socket.emit('rightPressed', true);
      paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
      socket.emit('leftPressed', true);
      paddleX -= 7;
    }
  } else {
    drawLoading();
  }

  requestAnimationFrame(draw);
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    // socket.emit('rightPressed', true);
    rightPressed = true;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    // socket.emit('leftPressed', true);
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    // socket.emit('rightPressed', false);
    rightPressed = false;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    // socket.emit('leftPressed', false);
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.offsetLeft;
  // socket.emit('mouseMove', relativeX);
}
