/* PNG Battle Online Avançado
   HTML + CSS + JS puro + Firebase Realtime Database.
   Partida online com mapa grande, paredes, power-ups, respawn, tempo e vencedor.
*/

const firebaseConfig = {
  apiKey: "AIzaSyBqhwvBUsqofLqjVu66-SeozStbp5sEeF0",
  authDomain: "jogo-a763b.firebaseapp.com",
  databaseURL: "https://jogo-a763b-default-rtdb.firebaseio.com",
  projectId: "jogo-a763b",
  storageBucket: "jogo-a763b.firebasestorage.app",
  messagingSenderId: "89985273406",
  appId: "1:89985273406:web:a517d125e70a9c5d0c0b6f",
  measurementId: "G-FLVFWCPNYB"
};

const FIREBASE_NOT_CONFIGURED = !firebaseConfig.databaseURL || firebaseConfig.databaseURL.includes("COLE_AQUI");

let app = null;
let db = null;

try {
  if (!FIREBASE_NOT_CONFIGURED && window.firebase) {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.database();
  }
} catch (error) {
  console.error("Erro ao iniciar Firebase:", error);
}

/* ===============================
   CONFIGURAÇÕES PRINCIPAIS
   =============================== */

const WORLD = {
  width: 2600,
  height: 1650
};

const MATCH_DURATION_MS = 5 * 60 * 1000; // 5 minutos
const PLAYER_RADIUS = 25;
const BULLET_RADIUS = 7;
const SYNC_INTERVAL = 45;
const POWERUP_DURATION_MS = 15000;
const POWERUP_RESPAWN_MS = 4500;
const MAX_POWERUPS = 18;
const RESPAWN_DELAY_MS = 3000;

/*
  Atributos dos personagens.
  Para criar personagens diferentes, altere estes valores.
*/
const CHARACTER_DATA = {
  blue: {
    name: "Ninja Azul",
    image: "assets/player_blue.png",
    hp: 6,
    speed: 4.6,
    fireCooldown: 250,
    bulletSpeed: 12,
    damage: 1,
    passiveName: "Equilíbrio",
    passive: { cooldownScale: 0.95 },
    ability: "dash",
    abilityName: "Dash curto",
    skill: "Passiva: leve redução de recarga. Q: avanço rápido na direção da mira."
  },
  red: {
    name: "Tanque Vermelho",
    image: "assets/player_red.png",
    hp: 15,
    speed: 2.8,
    fireCooldown: 340,
    bulletSpeed: 8,
    damage: 3,
    passiveName: "Armadura",
    passive: { armor: 1 },
    ability: "shield",
    abilityName: "Escudo",
    skill: "Passiva: reduz parte do dano recebido. Q: ativa escudo temporário."
  },
  green: {
    name: "Soldado Verde",
    image: "assets/player_green.png",
    hp: 6,
    speed: 5.0,
    fireCooldown: 230,
    bulletSpeed: 12,
    damage: 1,
    passiveName: "Passos Rápidos",
    passive: { speedScale: 1.08 },
    ability: "speedBurst",
    abilityName: "Arrancada",
    skill: "Passiva: movimentação mais rápida. Q: velocidade amplificada por alguns segundos."
  },
  purple: {
    name: "Mago Roxo",
    image: "assets/player_purple.png",
    hp: 5,
    speed: 4.1,
    fireCooldown: 310,
    bulletSpeed: 13,
    damage: 2,
    passiveName: "Resistência Tóxica",
    passive: { poisonImmune: true },
    ability: "poisonBurst",
    abilityName: "Névoa Venenosa",
    skill: "Passiva: imune a veneno. Q: aplica veneno em inimigos próximos."
  },
  yellow: {
    name: "Robô Amarelo",
    image: "assets/player_yellow.png",
    hp: 6,
    speed: 4.0,
    fireCooldown: 205,
    bulletSpeed: 11,
    damage: 1,
    passiveName: "Mira Automática",
    passive: { starterBuff: "homingUntil", starterDuration: 3500 },
    ability: "eightShot",
    abilityName: "Rajada 360°",
    skill: "Passiva: inicia com tiro teleguiado curto. Q: dispara em 8 direções."
  },
  black: {
    name: "Shadow",
    image: "assets/player_black.png",
    hp: 4,
    speed: 8.0,
    fireCooldown: 115,
    bulletSpeed: 24,
    damage: 1,
    passiveName: "Sombra Veloz",
    passive: { speedScale: 1.12, damageTakenScale: 1.15 },
    ability: "wallPhase",
    abilityName: "Fase Sombria",
    skill: "Passiva: muito rápido, mas recebe mais dano. Q: atravessa paredes por tempo curto."
  },
  pink: {
    name: "Melissa",
    image: "assets/player_pink.png",
    hp: 7,
    speed: 4.7,
    fireCooldown: 250,
    bulletSpeed: 12,
    damage: 1,
    passiveName: "Recuperação",
    passive: { regen: true, regenInterval: 4200 },
    ability: "heal",
    abilityName: "Cura Rápida",
    skill: "Passiva: recupera vida aos poucos. Q: cura instantânea."
  },
  cyan: {
    name: "Atirador Ciano",
    image: "assets/player_cyan.png",
    hp: 5,
    speed: 4.0,
    fireCooldown: 360,
    bulletSpeed: 18,
    damage: 2,
    passiveName: "Projétil Veloz",
    passive: { bulletSpeedScale: 1.25 },
    ability: "laser",
    abilityName: "Laser Focalizado",
    skill: "Passiva: tiros mais rápidos. Q: dispara um laser em linha reta."
  },
  orange: {
    name: "Bombardeiro Laranja",
    image: "assets/1.png",
    hp: 6,
    speed: 3.7,
    fireCooldown: 360,
    bulletSpeed: 10,
    damage: 2,
    passiveName: "Impacto Explosivo",
    passive: { starterBuff: "explosiveUntil", starterDuration: 5000 },
    ability: "explosiveShot",
    abilityName: "Munição Explosiva",
    skill: "Passiva: inicia com tiro explosivo. Q: ativa explosão nos próximos tiros."
  },
  white: {
    name: "Fantasma Branco",
    image: "assets/2.png",
    hp: 5,
    speed: 4.8,
    fireCooldown: 270,
    bulletSpeed: 12,
    damage: 1,
    passiveName: "Corpo Etéreo",
    passive: { starterBuff: "wallWalkUntil", starterDuration: 2500 },
    ability: "ghostShot",
    abilityName: "Tiro Fantasma",
    skill: "Passiva: inicia atravessando paredes. Q: tiros atravessam paredes."
  },
  medic: {
    name: "Médica Rubi",
    image: "assets/player_pink.png",
    hp: 6,
    speed: 4.3,
    fireCooldown: 285,
    bulletSpeed: 11,
    damage: 1,
    passiveName: "Tiro Curativo",
    passive: { healOnHit: 1 },
    ability: "healShot",
    abilityName: "Munição Curativa",
    skill: "Passiva: acertos curam 1 de vida. Q: próximos tiros curam mais ao acertar."
  },
  venom: {
    name: "Víbora Verde",
    image: "assets/player_green.png",
    hp: 5,
    speed: 4.5,
    fireCooldown: 280,
    bulletSpeed: 12,
    damage: 1,
    passiveName: "Veneno Natural",
    passive: { starterBuff: "poisonShotUntil", starterDuration: 5000 },
    ability: "poisonShot",
    abilityName: "Munição Venenosa",
    skill: "Passiva: inicia com tiros venenosos. Q: ativa veneno nos próximos tiros."
  },
  frost: {
    name: "Leonardo",
    image: "assets/player_cyan.png",
    hp: 6,
    speed: 3.9,
    fireCooldown: 300,
    bulletSpeed: 11,
    damage: 1,
    passiveName: "Frio Intenso",
    passive: { starterBuff: "slowShotUntil", starterDuration: 4000 },
    ability: "slowPulse",
    abilityName: "Pulso Lento",
    skill: "Passiva: inicia com tiros de lentidão. Q: reduz velocidade dos rivais próximos."
  },
  berserk: {
    name: "Berserker",
    image: "assets/player_red.png",
    hp: 8,
    speed: 4.2,
    fireCooldown: 300,
    bulletSpeed: 12,
    damage: 2,
    passiveName: "Fúria",
    passive: { lowHpDamageScale: 1.75 },
    ability: "damageBurst",
    abilityName: "Fúria Ativa",
    skill: "Passiva: com pouca vida causa mais dano. Q: dano amplificado temporário."
  },
  hunter: {
    name: "Caçador",
    image: "assets/player_black.png",
    hp: 5,
    speed: 4.4,
    fireCooldown: 330,
    bulletSpeed: 14,
    damage: 2,
    passiveName: "Perseguidor",
    passive: { starterBuff: "homingUntil", starterDuration: 6000 },
    ability: "homingShot",
    abilityName: "Mira Teleguiada",
    skill: "Passiva: começa com tiros teleguiados. Q: ativa teleguiado por mais tempo."
  },
  guardian: {
    name: "Sentinela",
    image: "assets/player_yellow.png",
    hp: 10,
    speed: 3.3,
    fireCooldown: 300,
    bulletSpeed: 10,
    damage: 1,
    passiveName: "Casco Defensivo",
    passive: { maxHpBonus: 2, armor: 1 },
    ability: "hpAmp",
    abilityName: "Vida Amplificada",
    skill: "Passiva: vida extra e armadura. Q: aumenta vida máxima durante a partida."
  },
  striker: {
    name: "Striker",
    image: "assets/player_blue.png",
    hp: 5,
    speed: 4.9,
    fireCooldown: 260,
    bulletSpeed: 13,
    damage: 1,
    passiveName: "Tiro Frontal/Traseiro",
    passive: { starterBuff: "frontBackUntil", starterDuration: 5000 },
    ability: "frontBack",
    abilityName: "Disparo Duplo Linear",
    skill: "Passiva: inicia atirando frente e trás. Q: ativa disparo frontal e traseiro."
  },
  octo: {
    name: "Octo",
    image: "assets/player_purple.png",
    hp: 5,
    speed: 4.0,
    fireCooldown: 390,
    bulletSpeed: 10,
    damage: 1,
    passiveName: "Oito Direções",
    passive: { starterBuff: "eightWayUntil", starterDuration: 3500 },
    ability: "eightShot",
    abilityName: "Oito Direções",
    skill: "Passiva: inicia com tiro em 8 direções. Q: rajada 360°."
  }
};

