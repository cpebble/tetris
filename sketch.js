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
// Game stuff
let paused = false;
let score = 0;
let pieceBag = [];
let lostGame = false;
// Drawing consts
const gutterWidth = 2;
const blockWidth = 48;
const colors = {
    0: "#ffffff",
    1: "#01ffff", // I
    2: "#0000ff", // J
    3: "#feaa00", // L
    4: "#ffff00", // O
    5: "#00ff03", // S
    6: "#9900fe", // T
    7: "#ff0100", // Z
}
const controls = {
    "left": 65,
    "right": 68,
    "down": 83,
    "rotate": 87,
    "pause": 8
}
let Sketch = function(sk) {
    sk.setup = ()=>{Setup(sk)}
    sk.draw = ()=>{Draw(sk)}
    sk.keyPressed = ()=>{KeyPressed(sk)}
}
/// Spawn the canvas and init the grid to size
function Setup(sk) {
    let maxWidth = columns*blockWidth;
    let maxHeight = rows*blockWidth
    cnv = sk.createCanvas(maxWidth, maxHeight);
    cnv.style("display", "block");
    // cnv.style("position", "absolute");
    cnv.parent("tetris-container");
    for (let r = 0; r < rows; r++) {
        grid.push([]);
        for (let c = 0; c < columns; c++) {
            grid[r].push(0);
        }
    }
    fillBag();
}
/// Handles running game-updates and drawing. 
function Draw(sk) {
    // Check for updates
    if (!paused && sk.millis() > nextMoveUpdate)
    {
        nextMoveUpdate = sk.millis() + moveTick;
        updateMove(sk);
    }
    if (!paused && sk.millis() > nextGameUpdate)
    {
        nextGameUpdate = sk.millis() + gameTick;
        updateGame(sk);
    }
    // Draw game board
    drawBlocks(sk);
    drawGrid(sk);
    drawCurrent(sk);
}
/// The function that updates the game logic, Handles movement and checks lines
function updateGame(sk) {
    // Check top-out
    let lost = checkLossCond();
    if (lost) {lose(); return;}
    // Check if we can move the piece down
    let canMoveDown = tryMoveDown()
    if (canMoveDown)
    {
        // Increase y, don't need to do anything else really
        // Will probably run 80% of all updates so keep it light
        current.y += 1;
    }
    else {
        // Record the placement
        addToGrid();
        // Check for cleared lines here
        checkClearedLines();
        // Then generate the new piece from sack
        nextPiece();
    }
}
function lose(){
    lost = true;
    paused = true;
    alert("you died")
}
/// Helper function to handle rotation <3
function getCurrentShape (){return shapes[current.type][current.rotation]}
/// Checks if we have reached the end of a shapes drop
function tryMoveDown() {
    // We need to know which blocks to check
    let s = getCurrentShape()
    // 2D Iteration of the shape
    for (let r = 0; r < s.length; r++) {
        for (let c = 0; c < s.length; c++) {
            // If the block isn't "Solid" we don't really care to check it
            if (s[r][c] == 1){
                // And thus goes the biggest memory sink/stupid hack i wrote
                // To handle rotation

                // Translate coords local->world
                let c_ = current.x+c
                let r_ = current.y+r
                try {
                    // And check for solids
                    if (grid[r_ + 1][c_] != 0)
                        return false;
                } catch (error) {
                    // IndexErrors mean oob. Catches hitting the bottom and/or glitching oob
                    return false;
                }
            }
        }
    }
    // If no blocks hold collisions, we are able to move down
    return true;
}

