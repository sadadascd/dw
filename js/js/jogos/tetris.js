import { AudioEngine, Storage, somRecorde } from '../engine.js';

export default function Tetris({ container, ui, id }) {
  container.innerHTML = `
    <canvas id="tetrisCanvas" width="300" height="600"></canvas>
    <p class="controls-hint">← → mover • ↑ girar • ↓ descer • Espaço pausar</p>
    <div class="status" id="tetrisStatus"></div>`;
  const canvas = container.querySelector('#tetrisCanvas');
  const ctx = canvas.getContext('2d');
  const status = container.querySelector('#tetrisStatus');
  const COLS = 10, ROWS = 20, SIZE = 30;
  let board, peca, timer, score, pausado, gameOver;

  const formas = [
    [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]],
  ];
  const cores = ['#4de1e1','#ffd93d','#b84dff','#4d7aff','#ff9a3d','#4ade80','#ff4d4d'];

  function novaPeca() {
    const i = Math.floor(Math.random() * formas.length);
    return { forma: formas[i], cor: cores[i], x: Math.floor((COLS - formas[i][0].length)/2), y: 0 };
  }
  function colide(p) {
    return p.forma.some((row, dy) => row.some((v, dx) => {
      if (!v) return false;
      const x = p.x + dx, y = p.y + dy;
      return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x]);
    }));
  }
  function fixar() {
    peca.forma.forEach((row, dy) => row.forEach((v, dx) => {
      if (v && peca.y + dy >= 0) board[peca.y + dy][peca.x + dx] = peca.cor;
    }));
    let linhas = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every(c => c)) { board.splice(y, 1); board.unshift(Array(COLS).fill(null)); linhas++; y++; }
    }
    if (linhas) { score += [0,100,300,500,800][linhas]; ui.setScore(score); AudioEngine.coin(); }
    peca = novaPeca();
    if (colide(peca)) {
      gameOver = true; clearInterval(timer);
      status.textContent = `Game Over — Pontos: ${score}`;
      status.classList.add('over');
      if (somRecorde(id, score, ui)) status.textContent += ' 🏆 Novo recorde!';
      AudioEngine.lose();
    }
  }
  function descer() {
    if (pausado || gameOver) return;
    peca.y++;
    if (colide(peca)) { peca.y--; fixar(); }
    desenhar();
  }
  function desenhar() {
    ctx.fillStyle = '#07070d'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#15152a';
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*SIZE, 0); ctx.lineTo(x*SIZE, ROWS*SIZE); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y*SIZE); ctx.lineTo(COLS*SIZE, y*SIZE); ctx.stroke(); }
    board.forEach((row, y) => row.forEach((cor, x) => {
      if (cor) { ctx.fillStyle = cor; ctx.fillRect(x*SIZE + 1, y*SIZE + 1, SIZE - 2, SIZE - 2); }
    }));
    if (peca) peca.forma.forEach((row, dy) => row.forEach((v, dx) => {
      if (v) { ctx.fillStyle = peca.cor; ctx.fillRect((peca.x + dx)*SIZE + 1, (peca.y + dy)*SIZE + 1, SIZE - 2, SIZE - 2); }
    }));
  }
  function rotacionar() {
    const nova = peca.forma[0].map((_, i) => peca.forma.map(r => r[i]).reverse());
    const teste = { ...peca, forma: nova };
    if (!colide(teste)) peca = teste;
    desenhar();
  }
  function onKey(e) {
    if (gameOver) { if (e.key === ' ') reset(); return; }
    const k = e.key;
    if (k === 'ArrowLeft') { peca.x--; if (colide(peca)) peca.x++; }
    else if (k === 'ArrowRight') { peca.x++; if (colide(peca)) peca.x--; }
    else if (k === 'ArrowDown') descer();
    else if (k === 'ArrowUp') rotacionar();
    else if (k === ' ') { pausado = !pausado; status.textContent = pausado ? 'Pausado' : ''; }
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(k)) e.preventDefault();
    desenhar();
  }
  function reset() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    peca = novaPeca(); score = 0; pausado = false; gameOver = false;
    status.textContent = ''; status.classList.remove('over');
    ui.setScore('0'); ui.setBest(Storage.recorde(id));
    clearInterval(timer); timer = setInterval(descer, 500);
    desenhar();
  }
  document.addEventListener('keydown', onKey);
  reset();
  return {
    destroy() { clearInterval(timer); document.removeEventListener('keydown', onKey); },
    pause() { pausado = !pausado; return pausado; },
    restart() { reset(); },
  };
}