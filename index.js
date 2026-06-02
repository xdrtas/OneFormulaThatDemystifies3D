const BACKGROUND_COLOR = "#101010";
const FOREGROUND_COLOR = "#50FF50";
const COORDINATE_COLOR = "#FF0000";

console.log(game);
game.width = 800;
game.height = 800;
const ctx = game.getContext("2d");
console.log(ctx);

const FPS = 60;
let dz = 1; // z coordinate of the point in 3D space, starts at 0 and increases over time
let angle = 0; // rotation angle around the Y axis in radians, starts at 0 and increases over time
const vs = [ // vertices of a cube centered at the origin with side length 0.5
    // front face
    {x: .25,    y: .25,     z: .25}, // 0
    {x: -.25,   y: .25,     z: .25}, // 1
    {x: -.25,   y: -.25,    z: .25}, // 2
    {x: .25,    y: -.25,    z: .25}, // 3

    // back face
    {x: .25,    y: .25,     z: -.25}, // 4
    {x: -.25,   y: .25,     z: -.25}, // 5
    {x: -.25,   y: -.25,    z: -.25}, // 6
    {x: .25,    y: -.25,    z: -.25}, // 7
];

// indices of the vertices that form the edges of the cube
const fs = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
];

vs.forEach((v, i) => {
    showXYZ.style.color = "#00FF00";
    showXYZ.innerText += "i: " + i + " - xyz: " + vs[i].x.toFixed(4) + " | " +vs[i].y.toFixed(4) + " | " + vs[i].z.toFixed(4) + " \n"; 
});

function drawCoordinates() {
    const origin = screen({x: 0, y: 0});
    const xAxisPos = screen({x: 1, y: 0});
    const yAxisPos = screen({x: 0, y: 1});
    const xAxisNeg = screen({x: -1, y: 0});
    const yAxisNeg = screen({x: 0, y: -1});

    line(origin, xAxisPos, isAxis=true);
    line(origin, yAxisPos, isAxis=true);
    line(origin, xAxisNeg, isAxis=true);
    line(origin, yAxisNeg, isAxis=true);
}


// Clear the canvas with the background color
function clear() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, game.width, game.height);
}

// p as point object vector with x and y properties, v as vertex index for display
function point({x, y}, i, dt) {
    const size = 20;
    ctx.fillStyle = FOREGROUND_COLOR;
    console.info("Drawing point at: ", x-size/2, y-size/2);
    //ctx.fillRect(x-size/2, y-size/2, size, size); // draw a square centered at (x, y)
    ctx.fillText("v: " + i + " | x: " + x.toFixed(2) + "px y: " + y.toFixed(2) + "px", x + size, y - size);
    displayInfo(dt);
}

// Draw a line between two points on the canvas
function line(p1, p2, isAxis=false) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = FOREGROUND_COLOR;
    ctx.lineWidth = 3;
    ctx.setLineDash([0, 0]); // solid line for edges

    if (isAxis) {
        ctx.strokeStyle = COORDINATE_COLOR;
        ctx.fillStyle = COORDINATE_COLOR;
        ctx.font = "12px Arial";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.fillText("X", 10, 415);
        ctx.fillText("Y", 410, 20);
        ctx.fillText("Z'y: 245px", 410, 245);
        ctx.fillText("Z'y: 555px", 410, 555);
        ctx.fillText("Z'x: 245px", 245, 415);
        ctx.fillText("Z'x: 551px", 551, 415);
    }

    ctx.stroke();
}

// p as point object vector with x and y properties
// Convert normalized coordinates (0 to 1) to screen coordinates 
// (0 to width/height of canvas)
// eg: -1..1 (coordenadas) => 0..w/h (canvas)
function screen(p) {
    // Se añade 1 a p.x y p.y y para convertirlos a un rango de 0 a 1, 
    // luego se divide por 2 para obtener un rango de 0 a 1, 
    // y finalmente se multiplica por el ancho o alto del juego 
    // para obtener las coordenadas en píxeles del canvas porque 
    // el canvas empieza en (0, 0) renderizando en el cuarto cuadrante, 
    // mientras que las coordenadas van de -1 a 1.
    return {
        x: (p.x + 1)/2 * game.width,
        y: (1 - (p.y + 1)/2) * game.height
    };
}

