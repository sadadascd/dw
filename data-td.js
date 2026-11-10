export const RARIDADES = {
  comum: { nome: 'Comum', cor: '#8a8aa8', peso: 70 },
  raro:  { nome: 'Raro',  cor: '#4d7aff', peso: 25 },
  epico: { nome: 'Épico', cor: '#b84dff', peso: 5  },
};

export const PERSONAGENS = [
  { id: 'ninja',      nome: 'Ninja',       emoji: '🥷', raridade: 'comum', custo: 50,  dano: 8,  alcance: 110, cadencia: 700,  tipo: 'single', desc: 'Rápido e barato' },
  { id: 'arqueiro',   nome: 'Arqueiro',    emoji: '🏹', raridade: 'comum', custo: 60,  dano: 10, alcance: 140, cadencia: 900,  tipo: 'single', desc: 'Alcance longo' },
  { id: 'mago',       nome: 'Mago',        emoji: '🧙', raridade: 'comum', custo: 70,  dano: 12, alcance: 120, cadencia: 1100, tipo: 'slow',   desc: 'Lentidão em área' },
  { id: 'espada',     nome: 'Espadachim',  emoji: '⚔️', raridade: 'comum', custo: 55,  dano: 14, alcance: 80,  cadencia: 800,  tipo: 'single', desc: 'Corpo a corpo forte' },
  { id: 'pirata',     nome: 'Pirata',      emoji: '🏴‍☠️', raridade: 'raro',  custo: 120, dano: 20, alcance: 150, cadencia: 850,  tipo: 'splash', desc: 'Dano em área' },
  { id: 'tita',       nome: 'Titã',        emoji: '🗿', raridade: 'raro',  custo: 150, dano: 35, alcance: 90,  cadencia: 1400, tipo: 'single', desc: 'Dano massivo lento' },
  { id: 'feiticeira', nome: 'Feiticeira',  emoji: '🔮', raridade: 'raro',  custo: 130, dano: 18, alcance: 160, cadencia: 1000, tipo: 'chain',  desc: 'Atinge 3 inimigos' },
  { id: 'dragao',     nome: 'Dragão',      emoji: '🐉', raridade: 'epico', custo: 250, dano: 55, alcance: 170, cadencia: 1300, tipo: 'splash', desc: 'Área devastadora' },
  { id: 'sombra',     nome: 'Sombra',      emoji: '🌑', raridade: 'epico', custo: 220, dano: 45, alcance: 140, cadencia: 700,  tipo: 'chain',  desc: 'Rápido e múltiplo' },
  { id: 'deus',       nome: 'Deus Antigo', emoji: '⚡', raridade: 'epico', custo: 300, dano: 70, alcance: 200, cadencia: 1600, tipo: 'splash', desc: 'O mais forte' },
];

export const INIMIGOS = {
  slime:    { nome: 'Slime',    emoji: '🟢', hp: 30,  vel: 55, dano: 1, recompensa: 12 },
  goblin:   { nome: 'Goblin',   emoji: '👺', hp: 60,  vel: 70, dano: 1, recompensa: 18 },
  ogro:     { nome: 'Ogro',     emoji: '👹', hp: 150, vel: 40, dano: 2, recompensa: 30 },
  fantasma: { nome: 'Fantasma', emoji: '👻', hp: 90,  vel: 90, dano: 1, recompensa: 22 },
  chefe:    { nome: 'Chefe',    emoji: '👑', hp: 600, vel: 30, dano: 5, recompensa: 150 },
};

export const FASES = [
  { nome: 'Floresta', ondas: [
    { tipo: 'slime', qtd: 8,  intervalo: 900 },
    { tipo: 'slime', qtd: 12, intervalo: 800 },
    { tipo: 'goblin', qtd: 8, intervalo: 850 },
  ], recompensa: 120 },
  { nome: 'Caverna', ondas: [
    { tipo: 'goblin', qtd: 10, intervalo: 800 },
    { tipo: 'ogro', qtd: 4, intervalo: 1400 },
    { tipo: 'fantasma', qtd: 10, intervalo: 600 },
  ], recompensa: 180 },
  { nome: 'Ruínas', ondas: [
    { tipo: 'fantasma', qtd: 12, intervalo: 550 },
    { tipo: 'ogro', qtd: 6, intervalo: 1200 },
    { tipo: 'chefe', qtd: 1, intervalo: 2000 },
  ], recompensa: 300 },
];

export function sortearPersonagem() {
  const total = Object.values(RARIDADES).reduce((s, r) => s + r.peso, 0);
  let n = Math.random() * total;
  let raridade = 'comum';
  for (const [k, r] of Object.entries(RARIDADES)) {
    if (n < r.peso) { raridade = k; break; }
    n -= r.peso;
  }
  const pool = PERSONAGENS.filter(p => p.raridade === raridade);
  return pool[Math.floor(Math.random() * pool.length)];
}