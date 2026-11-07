export const AudioEngine = (() => {
      let ctx = null, ligado = true;
        function getCtx() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; }
          function tone({ freq = 440, dur = 0.08, type = 'square', vol = 0.15 }) {
              if (!ligado) return;
                  try {
                        const ac = getCtx();
                              const osc = ac.createOscillator(), gain = ac.createGain();
                                    osc.type = type; osc.frequency.value = freq;
                                          gain.gain.setValueAtTime(vol, ac.currentTime);
                                                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
                                                      osc.connect(gain).connect(ac.destination);
                                                            osc.start(); osc.stop(ac.currentTime + dur);
                                                                } catch {}
                                                                  }
                                                                    return {
                                                                        beep: () => tone({ freq: 620 }),
                                                                            coin: () => tone({ freq: 880, dur: 0.12, type: 'triangle' }),
                                                                                hit: () => tone({ freq: 200, dur: 0.15, type: 'sawtooth' }),
                                                                                    win: () => { tone({ freq: 660 }); setTimeout(() => tone({ freq: 880 }), 100); setTimeout(() => tone({ freq: 1100, dur: 0.2 }), 200); },
                                                                                        lose: () => { tone({ freq: 300, dur: 0.2 }); setTimeout(() => tone({ freq: 150, dur: 0.3 }), 150); },
                                                                                            setLigado: v => { ligado = v; },
                                                                                                isLigado: () => ligado,
                                                                                                  };
                                                                                                  })();

                                                                                                  export const Storage = {
                                                                                                    get: (k, p) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : p; } catch { return p; } },
                                                                                                      set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
                                                                                                        recorde(jogo) { return this.get('rec_' + jogo, 0); },
                                                                                                          salvarRecorde(jogo, pts) {
                                                                                                              const atual = this.recorde(jogo);
                                                                                                                  if (pts > atual) { this.set('rec_' + jogo, pts); return true; }
                                                                                                                      return false;
                                                                                                                        },
                                                                                                                        };

                                                                                                                        export function criarLoop(dt, cb) {
                                                                                                                          let id = null, ultimo = 0, rodando = false;
                                                                                                                            const passo = (t) => {
                                                                                                                                if (!rodando) return;
                                                                                                                                    const delta = t - ultimo;
                                                                                                                                        if (delta >= dt) { ultimo = t - (delta % dt); cb(delta); }
                                                                                                                                            id = requestAnimationFrame(passo);
                                                                                                                                              };
                                                                                                                                                return {
                                                                                                                                                    start() { if (rodando) return; rodando = true; ultimo = performance.now(); id = requestAnimationFrame(passo); },
                                                                                                                                                        stop() { rodando = false; if (id) cancelAnimationFrame(id); },
                                                                                                                                                            isRunning: () => rodando,
                                                                                                                                                              };
                                                                                                                                                              }

                                                                                                                                                              export function criarInput(teclasAlvo = []) {
                                                                                                                                                                const teclas = new Set();
                                                                                                                                                                  function kd(e) { teclas.add(e.key); if (teclasAlvo.includes(e.key)) e.preventDefault(); }
                                                                                                                                                                    function ku(e) { teclas.delete(e.key); }
                                                                                                                                                                      document.addEventListener('keydown', kd);
                                                                                                                                                                        document.addEventListener('keyup', ku);
                                                                                                                                                                          return {
                                                                                                                                                                              pressed: k => teclas.has(k),
                                                                                                                                                                                  anyPressed: (...ks) => ks.some(k => teclas.has(k)),
                                                                                                                                                                                      destroy() { document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); },
                                                                                                                                                                                        };
                                                                                                                                                                                        }

                                                                                                                                                                                        export function somRecorde(jogo, pontos, ui) {
                                                                                                                                                                                          if (Storage.salvarRecorde(jogo, pontos)) { ui.toast(`🏆 Novo recorde em ${jogo}!`); return true; }
                                                                                                                                                                                            return false;
                                                                                                                                                                                            }
})