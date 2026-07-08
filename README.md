# PNG Battle Online Avançado

Jogo online feito com **HTML + CSS + JavaScript puro + Firebase Realtime Database**.

Esta versão tem:

- Tela de seleção estilo jogo de luta.
- Sala online por código.
- Mapa grande com câmera seguindo o jogador.
- Paredes para se proteger.
- Vida, morte e botão de renascer.
- Animação de morte.
- Partida com duração de 5 minutos.
- Vencedor por maior pontuação.
- Power-ups/aprimoramentos ampliados:
  - Tiro que atravessa parede.
  - Tiro que cura o usuário ao acertar.
  - Tiro 2x mais veloz.
  - Tiro pela frente e por trás.
  - Tiro teleguiado.
  - Tiro de lentidão.
  - Tiro em 8 direções.
  - Laser.
  - Tiro venenoso: 1 de dano por segundo durante 2 segundos.
  - Vida amplificada.
  - Velocidade amplificada.
  - Passar pelas paredes.
  - Tiro triplo, explosivo, gigante, sniper, escudo, invisibilidade, dispersão, roubo de vida e ricochete avançado.
- Mais personagens, cada um com uma passiva e habilidade especial no Q.
- Mapas randomizados ao criar ou reiniciar a sala.
- Som de tiro usando `assets/som1.mp3`.
- README detalhado para você alterar sem IA.

---

## 1. Como abrir o jogo

### Opção recomendada: VS Code + Live Server

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server**, se ainda não tiver.
3. Clique com o botão direito em `index.html`.
4. Clique em **Open with Live Server**.
5. O navegador abrirá o jogo.

### Teste online

1. Abra o jogo em um navegador.
2. Digite seu nome.
3. Digite uma sala, por exemplo:

```text
sala01
```

4. Clique em **Entrar na sala**.
5. Abra outro navegador ou uma guia anônima.
6. Entre na mesma sala `sala01`.
7. Os jogadores devem aparecer no mesmo mapa.

---

## 2. Firebase

O projeto já está configurado com:

```js
databaseURL: "https://jogo-a763b-default-rtdb.firebaseio.com"
```

O jogo usa o **Firebase Realtime Database** para sincronizar:

- jogadores;
- posição dos jogadores;
- tiros;
- paredes fixas do mapa;
- power-ups;
- vida;
- mortes;
- pontuação;
- tempo da partida.

---

## 3. Regras do Firebase para teste

No Firebase, vá em:

```text
Build > Realtime Database > Rules
```

Use estas regras para teste:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

Depois clique em **Publish**.

### Importante

Essas regras são abertas e servem para teste. Para um jogo real, use autenticação e regras restritas.

---

## 4. Estrutura do projeto

```text
/
├── index.html
├── style.css
├── game.js
├── README.md
└── assets/
    ├── som1.mp3
    ├── som1.wav
    ├── player_blue.png
    ├── player_red.png
    ├── player_green.png
    ├── player_purple.png
    ├── player_yellow.png
    ├── player_black.png
    ├── player_pink.png
    ├── player_cyan.png
    ├── power_double.png
    ├── power_rapid.png
    └── power_ricochet.png
```

---

## 5. Controles

```text
WASD ou setas = mover
Mouse = mirar
Clique esquerdo = atirar
Espaço = atirar
R = renascer quando estiver morto
```

---

## 6. Como adicionar mais personagens

Para adicionar um personagem novo, você precisa mexer em **3 partes**:

1. Colocar o PNG na pasta `assets`.
2. Adicionar o personagem no `index.html`.
3. Adicionar os atributos no `game.js`.

---

### 6.1. Coloque o PNG na pasta assets

Exemplo:

```text
assets/player_fire.png
```

Use PNG com fundo transparente, se possível.

Tamanho recomendado:

```text
360x360 px
```

Mas pode ser maior ou menor. O jogo redimensiona no canvas.

---

### 6.2. Adicione o botão do personagem no index.html

No `index.html`, procure por:

```html
<div class="character-grid" id="characterGrid">
```

Dentro desse bloco, adicione um botão novo:

```html
<button class="character-slot" data-character="fire" type="button">
  <img src="assets/player_fire.png" alt="Guerreiro de Fogo" />
  <span>Guerreiro de Fogo</span>
</button>
```

A parte mais importante é:

```html
data-character="fire"
```

Esse valor precisa ser igual ao nome usado no `game.js`.

---

### 6.3. Adicione os atributos no game.js

No `game.js`, procure por:

```js
const CHARACTER_DATA = {
```

Adicione um novo bloco:

