import { AudioEngine, Storage, somRecorde } from '../engine.js';

export default function Velha({ container, ui, id }) {
  container.innerHTML = `
    <div class="grid-velha" id="velhaGrid"></div>
    <p class="controls-hint">Você é ⭕ — clique para jogar</p>
    <div class="status" id="velhaStatus"></div>`;
  const grid = container.querySelector('#velhaGrid');
  const status = container.querySelector('#velhaStatus');
  let board, humano = 'O', maquina = 'X', ativo;

  const combos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function reset() {
    board = Array(9).fill('');
    ativo = true;
    status.textContent = '';
    status.classList.remove('over');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const b = document.createElement('button');
      b.dataset.i = i;
      b.addEventListener('click', () => jogar(i));
      grid.appendChild(b);
    }
    ui.setBest(Storage.recorde(id));
  }

  function jogar(i) {
    if (!ativo || board[i]) return;
    board[i] = humano;
    render(); AudioEngine.beep();
    if (fim()) return;
    setTimeout(() => {
      const melhor = melhorJogada();
      board[melhor] = maquina;
      render(); AudioEngine.beep();
      fim();
    }, 300);
  }

  function melhorJogada() {
    // tenta ganhar, depois bloquear, depois centro, canto, qualquer
    for (const c of combos) {
      const v = c.map(i => board[i]);
      if (v.filter(x => x === maquina).length === 2 && v.includes('')) return c[v.indexOf('')];
    }
    for (const c of combos) {
      const v = c.map(i => board[i]);
      if (v.filter(x => x === humano).length === 2 && v.includes('')) return c[v.indexOf('')];
    }
    if (!board[4]) return 4;
    const cantos = [0,2,6,8].filter(i => !board[i]);
    if (cantos.length) return cantos[Math.floor(Math.random()*cantos.length)];
    return board.findIndex(x => !x);
  }

  function render() {
    grid.querySelectorAll('button').forEach((b, i) => {
      b.textContent = board[i];
      b.disabled = !!board[i] || !ativo;
      b.style.color = board[i] === humano ? '#ffd93d' : '#4ade80';
    });
  }

  function vencedor() {
    for (const c of combos) {
      const [a,b,cc] = c;
      if (board[a] && board[a] === board[b] && board[a] === board[cc]) return board[a];
    }
    return board.includes('') ? null : 'empate';
  }

  function fim() {
    const v = vencedor();
    if (!v) return false;
    ativo = false;
    render();
    status.classList.add('over');
    if (v === humano) { status.textContent = '🏆 Você venceu!'; AudioEngine.win(); somRecorde(id, 1, ui); }
    else if (v === 'empate') { status.textContent = '🤝 Empate'; status.classList.remove('over'); }
    else { status.textContent = '💀 A máquina venceu'; AudioEngine.lose(); }
    return true;
  }

  reset();
  return { restart() { reset(); } };
}