const POWERUP_DATA = {
  double: { name: "Tiro Duplo", image: "assets/power_double.png", color: "#ffb82e", buff: "doubleUntil" },
  rapid: { name: "Cadência +", image: "assets/power_rapid.png", color: "#35d17f", buff: "rapidUntil" },
  ricochet: { name: "Ricochete", image: "assets/power_ricochet.png", color: "#52b9ff", buff: "ricochetUntil" },
  wallShot: { name: "Tiro atravessa parede", color: "#d8d8ff", buff: "wallShotUntil" },
  healShot: { name: "Tiro que cura", color: "#ff78b8", buff: "healShotUntil" },
  bulletSpeed: { name: "Tiro 2x veloz", color: "#ffe45c", buff: "bulletSpeedUntil" },
  frontBack: { name: "Frente e Trás", color: "#ff8a4c", buff: "frontBackUntil" },
  homing: { name: "Tiro teleguiado", color: "#9b7bff", buff: "homingUntil" },
  slowShot: { name: "Tiro de lentidão", color: "#77d7ff", buff: "slowShotUntil" },
  eightWay: { name: "8 Direções", color: "#f7f7f7", buff: "eightWayUntil" },
  laser: { name: "Laser", color: "#ff3434", buff: "laserUntil" },
  poisonShot: { name: "Tiro venenoso", color: "#88ff4a", buff: "poisonShotUntil" },
  hpAmp: { name: "Vida Amplificada", color: "#35d17f", instant: "hpAmp" },
  speedAmp: { name: "Velocidade Amplificada", color: "#31f5ff", buff: "speedAmplifyUntil" },
  wallWalk: { name: "Atravessar paredes", color: "#c8c8ff", buff: "wallWalkUntil" },
  triple: { name: "Tiro Triplo", color: "#ffaa00", buff: "tripleUntil" },
  explosive: { name: "Tiro Explosivo", color: "#ff5c33", buff: "explosiveUntil" },
  shield: { name: "Escudo", color: "#7aa8ff", buff: "shieldUntil" },
  giant: { name: "Tiro Gigante", color: "#ffcf73", buff: "giantBulletUntil" },
  damageAmp: { name: "Dano Amplificado", color: "#ff3d71", buff: "damageAmplifyUntil" },
  invisible: { name: "Invisibilidade", color: "#b5b5b5", buff: "invisibleUntil" },
  megaRicochet: { name: "Ricochete Avançado", color: "#4cc9ff", buff: "megaRicochetUntil" },
  sniper: { name: "Tiro Preciso", color: "#ffffff", buff: "sniperUntil" },
  scatter: { name: "Dispersão", color: "#ff94d6", buff: "scatterUntil" },
  drain: { name: "Roubo de Vida", color: "#baff6a", buff: "drainShotUntil" }
};

const POWERUP_TYPES = Object.keys(POWERUP_DATA);

/*
  Mapas randomizados.
  Cada sala escolhe um mapa aleatório ao iniciar/reiniciar.
*/
const MAPS = [
  {
    name: "Arena Clássica",
    bgA: "#101018",
    bgB: "#171724",
    walls: [
      { x: 360, y: 260, w: 420, h: 70 },
      { x: 1040, y: 180, w: 90, h: 410 },
      { x: 1520, y: 300, w: 470, h: 70 },
      { x: 2150, y: 190, w: 90, h: 370 },
      { x: 230, y: 700, w: 90, h: 440 },
      { x: 590, y: 770, w: 470, h: 80 },
      { x: 1260, y: 790, w: 360, h: 90 },
      { x: 1860, y: 760, w: 490, h: 80 },
      { x: 980, y: 1210, w: 90, h: 310 },
      { x: 1360, y: 1180, w: 520, h: 75 },
      { x: 2140, y: 1170, w: 90, h: 310 }
    ]
  },
  {
    name: "Corredores Cruzados",
    bgA: "#0d111a",
    bgB: "#141c25",
    walls: [
      { x: 420, y: 170, w: 90, h: 520 },
      { x: 760, y: 520, w: 540, h: 75 },
      { x: 1130, y: 120, w: 90, h: 360 },
      { x: 1510, y: 520, w: 650, h: 75 },
      { x: 2070, y: 220, w: 90, h: 520 },
      { x: 360, y: 1010, w: 650, h: 75 },
      { x: 1230, y: 970, w: 90, h: 470 },
      { x: 1510, y: 1050, w: 740, h: 75 },
      { x: 620, y: 1320, w: 90, h: 220 },
      { x: 1910, y: 1310, w: 90, h: 240 }
    ]
  },
  {
    name: "Ilhas de Combate",
    bgA: "#130f1b",
    bgB: "#1f1726",
    walls: [
      { x: 520, y: 240, w: 310, h: 100 },
      { x: 1120, y: 230, w: 360, h: 95 },
      { x: 1810, y: 250, w: 340, h: 95 },
      { x: 260, y: 690, w: 280, h: 100 },
      { x: 760, y: 760, w: 360, h: 95 },
      { x: 1320, y: 700, w: 330, h: 105 },
      { x: 1940, y: 760, w: 390, h: 95 },
      { x: 450, y: 1190, w: 360, h: 90 },
      { x: 1120, y: 1240, w: 460, h: 95 },
      { x: 1870, y: 1190, w: 330, h: 90 }
    ]
  },
  {
    name: "Fortaleza Central",
    bgA: "#101216",
    bgB: "#191a1f",
    walls: [
      { x: 900, y: 510, w: 800, h: 80 },
      { x: 900, y: 1030, w: 800, h: 80 },
      { x: 900, y: 510, w: 80, h: 600 },
      { x: 1620, y: 510, w: 80, h: 600 },
      { x: 360, y: 310, w: 420, h: 70 },
      { x: 1820, y: 310, w: 420, h: 70 },
      { x: 350, y: 1270, w: 420, h: 70 },
      { x: 1830, y: 1270, w: 420, h: 70 },
      { x: 1210, y: 130, w: 180, h: 70 },
      { x: 1210, y: 1450, w: 180, h: 70 }
    ]
  }
];

const SPAWN_POINTS = [
  { x: 160, y: 160 },
  { x: 2440, y: 160 },
  { x: 160, y: 1490 },
  { x: 2440, y: 1490 },
  { x: 1300, y: 160 },
  { x: 1300, y: 1490 },
  { x: 480, y: 510 },
  { x: 2160, y: 930 }
];

/* ===============================
   ELEMENTOS DA TELA
   =============================== */

const setupScreen = document.querySelector("#setupScreen");
const gameScreen = document.querySelector("#gameScreen");
const playerNameInput = document.querySelector("#playerName");
const roomCodeInput = document.querySelector("#roomCode");
const randomRoomBtn = document.querySelector("#randomRoomBtn");
const enterRoomBtn = document.querySelector("#enterRoomBtn");
const leaveRoomBtn = document.querySelector("#leaveRoomBtn");
const respawnBtn = document.querySelector("#respawnBtn");
const restartRoomBtn = document.querySelector("#restartRoomBtn");
const setupError = document.querySelector("#setupError");
const currentRoomTitle = document.querySelector("#currentRoom");
const scoreboard = document.querySelector("#scoreboard");
const buffList = document.querySelector("#buffList");
const statusBar = document.querySelector("#statusBar");
const timerEl = document.querySelector("#timer");
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const selectedPreview = document.querySelector("#selectedPreview");
const selectedName = document.querySelector("#selectedName");
const selectedSkill = document.querySelector("#selectedSkill");
const statHp = document.querySelector("#statHp");
const statSpeed = document.querySelector("#statSpeed");
const statCooldown = document.querySelector("#statCooldown");
const statDamage = document.querySelector("#statDamage");
const endOverlay = document.querySelector("#endOverlay");
const winnerText = document.querySelector("#winnerText");
const winnerDetail = document.querySelector("#winnerDetail");

/* ===============================
   ESTADO DO JOGO
   =============================== */

const characterImages = {};
Object.entries(CHARACTER_DATA).forEach(([id, data]) => {
  characterImages[id] = loadImage(data.image);
});

const powerImages = {};
Object.entries(POWERUP_DATA).forEach(([id, data]) => {
  powerImages[id] = loadImage(data.image);
});

const SFX = {
  shot: { src: "assets/sfx_shot.wav", volume: 0.52 },
  hit: { src: "assets/sfx_hit.wav", volume: 0.58 },
  powerup: { src: "assets/sfx_powerup.wav", volume: 0.62 },
  death: { src: "assets/sfx_death.wav", volume: 0.64 },
  respawn: { src: "assets/sfx_respawn.wav", volume: 0.62 },
  ability: { src: "assets/sfx_ability.wav", volume: 0.58 },
  blocked: { src: "assets/sfx_blocked.wav", volume: 0.42 }
};

Object.values(SFX).forEach((sound) => {
  sound.audio = new Audio(sound.src);
  sound.audio.volume = sound.volume;
  sound.audio.preload = "auto";
});

const playerId = getOrCreatePlayerId();

let selectedCharacter = "blue";
let roomCode = "";
let playerRef = null;
let playersRef = null;
let bulletsRef = null;
let powerupsRef = null;
let matchRef = null;

let players = {};
let bullets = {};
let powerups = {};
let match = null;

let keys = {};
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let camera = { x: 0, y: 0 };
let localPlayer = null;
let lastShotAt = 0;
let lastAbilityAt = 0;
let lastSyncAt = 0;
let lastPresenceRepairAt = 0;
let localEffectTimers = { regenAt: 0, poisonAt: 0 };
let lastPowerupCheckAt = 0;
let gameRunning = false;
let respawning = false;
let firingHeld = false;
let activePointerId = null;

playerNameInput.value = localStorage.getItem("pngbattle:name") || "";

/* ===============================
   EVENTOS
   =============================== */

function renderCharacterGrid() {
  const grid = document.querySelector("#characterGrid");
  if (!grid) return;

  grid.innerHTML = Object.entries(CHARACTER_DATA).map(([id, data]) => `
    <button class="character-slot ${id === selectedCharacter ? "selected" : ""}" data-character="${id}" type="button">
      <img src="${data.image}" alt="${escapeHtml(data.name)}" />
      <span>${escapeHtml(data.name)}</span>
      <small>${escapeHtml(data.passiveName || "Passiva")}</small>
    </button>
  `).join("");

  grid.querySelectorAll(".character-slot").forEach((button) => {
    button.addEventListener("click", () => {
      grid.querySelectorAll(".character-slot").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");

      selectedCharacter = button.dataset.character;
      updateCharacterPreview();
    });
  });
}