```js
fire: {
  name: "Guerreiro de Fogo",
  image: "assets/player_fire.png",
  hp: 5,
  speed: 4.2,
  fireCooldown: 260,
  bulletSpeed: 11,
  damage: 1,
  skill: "Personagem equilibrado com visual de fogo."
},
```

Atenção: se ele não for o último item da lista, mantenha a vírgula no final.

---

## 7. Como alterar os atributos iniciais dos personagens

Os atributos ficam no arquivo:

```text
game.js
```

Procure por:

```js
const CHARACTER_DATA = {
```

Cada personagem tem este formato:

```js
blue: {
  name: "Ninja Azul",
  image: "assets/player_blue.png",
  hp: 5,
  speed: 4.4,
  fireCooldown: 260,
  bulletSpeed: 11,
  damage: 1,
  skill: "Equilibrado, bom para começar."
}
```

---

### 7.1. O que cada atributo faz

| Atributo | O que faz |
|---|---|
| `name` | Nome exibido na tela de seleção. |
| `image` | Caminho do PNG do personagem. |
| `hp` | Vida inicial e vida máxima. |
| `speed` | Velocidade de movimento. |
| `fireCooldown` | Tempo entre um tiro e outro, em milissegundos. |
| `bulletSpeed` | Velocidade do tiro. |
| `damage` | Dano causado por cada tiro. |
| `skill` | Texto explicando a habilidade ou estilo do personagem. |

---

### 7.2. Exemplos práticos

#### Personagem mais rápido

```js
speed: 5.8
```

#### Personagem mais lento

```js
speed: 3.2
```

#### Personagem com mais vida

```js
hp: 8
```

#### Personagem com tiro mais rápido

```js
fireCooldown: 160
```

#### Personagem com tiro mais lento

```js
fireCooldown: 450
```

#### Personagem com tiro mais forte

```js
damage: 2
```

#### Personagem com tiro mais veloz

```js
bulletSpeed: 16
```

---

## 8. Como adicionar habilidades diferentes

O projeto já tem atributos diferentes por personagem, mas você pode criar habilidades mais específicas alterando a função de tiro.

No `game.js`, procure por:

```js
function shoot() {
```

Essa função controla quando o jogador atira.

---

### 8.1. Exemplo: personagem sempre atira duplo

Dentro da função `shoot()`, procure por:

```js
const hasDouble = buffs.doubleUntil && buffs.doubleUntil > now;
```

Troque por:

```js
const hasDouble = (buffs.doubleUntil && buffs.doubleUntil > now) || localPlayer.character === "fire";
```

Com isso, o personagem com `character === "fire"` sempre terá tiro duplo.

---

### 8.2. Exemplo: personagem sempre tem ricochete

Procure por:

```js
const hasRicochet = buffs.ricochetUntil && buffs.ricochetUntil > now;
```

Troque por:

```js
const hasRicochet = (buffs.ricochetUntil && buffs.ricochetUntil > now) || localPlayer.character === "stone";
```

Com isso, o personagem `stone` sempre terá tiro com ricochete.

---

### 8.3. Exemplo: personagem causa mais dano quando está com pouca vida

Procure a função:

```js
function createBullet(angle, ricochet) {
```

Dentro dela, procure:

```js
damage: config.damage,
```

Troque por:

```js
damage: localPlayer.hp <= 2 ? config.damage + 1 : config.damage,
```

Assim, qualquer personagem causará mais dano quando estiver com 2 de vida ou menos.

Se quiser isso só para um personagem:

```js
damage: localPlayer.character === "berserker" && localPlayer.hp <= 2
  ? config.damage + 1
  : config.damage,
```

---

## 9. Como adicionar mais power-ups

Os power-ups ficam em duas partes:

1. `POWERUP_DATA`
2. `applyPowerup(type)`

---

### 9.1. Adicione o visual do power-up

Coloque um PNG em:

```text
assets/power_shield.png
```

Depois, no `game.js`, procure:

```js
const POWERUP_DATA = {
```

Adicione:

```js
shield: {
  name: "Escudo",
  image: "assets/power_shield.png",
  color: "#8f7cff"
},
```

---

### 9.2. Faça ele aparecer no mapa

No `game.js`, procure:

```js
const type = randomFrom(["double", "rapid", "ricochet"]);
```

Adicione o novo tipo:

```js
const type = randomFrom(["double", "rapid", "ricochet", "shield"]);
```

---

### 9.3. Crie o efeito do power-up

Procure a função:

```js
async function applyPowerup(type) {
```

Adicione:

```js
if (type === "shield") {
  buffs.shieldUntil = now + POWERUP_DURATION_MS;
  statusBar.textContent = "Aprimoramento coletado: Escudo.";
}
```

---

### 9.4. Faça o escudo reduzir dano

Procure a função:

