import { AudioEngine, Storage, somRecorde } from '../engine.js';

export default function Breakout({ container, ui, id }) {
  container.innerHTML = `
    <canvas id="brCanvas" width="480" height="400"></canvas>
    <p class="controls-hint">Mouse ou ← → para mover</p>
    <div class="status" id="brStatus"></div>`;
  const canvas = container.querySelector('#brCanvas');
  const ctx = canvas.getContext('2d');
  const status = container.querySelector('#brStatus');
  const W = 480, H = 400;
  const paddle = { w: 80, h: 12, x: 200, y: H - 30, speed: 7 };
  const ball = { x: W/2, y: H/2, r: 6, dx: 3, dy: -3 };
  let bricks = [], score = 0, alive = true, vidas = 3, teclas = {};

  function criarBricks() {
    bricks = [];
    const linhas = 5, cols = 8, bw = 54, bh = 18, pad = 4, top = 40, left = (W - cols*(bw+pad))/2 + pad/2;
    for (let r = 0; r < linhas; r++) for (let c = 0; c < cols; c++) {
      bricks.push({ x: left + c*(bw+pad), y: top + r*(bh+pad), w: bw, h: bh, cor: `hsl(${r*40}, 80%, 60%)`, vivo: true });
    }
  }
  function resetBall() {
    ball.x = W/2; ball.y = H/2;
    ball.dx = 3 * (Math.random() < .5 ? -1 : 1); ball.dy = -3;
  }
  function loop() {
    if (!alive) return;
    if (teclas.ArrowLeft) paddle.x = Math.max(0, paddle.x - paddle.speed);
    if (teclas.ArrowRight) paddle.x = Math.min(W - paddle.w, paddle.x + paddle.speed);
    ball.x += ball.dx; ball.y += ball.dy;
    if (ball.x < ball.r || ball.x > W - ball.r) ball.dx *= -1;
    if (ball.y < ball.r) ball.dy *= -1;
    if (ball.y + ball.r > paddle.y && ball.y < paddle.y + paddle.h &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.w && ball.dy > 0) {
      ball.dy = -Math.abs(ball.dy);
      ball.dx += (ball.x - (paddle.x + paddle.w/2)) * 0.08;
      AudioEngine.beep();
    }
    bricks.forEach(b => {
      if (!b.vivo) return;
      if (ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
        b.vivo = false; ball.dy *= -1;
        score += 10; ui.setScore(score); AudioEngine.coin();
        if (bricks.every(br => !br.vivo)) {
          status.textContent = `🏆 Você venceu! Pontos: ${score}`;
          status.classList.add('over');
          alive = false; AudioEngine.win();
          if (somRecorde(id, score, ui)) status.textContent += ' 🏆';
        }
      }
    });
    if (ball.y > H) {
      vidas--;
      if (vidas <= 0) {
        status.textContent = `💀 Game Over — Pontos: ${score}`;
        status.classList.add('over');
        alive = false; AudioEngine.lose();
        if (somRecorde(id, score, ui)) status.textContent += ' 🏆';
      } else resetBall();
    }
    ctx.fillStyle = '#07070d'; ctx.fillRect(0, 0, W, H);
    bricks.forEach(b => { if (b.vivo) { ctx.fillStyle = b.cor; ctx.fillRect(b.x, b.y, b.w, b.h); } });
    ctx.fillStyle = '#4ade80'; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#8a8aa8'; ctx.font = '14px sans-serif';
    ctx.fillText(`Vidas: ${vidas}`, 10, H - 10);
    requestAnimationFrame(loop);
  }
  function moverMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    paddle.x = Math.max(0, Math.min(W - paddle.w, x - paddle.w/2));
  }
  function onKey(e) { teclas[e.key] = e.type === 'keydown'; }
  function addKey(e) { onKey(e); if (['ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); }
  canvas.addEventListener('mousemove', moverMouse);
  canvas.addEventListener('touchmove', e => { e.preventDefault(); moverMouse(e.touches[0]); }, { passive: false });
  document.addEventListener('keydown', addKey);
  document.addEventListener('keyup', onKey);
  criarBricks(); resetBall(); ui.setScore('0'); ui.setBest(Storage.recorde(id)); loop();
  return {
    destroy() { alive = false; canvas.removeEventListener('mousemove', moverMouse); document.removeEventListener('keydown', addKey); document.removeEventListener('keyup', onKey); },
    restart() { score = 0; vidas = 3; alive = true; status.textContent = ''; status.classList.remove('over'); criarBricks(); resetBall(); ui.setScore('0'); loop(); },
  };
}