randomRoomBtn.addEventListener("click", () => {
  roomCodeInput.value = `sala-${Math.random().toString(36).slice(2, 7)}`;
});

enterRoomBtn.addEventListener("click", enterRoom);
leaveRoomBtn.addEventListener("click", leaveRoom);
respawnBtn.addEventListener("click", tryRespawn);
restartRoomBtn.addEventListener("click", restartRoom);

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;

  if (event.code === "Space") {
    event.preventDefault();
    firingHeld = true;
    shoot();
  }

  if (event.key.toLowerCase() === "r") {
    tryRespawn();
  }

  if (event.key.toLowerCase() === "q") {
    event.preventDefault();
    useAbility();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;

  if (event.code === "Space") {
    firingHeld = false;
  }
});

function updateMouseFromPointerEvent(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
}

canvas.addEventListener("pointermove", updateMouseFromPointerEvent);

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;

  event.preventDefault();
  updateMouseFromPointerEvent(event);
  firingHeld = true;
  activePointerId = event.pointerId;

  try {
    canvas.setPointerCapture(event.pointerId);
  } catch (error) {
    // Alguns navegadores não permitem captura em todos os contextos.
  }

  shoot();
});

window.addEventListener("pointerup", (event) => {
  if (activePointerId !== null && event.pointerId !== activePointerId) return;

  firingHeld = false;
  activePointerId = null;
});

canvas.addEventListener("pointercancel", () => {
  firingHeld = false;
  activePointerId = null;
});

canvas.addEventListener("contextmenu", (event) => event.preventDefault());

window.addEventListener("beforeunload", () => {
  if (playerRef) {
    playerRef.remove();
  }
});

renderCharacterGrid();
updateCharacterPreview();

/* ===============================
   FUNÇÕES DE ENTRADA / SALA
   =============================== */

async function enterRoom() {
  hideSetupError();

  if (!window.firebase) {
    showSetupError("Firebase não carregou. Verifique sua internet ou rode com Live Server.");
    return;
  }

  if (!db || FIREBASE_NOT_CONFIGURED) {
    showSetupError("Firebase não foi configurado corretamente no arquivo <strong>game.js</strong>.");
    return;
  }

  enterRoomBtn.disabled = true;
  enterRoomBtn.textContent = "Entrando...";

  try {
    const name = playerNameInput.value.trim() || "Jogador";
    roomCode = cleanRoomCode(roomCodeInput.value || `sala-${Math.random().toString(36).slice(2, 7)}`);

    if (!roomCode) {
      roomCode = `sala-${Math.random().toString(36).slice(2, 7)}`;
    }

    localStorage.setItem("pngbattle:name", name);

    await ensureMatchExists();

    const config = CHARACTER_DATA[selectedCharacter];
    const spawn = getRandomSpawn();
    const initialMaxHp = getInitialMaxHp(config);
    const initialBuffs = getInitialBuffs(config);

    localPlayer = {
      id: playerId,
      name,
      character: selectedCharacter,
      x: spawn.x,
      y: spawn.y,
      hp: initialMaxHp,
      maxHp: initialMaxHp,
      score: 0,
      deaths: 0,
      dead: false,
      deathAnimAt: 0,
      respawnAvailableAt: 0,
      buffs: initialBuffs,
      joinedAt: Date.now(),
      updatedAt: Date.now()
    };

    playerRef = db.ref(`rooms/${roomCode}/players/${playerId}`);

    await playerRef.set({
      ...localPlayer,
      joinedAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });

    // Remove jogadores que fecharam a aba. Se houver uma oscilação curta de conexão,
    // o loop local restaura o próprio jogador automaticamente.
    playerRef.onDisconnect().remove();

    setupScreen.classList.remove("active");
    gameScreen.classList.add("active");
    currentRoomTitle.textContent = roomCode;
    endOverlay.classList.add("hidden");

    subscribeRoom();

    gameRunning = true;
    requestAnimationFrame(gameLoop);
  } catch (error) {
    console.error(error);

    let message = "Não foi possível entrar na sala.";

    if (String(error.message || "").toLowerCase().includes("permission")) {
      message += "<br><br><strong>Motivo provável:</strong> as regras do Realtime Database estão bloqueando leitura/escrita.";
      message += "<br>Use as regras de teste do README e clique em Publish.";
    } else {
      message += `<br><br><strong>Erro:</strong> ${escapeHtml(error.message || String(error))}`;
    }

    showSetupError(message);
  } finally {
    enterRoomBtn.disabled = false;
    enterRoomBtn.textContent = "Entrar na sala";
  }
}

async function ensureMatchExists() {
  const ref = db.ref(`rooms/${roomCode}/match`);

  const result = await ref.transaction((current) => {
    if (current && current.startedAt && current.status === "playing") {
      return current;
    }

    return {
      startedAt: Date.now(),
      durationMs: MATCH_DURATION_MS,
      status: "playing",
      winnerId: "",
      winnerName: "",
      endedAt: 0,
      mapIndex: Math.floor(Math.random() * MAPS.length)
    };
  });

  match = result.snapshot.val() || match;
}

function subscribeRoom() {
  playersRef = db.ref(`rooms/${roomCode}/players`);
  bulletsRef = db.ref(`rooms/${roomCode}/bullets`);
  powerupsRef = db.ref(`rooms/${roomCode}/powerups`);
  matchRef = db.ref(`rooms/${roomCode}/match`);

  playersRef.on("value", (snapshot) => {
    players = snapshot.val() || {};

    if (players[playerId]) {
      localPlayer = sanitizePlayerState({
        ...localPlayer,
        ...players[playerId]
      });
      players[playerId] = localPlayer;
    } else if (gameRunning && localPlayer && playerRef) {
      localPlayer = sanitizePlayerState(localPlayer);
      players[playerId] = localPlayer;
      restoreLocalPlayerToRoom("snapshot");
    }

    renderScoreboard();
  });

  bulletsRef.on("value", (snapshot) => {
    bullets = snapshot.val() || {};
  });

  powerupsRef.on("value", (snapshot) => {
    powerups = snapshot.val() || {};
  });

  matchRef.on("value", (snapshot) => {
    match = snapshot.val() || null;

    if (match && match.status === "ended") {
      showEndOverlay();
    }
  });
}

function leaveRoom() {
  gameRunning = false;

  if (playersRef) playersRef.off();
  if (bulletsRef) bulletsRef.off();
  if (powerupsRef) powerupsRef.off();
  if (matchRef) matchRef.off();
  if (playerRef) playerRef.remove();

  setupScreen.classList.add("active");
  gameScreen.classList.remove("active");

  players = {};
  bullets = {};
  powerups = {};
  match = null;
  localPlayer = null;
  playerRef = null;
  playersRef = null;
  bulletsRef = null;
  powerupsRef = null;
  matchRef = null;
  roomCode = "";
  respawning = false;
  firingHeld = false;
  activePointerId = null;
}

async function restartRoom() {
  if (!db || !roomCode) return;

  const updates = {};
  const nextMapIndex = Math.floor(Math.random() * MAPS.length);
  match = { ...(match || {}), mapIndex: nextMapIndex };

  updates[`rooms/${roomCode}/bullets`] = null;
  updates[`rooms/${roomCode}/powerups`] = null;
  updates[`rooms/${roomCode}/match`] = {
    startedAt: Date.now(),
    durationMs: MATCH_DURATION_MS,
    status: "playing",
    winnerId: "",
    winnerName: "",
    endedAt: 0,
    mapIndex: nextMapIndex
  };

  Object.values(players).forEach((player) => {
    const config = CHARACTER_DATA[player.character] || CHARACTER_DATA.blue;
    const spawn = getRandomSpawn();

    updates[`rooms/${roomCode}/players/${player.id}/score`] = 0;
    updates[`rooms/${roomCode}/players/${player.id}/deaths`] = 0;
    const initialMaxHp = getInitialMaxHp(config);
    updates[`rooms/${roomCode}/players/${player.id}/hp`] = initialMaxHp;
    updates[`rooms/${roomCode}/players/${player.id}/maxHp`] = initialMaxHp;
    updates[`rooms/${roomCode}/players/${player.id}/dead`] = false;
    updates[`rooms/${roomCode}/players/${player.id}/deathAnimAt`] = 0;
    updates[`rooms/${roomCode}/players/${player.id}/respawnAvailableAt`] = 0;
    updates[`rooms/${roomCode}/players/${player.id}/x`] = spawn.x;
    updates[`rooms/${roomCode}/players/${player.id}/y`] = spawn.y;
    updates[`rooms/${roomCode}/players/${player.id}/buffs`] = getInitialBuffs(config);
  });

  await db.ref().update(updates);
  endOverlay.classList.add("hidden");
}

/* ===============================
   LOOP PRINCIPAL
   =============================== */

function gameLoop(timestamp) {
  if (!gameRunning) return;

  updateTimerAndMatch();
  ensureLocalPlayerPresence();
  processLocalEffects();
  updateLocalPlayer();
  handleContinuousFire();
  updateCamera();
  updateOwnedBullets();
  checkPowerupSpawn(timestamp);
  checkPowerupPickup();
  detectHits();
  autoRespawnIfReady();
  drawGame();

  if (timestamp - lastSyncAt > SYNC_INTERVAL) {
    syncLocalPlayer();
    lastSyncAt = timestamp;
  }

  requestAnimationFrame(gameLoop);
}

function updateTimerAndMatch() {
  if (!match || !match.startedAt) return;

  const remaining = getRemainingMs();
  timerEl.textContent = formatTime(remaining);

  if (remaining <= 0 && match.status === "playing") {
    endMatch();
  }
}

async function endMatch() {
  if (!matchRef || !match || match.status === "ended") return;

  const sorted = Object.values(players).sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    return (a.deaths || 0) - (b.deaths || 0);
  });

  const winner = sorted[0] || null;

  await matchRef.transaction((current) => {
    if (!current || current.status === "ended") return current;

    return {
      ...current,
      status: "ended",
      winnerId: winner ? winner.id : "",
      winnerName: winner ? winner.name : "Sem vencedor",
      endedAt: Date.now()
    };
  });
}

