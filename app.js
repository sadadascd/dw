import { AudioEngine, Storage } from './engine.js';

const jogos = {
  towerdefense: { nome: 'Tower Defense Gacha', titulo: '🛡️ Tower Defense', desc: 'Defenda e colecione heróis', destaque: true },
    snake:        { nome: 'Snake', titulo: '🐍 Snake', desc: 'Coma e cresça' },
      pong:         { nome: 'Pong', titulo: '🏓 Pong', desc: 'Duelo de raquetes' },
        memoria:      { nome: 'Memória', titulo: '🧠 Memória', desc: 'Encontre os pares' },
          tetris:       { nome: 'Tetris', titulo: '🧱 Tetris', desc: 'Encaixe as peças' },
            breakout:     { nome: 'Breakout', titulo: '🧨 Breakout', desc: 'Quebre os tijolos' },
              velha:        { nome: 'Jogo da Velha', titulo: '⭕ Jogo da Velha', desc: 'Contra a máquina' },
                g2048:        { nome: '2048', titulo: '🔢 2048', desc: 'Junte os números' },
                  forca:        { nome: 'Forca', titulo: '🔤 Forca', desc: 'Adivinhe a palavra' },
                    flappy:       { nome: 'Flappy', titulo: '🐦 Flappy', desc: 'Desvie dos canos' },
                      reacao:       { nome: 'Reação', titulo: '⚡ Reação', desc: 'Teste seus reflexos' },
                      };

                      const menuEl = document.getElementById('menu');
                      const gameArea = document.getElementById('gameArea');
                      const container = document.getElementById('gameContainer');
                      const titleEl = document.getElementById('gameTitle');
                      const scoreEl = document.getElementById('scoreBoard');
                      const bestEl = document.getElementById('bestBoard');
                      const pauseBtn = document.getElementById('pauseBtn');
                      const restartBtn = document.getElementById('restartBtn');
                      const soundBtn = document.getElementById('soundBtn');
                      const toastEl = document.getElementById('toast');

                      let current = { id: null, cleanup: null, api: null };

                      function toast(msg) {
                        toastEl.textContent = msg;
                          toastEl.classList.add('show');
                            clearTimeout(toast._t);
                              toast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
                              }

                              const ui = {
                                toast,
                                  setScore: t => { scoreEl.textContent = t; },
                                    setBest: v => { bestEl.textContent = '🏆 ' + (v ?? 0); },
                                      gameOver: msg => { const s = container.querySelector('.status'); if (s) { s.textContent = msg; s.classList.add('over'); } },
                                        AudioEngine,
                                        };

                                        function construirMenu() {
                                          menuEl.innerHTML = '';
                                            Object.entries(jogos).forEach(([id, j]) => {
                                                const card = document.createElement('button');
                                                    card.className = 'card';
                                                        if (j.destaque) card.classList.add('card--destaque');
                                                            card.dataset.game = id;
                                                                card.setAttribute('aria-label', `Jogar ${j.nome}`);
                                                                    const rec = Storage.recorde(id);
                                                                        card.innerHTML = `
                                                                              <span class="emoji">${j.titulo.split(' ')[0]}</span>
                                                                                    <h2>${j.nome}</h2>
                                                                                          <p>${j.desc}</p>
                                                                                                ${rec ? `<span class="best">🏆 ${rec}</span>` : ''}
                                                                                                    `;
                                                                                                        card.addEventListener('click', () => abrirJogo(id));
                                                                                                            menuEl.appendChild(card);
                                                                                                              });
                                                                                                              }

                                                                                                              async function abrirJogo(id) {
                                                                                                                fecharJogo();
                                                                                                                  const info = jogos[id];
                                                                                                                    if (!info) return;
                                                                                                                      titleEl.textContent = info.titulo;
                                                                                                                        scoreEl.textContent = '—';
                                                                                                                          bestEl.textContent = '🏆 ' + Storage.recorde(id);
                                                                                                                            pauseBtn.classList.add('hidden');
                                                                                                                              restartBtn.classList.add('hidden');
                                                                                                                                container.innerHTML = '<p style="color:#8a8aa8">Carregando…</p>';
                                                                                                                                  menuEl.classList.add('hidden');
                                                                                                                                    gameArea.classList.remove('hidden');

                                                                                                                                      try {
                                                                                                                                          const mod = await import(`./jogos/${id}.js`);
                                                                                                                                              container.innerHTML = '';
                                                                                                                                                  const api = mod.default({ container, ui, id });
                                                                                                                                                      current = { id, cleanup: api?.destroy || null, api };
                                                                                                                                                          if (api?.pause) pauseBtn.classList.remove('hidden');
                                                                                                                                                              if (api?.restart) restartBtn.classList.remove('hidden');
                                                                                                                                                                  pauseBtn.textContent = '⏸ Pausar';
                                                                                                                                                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                                                                                                                        } catch (err) {
                                                                                                                                                                            console.error(err);
                                                                                                                                                                                container.innerHTML = `<p style="color:#ff4d4d">Erro ao carregar o jogo.</p>`;
                                                                                                                                                                                  }
                                                                                                                                                                                  }

                                                                                                                                                                                  function fecharJogo() {
                                                                                                                                                                                    if (current.cleanup) { try { current.cleanup(); } catch {} }
                                                                                                                                                                                      current = { id: null, cleanup: null, api: null };
                                                                                                                                                                                        container.innerHTML = '';
                                                                                                                                                                                        }

                                                                                                                                                                                        document.getElementById('backBtn').addEventListener('click', () => {
                                                                                                                                                                                          fecharJogo();
                                                                                                                                                                                            gameArea.classList.add('hidden');
                                                                                                                                                                                              menuEl.classList.remove('hidden');
                                                                                                                                                                                                construirMenu();
                                                                                                                                                                                                });

                                                                                                                                                                                                pauseBtn.addEventListener('click', () => {
                                                                                                                                                                                                  if (current.api?.pause) {
                                                                                                                                                                                                      const pausado = current.api.pause();
                                                                                                                                                                                                          pauseBtn.textContent = pausado ? '▶ Continuar' : '⏸ Pausar';
                                                                                                                                                                                                            }
                                                                                                                                                                                                            });

                                                                                                                                                                                                            restartBtn.addEventListener('click', () => { if (current.api?.restart) current.api.restart(); });

                                                                                                                                                                                                            soundBtn.addEventListener('click', () => {
                                                                                                                                                                                                              const novo = !AudioEngine.isLigado();
                                                                                                                                                                                                                AudioEngine.setLigado(novo);
                                                                                                                                                                                                                  soundBtn.setAttribute('aria-pressed', String(novo));
                                                                                                                                                                                                                    soundBtn.textContent = novo ? '🔊 Som' : '🔇 Mudo';
                                                                                                                                                                                                                    });

                                                                                                                                                                                                                    let deferredPrompt = null;
                                                                                                                                                                                                                    const installBtn = document.getElementById('installBtn');
                                                                                                                                                                                                                    window.addEventListener('beforeinstallprompt', e => {
                                                                                                                                                                                                                      e.preventDefault(); deferred