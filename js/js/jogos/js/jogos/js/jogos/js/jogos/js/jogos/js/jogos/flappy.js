import { AudioEngine, Storage, somRecorde } from '../engine.js';

export default function Flappy({ container, ui, id }) {
  container.innerHTML = `
    <canvas id="flappyCanvas" width="360" height="500"></canvas>
    <p class="controls-hint">Clique, toque ou Espaço para voar</p>
    <div class="status" id="flappyStatus"></div>`;
  const canvas = container.querySelector('#flappyCanvas');
  const ctx = canvas.getContext('2d');
  const status = container.querySelector('#flappyStatus');
  const W = 360, H = 500;
  const bird = { x: 80, y: H/2, vy: 0, r: 12, grav: 1400, pulo: -420 };
  let canos, score, vivo, timer, velocidade;

  function reset() {
    bird.y = H/2; bird.vy = 0;
    canos = []; score = 0; vivo = true; velocidade = 180;
    status.textContent = ''; status.classList.remove('over');
    ui.setScore('0'); ui.setBest(Storage.recorde(id));
    for (let i = 0; i < 3; i++) criarCano(W + i * 180);
    clearInterval(timer);
    let ultimo = performance.now();
    timer = setInterval(() => {
      if (!vivo) return;
      const agora = performance.now();
      const dt = Math.min(50, agora - ultimo) / 1000;
      ultimo = agora;
      atualizar(dt);
    }, 16);
  }

  function criarCano(x) {
    const gap = 130;
    const topoH = 60 + Math.random() * (H - gap - 120);
    canos.push({ x, w: 50, topoH, gap, passou: false });
  }

  function atualizar(dt) {
    bird.vy += bird.grav * dt;
    bird.y += bird.vy * dt;
    if (bird.y < bird.r || bird.y > H - bird.r) return morrer();

    canos.forEach(c => { c.x -= velocidade * dt; });
    canos = canos.filter(c => c.x > -c.w);
    const ultimo = canos[canos.length - 1];
    if (!ultimo || ultimo.x < W - 180) criarCano(W);

    for (const c of canos) {
      if (!c.passou && c.x + c.w < bird.x) { c.passou = true; score++; ui.setScore(score); AudioEngine.coin(); }
      const colideX = bird.x + bird.r > c.x && bird.x - bird.r < c.x + c.w;
      const colideY = bird.y - bird.r < c.topoH || bird.y + bird.r > c.topoH + c.gap;
      if (colideX && colideY) return morrer();
    }
    desenhar();
  }

  function morrer() {
    vivo = false;
    clearInterval(timer);
    AudioEngine.lose();
    status.textContent = `💀 Game Over — Pontos: ${score}`;
    status.classList.add('over');
    if (somRecorde(id, score, ui)) status.textContent += ' 🏆';
    desenhar();
  }

  function desenhar() {
    ctx.fillStyle = '#0b1a2e'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1a3a5a';
    for (let y = 0; y < H; y += 40) for (let x = 0; x < W; x += 40)
      if ((x + y) % 80 === 0) ctx.fillRect(x, y, 20, 20);

    canos.forEach(c => {
      ctx.fillStyle = '#2a9a3a';
      ctx.fillRect(c.x, 0, c.w, c.topoH);
      ctx.fillRect(c.x, c.topoH + c.gap, c.w, H - c.topoH - c.gap);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(c.x - 4, c.topoH - 20, c.w + 8, 20);
      ctx.fillRect(c.x - 4, c.topoH + c.gap, c.w + 8, 20);
    });

    ctx.fillStyle = '#ffd93d';
    ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff9a3d';
    ctx.beginPath(); ctx.arc(bird.x + 5, bird.y - 3, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#07070d';
    ctx.beginPath(); ctx.arc(bird.x + 4, bird.y - 3, 1.5, 0, Math.PI*2); ctx.fill();
  }

  function pular() {
    if (!vivo) { reset(); return; }
    bird.vy = bird.pulo;
    AudioEngine.beep();
  }

  canvas.addEventListener('click', pular);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); pular(); }, { passive: false });
  const onKey = e => { if (e.key === ' ') { e.preventDefault(); pular(); } };
  document.addEventListener('keydown', onKey);

  reset();
  return {
    destroy() { vivo = false; clearInterval(timer); canvas.removeEventListener('click', pular); document.removeEventListener('keydown', onKey); },
    restart() { reset(); },
  };
}a