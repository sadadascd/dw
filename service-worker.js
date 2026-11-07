const CACHE = 'arcade-v2';
const ARQUIVOS = [
  './', './index.html', './manifest.json', './css/style.css',
    './js/app.js', './js/engine.js', './js/data-td.js', './js/battle-td.js',
      './js/jogos/snake.js', './js/jogos/pong.js', './js/jogos/memoria.js',
        './js/jogos/tetris.js', './js/jogos/breakout.js', './js/jogos/velha.js',
          './js/jogos/2048.js', './js/jogos/forca.js', './js/jogos/flappy.js',
            './js/jogos/reacao.js', './js/jogos/towerdefense.js',
            ];

            self.addEventListener('install', e => {
              e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)));
                self.skipWaiting();
                });
                self.addEventListener('activate', e => {
                  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
                    self.clients.claim();
                    });
                    self.addEventListener('fetch', e => {
                      e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
                      });