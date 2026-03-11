// ------------------------------------------------------------
//  VECTOR HELPERS (Totally jag som skrivit detta)
// ------------------------------------------------------------
const vec = {
  sub: (a,b) => ({x: a.x - b.x, y: a.y - b.y}),
  add: (a,b) => ({x: a.x + b.x, y: a.y + b.y}),
  scale: (v,s) => ({x: v.x * s, y: v.y * s}),
  dot: (a,b) => a.x*b.x + a.y*b.y,
  len: v => Math.hypot(v.x, v.y),
  norm: v => {
    let l = Math.hypot(v.x, v.y);
    return l === 0 ? {x:0, y:0} : {x: v.x/l, y: v.y/l};
  }
};

class Popcorn {
  constructor(y = -10, x = (canvas.width/2-canvas.width/24) + Math.floor(Math.random() * canvas.width/12), r = Math.floor(Math.random() * 2 + 7), img = ballImg) {
    this.pos = {x, y};
    this.prev = {x, y};
    this.r = r;
    this.popped = false;
    this.rotation = Math.floor(Math.random() * 360);
    this.mass = r;
    this.img = img;
  }

  getVelocity() {
    return {
      x: this.pos.x - this.prev.x,
      y: this.pos.y - this.prev.y
    };
  }
  setVelocity(vx, vy) {
    this.prev.x = this.pos.x - vx;
    this.prev.y = this.pos.y - vy;
  }
  integrate(dt, gravity) {
    const vx = this.pos.x - this.prev.x;
    const vy = this.pos.y - this.prev.y;
    this.prev.x = this.pos.x;
    this.prev.y = this.pos.y;
    this.pos.x += vx;
    this.pos.y += vy + gravity * dt * dt;

    const vel = this.getVelocity();
    const speed = Math.hypot(vel.x, vel.y);

    this.rotation += (speed / this.r) * Math.sign(vel.x || 0);
  }

  draw(ctx) {
    const d = this.r * 5;

    if (this.img) {
      // === ROLLING ===
      const vel = this.getVelocity();
      const speed = Math.hypot(vel.x, vel.y);
      this.rotation += speed / this.r * Math.sign(vel.x || 0);

      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.img, -d/2, -d/2, d, d);
      ctx.restore();

    } else {
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
    }
  }
}

// Framework som används för popcorn hinken
class Hitbox {
  constructor(width, height, x, y, img) {
    this.width = width;
    this.height = height;
    this.pos = {x, y};
    this.img = img;
    this.ready = false;  // Kollar om bilden är inladdad
  }

  draw(ctx) {
    if (this.img && this.ready) {
      ctx.save();
      ctx.drawImage(this.img, this.pos.x, this.pos.y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.rect(this.pos.x, this.pos.y, this.width, this.height);
      ctx.fillStyle = "red";
      ctx.fill();
    }
  }
}

class Basket {
  constructor () {
    let width = canvas.width / 9;
    let height = canvas.height / 1.5;
    let x = canvas.width / 2 - (width / 2);
    let y = canvas.height / 2 + (height / 2);

    let cWidth = width / 10;
    let cHeight = height / 4;

    this.basket = new Hitbox(
      width,
      height,
      x,
      y,
      basketImg);
    this.cornerL = new Hitbox(
      cWidth,
      cHeight  - cHeight / 2.5,
      x - cWidth,
      y - cHeight / 2,
      null);
    this.cornerR = new Hitbox(
      cWidth,
      cHeight - cHeight / 2.5,
      x + width,
      y - cHeight / 2,
      null);
  }
}

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function solveCircleCollision(a, b) {
  const n = vec.sub(b.pos, a.pos);
  const dist = vec.len(n);
  const minDist = a.r + b.r;

  if (dist === 0) return;

  if (dist < minDist) {
    const normal = vec.scale(n, 1/dist);
    const overlap = minDist - dist;
    const corr = vec.scale(normal, overlap / 2);

    a.pos.x -= corr.x;
    a.pos.y -= corr.y;
    b.pos.x += corr.x;
    b.pos.y += corr.y;
  }
}

function solveWallCollision(c, W, H) {
  if (c.pos.x < c.r) c.pos.x = c.r;
  if (c.pos.x > W - c.r) c.pos.x = W - c.r;
  if (c.pos.y > H - c.r) c.pos.y = H - c.r;
}

function solveBasketCollision(c, B) {
  circRectCollision(c, B.basket);
  circRectCollision(c, B.cornerL);
  circRectCollision(c, B.cornerR);
}

function circRectCollision(c, B) {
  const cx = c.pos.x;
  const cy = c.pos.y;
  const r  = c.r;

  const rx = B.pos.x;
  const ry = B.pos.y*1.03; // Gör så att popcornen sjunker in i hinken lite
  const rw = B.width;
  const rh = B.height;

  // 1. Find nearest point inside rectangle
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));

  // 2. Vector from closest point to circle center
  const dx = cx - closestX;
  const dy = cy - closestY;

  // 3. Check collision
  if (dx*dx + dy*dy < r*r) {
    // 4. Push circle out along the shortest direction
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal push
      if (dx > 0) c.pos.x = closestX + r;
      else        c.pos.x = closestX - r;
    } else {
      // Vertical push
      if (dy > 0) c.pos.y = closestY + r;
      else        c.pos.y = closestY - r;
    }
  }
}

// ------------------------------------------------------------
//  SETUP
// ------------------------------------------------------------
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const popImg = loadImage("../Images/popcorn.png");
const ballImg = loadImage("../Images/kernel.png");
const basketImg = loadImage("../Images/basket.png");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// kommer hålla alla aktiva popcorn
let bodies = [];

const basket = new Basket();
basketImg.onload = () => {
  basket.basket.ready = true;
}

async function spawnPopcorn(amount = 1) {
  for (let i = 0; i < amount; i++) {
    bodies.push(new Popcorn(-i*10));
    await pause(60 * Math.exp((-0.7) * i) + 40);
  }
}

async function popTheCorn() {
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    if (b.popped == false) {
      await pause(410 * Math.exp((-0.16) * i) + 20);
      b.r *= 2;
      b.pos.y += b.r;
      b.img = popImg
      b.popped = true;
    }
  }
}

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const GRAVITY = 0.6;
const ITERATIONS = 6;

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Integration step
  for (let b of bodies) {
    b.integrate(1, GRAVITY);
  }

  // Solve constraints iteratively (BOX2D STYLE)
  for (let k = 0; k < ITERATIONS; k++) {
    // Circle-circle collisions
    for (let i=0; i<bodies.length; i++) {
      for (let j=i+1; j<bodies.length; j++) {
        solveCircleCollision(bodies[i], bodies[j]);
      }
    }

    // Walls
    for (let b of bodies) {
      solveWallCollision(b, canvas.width, canvas.height);
      solveBasketCollision(b, basket)
    }
  }

  // Draw
  for (let b of bodies) b.draw(ctx);
  basket.basket.draw(ctx);
  // basket.cornerL.draw(ctx); // for debugging corners hitbox
  // basket.cornerR.draw(ctx);

  requestAnimationFrame(loop);
}

loop();