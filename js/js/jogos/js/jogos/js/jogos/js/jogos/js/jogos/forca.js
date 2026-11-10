import { AudioEngine } from '../engine.js';

const PALAVRAS = ['JAVASCRIPT','PYTHON','ARCADE','GITHUB','NINJA','DRAGAO','PIRATA','ESPADA','MAGIA','CASTELO','FLORESTA','TESOURO'];

export default function Forca({ container, ui, id }) {
  container.innerHTML = `
    <div class="forca-word" id="forcaWord"></div>
    <div class="status" id="forcaStatus"></div>
    <div class="forca-keys" id="forcaKeys"></div>`;
  const wordEl = container.querySelector('#forcaWord');
  const status = container.querySelector('#forcaStatus');
  const keysEl = container.querySelector('#forcaKeys');
  let palavra, acertos, erros, maxErros = 6, vivo;

  function reset() {
    palavra = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
    acertos = new Set(); erros = 0; vivo = true;
    status.textContent = ''; status.classList.remove('over');
    keysEl.innerHTML = '';
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => {
      const b = document.createElement('button');
      b.textContent = l;
      b.onclick = () => tentar(l, b);
      keysEl.appendChild(b);
    });
    atualizar();
  }

  function tentar(letra, btn) {
    if (!vivo || btn.disabled) return;
    btn.disabled = true;
    if (palavra.includes(letra)) { acertos.add(letra); btn.classList.add('right'); AudioEngine.beep(); }
    else { erros++; btn.classList.add('wrong'); AudioEngine.hit(); }
    atualizar();
    if ([...palavra].every(l => acertos.has(l))) {
      vivo = false;
      status.textContent = '🏆 Você venceu!';
      AudioEngine.win();
    } else if (erros >= maxErros) {
      vivo = false;
      status.textContent = `💀 Enforcou! A palavra era: ${palavra}`;
      status.classList.add('over');
      AudioEngine.lose();
    }
  }

  function atualizar() {
    wordEl.textContent = [...palavra].map(l => acertos.has(l) ? l : '_').join(' ');
    ui.setScore(`${acertos.size}/${new Set(palavra).size} • Erros: ${erros}/${maxErros}`);
  }

  reset();
  return { restart() { reset(); } };
}