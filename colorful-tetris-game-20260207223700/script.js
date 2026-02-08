const canvas = document.getElementById('tetrisCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const startButton = document.getElementById('startButton');
const generationTimestampSpan = document.getElementById('generation-timestamp'); // Get the span

// Set generation timestamp
if (generationTimestampSpan) {
    generationTimestampSpan.textContent = new Date().toLocaleString();
}

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = canvas.width / COLS; // 300 / 10 = 30px

let board = [];
let currentPiece;
let currentPieceX;
let currentPieceY;
let score = 0;
let gameOver = false;
let gameInterval;
let gameSpeed = 500; // milliseconds

// Tetrominoes definitions (shape and color)
const TETROMINOES = [
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#800080' // Purple (T)
    },
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFFF00' // Yellow (O)
    },
    {
        shape: [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        color: '#00FFFF' // Cyan (I)
    },
    {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000FF' // Blue (J)
    },
    {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#FFA500' // Orange (L)
    },
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#008000' // Green (S)
    },
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#FF0000' // Red (Z)
    }
];

// Function to draw a single block
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000'; // Block border
    ctx.lineWidth = 1;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Function to draw the current piece
function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                drawBlock(currentPieceX + x, currentPieceY + y, currentPiece.color);
            }
        });
    });
}

// Function to initialize the board
function initBoard() {
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = 0; // 0 represents an empty cell
        }
    }
}

// Function to draw the entire board
function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(x, y, value); // value holds the color of the block
            }
        });
    });
}

// Function to generate a random tetromino
function generatePiece() {
    const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
    return JSON.parse(JSON.stringify(TETROMINOES[randomIndex])); // Deep copy to avoid reference issues
}

// Function to place a new piece at the top
function newPiece() {
    currentPiece = generatePiece();
    currentPieceX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPieceY = 0;

    if (!isValidMove(currentPieceX, currentPieceY, currentPiece.shape)) {
        gameOver = true;
        clearInterval(gameInterval);
        alert('Game Over! Score: ' + score);
        startButton.textContent = 'Play Again';
        startButton.disabled = false;
    }
}

// Collision detection
function isValidMove(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col] === 1) {
                let boardX = x + col;
                let boardY = y + row;

                // Check boundaries
                if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                    return false;
                }
                // Check collision with existing blocks on the board
                if (boardY < 0) continue; // Allow pieces to start above the board
                if (board[boardY][boardX] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Function to lock the current piece to the board
function lockPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 1) {
                board[currentPieceY + y][currentPieceX + x] = currentPiece.color;
            }
        });
    });
}

// Function to clear full lines
function clearLines() {
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            linesCleared++;
            // Remove the full line and add an empty line at the top
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100; // Basic scoring
        scoreDisplay.textContent = 'Score: ' + score;

        // Increase game speed for every 5 lines cleared
        if (score % 500 === 0 && gameSpeed > 100) {
            gameSpeed -= 50;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }
}

// Game Loop
function gameLoop() {
    if (gameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw board
    drawBoard();

    // Move piece down
    if (isValidMove(currentPieceX, currentPieceY + 1, currentPiece.shape)) {
        currentPieceY++;
    } else {
        // Piece landed, lock it and check for line clears
        lockPiece();
        clearLines();
        newPiece(); // Generate new piece
    }

    // Draw current piece
    drawPiece();
}

// Keyboard controls
document.addEventListener('keydown', e => {
    if (gameOver) return;

    if (e.key === 'ArrowLeft') {
        if (isValidMove(currentPieceX - 1, currentPieceY, currentPiece.shape)) {
            currentPieceX--;
        }
    } else if (e.key === 'ArrowRight') {
        if (isValidMove(currentPieceX + 1, currentPieceY, currentPiece.shape)) {
            currentPieceX++;
        }
    } else if (e.key === 'ArrowDown') {
        if (isValidMove(currentPieceX, currentPieceY + 1, currentPiece.shape)) {
            currentPieceY++;
            score += 1; // Soft drop score
            scoreDisplay.textContent = 'Score: ' + score;
        }
    } else if (e.key === 'ArrowUp') {
        // Rotate piece
        const rotatedShape = rotate(currentPiece.shape);
        if (isValidMove(currentPieceX, currentPieceY, rotatedShape)) {
            currentPiece.shape = rotatedShape;
        }
    } else if (e.key === ' ') {
        // Hard drop
        while (isValidMove(currentPieceX, currentPieceY + 1, currentPiece.shape)) {
            currentPieceY++;
            score += 2; // Hard drop score
        }
        scoreDisplay.textContent = 'Score: ' + score;
        lockPiece();
        clearLines();
        newPiece();
    }
    // Redraw immediately after movement/rotation
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece();
});

// Function to rotate a matrix (tetromino shape)
function rotate(matrix) {
    const N = matrix.length;
    const rotated = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
            rotated[c][N - 1 - r] = matrix[r][c];
        }
    }
    return rotated;
}

// Start Game / Restart Game
function startGame() {
    initBoard();
    score = 0;
    scoreDisplay.textContent = 'Score: 0';
    gameOver = false;
    gameSpeed = 500;
    newPiece();
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(gameLoop, gameSpeed);
    startButton.disabled = true;
    startButton.textContent = 'Game Running';
}

startButton.addEventListener('click', startGame);

// Initial call to draw the empty board when page loads
initBoard();
drawBoard();