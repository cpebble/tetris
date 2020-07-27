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
    "rotate": 87,
    "pause": 8
}

/// Spawn the canvas and init the grid to size
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
/// Handles running game-updates and drawing. 
function draw() {
    // Check for updates
    if (!paused && millis() > nextMoveUpdate)
    {
        nextMoveUpdate = millis() + moveTick;
        updateMove();
    }
    if (!paused && millis() > nextGameUpdate)
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
/// The function that updates the game logic, Handles movement and checks lines
function updateGame() {
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
    let newBag = shuffle([1,2,3,4,5,6,7]);
    newBag.forEach(t=>{
        pieceBag.push(t);
    });
}
/// This is a simple check for moving the piece
function updateMove() {
    // We check if the key is down AND the move is legal, then move that dir
    if (keyIsDown(controls.left) && tryMoveHorizontal(-1))
        current.x -= 1;
    if (keyIsDown(controls.right) && tryMoveHorizontal(1))
        current.x += 1;
    // Rotate is slightly more complex move, so wrap that in a seperate func
    if (keyIsDown(controls.rotate))
        rotateCurrent()
    // This is basically a soft drop, but i'll get back to it
    if (keyIsDown(controls.down) && tryMoveDown())
        current.y += 1;
}

/// Ok, right now it isn't that complex
function rotateCurrent()
{
    // Improve you Simp
    current.rotation = (current.rotation + 1) % 4;
}

/// Draw the grid as an overlay. Without this tetris looks weird o.O
function drawGrid(){
    // We use a thick gray-outlined box
    noFill()
    stroke("gray");
    strokeWeight(gutterWidth)
    // Standard rectangle grid drawing
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            rect(c*blockWidth, r*blockWidth, blockWidth, blockWidth )
        }
    }
}
/// Draw the placed blocks
function drawBlocks(){
    // This time we use a filled block, with the 
    noStroke();
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            // Could be slightly improved to account for all the redraws of white blocks
            fill(colors[grid[r][c]]);
            rect(c*blockWidth, r*blockWidth, blockWidth, blockWidth)
        }
    }
}
/// Draw the current shape
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

function keyPressed(){
    if (keyCode == controls.pause)
        paused = !paused;
}

function windowResized() {
    // Just in case i encounter drawing issues with small -> large screen
    resizeCanvas(windowWidth, windowHeight);
}