function ensureLocalPlayerPresence() {
  if (!gameRunning || !localPlayer || !playerRef || isMatchEnded()) return;

  const repaired = sanitizePlayerState(localPlayer);

  if (repaired !== localPlayer) {
    localPlayer = repaired;
  }

  if (!players[playerId]) {
    players[playerId] = localPlayer;
    restoreLocalPlayerToRoom("loop");
  }
}

function restoreLocalPlayerToRoom(reason = "auto") {
  if (!playerRef || !localPlayer) return;

  const now = Date.now();
  if (now - lastPresenceRepairAt < 1200) return;
  lastPresenceRepairAt = now;

  const repaired = sanitizePlayerState(localPlayer);
  localPlayer = repaired;

  playerRef.set({
    ...repaired,
    offline: false,
    restoredByClient: reason,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  }).catch((error) => {
    console.warn("Falha ao restaurar jogador na sala:", error);
  });
}

function handleContinuousFire() {
  if (!firingHeld) return;
  shoot();
}

function updateLocalPlayer() {
  if (!localPlayer || isMatchEnded() || localPlayer.dead || localPlayer.hp <= 0) return;

  localPlayer = sanitizePlayerState(localPlayer);

  const config = CHARACTER_DATA[localPlayer.character] || CHARACTER_DATA.blue;

  let dx = 0;
  let dy = 0;

  if (keys["w"] || keys["arrowup"]) dy -= 1;
  if (keys["s"] || keys["arrowdown"]) dy += 1;
  if (keys["a"] || keys["arrowleft"]) dx -= 1;
  if (keys["d"] || keys["arrowright"]) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;
  }

  const speed = getEffectiveSpeed(localPlayer, config);
  movePlayerWithCollision(dx * speed, dy * speed);
}

function movePlayerWithCollision(moveX, moveY) {
  const canPhaseWalls = hasTimedBuff(localPlayer, "wallWalkUntil");

  let nextX = clamp(localPlayer.x + moveX, PLAYER_RADIUS, WORLD.width - PLAYER_RADIUS);
  let nextY = localPlayer.y;

  if (canPhaseWalls || !circleCollidesWalls(nextX, nextY, PLAYER_RADIUS)) {
    localPlayer.x = nextX;
  }

  nextX = localPlayer.x;
  nextY = clamp(localPlayer.y + moveY, PLAYER_RADIUS, WORLD.height - PLAYER_RADIUS);

  if (canPhaseWalls || !circleCollidesWalls(nextX, nextY, PLAYER_RADIUS)) {
    localPlayer.y = nextY;
  }
}

function updateCamera() {
  if (!localPlayer) return;

  camera.x = clamp(localPlayer.x - canvas.width / 2, 0, WORLD.width - canvas.width);
  camera.y = clamp(localPlayer.y - canvas.height / 2, 0, WORLD.height - canvas.height);
}

function syncLocalPlayer() {
  if (!localPlayer || !playerRef) return;

  localPlayer = sanitizePlayerState(localPlayer);

  playerRef.update({
    x: localPlayer.x,
    y: localPlayer.y,
    character: localPlayer.character,
    buffs: localPlayer.buffs || {},
    offline: false,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  }).catch((error) => {
    console.warn("Falha ao sincronizar jogador:", error);
  });
}

function updateOwnedBullets() {
  if (!db || !roomCode) return;

  const now = Date.now();

  Object.entries(bullets).forEach(([bulletId, bullet]) => {
    if (bullet.owner !== playerId) return;

    const age = now - bullet.createdAt;

    if (bullet.laser) {
      if (age > 170) {
        db.ref(`rooms/${roomCode}/bullets/${bulletId}`).remove();
      }
      return;
    }

    const last = bullet.lastUpdate || bullet.createdAt || now;
    const dt = Math.min(40, now - last) / 16.67;

    let nextVx = bullet.vx;
    let nextVy = bullet.vy;

    if (bullet.homing) {
      const target = findNearestEnemy(bullet.x, bullet.y, 520);
      if (target) {
        const desiredAngle = Math.atan2(target.y - bullet.y, target.x - bullet.x);
        const speed = Math.max(3, Math.hypot(nextVx, nextVy));
        const desiredVx = Math.cos(desiredAngle) * speed;
        const desiredVy = Math.sin(desiredAngle) * speed;
        nextVx = nextVx * 0.88 + desiredVx * 0.12;
        nextVy = nextVy * 0.88 + desiredVy * 0.12;
      }
    }

    let nextX = bullet.x + nextVx * dt;
    let nextY = bullet.y + nextVy * dt;
    let bounces = bullet.bounces || 0;

    const wallHit = !bullet.throughWalls && pointInsideAnyWall(nextX, nextY, bullet.radius || BULLET_RADIUS);

    if (wallHit) {
      if (bullet.ricochet && bounces < (bullet.maxBounces || 3)) {
        const prevXHit = pointInsideAnyWall(bullet.x, nextY, bullet.radius || BULLET_RADIUS);
        const prevYHit = pointInsideAnyWall(nextX, bullet.y, bullet.radius || BULLET_RADIUS);

        if (!prevXHit && prevYHit) {
          nextVx *= -1;
        } else if (prevXHit && !prevYHit) {
          nextVy *= -1;
        } else {
          nextVx *= -1;
          nextVy *= -1;
        }

        nextX = bullet.x + nextVx * 2;
        nextY = bullet.y + nextVy * 2;
        bounces += 1;
      } else {
        db.ref(`rooms/${roomCode}/bullets/${bulletId}`).remove();
        return;
      }
    }

    const outside = nextX < -80 || nextX > WORLD.width + 80 || nextY < -80 || nextY > WORLD.height + 80;
    const ttl = bullet.sniper || bullet.throughWalls ? 3600 : 2800;

    if (age > ttl || outside) {
      db.ref(`rooms/${roomCode}/bullets/${bulletId}`).remove();
      return;
    }

    db.ref(`rooms/${roomCode}/bullets/${bulletId}`).update({
      x: nextX,
      y: nextY,
      vx: nextVx,
      vy: nextVy,
      bounces,
      lastUpdate: now
    });
  });
}

function findNearestEnemy(x, y, maxDistance) {
  let nearest = null;
  let nearestDistance = maxDistance;

  Object.values(players).forEach((player) => {
    if (!player || player.id === playerId || player.dead || player.hp <= 0) return;

    const distance = Math.hypot(player.x - x, player.y - y);
    if (distance < nearestDistance) {
      nearest = player;
      nearestDistance = distance;
    }
  });

  return nearest;
}

/* ===============================
   TIRO, DANO E MORTE
   =============================== */

function shoot() {
  if (!db || !roomCode || !localPlayer || localPlayer.dead || localPlayer.hp <= 0 || isMatchEnded()) return;

  const now = Date.now();
  const config = CHARACTER_DATA[localPlayer.character] || CHARACTER_DATA.blue;
  const cooldown = getEffectiveCooldown(localPlayer, config);

  if (now - lastShotAt < cooldown) return;
  lastShotAt = now;

  playShotSound();

  const worldMouse = screenToWorld(mouse.x, mouse.y);
  const angle = Math.atan2(worldMouse.y - localPlayer.y, worldMouse.x - localPlayer.x);
  firePattern(angle);
}

function firePattern(angle, forcedOptions = {}) {
  const buffs = localPlayer.buffs || {};
  const now = Date.now();
  const options = { ...getBulletOptionsFromState(), ...forcedOptions };

  if (hasTimedBuff(localPlayer, "laserUntil") || forcedOptions.forceLaser) {
    createLaser(angle, options);
    return;
  }

  if (hasTimedBuff(localPlayer, "eightWayUntil") || forcedOptions.forceEightWay) {
    for (let i = 0; i < 8; i++) {
      createBullet((Math.PI * 2 / 8) * i, options);
    }
    return;
  }

  const angles = [angle];

  if (hasTimedBuff(localPlayer, "doubleUntil")) {
    angles.splice(0, 1, angle - 0.13, angle + 0.13);
  }

  if (hasTimedBuff(localPlayer, "tripleUntil")) {
    angles.splice(0, angles.length, angle - 0.18, angle, angle + 0.18);
  }

  if (hasTimedBuff(localPlayer, "scatterUntil")) {
    angles.splice(0, angles.length, angle - 0.34, angle - 0.17, angle, angle + 0.17, angle + 0.34);
  }

  if (hasTimedBuff(localPlayer, "frontBackUntil") || forcedOptions.forceFrontBack) {
    angles.push(angle + Math.PI);
  }

  angles.forEach((shotAngle) => createBullet(shotAngle, options));

  if (buffs.cloneSideUntil && buffs.cloneSideUntil > now) {
    createBullet(angle + Math.PI / 2, options);
    createBullet(angle - Math.PI / 2, options);
  }
}

function getBulletOptionsFromState() {
  const config = CHARACTER_DATA[localPlayer.character] || CHARACTER_DATA.blue;
  const passive = config.passive || {};

  const speed = getEffectiveBulletSpeed(localPlayer, config);
  const damage = getEffectiveDamage(localPlayer, config);
  const ricochet = hasTimedBuff(localPlayer, "ricochetUntil") || hasTimedBuff(localPlayer, "megaRicochetUntil");
  const maxBounces = hasTimedBuff(localPlayer, "megaRicochetUntil") ? 7 : 3;
  const healAmount = hasTimedBuff(localPlayer, "healShotUntil") ? 2 : hasTimedBuff(localPlayer, "drainShotUntil") ? 1 : (passive.healOnHit || 0);

  return {
    speed,
    damage,
    ricochet,
    maxBounces,
    throughWalls: hasTimedBuff(localPlayer, "wallShotUntil"),
    homing: hasTimedBuff(localPlayer, "homingUntil"),
    slow: hasTimedBuff(localPlayer, "slowShotUntil"),
    poison: hasTimedBuff(localPlayer, "poisonShotUntil"),
    explosive: hasTimedBuff(localPlayer, "explosiveUntil"),
    giant: hasTimedBuff(localPlayer, "giantBulletUntil"),
    sniper: hasTimedBuff(localPlayer, "sniperUntil"),
    healOwner: healAmount > 0,
    healAmount,
    pierce: hasTimedBuff(localPlayer, "wallShotUntil") || hasTimedBuff(localPlayer, "sniperUntil"),
    color: getBulletColor()
  };
}

