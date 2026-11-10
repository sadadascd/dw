import { criarLoop, criarInput, AudioEngine, Storage, somRecorde } from '../engine.js';

export default function Snake({ container, ui, id }) {
  container.innerHTML = `
    <canvas id="snakeCanvas" width="440" height="440" aria-label="Tabuleiro do Snake"></canvas>
    <p class="controls-hint">Setas / WASD para mover • Espaço reinicia</p>
    <div class="status" id="snakeStatus"></div>`;
  const canvas = container.querySelector('#snakeCanvas');
  const ctx = canvas.getContext('2d');
  const status = container.querySelector('#snakeStatus');
  const CELL = 22, COLS = 20, ROWS = 20;
  canvas.width = CELL * COLS; canvas.height = CELL * ROWS;
  let snake, dir, proxDir, food, score, vivo, pausado, particulas;

  const input = criarInput(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ']);
  const loop = criarLoop(110, tick);

  function reset() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 }; proxDir = dir;
    food = randomFood();
    score = 0; vivo = true; pausado = false; particulas = [];
    status.textContent = ''; status.classList.remove('over');
    ui.setScore('0'); ui.setBest(Storage.recorde(id));
    desenhar();
  }

  function randomFood() {
    let p;
    do { p = { x: (Math.random()*COLS)|0, y: (Math.random()*ROWS)|0 }; }
    while (snake?.some(s => s.x === p.x && s.y === p.y));
    return p;
  }

  function tick() {
    if (!vivo || pausado) return;
    if (proxDir.x !== -dir.x || proxDir.y !== -dir.y) dir = proxDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      vivo = false; AudioEngine.lose();
      status.textContent = `Game Over — Pontos: ${score}`;
      status.classList.add('over');
      if (somRecorde(id, score, ui)) status.textContent += ' 🏆 Novo recorde!';
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10; ui.setScore(score); AudioEngine.coin();
      for (let i = 0; i < 8; i++) particulas.push({
        x: food.x*CELL + CELL/2, y: food.y*CELL + CELL/2,
        vx: (Math.random()-.5)*4, vy: (Math.random()-.5)*4, life: 1,
      });
      food = randomFood();
    } else snake.pop();
    particulas.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.04; });
    particulas = particulas.filter(p => p.life > 0);
    desenhar();
  }

  function desenhar() {
    ctx.fillStyle = '#07070d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b0b14';
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++)
      if ((x + y) % 2 === 0) ctx.fillRect(x*CELL, y*CELL, CELL, CELL);

    const t = performance.now() / 300;
    const r = CELL/2 * (0.75 + Math.sin(t) * 0.1);
    ctx.fillStyle = '#ff4d4d'; ctx.shadowColor = '#ff4d4d'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(food.x*CELL + CELL/2, food.y*CELL + CELL/2, r, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    snake.forEach((s, i) => {
      const ratio = i / snake.length;
      ctx.fillStyle = i === 0 ? '#4ade80' : `rgb(${40 +