// (x, y, z) as point object vector with x, y and z properties
// x' = x / z
// y' = y / z
function project({x, y, z}) {
    const scale = 1 / z;
    const FOV = Math.PI / 2; // 45 degrees field of view
    const aspectRatio = game.width / game.height;
    const f = 1 / Math.tan(FOV / 2);
    const projectedX = (x * f * aspectRatio)/z;
    const projectedY = (y * f)/z;
    showProjectZ.innerText = "z: " + z.toFixed(4) + " | scale: " + scale.toFixed(4);
    return {
        x: projectedX,
        y: projectedY
    };
}

// translate a point in 3D space by adding dz to its z coordinate
function translateZ(v, dz) {
    showTranslateZ.innerText = "z: " + v.z.toFixed(4) + " | dz: " + dz.toFixed(4);
    showXYZ.innerText = "xyz: " + v.x.toFixed(4) + " | " +v.y.toFixed(4) + " | " + v.z.toFixed(4) + " \n";
    return {
        x: v.x,
        y: v.y,
        z: v.z + dz
    }
}

// rotate a point in 3D space around the Y axis by a given angle
function rotateXZ(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: v.x * cos - v.z * sin,
        y: v.y,
        z: v.x * sin + v.z * cos
    };
}

// Helper: Transform vertex and return 3D point after rotation and translation
function transformVertex(v, angle, dz) {
    return translateZ(rotateXZ(v, angle), dz);
}

// Clipping check: return false if vertex is behind camera (z <= 0)
function isInFrontOfCamera(v3d) {
    return v3d.z > 0;
}

function displayInfo(dt) {
    showDt.innerText = "dt: " + dt.toFixed(4) + "s";
    showDz.innerText = "dz: " + dz.toFixed(4);
    showAngle.innerText = "angle: " + angle.toFixed(4);
    showFPS.innerText = "FPS: " + FPS;
}

function frame() {
    const dt = 1 / FPS; // delta time in seconds
    //dz += 1*dt;
    
    // speed is in radians per second, 
    // so we multiply by dt to get the angle change 
    // for this frame
    angle += .01*Math.PI*dt; 

    // keep `angle` bounded in [0, 2π) and snap to 0 when a full revolution completes
    angle = angle % (2 * Math.PI);
    // correct tiny floating-point residuals so we get exactly 0 after a revolution
    if (angle < 1e-6) {
        angle = 0;
    }

    clear();
    vs.forEach((v, i) => {
        console.info("Processing vertex: ", i, v);
        drawCoordinates();
        const v3d = transformVertex(v, angle, dz);
        // Only render if vertex is in front of camera
        if (isInFrontOfCamera(v3d)) {
            point(
                screen(project(v3d))
                , i, dt);
        }
    });

    for (const f of fs) {
        for (let i = 0; i < f.length; i++) {
            const v1 = vs[f[i]];
            const v2 = vs[f[(i + 1) % f.length]];
            
            const v1_3d = transformVertex(v1, angle, dz);
            const v2_3d = transformVertex(v2, angle, dz);
            
            // Only render edge if both endpoints are in front of camera
            if (isInFrontOfCamera(v1_3d) && isInFrontOfCamera(v2_3d)) {
                line(
                    screen(project(v1_3d)),
                    screen(project(v2_3d)),
                    false
                );
            }
        }
    }
    
    setTimeout(frame, 1000 / FPS);
}
setTimeout(frame, 1000 / FPS);

clear();
point(screen({x: -.25, y: 0}), 0, 0); // should be in the center of the screen);