function getBulletColor() {
  if (hasTimedBuff(localPlayer, "poisonShotUntil")) return "#88ff4a";
  if (hasTimedBuff(localPlayer, "laserUntil")) return "#ff3434";
  if (hasTimedBuff(localPlayer, "homingUntil")) return "#9b7bff";
  if (hasTimedBuff(localPlayer, "slowShotUntil")) return "#77d7ff";
  if (hasTimedBuff(localPlayer, "healShotUntil") || hasTimedBuff(localPlayer, "drainShotUntil")) return "#ff78b8";
  if (hasTimedBuff(localPlayer, "explosiveUntil")) return "#ff5c33";
  return "#ffad42";
}

function createBullet(angle, options = {}) {
  const bulletRef = db.ref(`rooms/${roomCode}/bullets`).push();
  const radius = options.giant ? BULLET_RADIUS * 1.9 : options.sniper ? BULLET_RADIUS * 0.75 : BULLET_RADIUS;
  const speed = options.speed || 11;

  bulletRef.set({
    owner: playerId,
    ownerName: localPlayer.name,
    x: localPlayer.x + Math.cos(angle) * 38,
    y: localPlayer.y + Math.sin(angle) * 38,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    damage: options.damage || 1,
    radius,
    color: options.color || "#ffad42",
    ricochet: Boolean(options.ricochet),
    maxBounces: options.maxBounces || 3,
    throughWalls: Boolean(options.throughWalls),
    homing: Boolean(options.homing),
    slow: Boolean(options.slow),
    poison: Boolean(options.poison),
    explosive: Boolean(options.explosive),
    healOwner: Boolean(options.healOwner),
    healAmount: options.healAmount || 0,
    pierce: Boolean(options.pierce),
    sniper: Boolean(options.sniper),
    bounces: 0,
    hitMap: {},
    createdAt: Date.now(),
    lastUpdate: Date.now()
  });
}

function createLaser(angle, options = {}) {
  const bulletRef = db.ref(`rooms/${roomCode}/bullets`).push();

  bulletRef.set({
    owner: playerId,
    ownerName: localPlayer.name,
    x: localPlayer.x,
    y: localPlayer.y,
    angle,
    vx: Math.cos(angle),
    vy: Math.sin(angle),
    damage: Math.max(2, options.damage || 2),
    radius: 15,
    color: "#ff3434",
    laser: true,
    length: 720,
    throughWalls: true,
    pierce: true,
    hitMap: {},
    createdAt: Date.now(),
    lastUpdate: Date.now()
  });
}

async function useAbility() {
  if (!db || !roomCode || !localPlayer || localPlayer.dead || localPlayer.hp <= 0 || isMatchEnded()) return;

  const now = Date.now();
  const config = CHARACTER_DATA[localPlayer.character] || CHARACTER_DATA.blue;
  const ability = config.ability || "dash";
  const cooldown = config.abilityCooldown || 9000;

  if (now - lastAbilityAt < cooldown) {
    const remaining = Math.ceil((cooldown - (now - lastAbilityAt)) / 1000);
    statusBar.textContent = `Habilidade Q recarregando: ${remaining}s.`;
    playSound("blocked");
    return;
  }

  lastAbilityAt = now;
  playSound("ability");
  const worldMouse = screenToWorld(mouse.x, mouse.y);
  const angle = Math.atan2(worldMouse.y - localPlayer.y, worldMouse.x - localPlayer.x);

  if (ability === "dash") {
    dashTowards(angle, 230);
    statusBar.textContent = "Q usado: Dash curto.";
    return;
  }

  if (ability === "shield") {
    await addTimedBuff("shieldUntil", 5000);
    statusBar.textContent = "Q usado: Escudo ativado.";
    return;
  }

  if (ability === "speedBurst") {
    await addTimedBuff("speedAmplifyUntil", 6000);
    statusBar.textContent = "Q usado: velocidade amplificada.";
    return;
  }

  if (ability === "heal") {
    await healPlayerBy(playerId, 3);
    statusBar.textContent = "Q usado: cura instantânea.";
    return;
  }

  if (ability === "laser") {
    createLaser(angle, getBulletOptionsFromState());
    statusBar.textContent = "Q usado: Laser.";
    return;
  }

  if (ability === "eightShot") {
    firePattern(angle, { forceEightWay: true });
    statusBar.textContent = "Q usado: tiros em 8 direções.";
    return;
  }

  if (ability === "wallPhase") {
    await addTimedBuff("wallWalkUntil", 5500);
    statusBar.textContent = "Q usado: atravessar paredes.";
    return;
  }

  if (ability === "poisonBurst") {
    await applyAreaEffect("poison", 330);
    statusBar.textContent = "Q usado: névoa venenosa.";
    return;
  }

  if (ability === "explosiveShot") {
    await addTimedBuff("explosiveUntil", 8000);
    statusBar.textContent = "Q usado: tiros explosivos.";
    return;
  }

  if (ability === "ghostShot") {
    await addTimedBuff("wallShotUntil", 8000);
    statusBar.textContent = "Q usado: tiros atravessam paredes.";
    return;
  }

  if (ability === "healShot") {
    await addTimedBuff("healShotUntil", 9000);
    statusBar.textContent = "Q usado: tiro que cura ao acertar.";
    return;
  }

  if (ability === "poisonShot") {
    await addTimedBuff("poisonShotUntil", 9000);
    statusBar.textContent = "Q usado: tiro venenoso.";
    return;
  }

  if (ability === "slowPulse") {
    await applyAreaEffect("slow", 360);
    statusBar.textContent = "Q usado: pulso de lentidão.";
    return;
  }

  if (ability === "damageBurst") {
    await addTimedBuff("damageAmplifyUntil", 7000);
    statusBar.textContent = "Q usado: dano amplificado.";
    return;
  }

  if (ability === "homingShot") {
    await addTimedBuff("homingUntil", 9000);
    statusBar.textContent = "Q usado: tiro teleguiado.";
    return;
  }

  if (ability === "hpAmp") {
    await amplifyMaxHp(4);
    statusBar.textContent = "Q usado: vida amplificada.";
    return;
  }

  if (ability === "frontBack") {
    firePattern(angle, { forceFrontBack: true });
    statusBar.textContent = "Q usado: tiro pela frente e por trás.";
    return;
  }
}

function dashTowards(angle, distance) {
  const canPhaseWalls = hasTimedBuff(localPlayer, "wallWalkUntil");
  const steps = 12;
  const step = distance / steps;

  for (let i = 0; i < steps; i++) {
    const nextX = clamp(localPlayer.x + Math.cos(angle) * step, PLAYER_RADIUS, WORLD.width - PLAYER_RADIUS);
    const nextY = clamp(localPlayer.y + Math.sin(angle) * step, PLAYER_RADIUS, WORLD.height - PLAYER_RADIUS);

    if (!canPhaseWalls && circleCollidesWalls(nextX, nextY, PLAYER_RADIUS)) break;

    localPlayer.x = nextX;
    localPlayer.y = nextY;
  }

  syncLocalPlayer();
}

async function addTimedBuff(buffKey, duration) {
  const buffs = { ...(localPlayer.buffs || {}) };
  buffs[buffKey] = Math.max(buffs[buffKey] || 0, Date.now() + duration);
  localPlayer.buffs = buffs;
  await playerRef.update({ buffs, updatedAt: firebase.database.ServerValue.TIMESTAMP });
}

function playShotSound() {
  playSound("shot");
}

function playSound(name, volumeOverride) {
  const sound = SFX[name];
  if (!sound || !sound.audio) return;

  try {
    const clone = sound.audio.cloneNode();
    clone.volume = typeof volumeOverride === "number" ? volumeOverride : sound.volume;
    clone.play().catch(() => {});
  } catch (error) {
    // Navegadores podem bloquear áudio antes da primeira interação.
  }
}

function detectHits() {
  if (!localPlayer || localPlayer.dead || localPlayer.hp <= 0 || isMatchEnded()) return;

  Object.entries(bullets).forEach(([bulletId, bullet]) => {
    if (bullet.owner === playerId) return;
    if (bullet.hitMap && bullet.hitMap[playerId]) return;

    let hit = false;

    if (bullet.laser) {
      hit = distanceToSegment(
        localPlayer.x,
        localPlayer.y,
        bullet.x,
        bullet.y,
        bullet.x + Math.cos(bullet.angle || 0) * (bullet.length || 700),
        bullet.y + Math.sin(bullet.angle || 0) * (bullet.length || 700)
      ) <= PLAYER_RADIUS + (bullet.radius || 12);
    } else {
      const distance = Math.hypot(bullet.x - localPlayer.x, bullet.y - localPlayer.y);
      hit = distance <= PLAYER_RADIUS + (bullet.radius || BULLET_RADIUS);
    }

    if (hit) {
      applyHit(bulletId, bullet);
    }
  });
}

async function applyHit(bulletId, bullet) {
  playSound("hit");
  const damage = getIncomingDamage(bullet.damage || 1);
  const bulletRef = db.ref(`rooms/${roomCode}/bullets/${bulletId}`);

  if (bullet.pierce || bullet.laser) {
    await bulletRef.child(`hitMap/${playerId}`).set(true);
  } else {
    await bulletRef.remove();
  }

  if (bullet.slow) {
    await mergeBuffToLocal("slowUntil", 3200);
  }

  if (bullet.poison) {
    await applyPoison(bullet.owner);
  }

  if (bullet.explosive) {
    await applyExplosionDamage(bullet.owner, bullet.x, bullet.y, damage);
  }

  if (bullet.healOwner && bullet.owner) {
    await healPlayerBy(bullet.owner, bullet.healAmount || 1);
  }

  const hpRef = db.ref(`rooms/${roomCode}/players/${playerId}/hp`);

  const result = await hpRef.transaction((currentHp) => {
    if (currentHp === null || currentHp <= 0) return currentHp;
    return Math.max(0, currentHp - damage);
  });

  const newHp = result.snapshot.val();

  if (result.committed && newHp <= 0 && !respawning) {
    await die(bullet.owner);
  }
}