```js
async function applyHit(bulletId, attackerId, damage) {
```

Antes desta parte:

```js
const hpRef = db.ref(`rooms/${roomCode}/players/${playerId}/hp`);
```

Adicione:

```js
const buffs = localPlayer.buffs || {};

if (buffs.shieldUntil && buffs.shieldUntil > Date.now()) {
  damage = Math.max(0, damage - 1);
}
```

---

### 9.5. Faça o escudo aparecer na lista da lateral

Procure a função:

```js
function renderBuffs() {
```

Depois dos outros buffs, adicione:

```js
if (buffs.shieldUntil && buffs.shieldUntil > now) {
  active.push({ name: "Escudo", remaining: buffs.shieldUntil - now });
}
```

---

## 10. Como alterar a duração dos power-ups

No `game.js`, procure:

```js
const POWERUP_DURATION_MS = 15000;
```

Esse valor está em milissegundos.

Exemplos:

```js
const POWERUP_DURATION_MS = 10000; // 10 segundos
const POWERUP_DURATION_MS = 20000; // 20 segundos
const POWERUP_DURATION_MS = 30000; // 30 segundos
```

---

## 11. Como alterar a duração da partida

No `game.js`, procure:

```js
const MATCH_DURATION_MS = 5 * 60 * 1000;
```

Exemplos:

### Partida de 3 minutos

```js
const MATCH_DURATION_MS = 3 * 60 * 1000;
```

### Partida de 10 minutos

```js
const MATCH_DURATION_MS = 10 * 60 * 1000;
```

### Partida de 30 segundos para teste

```js
const MATCH_DURATION_MS = 30 * 1000;
```

---

## 12. Como alterar o tamanho do mapa

No `game.js`, procure:

```js
const WORLD = {
  width: 2600,
  height: 1650
};
```

Para aumentar:

```js
const WORLD = {
  width: 3600,
  height: 2200
};
```

Para diminuir:

```js
const WORLD = {
  width: 1800,
  height: 1200
};
```

---

## 13. Como adicionar paredes

No `game.js`, procure:

```js
const WALLS = [
```

Cada parede usa:

```js
{ x: 360, y: 260, w: 420, h: 70 }
```

Significado:

| Campo | Significado |
|---|---|
| `x` | Distância da parede até a esquerda do mapa. |
| `y` | Distância da parede até o topo do mapa. |
| `w` | Largura da parede. |
| `h` | Altura da parede. |

Exemplo de parede horizontal:

```js
{ x: 500, y: 400, w: 600, h: 80 }
```

Exemplo de parede vertical:

```js
{ x: 900, y: 300, w: 80, h: 500 }
```

---

## 14. Como alterar onde os jogadores nascem

No `game.js`, procure:

```js
const SPAWN_POINTS = [
```

Cada ponto é:

```js
{ x: 160, y: 160 }
```

Para adicionar um novo ponto:

```js
{ x: 1300, y: 800 }
```

Evite colocar pontos dentro das paredes.

---

## 15. Como trocar o som de tiro

O som está em:

```text
assets/som1.mp3
```

Para trocar:

1. Pegue seu novo áudio.
2. Renomeie para:

```text
som1.mp3
```

3. Substitua o arquivo dentro da pasta `assets`.

Não precisa alterar o código se mantiver o mesmo nome.

---

## 16. Como alterar o volume do tiro

No `game.js`, procure:

```js
shotSound.volume = 0.55;
```

Exemplos:

```js
shotSound.volume = 0.2; // mais baixo
shotSound.volume = 0.8; // mais alto
shotSound.volume = 1.0; // máximo
```

---

## 17. Como alterar a quantidade de power-ups no mapa

No `game.js`, procure:

```js
const MAX_POWERUPS = 12;
```

Exemplos:

```js
const MAX_POWERUPS = 6;
const MAX_POWERUPS = 20;
```

---

## 18. Como alterar o tempo para nascerem novos power-ups

No `game.js`, procure:

```js
const POWERUP_RESPAWN_MS = 4500;
```

Exemplos:

```js
const POWERUP_RESPAWN_MS = 2000; // nasce mais rápido
const POWERUP_RESPAWN_MS = 8000; // nasce mais devagar
```

---

## 19. Como alterar o tempo para renascer

No `game.js`, procure:

```js
const RESPAWN_DELAY_MS = 3000;
```

Exemplos:

```js
const RESPAWN_DELAY_MS = 1000; // 1 segundo
const RESPAWN_DELAY_MS = 5000; // 5 segundos
```

---

## 20. Observações sobre jogo online com Firebase

Este projeto funciona bem como protótipo online.

