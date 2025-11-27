const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');

let width, height, DPR;
let snowflakes = [];
let mouse = { x: null, y: null };

function resize() {
  DPR = window.devicePixelRatio || 1;
  width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  // CSS size
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  // internal pixel size for crisp rendering on high-DPI
  canvas.width = Math.round(width * DPR);
  canvas.height = Math.round(height * DPR);

  // scale drawing operations to DPR
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

// init + listeners
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
resize();

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
canvas.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

class Snowflake {
  constructor(layer = 1) {
    this.reset(layer);
  }

  reset(layer = 1) {
    this.x = Math.random() * width;
    this.y = Math.random() * -height; // start above viewport
    this.radius = Math.random() * (2 / layer) + 1;
    // SLOW, SMOOTH FALL:
    this.speedY = Math.random() * (0.3 * layer) + 0.15; // <-- slower vertical speed
    this.speedX = Math.random() * 0.6 - 0.3;
    this.opacity = Math.random() * 0.5 + 0.4;
    this.layer = layer;
  }

  update() {
    // Normal fall with subtle horizontal wiggle
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.y * 0.01) * 0.4;

    // Mouse interaction (gentle swirl/repel)
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 200) {
        const force = (1 - dist / 200) * 0.12; // gentle
        const angle = Math.atan2(dy, dx) + Math.PI / 2;

        this.x += Math.cos(angle) * force * 15;
        this.y += Math.sin(angle) * force * 15;
      }
    }

    // Recycle when out of bounds
    if (this.y > height + 10) {
      this.reset(this.layer);
      this.y = -10;
    }

    if (this.x > width + 10) this.x = -10;
    if (this.x < -10) this.x = width + 10;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
    ctx.fill();
  }
}

function createSnowflakes(count, layer = 1) {
  for (let i = 0; i < count; i++) {
    snowflakes.push(new Snowflake(layer));
  }
}

// default counts (tweak if you want denser or lighter snowfall)
createSnowflakes(120, 1);
createSnowflakes(60, 2);
createSnowflakes(30, 3);

function animate() {
  ctx.clearRect(0, 0, width, height);
  for (let flake of snowflakes) {
    flake.update();
    flake.draw();
  }
  requestAnimationFrame(animate);
}

animate();
