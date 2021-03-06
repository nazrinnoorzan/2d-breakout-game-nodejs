let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

// store latest ball position, score, lives, .etc
let gameData;

// if true, client will start receive game data
let startGame = false;

let loading = true;
let loadingText = 'Loading';

// variable related to paddle & user action
const paddleWidth = 75;
const paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let mouseRelativeX;

// default user action data to be sent to server
const userAction = {
  timestamp: new Date().toLocaleTimeString(),
  rightPressed,
  leftPressed,
  mouseRelativeX,
};

const socket = io();

socket.on('connect', () => {
  console.log('You are connected...');

  // receive latest game data
  socket.on('gameLogic', (user) => {
    gameData = user;
    startGame = true;
    // console.log('server to client', new Date().toLocaleTimeString());
  });

  // reset paddle to default position
  socket.on('resetGame', () => {
    paddleX = (canvas.width - paddleWidth) / 2;
  });

  // alert window after game end (either win or lose)
  socket.on('gameOver', (text) => {
    alert(text);
    document.location.reload();
  });

  // render on canvas
  draw();
});

function drawBall() {
  if (gameData) {
    // constantly get the latest ball position from the server
    const { x, y } = gameData;

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  }
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
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
  // console.log('client to server', new Date().toLocaleTimeString());

  // keep sending to server so that server start moving the ball & knows user action
  socket.emit('runGame', {
    ...userAction,
    rightPressed,
    leftPressed,
    mouseRelativeX,
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // only start render the object when startGame is true
  if (startGame) {
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
      paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
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
    rightPressed = true;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    rightPressed = false;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  mouseRelativeX = e.clientX - canvas.offsetLeft;
  if (mouseRelativeX > 0 && mouseRelativeX < canvas.width) {
    paddleX = mouseRelativeX - paddleWidth / 2;
  }
}
