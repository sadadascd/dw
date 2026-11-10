import { PERSONAGENS, RARIDADES, FASES, sortearPersonagem } from '../data-td.js';
import { Storage, AudioEngine } from '../engine.js';

export default function TowerDefense({ container, ui, id }) {
  const SAVE_KEY = 'td_save';
  const lerSave = () => Storage.get(SAVE_KEY, { moedas: 200, faseMax: 1, colecao: [] });
  const salvar = s => Storage.set(SAVE_KEY, s);

  let save = lerSave();
  let batalha = null;

  container.innerHTML = `
    <div class="td-wrap">
      <div class="td-topbar">
        <button class="btn-ghost" data-acao="menu">← Fases</button>
        <div class="td-recursos">
          💰 <b id="tdMoedas">${save.moedas}</b>
          <span>🌍 Fase <b id="tdFaseMax">${save.faseMax}</b></span>
        </div>
      </div>
      <div id="tdTela" class="td-tela"></div>
    </div>
  `;

  const tela = container.querySelector('#tdTela');
  const moedasEl = container.querySelector('#tdMoedas');
  const faseMaxEl = container.querySelector('#tdFaseMax');

  function atualizarRecursos() {
    moedasEl.textContent = save.moedas;
    faseMaxEl.textContent = save.faseMax;
    ui.setBest(save.faseMax);
  }

  function renderFases() {
    if (batalha) { batalha.destroy(); batalha = null; }
    tela.innerHTML = `
      <div class="td-fases">
        ${FASES.map((f, i) => {
          const liberada = i + 1 <= save.faseMax;
          return `<button class="td-fase ${liberada ? '' : 'locked'}" data-fase="${i}" ${liberada ? '' : 'disabled'}>
            <h3>${f.nome}</h3>
            <p>${f.ondas.length} ondas</p>
            <span>${liberada ? '▶ Jogar' : '🔒 Bloqueada'}</span>
          </button>`;
        }).join('')}
      </div>
      <div class="td-acoes">
        <button class="btn-ghost" data-acao="colecao">📚 Coleção</button>
        <button class="btn-ghost" data-acao="gacha">🎲 Invocar (100💰)</button>
      </div>
    `;
    tela.querySelectorAll('.td-fase').forEach(btn => btn.onclick = () => iniciarFase(Number(btn.dataset.fase)));
    tela.querySelector('[data-acao="colecao"]').onclick = renderColecao;
    tela.querySelector('[data-acao="gacha"]').onclick = renderGacha;
  }

  function iniciarFase(idx) {
    const fase = { ...FASES[idx], idx };
    tela.innerHTML = `
      <div class="td-batalha">
        <canvas id="tdCanvas" width="704" height="396"></canvas>
        <aside class="td-loja">
          <h3>Heróis</h3>
          ${PERSONAGENS.map(p => `
            <button class="td-torre-btn" data-id="${p.id}" style="border-color:${RARIDADES[p.raridade].cor}">
              <span class="emoji">${p.emoji}</span>
              <span class="info"><b>${p.nome}</b><small>${RARIDADES[p.raridade].nome}</small></span>
              <span class="custo">${p.custo}💰</span>
            </button>`).join('')}
        </aside>
      </div>
    `;

    import('../battle-td.js').then(({ iniciarBatalha }) => {
      const canvas = tela.querySelector('#tdCanvas');
      batalha = iniciarBatalha({
        canvas, fase,
        save: { get moedas() { return save.moedas; }, set moedas(v) { save.moedas = v; } },
        ui: {
          setScore: t => ui.setScore(t),
          toast: m => ui.toast(m),
          selecionarTorre: p => {
            tela.querySelectorAll('.td-torre-btn').forEach(b => b.classList.remove('sel'));
            if (p) tela.querySelector(`.td-torre-btn[data-id="${p.id}"]`)?.classList.add('sel');
          },
          vitoria: bonus => {
            const novo = sortearPersonagem();
            save.colecao.push(novo.id);
            save.faseMax = Math.max(save.faseMax, idx + 2);
            salvar(save);
            atualizarRecursos();
            AudioEngine.win();
            modalVitoria(bonus, novo);
          },
          derrota: () => {
            salvar(save);
            AudioEngine.lose();
            modalDerrota();
          },
        },
      });

      tela.querySelectorAll('.td-torre-btn').forEach(btn => {
        btn.onclick = () => {
          const p = PERSONAGENS.find(x => x.id === btn.dataset.id);
          batalha.selecionar(p);
          tela.querySelectorAll('.td-torre-btn').forEach(b => b.classList.remove('sel'));
          btn.classList.add('sel');
        };
      });
    });
  }

  function modal(titulo, corpo, acaoTxt, onAcao) {
    const div = document.createElement('div');
    div.className = 'td-modal';
    div.innerHTML = `<div class="td-modal-box">
      <h2>${titulo}</h2>${corpo}
      <button class="action">${acaoTxt}</button>
    </div>`;
    container.appendChild(div);
    div.querySelector('.action').onclick = () => { div.remove(); onAcao(); };
  }

  function modalVitoria(bonus, p) {
    const r = RARIDADES[p.raridade];
    modal('🏆 Vitória!', `
      <p>+${bonus} moedas</p>
      <div class="td-gacha-card" style="border-color:${r.cor}">
        <div class="emoji" style="font-size:3rem">${p.emoji}</div>
        <h3>${p.nome}</h3>
        <span style="color:${r.cor}">${r.nome}</span>
      </div>`, 'Continuar', () => { save = lerSave(); atualizarRecursos(); renderFases(); });
  }

  function modalDerrota() {
    modal('💀 Derrota', '<p>Suas vidas acabaram. Tente de novo!</p>', 'Voltar', () => renderFases());
  }

  function renderColecao() {
    const mapa = {};
    save.colecao.forEach(idp => mapa[idp] = (mapa[idp] || 0) + 1);
    tela.innerHTML = `
      <div class="td-colecao">
        ${PERSONAGENS.map(p => {
          const qtd = mapa[p.id] || 0;
          const r = RARIDADES[p.raridade];
          return `<div class="td-colecao-item ${qtd ? '' : 'vazio'}" style="border-color:${qtd ? r.cor : '#2a2a4a'}">
            <div class="emoji">${qtd ? p.emoji : '❓'}</div>
            <b>${qtd ? p.nome : '???'}</b>
            <small style="color:${r.cor}">${r.nome}</small>
            <span>${qtd ? 'x' + qtd : '—'}</span>
          </div>`;
        }).join('')}
      </div>
      <button class="btn-ghost" data-acao="voltar">← Voltar</button>
    `;
    tela.querySelector('[data-acao="voltar"]').onclick = renderFases;
  }

  function renderGacha() {
    tela.innerHTML = `
      <div class="td-gacha">
        <p>Invoque um herói aleatório por <b>100 moedas</b>.</p>
        <div class="td-gacha-resultado" id="tdGachaRes"><span>❔</span></div>
        <button class="action" id="tdBtnInvocar">Invocar (100 💰)</button>
        <p class="td-taxas">Comum 70% • Raro 25% • Épico 5%</p>
        <button class="btn-ghost" data-acao="voltar">← Voltar</button>
      </div>
    `;
    tela.querySelector('[data-acao="voltar"]').onclick = renderFases;
    tela.querySelector('#tdBtnInvocar').onclick = () => {
      if (save.moedas < 100) return ui.toast('Moedas insuficientes');
      save.moedas -= 100;
      const p = sortearPersonagem();
      save.colecao.push(p.id);
      salvar(save);
      atualizarRecursos();
      AudioEngine.coin();
      const r = RARIDADES[p.raridade];
      const res = tela.querySelector('#tdGachaRes');
      res.style.borderColor = r.cor;
      res.innerHTML = `<div class="emoji" style="font-size:3.5rem">${p.emoji}</div>
        <h3>${p.nome}</h3><span style="color:${r.cor}">${r.nome}</span>`;
      res.animate([{ transform: 'scale(.6)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 400 });
    };
  }

  container.querySelector('[data-acao="menu"]').onclick = () => {
    if (batalha) { batalha.destroy(); batalha = null; }
    renderFases();
  };

  atualizarRecursos();
  renderFases();

  return {
    destroy() { if (batalha) { batalha.destroy(); batalha = null; } },
    pause() { return batalha?.pause?.() ?? false; },
    restart() { renderFases(); },
  };
}