let NBSketch = function(sk) {

    let NBcnv;
    // Grid internals
    /// Spawn the canvas and init the grid to size
    sk.setup = ()=>{
        // Max size is 4*4 for blue guy
        let maxWidth = 4*blockWidth;
        let maxHeight = 4*blockWidth
        NBcnv = sk.createCanvas(maxWidth, maxHeight);
        NBcnv.style("display", "block");
        // NBcnv.style("position", "absolute");
        NBcnv.parent("nextBox");
    }
    sk.draw = ()=> {
        // Draw Grid
        sk.fill("white")
        sk.stroke("gray");
        sk.strokeWeight(gutterWidth)
        // Standard rectangle grid drawing
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                sk.rect(c*blockWidth, r*blockWidth, blockWidth, blockWidth )
            }
        }
        // Draw next piece
        // sk.noStroke()
        sk.fill(colors[pieceBag[0]])
        let s = shapes[pieceBag[0]][0];
        for(let r = 0; r < s.length; r++)
        {
            for (let c = 0; c < s[r].length; c++) {
                const element = s[r][c];
                if (element != 0)
                {
                    sk.rect(c*blockWidth, r*blockWidth, blockWidth, blockWidth)
                }
            }
        }
    }

}
new p5(NBSketch)