async function applyExplosionDamage(attackerId, x, y, baseDamage) {
  const distance = Math.hypot(localPlayer.x - x, localPlayer.y - y);
  if (distance > 135) return;

  const splashDamage = Math.max(1, Math.floor(baseDamage / 2));
  const hpRef = db.ref(`rooms/${roomCode}/players/${playerId}/hp`);

  const result = await hpRef.transaction((currentHp) => {
    if (currentHp === null || currentHp <= 0) return currentHp;
    return Math.max(0, currentHp - splashDamage);
  });

  const newHp = result.snapshot.val();

  if (result.committed && newHp <= 0 && !respawning) {
    await die(attackerId);
  }
}

async function applyPoison(attackerId) {
  const config = CHARACTER_DATA[localPlayer.character] || CHARACTER_DATA.blue;
  if (config.passive && config.passive.poisonImmune) return;

  const buffs = { ...(localPlayer.buffs || {}) };
  buffs.poisonUntil = Date.now() + 2000;
  buffs.poisonAttackerId = attackerId || "";
  buffs.poisonTicks = 2;
  localPlayer.buffs = buffs;
  await playerRef.update({ buffs, updatedAt: firebase.database.ServerValue.TIMESTAMP });
}

async function mergeBuffToLocal(buffKey, duration) {
  const buffs = { ...(localPlayer.buffs || {}) };
  buffs[buffKey] = Math.max(buffs[buffKey] || 0, Date.now() + duration);
  localPlayer.buffs = buffs;
  await playerRef.update({ buffs, updatedAt: firebase.database.ServerValue.TIMESTAMP });
}

async function die(attackerId) {
  respawning = true;
  const now = Date.now();

  await playerRef.update({
    dead: true,
    hp: 0,
    deaths: (localPlayer.deaths || 0) + 1,
    deathAnimAt: now,
    respawnAvailableAt: now + RESPAWN_DELAY_MS,
    buffs: {}
  });

  if (attackerId && attackerId !== playerId) {
    await addScore(attackerId);
  }

  playSound("death");
  statusBar.textContent = "Você morreu. Aguarde para renascer.";
  updateRespawnButton();
}

async function addScore(attackerId) {
  const scoreRef = db.ref(`rooms/${roomCode}/players/${attackerId}/score`);
  await scoreRef.transaction((currentScore) => {
    return (currentScore || 0) + 1;
  });
}

function autoRespawnIfReady() {
  updateRespawnButton();

  if (!localPlayer || !localPlayer.dead || isMatchEnded()) return;

  if (Date.now() >= (localPlayer.respawnAvailableAt || 0)) {
    respawnBtn.disabled = false;
    respawnBtn.textContent = "Renascer";
  }
}

async function tryRespawn() {
  if (!localPlayer || !localPlayer.dead || isMatchEnded()) return;

  const now = Date.now();
  const availableAt = localPlayer.respawnAvailableAt || 0;

  if (now < availableAt) return;

  const config = CHARACTER_DATA[localPlayer.character] || CHARACTER_DATA.blue;
  const spawn = getRandomSpawn();
  const initialMaxHp = getInitialMaxHp(config);

  respawning = false;

  await playerRef.update({
    hp: initialMaxHp,
    maxHp: initialMaxHp,
    x: spawn.x,
    y: spawn.y,
    dead: false,
    deathAnimAt: 0,
    respawnAvailableAt: 0,
    buffs: getInitialBuffs(config),
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  });

  playSound("respawn");
  statusBar.textContent = "Você renasceu.";
  respawnBtn.classList.add("hidden");
}

function updateRespawnButton() {
  if (!localPlayer || !localPlayer.dead) {
    respawnBtn.classList.add("hidden");
    return;
  }

  respawnBtn.classList.remove("hidden");

  const remaining = Math.max(0, (localPlayer.respawnAvailableAt || 0) - Date.now());

  if (remaining > 0) {
    respawnBtn.disabled = true;
    respawnBtn.textContent = `Renascer em ${Math.ceil(remaining / 1000)}s`;
  } else {
    respawnBtn.disabled = false;
    respawnBtn.textContent = "Renascer";
  }
}

/* ===============================
   POWER-UPS / APRIMORAMENTOS
   =============================== */

function checkPowerupSpawn(timestamp) {
  if (!powerupsRef || isMatchEnded()) return;

  if (timestamp - lastPowerupCheckAt < POWERUP_RESPAWN_MS) return;
  lastPowerupCheckAt = timestamp;

  const count = Object.keys(powerups).length;

  if (count >= MAX_POWERUPS) return;

  // Cada cliente pode tentar criar. O limite evita excesso na prática.
  const type = randomFrom(POWERUP_TYPES);
  const pos = randomFreePosition(80);

  powerupsRef.push({
    type,
    x: pos.x,
    y: pos.y,
    createdAt: Date.now()
  });
}

async function checkPowerupPickup() {
  if (!localPlayer || localPlayer.dead || isMatchEnded()) return;

  for (const [powerId, power] of Object.entries(powerups)) {
    const distance = Math.hypot(power.x - localPlayer.x, power.y - localPlayer.y);

    if (distance <= PLAYER_RADIUS + 28) {
      await db.ref(`rooms/${roomCode}/powerups/${powerId}`).remove();
      await applyPowerup(power.type);
      break;
    }
  }
}

async function applyPowerup(type) {
  playSound("powerup");
  const data = POWERUP_DATA[type] || POWERUP_DATA.double;

  if (data.instant === "hpAmp") {
    await amplifyMaxHp(4);
    statusBar.textContent = "Aprimoramento coletado: Vida Amplificada.";
    return;
  }

  if (data.buff) {
    await addTimedBuff(data.buff, getPowerupDuration(type));
    statusBar.textContent = `Aprimoramento coletado: ${data.name}.`;
    return;
  }

  statusBar.textContent = `Aprimoramento coletado: ${data.name}.`;
}

function getPowerupDuration(type) {
  const custom = {
    shield: 8000,
    invisible: 7000,
    wallWalk: 7500,
    laser: 6500,
    homing: 9000,
    speedAmp: 8500,
    damageAmp: 8000,
    sniper: 8500,
    poisonShot: 9000,
    slowShot: 9000,
    wallShot: 9000,
    healShot: 9000,
    drain: 9000,
    giant: 8000,
    explosive: 8500,
    eightWay: 6000,
    frontBack: 9000,
    bulletSpeed: 9000
  };

  return custom[type] || POWERUP_DURATION_MS;
}

function getActiveBuffLabels(player = localPlayer) {
  if (!player) return [];

  const now = Date.now();
  const buffs = player.buffs || {};
  const labels = [
    ["doubleUntil", "Tiro Duplo"],
    ["rapidUntil", "Cadência +"],
    ["ricochetUntil", "Ricochete"],
    ["megaRicochetUntil", "Ricochete Avançado"],
    ["wallShotUntil", "Tiro atravessa parede"],
    ["healShotUntil", "Tiro que cura"],
    ["drainShotUntil", "Roubo de Vida"],
    ["bulletSpeedUntil", "Tiro 2x veloz"],
    ["frontBackUntil", "Frente e Trás"],
    ["homingUntil", "Teleguiado"],
    ["slowShotUntil", "Tiro de lentidão"],
    ["eightWayUntil", "8 Direções"],
    ["laserUntil", "Laser"],
    ["poisonShotUntil", "Venenoso"],
    ["speedAmplifyUntil", "Velocidade +"],
    ["wallWalkUntil", "Atravessar paredes"],
    ["tripleUntil", "Tiro Triplo"],
    ["explosiveUntil", "Explosivo"],
    ["shieldUntil", "Escudo"],
    ["giantBulletUntil", "Tiro Gigante"],
    ["damageAmplifyUntil", "Dano +"],
    ["invisibleUntil", "Invisível"],
    ["sniperUntil", "Tiro Preciso"],
    ["scatterUntil", "Dispersão"],
    ["slowUntil", "Lentidão"],
    ["poisonUntil", "Envenenado"]
  ];

  return labels
    .filter(([key]) => buffs[key] && buffs[key] > now)
    .map(([key, name]) => ({ name, remaining: buffs[key] - now }));
}

function renderBuffs() {
  if (!localPlayer) return;

  const active = getActiveBuffLabels(localPlayer);

  if (!active.length) {
    buffList.textContent = "Nenhum aprimoramento ativo.";
    return;
  }

  buffList.innerHTML = active.map((buff) => `
    <div class="buff-pill">
      <strong>${buff.name}</strong>
      <span>${Math.ceil(buff.remaining / 1000)}s</span>
    </div>
  `).join("");
}

/* ===============================
   DESENHO DO JOGO
   =============================== */

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawWalls();
  drawPowerups();
  drawBullets();
  drawPlayers();
  drawAimLine();
  drawMiniMap();
  updateStatus();
  renderBuffs();
}

