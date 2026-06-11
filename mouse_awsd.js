const c = document.getElementById("c");
const ctx = c.getContext("2d");

let player = { x: 250, y: 250 }; // centro de la imagen
let mouse = { x: 0, y: 0 }; // vector inicial del mouse
let angle = 0; // ángulo

// Añadir evento mousemove
c.addEventListener("mousemove", e => {
  const rect = c.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

let keys = {};

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

const speed = 3;

// Manejar translacion con el teclado.
function handleKeyboard() {
  let moveX = 0, moveY = 0;

  let forwardX = Math.cos(angle);
  let forwardY = Math.sin(angle);

  let rightX = -Math.sin(angle);
  let rightY = Math.cos(angle);

  if (keys["w"]) {
    moveX += forwardX;
    moveY += forwardY;
  }
  if (keys["s"]) {
    moveX -= forwardX;
    moveY -= forwardY;
  }
  if (keys["a"]) {
    moveX -= rightX;
    moveY -= rightY;
  }
  if (keys["d"]) {
    moveX += rightX;
    moveY += rightY;
  }

  // si "w" => (0,-1) =>
  // mag = √( 0² + (-1)² ) =>
  // mag = √(0+1) => mag = √1 => mag = 1;
  // let mag = Math.sqrt(x*x + y*y);
  let mag = Math.sqrt(moveX*moveX + moveY*moveY);
  
  if (mag > 0) {
    moveX = (moveX / mag) * speed; // (0/1) * 3 = 0
    moveY = (moveY / mag) * speed; // (-1/1) * 3 = -1*3 => -3
    // "sube" porque el vector esta en la posicion (250,250)
    // (250, 250-y) => v(250,247)
  } else {
    moveX = 0; moveY = 0;
  }
  player.x += moveX;
  player.y += moveY;

  player.x = clamp(player.x,5,495);
  player.y = clamp(player.y,5,495);
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

// Manejar rotación con el mouse
function handleMouse() {
  const dx = mouse.x - player.x;
  const dy = mouse.y - player.y;

  //console.info("x: ", mouse.x + " - " + player.y + " | " + dx);

  let targetAngle = Math.atan2(dy, dx);
    
  angle = lerpAngle(angle, targetAngle, 0.15);
}

function lerpAngle(a,b,t){
    let diff = b - a;

    while(diff > Math.PI) diff -= Math.PI * 2;
    while(diff < -Math.PI) diff += Math.PI * 2;

    return a + diff * t;
}

function update() {
  handleKeyboard();
  handleMouse();
}

function loop() {
  ctx.clearRect(0,0,500,500);

  update();

  // dirección del "frente" del player
  const len = 150;
  const fx = player.x + Math.cos(angle) * len;
  const fy = player.y + Math.sin(angle) * len;
  const radioPor2 = Math.PI*2; // 

  // jugador
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 5, 0, radioPor2);
  ctx.fill();

  // línea de dirección
  ctx.strokeStyle = "lime";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(fx, fy);
  ctx.stroke();

  requestAnimationFrame(loop);
}

loop();