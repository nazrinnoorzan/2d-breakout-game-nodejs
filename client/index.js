let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

// var randomColor;

// // ball
// let x;
// let y;
// var dx = 2;
// var dy = -2;
// var ballRadius = 10;

// // paddle
// var paddleHeight = 10;
// var paddleWidth = 75;
// var paddleX = (canvas.width - paddleWidth) / 2;
// var rightPressed = false;
// var leftPressed = false;

// // brick
// var brickRowCount = 3;
// var brickColumnCount = 5;
// var brickWidth = 75;
// var brickHeight = 20;
// var brickPadding = 10;
// var brickOffsetTop = 30;
// var brickOffsetLeft = 30;

// // score & lives
// var score = 0;
// var lives = 3;

// var bricks = [];
// for (var c = 0; c < brickColumnCount; c++) {
//   bricks[c] = [];
//   for (var r = 0; r < brickRowCount; r++) {
//     bricks[c][r] = { x: 0, y: 0, status: 1 };
//   }
// }

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

  // draw circle on canvas
  draw();
});

function drawBall() {
  if (gameData) {
    const { x, y } = gameData;
    // console.log({ x, y });

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

function draw() {
  socket.emit('runGame');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();

  requestAnimationFrame(draw);
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

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

// function drawBall() {
//   ctx.beginPath();
//   ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
//   ctx.fillStyle = `#${randomColor}`;
//   ctx.fill();
//   ctx.closePath();
// }

// function drawPaddle() {
//   ctx.beginPath();
//   ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
//   ctx.fillStyle = '#0095DD';
//   ctx.fill();
//   ctx.closePath();
// }

// function drawBricks() {
//   for (var c = 0; c < brickColumnCount; c++) {
//     for (var r = 0; r < brickRowCount; r++) {
//       if (bricks[c][r].status == 1) {
//         var brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
//         var brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
//         bricks[c][r].x = brickX;
//         bricks[c][r].y = brickY;
//         ctx.beginPath();
//         ctx.rect(brickX, brickY, brickWidth, brickHeight);
//         ctx.fillStyle = '#0095DD';
//         ctx.fill();
//         ctx.closePath();
//       }
//     }
//   }
// }

// function draw() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   drawBricks();
//   drawBall();
//   drawPaddle();
//   drawScore();
//   drawLives();
//   collisionDetection();

//   x += dx;
//   y += dy;

//   if (x > canvas.width - ballRadius || x < ballRadius) {
//     randomColor = Math.floor(Math.random() * 16777215).toString(16);
//     dx = -dx;
//   }

//   if (y < ballRadius) {
//     randomColor = Math.floor(Math.random() * 16777215).toString(16);
//     dy = -dy;
//   } else if (y > canvas.height - ballRadius) {
//     if (x > paddleX && x < paddleX + paddleWidth) {
//       dy = -dy;
//     } else {
//       lives--;
//       if (!lives) {
//         alert('GAME OVER');
//         document.location.reload();
//       } else {
//         x = canvas.width / 2;
//         y = canvas.height - 30;
//         dx = 2;
//         dy = -2;
//         paddleX = (canvas.width - paddleWidth) / 2;
//       }
//     }
//   }

//   if (rightPressed) {
//     paddleX += 7;
//     if (paddleX + paddleWidth > canvas.width) {
//       paddleX = canvas.width - paddleWidth;
//     }
//   } else if (leftPressed) {
//     paddleX -= 7;
//     if (paddleX < 0) {
//       paddleX = 0;
//     }
//   }

//   requestAnimationFrame(draw);
// }

// function collisionDetection() {
//   for (var c = 0; c < brickColumnCount; c++) {
//     for (var r = 0; r < brickRowCount; r++) {
//       var b = bricks[c][r];
//       if (b.status == 1) {
//         if (
//           x > b.x &&
//           x < b.x + brickWidth &&
//           y > b.y &&
//           y < b.y + brickHeight
//         ) {
//           randomColor = Math.floor(Math.random() * 16777215).toString(16);
//           dy = -dy;
//           b.status = 0;
//           score++;
//           if (score == brickRowCount * brickColumnCount) {
//             alert('YOU WIN, CONGRATULATIONS!');
//             document.location.reload();
//           }
//         }
//       }
//     }
//   }
// }

// function drawScore() {
//   ctx.font = '16px Arial';
//   ctx.fillStyle = '#0095DD';
//   ctx.fillText('Score: ' + score, 8, 20);
// }

// function drawLives() {
//   ctx.font = '16px Arial';
//   ctx.fillStyle = '#0095DD';
//   ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
// }

// document.addEventListener('keydown', keyDownHandler, false);
// document.addEventListener('keyup', keyUpHandler, false);
// document.addEventListener('mousemove', mouseMoveHandler, false);

// function keyDownHandler(e) {
//   if (e.key == 'Right' || e.key == 'ArrowRight') {
//     rightPressed = true;
//   } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
//     leftPressed = true;
//   }
// }

// function keyUpHandler(e) {
//   if (e.key == 'Right' || e.key == 'ArrowRight') {
//     rightPressed = false;
//   } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
//     leftPressed = false;
//   }
// }

// function mouseMoveHandler(e) {
//   var relativeX = e.clientX - canvas.offsetLeft;
//   if (relativeX > 0 && relativeX < canvas.width) {
//     paddleX = relativeX - paddleWidth / 2;
//   }
// }
