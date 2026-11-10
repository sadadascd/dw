import { AudioEngine, Storage, somRecorde } from '../engine.js';

export default function Pong({ container, ui, id }) {
  container.innerHTML = `
    <canvas id="pongCanvas" width="600" height="400"></canvas>
    <p class="controls-hint">Mouse ou W/S para mover • Primeiro a 5 vence</p>
    <div class="status" id="pongStatus"></div>`;
  const canvas = container.querySelector('#pongCanvas');
  const ctx = canvas.getContext('2d');
  const status = container.querySelector('#pongStatus');
  const W = 600, H = 400;
  const p1 = { x: 10, y: 160, w: 10, h: 80, score: 0 };
  const p2 = { x: 580, y: 160, w: 10, h: 80, score: 0 };
  const ball = { x: W/2, y: H/2, dx: 4, dy: 3, r: 8 };
  let alive = true;

  function resetBall(direcao) {
    ball.x = W/2; ball.y = H/2;
    ball.dx = direcao * 4;
    ball.dy = (Math.random()*4 + 2) * (Math.random() < .5 ? -1 : 1);
  }

  function loop() {
    if (!alive) return;
    ball.x += ball.dx; ball.y += ball.dy;
    if (ball.y < ball.r || ball.y > H - ball.r) ball.dy *= -1;
    const alvo = ball.y - p2.h/2;
    p2.y += Math.sign(alvo - p2.y) * 3.2;
    p2.y = Math.max(0, Math.min(H - p2.h, p2.y));
    if (ball.x - ball.r < p1.x + p1.w && ball.y > p1.y && ball.y < p1.y + p1.h && ball.dx < 0) {
      ball.dx *= -1.05; ball.dy += (ball.y - (p1.y + p1.h/2)) * 0.05; AudioEngine.beep();
    }
    if (ball.x + ball.r > p2.x && ball.y > p2.y && ball.y < p2.y + p2.h && ball.dx > 0) {
      ball.dx *= -1.05; ball.dy += (ball.y - (p2.y + p2.h/2)) * 0.05; AudioEngine.beep();
    }
    if (ball.x < 0) { p2.score++; resetBall(1); }
    if (ball.x > W) { p1.score++; resetBall(-1); }
    ui.setScore(`${p1.score} x ${p2.score}`);

    if (p1.score >= 5 || p2.score >= 5) {
      alive = false;
      const venceu = p1.score >= 5;
      status.textContent = venceu ? '🏆 Você venceu!' : '💀 Você perdeu';
      status.classList.add('over');
      if (venceu) { AudioEngine.win(); if (somRecorde(id, p1.score - p2.score, ui)) status.textContent += ' 🏆'; }
      else AudioEngine.lose();
      return;
    }

    ctx.fillStyle = '#07070d'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2a2a4a';
    for (let y = 0; y < H; y += 20) ctx.fillRect(W/2 - 1, y, 2, 10);
    ctx.fillStyle = '#4ade80'; ctx.fillRect(p1.x, p1.y, p1.w, p1.h);
    ctx.fillStyle = '#ff4d4d'; ctx.fillRect(p2.x, p2.y, p2.w, p2.h);
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
    requestAnimationFrame(loop);
  }

  function mover(e) {
    const rect = canvas.getBoundingClientRect();
    const y = (e.clientY - rect.top) * (H / rect.height);
    p1.y = Math.max(0, Math.min(H - p1.h, y - p1.h/2));
  }
  function tecla(e) {
    if (e.key === 'w' || e.key === 'W') p1.y = Math.max(0, p1.y - 25);
    if (e.key === 's' || e.key === 'S') p1.y = Math.min(H - p1.h, p1.y + 25);
  }
  canvas.addEventListener('mousemove', mover);
  canvas.addEventListener('touchmove', e => { e.preventDefault(); mover(e.touches[0]); }, { passive: false });
  document.addEventListener('keydown', tecla);
  resetBall(1); loop();

  return {
    destroy() { alive = false; canvas.removeEventListener('mousemove', mover); document.removeEventListener('keydown', tecla); },
    restart() { p1.score = 0; p2.score = 0; alive = true; status.textContent = ''; status.classList.remove('over'); resetBall(1); loop(); },
  };
}