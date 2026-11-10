import { AudioEngine, Storage, somRecorde } from '../engine.js';

export default function G2048({ container, ui, id }) {
  container.innerHTML = `<div class="grid-2048" id="grid2048"></div>
    <p class="controls-hint">Setas ou WASD • Deslize na tela</p>
    <div class="status" id="status2048"></div>`;
  const grid = container.querySelector('#grid2048');
  const status = container.querySelector('#status2048');
  let board, score, vivo;

  function reset() {
    board = Array.from({ length: 4 }, () => Array(4).fill(0));
    score = 0; vivo = true;
    status.textContent = ''; status.classList.remove('over');
    adicionar(); adicionar();
    ui.setScore('0'); ui.setBest(Storage.recorde(id));
    render();
  }

  function adicionar() {
    const vazias = [];
    board.forEach((row, y) => row.forEach((v, x) => { if (!v) vazias.push({ x, y }); }));
    if (!vazias.length) return;
    const { x, y } = vazias[Math.floor(Math.random() * vazias.length)];
    board[y][x] = Math.random() < 0.9 ? 2 : 4;
  }

  function render() {
    grid.innerHTML = '';
    board.forEach(row => row.forEach(v => {
      const d = document.createElement('div');
      d.className = 'tile-2048';
      d.dataset.v = v || '';
      d.textContent = v || '';
      grid.appendChild(d);
    }));
  }

  function mover(dir) {
    if (!vivo) return;
    const antes = JSON.stringify(board);
    const girar = () => {
      const novo = Array.from({ length: 4 }, () => Array(4).fill(0));
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) novo[x][3-y] = board[y][x];
      board = novo;
    };
    const empurrar = () => {
      for (let y = 0; y < 4; y++) {
        let linha = board[y].filter(v => v);
        for (let i = 0; i < linha.length - 1; i++) {
          if (linha[i] === linha[i+1]) {
            linha[i] *= 2; score += linha[i]; linha.splice(i+1, 1);
          }
        }
        while (linha.length < 4) linha.push(0);
        board[y] = linha;
      }
    };
    if (dir === 'ArrowRight') { girar(); girar(); empurrar(); girar(); girar(); }
    else if (dir === 'ArrowDown') { girar(); girar(); girar(); empurrar(); girar(); }
    else if (dir === 'ArrowUp') { girar(); empurrar(); girar(); girar(); girar(); }
    else if (dir === 'ArrowLeft') empurrar();

    if (JSON.stringify(board) !== antes) {
      adicionar();
      ui.setScore(score);
      render();
      AudioEngine.beep();
      if (board.flat().includes(2048) && !status.textContent) {
        status.textContent = '🏆 Você chegou a 2048!';
        AudioEngine.win();
        somRecorde(id, score, ui);
      }
      if (!movimentos()) {
        vivo = false;
        status.textContent = `💀 Sem movimentos — Pontos: ${score}`;
        status.classList.add('over');
        AudioEngine.lose();
        somRecorde(id, score, ui);
      }
    }
  }

  function movimentos() {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      if (!board[y][x]) return true;
      if (x < 3 && board[y][x] === board[y][x+1]) return true;
      if (y < 3 && board[y][x] === board[y+1][x]) return true;
    }
    return false;
  }

  function onKey(e) {
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
      e.preventDefault();
      mover(e.key);
    }
  }
  document.addEventListener('keydown', onKey);

  // Swipe
  let sx = 0, sy = 0;
  grid.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  grid.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > Math.abs(dy)) mover(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    else mover(dy > 0 ? 'ArrowDown' : 'ArrowUp');
  });

  reset();
  return {
    destroy() { document.removeEventListener('keydown', onKey); },
    restart() { reset(); },
  };
}