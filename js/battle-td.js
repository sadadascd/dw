import { INIMIGOS } from './data-td.js';

const RARIDADE_COR = { comum: '#8a8aa8', raro: '#4d7aff', epico: '#b84dff' };

export function iniciarBatalha({ canvas, fase, ui, save }) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const CELL = 44, COLS = 16, ROWS = 9;
  const caminho = [
    { x: 0, y: 4 }, { x: 3, y: 4 }, { x: 3, y: 1 }, { x: 7, y: 1 },
    { x: 7, y: 7 }, { x: 11, y: 7 }, { x: 11, y: 2 }, { x: 15, y: 2 },
  ].map(p => ({ x: p.x * CELL + CELL / 2, y: p.y * CELL + CELL / 2 }));

  const estado = {
    ondas: fase.ondas, ondaAtual: 0,
    spawnTimer: 0, spawnRestante: [],
    inimigos: [], torres: [], projeteis: [],
    vidas: 10, moedas: save.moedas, ouroGanho: 0,
    selecionada: null, vivo: true, pausado: false,
    torreSelecionada: null,
  };

  function noCaminho(gx, gy) {
    for (let i = 0; i < caminho.length - 1; i++) {
      const a = caminho[i], b = caminho[i + 1];
      const minX = Math.min(a.x, b.x) - CELL / 2, maxX = Math.max(a.x, b.x) + CELL / 2;
      const minY = Math.min(a.y, b.y) - CELL / 2, maxY = Math.max(a.y, b.y) + CELL / 2;
      const cx = gx * CELL + CELL / 2, cy = gy * CELL + CELL / 2;
      if (cx >= minX && cx <= maxX && cy >= minY && cy <= maxY) return true;
    }
    return false;
  }

  function colocarTorre(personagem, gx, gy) {
    if (estado.moedas < personagem.custo) return ui.toast('Moedas insuficientes');
    if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return;
    if (estado.torres.some(t => t.gx === gx && t.gy === gy)) return ui.toast('Já tem torre aqui');
    if (noCaminho(gx, gy)) return ui.toast('Não pode no caminho');
    estado.moedas -= personagem.custo;
    save.moedas = estado.moedas;
    estado.torres.push({
      ...personagem, gx, gy,
      px: gx * CELL + CELL / 2, py: gy * CELL + CELL / 2,
      cooldown: 0,
    });
    atualizarHUD();
  }

  function spawnInimigo(tipo) {
    const info = INIMIGOS[tipo];
    estado.inimigos.push({
      ...info, hpAtual: info.hp, alvo: 0,
      x: caminho[0].x, y: caminho[0].y, slowTimer: 0,
    });
  }

  function proximaOnda() {
    if (estado.ondaAtual >= estado.ondas.length) {
      if (estado.inimigos.length === 0) finalizarVitoria();
      return;
    }
    const onda = estado.ondas[estado.ondaAtual];
    estado.spawnRestante = Array(onda.qtd).fill(onda.tipo);
    estado.spawnTimer = 0;
    estado.ondaAtual++;
    atualizarHUD();
  }

  function atualizarHUD() {
    ui.setScore(`${estado.moedas} 💰 | ${estado.vidas} ❤️ | Onda ${estado.ondaAtual}/${fase.ondas.length}`);
  }

  function encontrarAlvo(torre) {
    let melhor = null, distMin = Infinity;
    for (const ini of estado.inimigos) {
      const d = Math.hypot(ini.x - torre.px, ini.y - torre.py);
      if (d <= torre.alcance && d < distMin) { distMin = d; melhor = ini; }
    }
    return melhor;
  }

  function aplicarDano(p) {
    const alvos = [p.alvo];
    if (p.tipo === 'splash') {
      estado.inimigos.forEach(i => {
        if (i !== p.alvo && Math.hypot(i.x - p.alvo.x, i.y - p.alvo.y) < 60) alvos.push(i);
      });
    } else if (p.tipo === 'chain') {
      const outros = estado.inimigos
        .filter(i => i !== p.alvo)
        .sort((a, b) => Math.hypot(a.x - p.alvo.x, a.y - p.alvo.y) - Math.hypot(b.x - p.alvo.x, b.y - p.alvo.y))
        .slice(0, 2);
      alvos.push(...outros);
    }
    alvos.forEach(a => { a.hpAtual -= p.dano; if (p.tipo === 'slow') a.slowTimer = 1.5; });
  }

  let ultimo = performance.now();
  function tick(agora) {
    if (!estado.vivo || estado.pausado) return;
    const dt = Math.min(50, agora - ultimo) / 1000;
    ultimo = agora;

    if (estado.spawnRestante.length > 0) {
      estado.spawnTimer -= dt * 1000;
      if (estado.spawnTimer <= 0) {
        spawnInimigo(estado.spawnRestante.shift());
        const onda = estado.ondas[estado.ondaAtual - 1];
        estado.spawnTimer = onda.intervalo;
      }
    } else if (estado.inimigos.length === 0 && estado.ondaAtual < estado.ondas.length) {
      proximaOnda();
    } else if (estado.inimigos.length === 0 && estado.ondaAtual >= estado.ondas.length) {
      finalizarVitoria();
    }

    for (const ini of estado.inimigos) {
      const alvo = caminho[ini.alvo + 1];
      if (!alvo) { ini.hpAtual = 0; estado.vidas -= ini.dano; if (estado.vidas <= 0) finalizarDerrota(); continue; }
      const vel = ini.vel * (ini.slowTimer > 0 ? 0.5 : 1);
      const dx = alvo.x - ini.x, dy = alvo.y - ini.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) ini.alvo++;
      else { ini.x += (dx / dist) * vel * dt; ini.y += (dy / dist) * vel * dt; }
      if (ini.slowTimer > 0) ini.slowTimer -= dt;
    }

    for (const torre of estado.torres) {
      torre.cooldown -= dt * 1000;
      if (torre.cooldown <= 0) {
        const alvo = encontrarAlvo(torre);
        if (alvo) {
          estado.projeteis.push({ x: torre.px, y: torre.py, alvo, dano: torre.dano, tipo: torre.tipo, vel: 420 });
          torre.cooldown = torre.cadencia;
        }
      }
    }

    for (const p of estado.projeteis) {
      if (!p.alvo || p.alvo.hpAtual <= 0) { p.morto = true; continue; }
      const dx = p.alvo.x - p.x, dy = p.alvo.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 8) { p.morto = true; aplicarDano(p); }
      else { p.x += (dx / dist) * p.vel * dt; p.y += (dy / dist) * p.vel * dt; }
    }
    estado.projeteis = estado.projeteis.filter(p => !p.morto);

    estado.inimigos = estado.inimigos.filter(ini => {
      if (ini.hpAtual <= 0) {
        estado.moedas += ini.recompensa;
        estado.ouroGanho += ini.recompensa;
        save.moedas = estado.moedas;
        return false;
      }
      return true;
    });

    desenhar();
    atualizarHUD();
    requestAnimationFrame(tick);
  }

  function desenhar() {
    ctx.fillStyle = '#0b0b14';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#15152a';
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke(); }

    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = CELL;
    ctx.lineCap = 'round';
    ctx.beginPath();
    caminho.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.stroke();

    estado.torres.forEach(t => {
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.arc(t.px, t.py, CELL / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = RARIDADE_COR[t.raridade] || '#ffd93d';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(t.emoji, t.px, t.py);
      if (t === estado.torreSelecionada) {
        ctx.strokeStyle = 'rgba(255,217,61,0.4)';
        ctx.beginPath();
        ctx.arc(t.px, t.py, t.alcance, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    estado.inimigos.forEach(i => {
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i.emoji, i.x, i.y);
      const w = 30, hpPct = Math.max(0, i.hpAtual / i.hp);
      ctx.fillStyle = '#300';
      ctx.fillRect(i.x - w / 2, i.y - 18, w, 4);
      ctx.fillStyle = hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#ffd93d' : '#ff4d4d';
      ctx.fillRect(i.x - w / 2, i.y - 18, w * hpPct, 4);
      if (i.slowTimer > 0) {
        ctx.fillStyle = 'rgba(100,180,255,0.3)';
        ctx.beginPath();
        ctx.arc(i.x, i.y, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    estado.projeteis.forEach(p => {
      ctx.fillStyle = p.tipo === 'splash' ? '#ff7a3d' : p.tipo === 'chain' ? '#b84dff' : '#ffd93d';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function finalizarVitoria() {
    if (!estado.vivo) return;
    estado.vivo = false;
    const bonus = fase.recompensa + estado.ouroGanho;
    save.moedas += bonus;
    ui.vitoria(bonus);
  }

  function finalizarDerrota() {
    if (!estado.vivo) return;
    estado.vivo = false;
    ui.derrota();
  }

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);
    const gx = Math.floor(x / CELL), gy = Math.floor(y / CELL);
    const torre = estado.torres.find(t => t.gx === gx && t.gy === gy);
    if (torre) { estado.torreSelecionada = torre; return; }
    if (estado.selecionada) {
      colocarTorre(estado.selecionada, gx, gy);
      estado.selecionada = null;
      ui.selecionarTorre(null);
    }
  });

  proximaOnda();
  requestAnimationFrame(tick);

  return {
    selecionar(p) { estado.selecionada = p; },
    pause() { estado.pausado = !estado.pausado; return estado.pausado; },
    destroy() { estado.vivo = false; },
  };
}