function drawBackground() {
  ctx.save();
  const map = getCurrentMap();
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, map.bgA || "#101018");
  gradient.addColorStop(1, map.bgB || "#171724");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;

  const grid = 70;
  const startX = -camera.x % grid;
  const startY = -camera.y % grid;

  for (let x = startX; x < canvas.width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = startY; y < canvas.height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawWalls() {
  ctx.save();

  getCurrentWalls().forEach((wall) => {
    const x = wall.x - camera.x;
    const y = wall.y - camera.y;

    if (x + wall.w < -50 || x > canvas.width + 50 || y + wall.h < -50 || y > canvas.height + 50) {
      return;
    }

    ctx.fillStyle = "#2a2b38";
    ctx.strokeStyle = "rgba(255, 173, 66, 0.38)";
    ctx.lineWidth = 2;

    roundRect(ctx, x, y, wall.w, wall.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let stripe = x + 12; stripe < x + wall.w; stripe += 32) {
      ctx.fillRect(stripe, y + 8, 10, wall.h - 16);
    }
  });

  ctx.restore();
}

function drawPowerups() {
  const now = Date.now();

  Object.values(powerups).forEach((power) => {
    const data = POWERUP_DATA[power.type] || POWERUP_DATA.double;
    const image = powerImages[power.type];

    const x = power.x - camera.x;
    const y = power.y - camera.y;

    if (x < -80 || x > canvas.width + 80 || y < -80 || y > canvas.height + 80) return;

    const pulse = 1 + Math.sin(now / 180) * 0.08;
    const size = 46 * pulse;

    ctx.save();
    ctx.shadowColor = data.color;
    ctx.shadowBlur = 22;

    if (isImageReady(image)) {
      ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
    } else {
      ctx.fillStyle = data.color;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.font = "800 12px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(data.name, x, y + 40);
    ctx.restore();
  });
}

function drawBullets() {
  Object.values(bullets).forEach((bullet) => {
    const x = bullet.x - camera.x;
    const y = bullet.y - camera.y;

    ctx.save();

    if (bullet.laser) {
      const angle = bullet.angle || 0;
      const endX = x + Math.cos(angle) * (bullet.length || 700);
      const endY = y + Math.sin(angle) * (bullet.length || 700);

      ctx.strokeStyle = bullet.owner === playerId ? "#ff3434" : "#ffffff";
      ctx.shadowColor = "#ff3434";
      ctx.shadowBlur = 24;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.82)";
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (x < -60 || x > canvas.width + 60 || y < -60 || y > canvas.height + 60) {
      ctx.restore();
      return;
    }

    const radius = bullet.radius || BULLET_RADIUS;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = bullet.owner === playerId ? (bullet.color || "#ffad42") : "#ffffff";
    ctx.shadowColor = bullet.color || (bullet.ricochet ? "#52b9ff" : "#ff7a18");
    ctx.shadowBlur = bullet.homing ? 24 : 16;
    ctx.fill();

    if (bullet.ricochet || bullet.throughWalls || bullet.homing || bullet.poison || bullet.slow || bullet.explosive) {
      ctx.strokeStyle = bullet.color || "#52b9ff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (bullet.explosive) {
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(x, y, 42, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawPlayers() {
  Object.values(players).forEach((player) => {
    if (!player) return;

    if (!Number.isFinite(Number(player.x)) || !Number.isFinite(Number(player.y))) {
      if (player.id === playerId && localPlayer) {
        localPlayer = sanitizePlayerState(localPlayer);
        players[playerId] = localPlayer;
      }
      return;
    }

    const image = characterImages[player.character] || characterImages.blue;
    const isMe = player.id === playerId;
    const isInvisible = hasTimedBuff(player, "invisibleUntil");
    const alpha = player.dead || player.hp <= 0 ? 0.22 : isInvisible ? (isMe ? 0.74 : 0.42) : 1;

    const x = Number(player.x) - camera.x;
    const y = Number(player.y) - camera.y;

    if (x < -100 || x > canvas.width + 100 || y < -100 || y > canvas.height + 100) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (isInvisible && !(player.dead || player.hp <= 0)) {
      ctx.setLineDash([5, 6]);
      ctx.strokeStyle = isMe ? "rgba(255,173,66,0.78)" : "rgba(255,255,255,0.42)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, PLAYER_RADIUS + 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.arc(x, y, PLAYER_RADIUS + 8, 0, Math.PI * 2);
    ctx.strokeStyle = isMe ? "#ffad42" : "rgba(255,255,255,0.35)";
    ctx.lineWidth = isMe ? 4 : 2;
    ctx.stroke();

    drawPlayerSprite(image, player, x, y, isMe);
    drawNameAndHp(player, x, y);
    ctx.restore();

    if (player.dead && player.deathAnimAt) {
      drawDeathAnimation(player, x, y);
    }
  });
}

function drawPlayerSprite(image, player, x, y, isMe) {
  const size = PLAYER_RADIUS * 2.35;

  if (isImageReady(image)) {
    const aspect = image.naturalWidth / image.naturalHeight || 1;
    let drawW = size;
    let drawH = size;

    if (aspect > 1) {
      drawH = size / aspect;
    } else {
      drawW = size * aspect;
    }

    ctx.shadowColor = isMe ? "rgba(255,173,66,0.55)" : "rgba(0,0,0,0.55)";
    ctx.shadowBlur = isMe ? 14 : 10;
    ctx.drawImage(image, x - drawW / 2, y - drawH / 2, drawW, drawH);
    ctx.shadowBlur = 0;
    return;
  }

  const fallbackColor = getCharacterFallbackColor(player.character);
  ctx.fillStyle = fallbackColor;
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(player.name || "J").slice(0, 1).toUpperCase(), x, y + 1);
  ctx.textBaseline = "alphabetic";
}

function getCharacterFallbackColor(character) {
  const colors = {
    blue: "#2f8fff",
    red: "#ff3d3d",
    green: "#35d17f",
    purple: "#8e55ff",
    yellow: "#ffd34a",
    black: "#202028",
    pink: "#ff5db8",
    cyan: "#31d7ff",
    orange: "#ff8a2f",
    white: "#eeeeee"
  };

  return colors[character] || "#ffad42";
}

function drawNameAndHp(player, x, y) {
  ctx.font = "700 13px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(player.name || "Jogador", x, y - 42);

  const width = 58;
  const height = 7;
  const hpPercent = Math.max(0, Math.min(1, (player.hp || 0) / (player.maxHp || 5)));

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x - width / 2, y + 35, width, height);

  ctx.fillStyle = hpPercent > 0.5 ? "#35d17f" : hpPercent > 0.25 ? "#ffad42" : "#ff3838";
  ctx.fillRect(x - width / 2, y + 35, width * hpPercent, height);
}

function drawDeathAnimation(player, x, y) {
  const elapsed = Date.now() - player.deathAnimAt;
  const progress = Math.min(1, elapsed / 900);

  ctx.save();
  ctx.globalAlpha = 1 - progress;
  ctx.strokeStyle = "#ff3838";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 18 + progress * 78, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,56,56,0.2)";
  ctx.beginPath();
  ctx.arc(x, y, 8 + progress * 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAimLine() {
  if (!localPlayer || localPlayer.dead || localPlayer.hp <= 0 || isMatchEnded()) return;

  const playerScreen = worldToScreen(localPlayer.x, localPlayer.y);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(playerScreen.x, playerScreen.y);
  ctx.lineTo(mouse.x, mouse.y);
  ctx.strokeStyle = "rgba(255, 122, 24, 0.30)";
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.restore();
}

function drawMiniMap() {
  const w = 190;
  const h = 120;
  const x = canvas.width - w - 18;
  const y = 18;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();

  getCurrentWalls().forEach((wall) => {
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(
      x + (wall.x / WORLD.width) * w,
      y + (wall.y / WORLD.height) * h,
      (wall.w / WORLD.width) * w,
      (wall.h / WORLD.height) * h
    );
  });

  Object.values(players).forEach((player) => {
    ctx.fillStyle = player.id === playerId ? "#ffad42" : "#ffffff";
    ctx.beginPath();
    ctx.arc(
      x + (player.x / WORLD.width) * w,
      y + (player.y / WORLD.height) * h,
      player.id === playerId ? 4 : 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  ctx.restore();
}

/* ===============================
   UI
   =============================== */

function renderScoreboard() {
  const list = Object.values(players)
    .sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      return (a.deaths || 0) - (b.deaths || 0);
    });

  if (!list.length) {
    scoreboard.innerHTML = "<p>Nenhum jogador na sala.</p>";
    return;
  }

  scoreboard.innerHTML = list.map((player) => {
    const hp = Number(player.hp || 0);
    const maxHp = Number(player.maxHp || 5);
    const score = Number(player.score || 0);
    const deaths = Number(player.deaths || 0);
    const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    const me = player.id === playerId ? "Você" : "Rival";

    return `
      <div class="player-row">
        <div class="player-name">
          <span>${escapeHtml(player.name || "Jogador")} <small>(${me})</small></span>
          <span>${score} pts</span>
        </div>
        <div>Vida: ${hp}/${maxHp} · Mortes: ${deaths}</div>
        <div class="hp-bar">
          <div class="hp-fill" style="width:${hpPercent}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

function updateStatus() {
  if (!match || match.status === "ended") return;

  if (localPlayer && localPlayer.dead) {
    const remaining = Math.max(0, (localPlayer.respawnAvailableAt || 0) - Date.now());

    if (remaining > 0) {
      statusBar.textContent = `Você morreu. Renascer liberado em ${Math.ceil(remaining / 1000)}s.`;
    } else {
      statusBar.textContent = "Você pode renascer. Clique em Renascer ou pressione R.";
    }

    return;
  }

  const count = Object.keys(players).length;

  if (count < 2) {
    statusBar.textContent = `Sala ${roomCode}. Mapa: ${getCurrentMap().name}. Aguardando outro jogador entrar.`;
  } else {
    statusBar.textContent = `Jogadores online: ${count}. Mapa: ${getCurrentMap().name}. Use Q para habilidade especial.`;
  }
}

function showEndOverlay() {
  const winner = Object.values(players).find((p) => p.id === match.winnerId);
  const sorted = Object.values(players).sort((a, b) => (b.score || 0) - (a.score || 0));

  const winnerName = match.winnerName || (winner ? winner.name : "Sem vencedor");
  const topScore = sorted[0] ? sorted[0].score || 0 : 0;

  winnerText.textContent = `${winnerName} venceu`;
  winnerDetail.textContent = `Pontuação final do vencedor: ${topScore} ponto(s). A partida durou 5 minutos.`;
  endOverlay.classList.remove("hidden");
}

function updateCharacterPreview() {
  const data = CHARACTER_DATA[selectedCharacter] || CHARACTER_DATA.blue;

  selectedPreview.src = data.image;
  selectedName.textContent = data.name;
  selectedSkill.textContent = data.skill;
  statHp.textContent = data.hp;
  statSpeed.textContent = data.speed;
  statCooldown.textContent = `${data.fireCooldown}ms`;
  statDamage.textContent = data.damage;
}

function showSetupError(message) {
  setupError.innerHTML = message;
  setupError.classList.remove("hidden");
}

function hideSetupError() {
  setupError.innerHTML = "";
  setupError.classList.add("hidden");
}

/* ===============================
   EFEITOS, PASSIVAS E ATRIBUTOS
   =============================== */

function getInitialMaxHp(config) {
  return (config.hp || 5) + ((config.passive && config.passive.maxHpBonus) || 0);
}

function getInitialBuffs(config) {
  const buffs = {};
  const passive = config.passive || {};

  if (passive.starterBuff) {
    buffs[passive.starterBuff] = Date.now() + (passive.starterDuration || 4000);
  }

  return buffs;
}

function hasTimedBuff(player, key, now = Date.now()) {
  return Boolean(player && player.buffs && player.buffs[key] && player.buffs[key] > now);
}

function getEffectiveSpeed(player, config) {
  const passive = config.passive || {};
  let speed = config.speed || 4;

  speed *= passive.speedScale || 1;

  if (hasTimedBuff(player, "speedAmplifyUntil")) speed *= 1.85;
  if (hasTimedBuff(player, "slowUntil")) speed *= 0.48;

  return Math.max(1.2, speed);
}

function getEffectiveCooldown(player, config) {
  const passive = config.passive || {};
  let cooldown = config.fireCooldown || 260;

  cooldown *= passive.cooldownScale || 1;

  if (hasTimedBuff(player, "rapidUntil")) cooldown *= 0.45;
  if (hasTimedBuff(player, "eightWayUntil")) cooldown *= 1.15;
  if (hasTimedBuff(player, "laserUntil")) cooldown *= 1.25;

  return Math.max(80, cooldown);
}

function getEffectiveBulletSpeed(player, config) {
  const passive = config.passive || {};
  let speed = config.bulletSpeed || 11;

  speed *= passive.bulletSpeedScale || 1;
  if (hasTimedBuff(player, "bulletSpeedUntil")) speed *= 2;
  if (hasTimedBuff(player, "sniperUntil")) speed *= 1.55;

  return speed;
}

function getEffectiveDamage(player, config) {
  const passive = config.passive || {};
  let damage = config.damage || 1;

  if (hasTimedBuff(player, "damageAmplifyUntil")) damage += 2;
  if (hasTimedBuff(player, "sniperUntil")) damage += 2;

  if (passive.lowHpDamageScale && player.maxHp && player.hp / player.maxHp <= 0.35) {
    damage = Math.ceil(damage * passive.lowHpDamageScale);
  }

  return Math.max(1, Math.round(damage));
}

function getIncomingDamage(baseDamage) {
  const config = CHARACTER_DATA[localPlayer.character] || CHARACTER_DATA.blue;
  const passive = config.passive || {};
  let damage = baseDamage;

  if (hasTimedBuff(localPlayer, "shieldUntil")) damage -= 2;
  if (passive.armor) damage -= passive.armor;
  if (passive.damageTakenScale) damage *= passive.damageTakenScale;

  return Math.max(1, Math.round(damage));
}

async function processLocalEffects() {
  if (!localPlayer || !playerRef || localPlayer.dead || localPlayer.hp <= 0 || isMatchEnded()) return;

  const now = Date.now();
  const config = CHARACTER_DATA[localPlayer.character] || CHARACTER_DATA.blue;
  const passive = config.passive || {};
  const buffs = { ...(localPlayer.buffs || {}) };

  if (passive.regen && now - localEffectTimers.regenAt > (passive.regenInterval || 4500)) {
    localEffectTimers.regenAt = now;
    if ((localPlayer.hp || 0) < (localPlayer.maxHp || config.hp)) {
      await healPlayerBy(playerId, 1);
    }
  }

  if (passive.poisonImmune && buffs.poisonUntil) {
    delete buffs.poisonUntil;
    delete buffs.poisonAttackerId;
    delete buffs.poisonTicks;
    localPlayer.buffs = buffs;
    await playerRef.update({ buffs, updatedAt: firebase.database.ServerValue.TIMESTAMP });
  }

  if (!passive.poisonImmune && buffs.poisonUntil && buffs.poisonUntil > now && (buffs.poisonTicks || 0) > 0 && now - localEffectTimers.poisonAt > 1000) {
    localEffectTimers.poisonAt = now;
    buffs.poisonTicks = Math.max(0, (buffs.poisonTicks || 0) - 1);
    localPlayer.buffs = buffs;
    await playerRef.update({ buffs, updatedAt: firebase.database.ServerValue.TIMESTAMP });

    const hpRef = db.ref(`rooms/${roomCode}/players/${playerId}/hp`);
    const result = await hpRef.transaction((currentHp) => {
      if (currentHp === null || currentHp <= 0) return currentHp;
      return Math.max(0, currentHp - 1);
    });

    const newHp = result.snapshot.val();
    if (result.committed && newHp <= 0 && !respawning) {
      await die(buffs.poisonAttackerId || "");
    }
  }
}

async function healPlayerBy(targetId, amount) {
  if (!targetId || !db || !roomCode) return;

  const target = players[targetId] || (targetId === playerId ? localPlayer : null);
  const maxHp = target ? Number(target.maxHp || target.hp || 5) : 5;
  const hpRef = db.ref(`rooms/${roomCode}/players/${targetId}/hp`);

  await hpRef.transaction((currentHp) => {
    if (currentHp === null || currentHp <= 0) return currentHp;
    return Math.min(maxHp, currentHp + amount);
  });
}

async function amplifyMaxHp(amount) {
  const currentMax = Number(localPlayer.maxHp || 5);
  const newMax = Math.min(currentMax + amount, getInitialMaxHp(CHARACTER_DATA[localPlayer.character] || CHARACTER_DATA.blue) + 12);
  const hpGain = newMax - currentMax;

  localPlayer.maxHp = newMax;
  localPlayer.hp = Math.min(newMax, (localPlayer.hp || 0) + hpGain);

  await playerRef.update({
    maxHp: localPlayer.maxHp,
    hp: localPlayer.hp,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  });
}

async function applyAreaEffect(effect, radius) {
  const updates = {};
  const now = Date.now();

  Object.values(players).forEach((player) => {
    if (!player || player.id === playerId || player.dead || player.hp <= 0) return;

    const distance = Math.hypot(player.x - localPlayer.x, player.y - localPlayer.y);
    if (distance > radius) return;

    const buffs = { ...(player.buffs || {}) };

    if (effect === "slow") {
      buffs.slowUntil = Math.max(buffs.slowUntil || 0, now + 4200);
    }

    if (effect === "poison") {
      buffs.poisonUntil = now + 2000;
      buffs.poisonAttackerId = playerId;
      buffs.poisonTicks = 2;
    }

    updates[`rooms/${roomCode}/players/${player.id}/buffs`] = buffs;
  });

  if (Object.keys(updates).length) {
    await db.ref().update(updates);
  }
}

function getCurrentMap() {
  const index = match && Number.isInteger(match.mapIndex) ? match.mapIndex : 0;
  return MAPS[index] || MAPS[0];
}

function getCurrentWalls() {
  return getCurrentMap().walls;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) return Math.hypot(px - x1, py - y1);

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
  const projectionX = x1 + t * dx;
  const projectionY = y1 + t * dy;

  return Math.hypot(px - projectionX, py - projectionY);
}

/* ===============================
   COLISÃO / POSIÇÕES
   =============================== */

function circleCollidesWalls(cx, cy, radius) {
  return getCurrentWalls().some((wall) => circleRectCollision(cx, cy, radius, wall));
}

function pointInsideAnyWall(x, y, radius = 0) {
  return getCurrentWalls().some((wall) => circleRectCollision(x, y, radius, wall));
}

function circleRectCollision(cx, cy, radius, rect) {
  const closestX = clamp(cx, rect.x, rect.x + rect.w);
  const closestY = clamp(cy, rect.y, rect.y + rect.h);

  const dx = cx - closestX;
  const dy = cy - closestY;

  return dx * dx + dy * dy < radius * radius;
}

function getRandomSpawn() {
  for (let i = 0; i < 40; i++) {
    const point = randomFrom(SPAWN_POINTS);
    const pos = {
      x: point.x + randomBetween(-35, 35),
      y: point.y + randomBetween(-35, 35)
    };

    if (!circleCollidesWalls(pos.x, pos.y, PLAYER_RADIUS + 8)) {
      return pos;
    }
  }

  return randomFreePosition(110);
}

function randomFreePosition(margin = 60) {
  for (let i = 0; i < 200; i++) {
    const pos = {
      x: randomBetween(margin, WORLD.width - margin),
      y: randomBetween(margin, WORLD.height - margin)
    };

    if (!circleCollidesWalls(pos.x, pos.y, 48)) {
      return pos;
    }
  }

  return { x: WORLD.width / 2, y: WORLD.height / 2 };
}

function screenToWorld(x, y) {
  return {
    x: x + camera.x,
    y: y + camera.y
  };
}

function worldToScreen(x, y) {
  return {
    x: x - camera.x,
    y: y - camera.y
  };
}

/* ===============================
   HELPERS
   =============================== */

function isImageReady(image) {
  return Boolean(image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
}

function sanitizePlayerState(player) {
  if (!player) return player;

  const config = CHARACTER_DATA[player.character] || CHARACTER_DATA.blue;
  const fallbackSpawn = getRandomSpawn();
  const initialMaxHp = getInitialMaxHp(config);
  const next = { ...player };

  next.character = CHARACTER_DATA[next.character] ? next.character : "blue";
  next.x = Number.isFinite(Number(next.x)) ? clamp(Number(next.x), PLAYER_RADIUS, WORLD.width - PLAYER_RADIUS) : fallbackSpawn.x;
  next.y = Number.isFinite(Number(next.y)) ? clamp(Number(next.y), PLAYER_RADIUS, WORLD.height - PLAYER_RADIUS) : fallbackSpawn.y;
  next.maxHp = Math.max(1, Number.isFinite(Number(next.maxHp)) ? Number(next.maxHp) : initialMaxHp);
  next.hp = Math.max(0, Math.min(next.maxHp, Number.isFinite(Number(next.hp)) ? Number(next.hp) : next.maxHp));
  next.score = Number.isFinite(Number(next.score)) ? Number(next.score) : 0;
  next.deaths = Number.isFinite(Number(next.deaths)) ? Number(next.deaths) : 0;
  next.buffs = next.buffs && typeof next.buffs === "object" ? next.buffs : {};
  next.dead = Boolean(next.dead || next.hp <= 0);

  if (!next.name) next.name = "Jogador";
  if (!next.id) next.id = playerId;

  return next;
}

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function getOrCreatePlayerId() {
  const storedId = localStorage.getItem("pngbattle:playerId");
  if (storedId) return storedId;

  let newId;

  if (window.crypto && crypto.randomUUID) {
    newId = crypto.randomUUID();
  } else {
    newId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  localStorage.setItem("pngbattle:playerId", newId);
  return newId;
}

function cleanRoomCode(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .slice(0, 18);
}

function isMatchEnded() {
  return match && match.status === "ended";
}

function getRemainingMs() {
  if (!match || !match.startedAt) return MATCH_DURATION_MS;
  const duration = match.durationMs || MATCH_DURATION_MS;
  return Math.max(0, duration - (Date.now() - match.startedAt));
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