Porém, para um jogo competitivo real, o ideal é ter um servidor próprio validando dano, tiros e pontuação. Aqui, boa parte da lógica roda no navegador dos jogadores.

Isso é normal para protótipo, teste e aprendizado, mas não é o modelo mais seguro para ranking competitivo real.

---

## 21. Erros comuns

### O botão Entrar na sala não funciona

Verifique:

1. O Realtime Database foi criado.
2. As regras foram publicadas.
3. Você está com internet.
4. Você abriu pelo Live Server.
5. O console do navegador não mostra erro do Firebase.

### Os jogadores não aparecem um para o outro

Verifique:

1. Os dois estão usando o mesmo código de sala.
2. As regras do Firebase permitem leitura e escrita.
3. O `databaseURL` no `game.js` está correto.

### O som não toca

Navegadores bloqueiam áudio antes de uma interação do usuário.

Depois do primeiro clique na tela, o som deve funcionar. O disparo usa:

```js
const shotSound = new Audio("assets/som1.mp3");
```

---

## 22. Onde mexer para criar mais coisas

Resumo rápido:

| O que alterar | Onde mexer |
|---|---|
| Personagens | `index.html` e `CHARACTER_DATA` no `game.js` |
| Atributos | `CHARACTER_DATA` no `game.js` |
| Habilidades | `shoot()`, `createBullet()` e `applyHit()` |
| Power-ups | `POWERUP_DATA`, `applyPowerup()` e `renderBuffs()` |
| Mapa | `WORLD` no `game.js` |
| Paredes | `WALLS` no `game.js` |
| Spawn | `SPAWN_POINTS` no `game.js` |
| Tempo da partida | `MATCH_DURATION_MS` |
| Som de tiro | `assets/som1.mp3` |
| Estilo visual | `style.css` |

## Atualização aplicada

- Corrigido problema em que o personagem podia sumir da sala após oscilação de conexão ou estado inválido de posição.
- Adicionado disparo contínuo: segure o clique esquerdo ou a tecla Espaço para atirar conforme a recarga do personagem.
- Adicionados novos efeitos sonoros para tiro, acerto, power-up, morte, respawn, habilidade e habilidade bloqueada.
- Sprites dos personagens foram padronizados em canvas 512x512 para reduzir corte, distorção e falha visual.
- Personagens com invisibilidade agora ficam transparentes com contorno, em vez de parecerem completamente sumidos.

---

## Atualização aplicada: modo cooperativo com boss

Esta versão inclui um novo modo no menu inicial:

- **Versus**: mantém o funcionamento original, com jogadores se enfrentando pela pontuação.
- **Cooperativo**: todos os jogadores da sala são aliados contra um boss.

### Como jogar no modo cooperativo

1. Na tela inicial, selecione **Cooperativo**.
2. Escolha o nível do boss:
   - **Nível 1 · Ameaça Controlada**
   - **Nível 2 · Chefe Adaptativo**
   - **Nível 3 · Boss Implacável**
3. Entre em uma sala.
4. Outros jogadores devem entrar no mesmo código de sala.
5. Todos atacam o boss juntos.

### Regras do cooperativo

- Jogadores são aliados e não causam dano entre si.
- O boss possui vida própria, barra lateral e aparece no minimapa.
- A pontuação no coop representa o dano causado no boss.
- Se o boss for derrotado antes do tempo acabar, a equipe vence.
- Se o tempo acabar e o boss continuar vivo, o boss vence.
- Os buffs/power-ups continuam aparecendo como no modo versus.

### Boss adaptativo

O boss possui padrões de ataque e muda o comportamento conforme a situação da batalha:

- **Rajada em leque**: tiros concentrados contra o alvo mais próximo.
- **Explosão circular**: ataque em volta do boss quando os jogadores ficam próximos ou agrupados.
- **Tiros direcionados**: mira em vários jogadores ao mesmo tempo.
- **Perseguição adaptativa**: projéteis teleguiados contra jogadores rápidos.
- **Cruzamento de arena**: tiros fortes em linhas cruzadas.
- **Espiral variável**: padrão agressivo, mais comum quando o boss está com pouca vida.

### Sons e falas do boss

O jogo procura os seguintes arquivos na pasta `assets`:

```text
assets/boss.png
assets/falas1.mp3
assets/falas2.mp3
...
assets/falas20.mp3
```

Foram adicionados arquivos placeholder para evitar erro de carregamento. Para trocar por falas reais, basta substituir os arquivos `falas1.mp3` até `falas20.mp3` mantendo os mesmos nomes.

### Correção de imagem bugada

O arquivo `assets/mellissa.png` estava inválido e foi recriado como PNG funcional. Isso corrige o personagem que aparecia quebrado na tela inicial.
