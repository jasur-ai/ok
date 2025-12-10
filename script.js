const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let cw = window.innerWidth;
let ch = window.innerHeight;

canvas.width = cw;
canvas.height = ch;

window.addEventListener('resize', () => {
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
});

const opts = {
  charSize: 20,
  fireworkSpawnTime: 100,
  fireworkLife: 100,
  particleCount: 100,
  particleSpeed: 10,
  particleLife: 50
};

const text = "ENJOY";
const letters = [];

function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;

  this.dx = -ctx.measureText(char).width / 2;
  this.dy = opts.charSize / 2;

  this.fireworkDy = this.y - 100;

  const hue = (x / (text.length * opts.charSize)) * 360;

  this.color = `hsl(${hue}, 80%, 50%)`;
  this.lightColor = `hsl(${hue}, 80%, 70%)`;
  this.alphaColor = `hsla(${hue}, 80%, 50%, 0.5)`;

  this.reset();
}

Letter.prototype.reset = function() {
  this.phase = 'firework';
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
}

const particles = [];

function Particle(x, y, color) {
  this.x = x;
  this.y = y;
  this.color = color;
  this.life = opts.particleLife;
  this.angle = Math.random() * Math.PI * 2;
  this.speed = Math.random() * opts.particleSpeed;
  this.vx = Math.cos(this.angle) * this.speed;
  this.vy = Math.sin(this.angle) * this.speed;
}

function loop() {
  requestAnimationFrame(loop);

  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalCompositeOperation = 'lighter';

  drawLetters();
  drawParticles();
}

function drawLetters() {
  const textWidth = text.length * opts.charSize;
  const textX = (cw - textWidth) / 2;

  if (letters.length === 0) {
    for (let i = 0; i < text.length; i++) {
      letters.push(new Letter(text[i], textX + i * opts.charSize, ch));
    }
  }

  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];

    if (letter.phase === 'firework') {
      if (!letter.spawned && letter.tick >= letter.spawningTime) {
        letter.spawned = true;
      }

      if (letter.spawned) {
        const t = letter.tick / opts.fireworkLife;
        letter.y = ch - (ch - letter.fireworkDy) * t;

        if (letter.y <= letter.fireworkDy) {
          letter.phase = 'explode';
          for (let j = 0; j < opts.particleCount; j++) {
            particles.push(new Particle(letter.x, letter.y, letter.color));
          }
        }
      }
    }

    if (letter.phase === 'explode') {
        ctx.font = `${opts.charSize}px Arial`;
        ctx.fillStyle = letter.lightColor;
        ctx.fillText(letter.char, letter.x + letter.dx, letter.y + letter.dy);
    }

    letter.tick++;
  }
}

function drawParticles() {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    p.vx *= 0.98;
    p.vy += 0.1;

    p.x += p.vx;
    p.y += p.vy;

    p.life--;

    if (p.life <= 0) {
      particles.splice(i, 1);
      i--;
      continue;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2, false);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
}

loop();
