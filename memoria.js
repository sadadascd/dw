import { AudioEngine } from '../engine.js';

export default function Memoria({ container, ui, id }) {
  const emojis = ['🐍','🏓','🧠','🧱','🧨','⭕','🔢','🔤'];
  const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  container.innerHTML = `<div class="memory-grid" id="memGrid"></div>
    <div class="status" id="memStatus"></div>`;
  const grid = container.querySelector('#memGrid');
  const status = container.querySelector('#memStatus');
  let abertas = [], travado = false, pares = 0, tentativas = 0;

  function montar() {
    grid.innerHTML = '';
    deck.forEach((emoji, i) => {
      const b = document.createElement('button');
      b.className = 'memory-card';
      b.dataset.emoji = emoji;
      b.dataset.idx = i;
      b.textContent = emoji;
      b.addEventListener('click', () => clicar(b));
      grid.appendChild(b);
    });
  }

  function clicar(b) {
    if (travado || b.classList.contains('flipped') || b.classList.contains('matched')) return;
    b.classList.add('flipped');
    AudioEngine.beep();
    abertas.push(b);
    if (abertas.length === 2) {
      travado = true; tentativas++;
      ui.setScore(`Pares: ${pares}/8 • Tentativas: ${tentativas}`);
      if (abertas[0].dataset.emoji === abertas[1].dataset.emoji) {
        abertas.forEach(c => c.classList.add('matched'));
        pares++; AudioEngine.coin();
        ui.setScore(`Pares: ${pares}/8 • Tentativas: ${tentativas}`);
        abertas = []; travado = false;
        if (pares === 8) { status.textContent = `🎉 Você venceu em ${tentativas} tentativas!`; AudioEngine.win(); }
      } else {
        setTimeout(() => { abertas.forEach(c => c.classList.remove('flipped')); abertas = []; travado = false; }, 700);
      }
    }
  }

  ui.setScore('Pares: 0/8 • Tentativas: 0');
  montar();
  return { restart() { abertas = []; travado = false; pares = 0; tentativas = 0; status.textContent = ''; deck.sort(() => Math.random() - 0.5); montar(); ui.setScore('Pares: 0/8 • Tentativas: 0'); } };
}