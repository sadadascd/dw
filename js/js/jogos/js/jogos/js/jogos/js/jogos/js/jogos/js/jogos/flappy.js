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