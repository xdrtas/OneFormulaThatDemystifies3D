console.log("game: ", game);
game.width = 800;
game.height = 800;
const ctx = game.getContext("2d");
console.log("ctx: ", ctx);

const COORDINATE_COLOR = "#fbff00";
const FOREGROUND_COLOR = "#50FF50";

const square = [
    {x: 0.25, y: 0.25},
    {x: -0.25, y: 0.25},
    {x: -0.25, y: -0.25},
    {x: 0.25, y: -0.25}
];

const fs = [
    [0, 1, 2, 3]
];

const FPS = 60;
let angle = 0;

function clear() {
    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, game.width, game.height);
}

// dibujar el punto en la pantalla con coordenadas x e y, 
// y un índice i para mostrar las coordenadas en el div showXYZ
function point(p) {
    const {x, y} = p;
    const dotSize = 10;
    const screenPos = screen({x, y});
    ctx.fillStyle = COORDINATE_COLOR;
    ctx.fillRect(x-dotSize/2, y-dotSize/2, dotSize, dotSize);
    showXYZ.style.color = "#00FF00";
    showXYZ.innerText = "x: " + x.toFixed(4) + " | y: " + y.toFixed(4) + " \n";
    ctx.fillText("x: " + x.toFixed(2) + "px y: " + y.toFixed(2) + "px", x + dotSize, y - dotSize);

}

function line(p1, p2, isAxis=false) {
    ctx.strokeStyle = isAxis ? COORDINATE_COLOR : FOREGROUND_COLOR;
    ctx.lineWidth = isAxis ? 1 : 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.setLineDash(isAxis ? [5, 5] : [0, 0]);
    if(isAxis) {
        ctx.fillText("X", 10, 415);
        ctx.fillText("Y", 410, 20);
    }

    ctx.stroke();
}

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

// Convertir coordenadas del sistema de juego (-1 a 1) 
// a coordenadas de pantalla (0 a width/height)
// retorna un objeto con las coordenadas x e y 
// en píxeles para dibujar en el canvas.
// La función toma un punto p con coordenadas x e y en el sistema de juego,
// y lo convierte a coordenadas de pantalla. 
// Se añade 1 a p.x y p.y para convertirlos a un rango de 0 a 1 (normalización),
// luego se divide por 2 para obtener un rango de 0 a 1,
// y finalmente se multiplica por el ancho o alto del juego para obtener las coordenadas en píxeles del canvas.
// Esto se hace porque el canvas empieza en (0, 0) renderizando en el cuarto cuadrante,
// mientras que las coordenadas van de -1 a 1.
function screen(p) {
    return {
        x: (p.x + 1) / 2 * game.width, //widthCenter + x * widthCenter,
        y: (1 - (p.y + 1) / 2) * game.height //heightCenter - y * heightCenter
    };
}

// dibujar las coordenadas x e y en la pantalla, 
// con líneas rojas que cruzan el origen (0, 0)
function IVcuadrant(p) {
    ctx.strokeStyle = COORDINATE_COLOR;
    ctx.fillStyle = COORDINATE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(game.width, 0);
    ctx.moveTo(0,0);
    ctx.lineTo(0, game.height);
    ctx.fillText("O: origin {x: 0, y: 0}", 5, 13);
    ctx.stroke();
}

function rotateXY(p, angle) {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    return {
        x: p.x * cosA - p.y * sinA,
        y: p.x * sinA + p.y * cosA
    };
}

function frame() {
    const dt = 1 / FPS;
    angle += .1 * Math.PI * dt;
    clear();
    IVcuadrant();
    point({ x: 0, y: 0 });
    drawCoordinates();

    // Dibujar el cuadrado y sus aristas
    // Para cada vértice del cuadrado, 
    // dibujar una línea a los siguientes vértices 
    // según las caras definidas en fs
    square.forEach((sq, i) => {
        // console.info("Drawing point for square vertex: ", sq);
        for (let j = 0; j < fs.length; j++) {
            const face = fs[j];
            // Si el índice del vértice actual está en la cara, 
            // dibujar una línea al siguiente vértice de la cara
            // console.info("Checking face: ", face, " for vertex index: ", i);
            if (face.includes(i)) {
                const nextIndex = face[(face.indexOf(i) + 1) % face.length];
                //console.info("Drawing line from vertex index: ", i, " to vertex index: ", nextIndex);
                const p1 = screen(rotateXY(sq, angle));
                const p2 = screen(rotateXY(square[nextIndex], angle));
                line(p1, p2);
            }
        }
    });

    square.forEach((sq, i) => {
        const rotatedPoint = rotateXY(sq, angle);
        const screenPoint = screen(rotatedPoint);
        point(screenPoint);
    });

    setTimeout(frame, 1000 / FPS);
}
setTimeout(frame, 1000 / FPS);

clear();
IVcuadrant();
point({ x: 0, y: 0 });