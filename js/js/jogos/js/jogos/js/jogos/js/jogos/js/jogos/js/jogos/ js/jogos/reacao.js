import { AudioEngine, Storage, somRecorde } from '../engine.js';

export default function Reacao({ container, ui, id }) {
  container.innerHTML = `
    <div id="reacaoBox" style="width:100%;max-width:420px;height:260px;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;transition:background .15s;background:#7a2a2a;user-select:none;">
      <h3 style="font-size:1.4rem;color:#fff" id="reacaoTitulo">Clique para começar</h3>
      <p style="color:#fff9;margin-top:.5rem;font-size:.9rem" id="reacaoSub">Aguarde o verde, então clique rápido</p>
    </div>
    <p class="controls-hint">Teste de reflexo — quanto menor, melhor</p>
    <div class="status" id="reacaoStatus"></div>`;
  const box = container.querySelector('#reacaoBox');
  const titulo = container.querySelector('#reacaoTitulo');
  const sub = container.querySelector('#reacaoSub');
  const status = container.querySelector('#reacaoStatus');
  let estado = 'idle', inicio = 0, timeout = null, melhorTempo = Storage.get('rec_reacao_tempo', Infinity);

  function reset() {
    clearTimeout(timeout);
    estado = 'idle';
    box.style.background = '#7a2a2a';
    titulo.textContent = 'Clique para começar';
    sub.textContent = 'Aguarde o verde, então clique rápido';
    status.textContent = melhorTempo < Infinity ? `🏆 Melhor: ${melhorTempo}ms` : '';
    status.classList.remove('over');
  }

  box.addEventListener('click', () => {
    if (estado === 'idle') {
      estado = 'espera';
      box.style.background = '#7a2a2a';
      titulo.textContent = 'Aguarde...';
      sub.textContent = 'Não clique antes do verde!';
      timeout = setTimeout(() => {
        estado = 'go';
        box.style.background = '#2a7a3a';
        titulo.textContent = 'CLIQUE!';
        sub.textContent = '';
        inicio = performance.now();
        AudioEngine.beep();
      }, 1500 + Math.random() * 2500);
    } else if (estado === 'espera') {
      clearTimeout(timeout);
      estado = 'idle';
      box.style.background = '#7a2a2a';
      titulo.textContent = 'Cedo demais!';
      sub.textContent = 'Clique para tentar de novo';
      AudioEngine.lose();
    } else if (estado === 'go') {
      const tempo = Math.round(performance.now() - inicio);
      estado = 'idle';
      box.style.background = '#1a3a5a';
      titulo.textContent = `${tempo}ms`;
      sub.textContent = 'Clique para tentar de novo';
      AudioEngine.coin();
      ui.setScore(tempo + 'ms');
      if (tempo < melhorTempo) {
        melhorTempo = tempo;
        Storage.set('rec_reacao_tempo', tempo);
        status.textContent = `🏆 Novo recorde: ${tempo}ms`;
        somRecorde(id, 10000 - tempo, ui);
      } else {
        status.textContent = `🏆 Melhor: ${melhorTempo}ms`;
      }
    }
  });

  reset();
  return { restart() { reset(); } };
}