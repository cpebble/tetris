let cnv;
// Grid internals
let grid = []
const rows = 16;
const columns = 8;
let current = {"x": 2,"y": 0, "type": 1, "rotation": 0};
// Ticks
const gameTick = 500;
const moveTick = gameTick / 3;
let nextGameUpdate = gameTick;
let nextMoveUpdate = moveTick;
// Drawing consts
const gutterWidth = 2;
const blockWidth = 48;
const colors = {
    0: "#FFFFFF",
    1: "cyan", // I
    2: "blue", // J
    3: "orange", // L
    4: "yellow", // O
    5: "green", // S
    6: "purple", // T
    7: "red" // Z
}
const controls = {
    "left": 65,
    "right": 68,
    "down": 83,
    "rotate": 87
}
function setup() {
    cnv = createCanvas(windowWidth, windowHeight)
    cnv.style("display", "block");
    // cnv.style("position", "absolute");
    cnv.parent("body")
    for (let r = 0; r < rows; r++) {
        grid.push([]);
        for (let c = 0; c < columns; c++) {
            grid[r].push(0);
        }
    }
}
function draw() {
    // Check for updates
    if (millis() > nextMoveUpdate)
    {
        nextMoveUpdate = millis() + moveTick;
        updateMove();
    }
    if (millis() > nextGameUpdate)
    {
        nextGameUpdate = millis() + gameTick;
        updateGame();
    }
    // Draw game board
    translate(blockWidth, blockWidth)
    drawBlocks()
    drawGrid()
    drawCurrent();
}
function updateGame() {
    let canMoveDown = tryMoveDown()
    if (canMoveDown)
    {
        current.y += 1;
    }
    else {
        console.log("cantMove")
        addToGrid();
        nextPiece();
    }
}
function getCurrentShape (){return shapes[current.type][current.rotation]}
function tryMoveDown() {
    // return true;
    let s = getCurrentShape()
    for (let r = 0; r < s.length; r++) {
        for (let c = 0; c < s.length; c++) {
            if (s[r][c] == 1){
                let c_ = current.x+c
                let r_ = current.y+r
                try {
                    if (grid[r_ + 1][c_] != 0)
                        return false;
                } catch (error) {
                    return false;
                }
            }
        }
    }
    return true;
}
function tryMoveHorizontal(dir) {
    // return true;
    let s = getCurrentShape()
    for (let r = 0; r < s.length; r++) {
        for (let c = 0; c < s.length; c++) {
            if (s[r][c] == 1){
                let c_ = current.x+c
                let r_ = current.y+r
                try {
                    if (grid[r_][c_+dir] != 0)
                        return false;
                } catch (error) {
                    return false;
                }
            }
        }
    }
    return true;
}
function addToGrid() {
    let s = getCurrentShape()
    for (let r = 0; r < s.length; r++) {
        for (let c = 0; c < s[0].length; c++) {
            if (s[r][c] == 1){
                let c_ = current.x+c
                let r_ = current.y+r
                grid[r_][c_] = current.type;
            }
        }
    }
}

function nextPiece() {
    let newPiece = Math.ceil(Math.random() * 7)
    current.x = 2;
    current.y = 0;
    current.rotation = 0;
    current.type = newPiece;
}
function updateMove() {
    // Check move left
    if (keyIsDown(controls.left) && tryMoveHorizontal(-1))
        current.x -= 1;
    if (keyIsDown(controls.right) && tryMoveHorizontal(1))
        current.x += 1;
    if (keyIsDown(controls.rotate))
        rotateCurrent()
    if (keyIsDown(controls.down) && tryMoveDown())
        current.y += 1;
}

function rotateCurrent()
{
    current.rotation = (current.rotation + 1) % 4;
}

function drawGrid(){
    noFill()
    stroke("gray");
    strokeWeight(gutterWidth)
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            rect(c*blockWidth, r*blockWidth, blockWidth, blockWidth )
        }
    }
}
function drawBlocks(){
    noStroke();
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            fill(colors[grid[r][c]]);
            rect(c*blockWidth, r*blockWidth, blockWidth, blockWidth )
        }
    }
}
function drawCurrent(){
    fill(colors[current.type])
    let s = getCurrentShape()
    for (let r = 0; r < s.length; r++) {
        for (let c = 0; c < s.length; c++) {
            if (s[r][c] == 1)
                rect((current.x+c)*blockWidth, (current.y+r)*blockWidth, blockWidth, blockWidth )
        }
    }
}

function mousePressed() {
    // spawn_circle(mouseX, mouseY, 50);
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}