/// This basically does the same as tryMoveDown, see for comments
function tryMoveHorizontal(dir) {
    let s = getCurrentShape()
    for (let r = 0; r < s.length; r++) {
        for (let c = 0; c < s.length; c++) {
            if (s[r][c] == 1){
                let c_ = current.x+c
                let r_ = current.y+r
                // OOB check
                if (c_ < 0 || c_ >= columns)
                    return false;
                try {
                    // OCC check
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
/// Log the current shape to grid. Is called after moving down
function addToGrid() {
    // This uses the same 2d iteration as the tryMoves with a simpler body
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

/// Function check rows for, and remove cleared lines
function checkClearedLines(){
    // Check top-down and collect lines to remove
    let toRemove = [];
    for (let r = 0; r < grid.length; r++)
    {
        let clear = true;
        for (let c = 0; c < grid[0].length; c++)
        {
            if (grid[r][c] == 0){
                clear = false;
                break
            }
        }
        if (clear)
            toRemove.push(r)
    }
    // Now remove those and push down
    // Runs in $O(\infty)$
    toRemove.reverse().forEach((i)=>
    {
        console.log(toRemove.reverse()[i])
        for (let r = i; r > 0; r--)
        {
            for (let c = 0; c < grid[0].length; c++)
            {
                grid[r][c] = grid[r-1][c]
            }
        }
        score += 10;
    });
    updateScore(score);
}

/// Gimme a new random piece and init the current object
function nextPiece() {
    //TODO: Use proper piece spawning
    let newPiece = getFromBag();
    current.x = 2;
    current.y = 0;
    current.rotation = 0;
    current.type = newPiece;
}
/// These two manage the random bag
function getFromBag() {
    if (pieceBag.length <= 4)
    {
        fillBag();
    }
    return pieceBag.shift();
}
function fillBag() {
    let arra1 = [1,2,3,4,5,6,7];
    var ctr = arra1.length, temp, index;

    // While there are elements in the array
    while (ctr > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * ctr);
        // Decrease ctr by 1
        ctr--;
        // And swap the last element with it
        temp = arra1[ctr];
        arra1[ctr] = arra1[index];
        arra1[index] = temp;
    }
    arra1.forEach(t=>{
        pieceBag.push(t);
    });
}

function checkLossCond() {
    // First check if current piece overlaps with game-board
    let s = getCurrentShape();
    for(let r = 0; r < s.length; r++)
    {
        for (let c = 0; c < s[0].length; c++) {
            const element = s[r][c];
            if (element != 0 && grid[r+current.y][c+current.x] != 0)
            {
                console.log("collision on new piece spawned: "+(r+current.y)
                +", "+ (c+current.x)+" with value "+ grid[r+current.y][c+current.x]);
                return true;
            }
        }
    }
    return false;
}


/// This is a simple check for moving the piece
function updateMove(sk) {
    // We check if the key is down AND the move is legal, then move that dir
    if (sk.keyIsDown(controls.left) && tryMoveHorizontal(-1))
        current.x -= 1;
    if (sk.keyIsDown(controls.right) && tryMoveHorizontal(1))
        current.x += 1;
    // Rotate is slightly more complex move, so wrap that in a seperate func
    if (sk.keyIsDown(controls.rotate))
        rotateCurrent()
    // This is basically a soft drop, but i'll get back to it
    if (sk.keyIsDown(controls.down) && tryMoveDown())
        current.y += 1;
    
    nextMoveUpdate = sk.millis() + moveTick;
}

/// Ok, right now it isn't that complex
function rotateCurrent()
{
    // Update rotation
    let old = current.rotation;
    current.rotation = (current.rotation + 1) % 4;
    // Check if shape overlaps
    let canMove = tryMoveHorizontal(0); // Checks oob and collisions so good enough
    if (!canMove)
        current.rotation = old;

}

/// Draw the grid as an overlay. Without this tetris looks weird o.O
function drawGrid(sk){
    // We use a thick gray-outlined box
    sk.noFill()
    sk.stroke("gray");
    sk.strokeWeight(gutterWidth)
    // Standard rectangle grid drawing
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            sk.rect(c*blockWidth, r*blockWidth, blockWidth, blockWidth )
        }
    }
}
/// Draw the placed blocks
function drawBlocks(sk){
    // This time we use a filled block, with the 
    sk.noStroke();
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            // Could be slightly improved to account for all the redraws of white blocks
            sk.fill(colors[grid[r][c]]);
            sk.rect(c*blockWidth, r*blockWidth, blockWidth, blockWidth)
        }
    }
}
/// Draw the current shape
function drawCurrent(sk){
    sk.fill(colors[current.type])
    let s = getCurrentShape()
    for (let r = 0; r < s.length; r++) {
        for (let c = 0; c < s.length; c++) {
            if (s[r][c] == 1)
                sk.rect((current.x+c)*blockWidth, (current.y+r)*blockWidth, blockWidth, blockWidth )
        }
    }
}

function KeyPressed(sk){
    if (!paused)
        updateMove(sk);

    if (sk.keyCode == controls.pause)
        paused = !paused;
}

// function windowResized() {
//     // Just in case i encounter drawing issues with small -> large screen
//     resizeCanvas(windowWidth, windowHeight);
// }
new p5(Sketch);