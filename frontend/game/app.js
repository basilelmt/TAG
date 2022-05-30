const socket = io()

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

var WAIT = false;
const id = []
const SCALE = 1.5
var time = Date.now();
var timer = 0;
var end_the_round = false;
var bumpCounter = 0; // to control annnoying bug
var game = {
    block_input: false,
    roles_set: false,
    both_players_connected: false,
    other_player_left: false,
    game_over: false,
    round_is_over: false,
    acending_timer: true,
    p1_is_chaser: true,
    p1_score: 0,
    p2_score: 0,
    started: false,
    lock_timer: false,
    setValues(data) {
        if (this.both_players_connected && !data)
            this.other_player_left = true;
        this.both_players_connected = data
    }
};

socket.on('playerInfo', (data) => {
    id.push(data.name);
});

const app = new PIXI.Application({
    width: 800*SCALE,
    height: 448*SCALE
});
app.renderer.backgroundColor = 0x211f30;
document.body.style.overflow = 'hidden';

function resize() {
    app.renderer.view.style.position = 'absolute';
    app.renderer.view.style.left = ((window.innerWidth - app.renderer.width) >> 1) + 'px';
    app.renderer.view.style.top = ((window.innerHeight - app.renderer.height) >> 1) + 'px';
}
resize();
window.addEventListener('resize', resize);
// app.renderer.view.style.position = 'absolute';
// app.renderer.resize(window.innerWidth, window.innerHeight);
// app.renderer.resize(window.innerWidth, window.innerHeight);
// console.log(app.screen.width, app.screen.height); // classic: 1503 948, with server: 1202 758
const graphics = new PIXI.Graphics();
const pixel = new PIXI.Graphics();
const OFFSETX = (app.screen.width/2)-800*0.9
const OFFSETY = (app.screen.height/2)-448*0.9

document.body.appendChild(app.view);

// ------ Text Styles ------ //
const roleStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
});

const endStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 200,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#FFFFFF', '#00D8FF'], // gradient
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 12,
});

const timerStyle = new PIXI.TextStyle({
    fill: "#4de4ff",
    fontSize: 800,
    fontWeight: "bolder"
})

const fancyStyle = new PIXI.TextStyle({
    fill: 0x000000,
    fontSize: 200,
    fontFamily: 'Fancy'
});

const timerText = new PIXI.Text(`${timer}`, timerStyle);
timerText.height = app.screen.height+200;
timerText.anchor.set(0.5);
timerText.x = app.screen.width / 2;
timerText.y = app.screen.height / 2;

const endText = new PIXI.Text("GAME!", endStyle);
endText.anchor.set(0.5);
endText.x = app.screen.width / 2;
endText.y = app.screen.height / 2;

const roleText = new PIXI.Text("...", roleStyle);
roleText.x = 50;
roleText.y = 0;

const readyText = new PIXI.Text("READY?", endStyle);
readyText.anchor.set(0.5);
readyText.x = app.screen.width / 2;
readyText.y = app.screen.height / 2;

const goText = new PIXI.Text("GO!", endStyle);
goText.anchor.set(0.5);
goText.x = app.screen.width / 2;
goText.y = app.screen.height / 2;

const scoreText = new PIXI.Text("0 - 0", endStyle)
roleText.x = 50;
roleText.y = 0;

const waitingText = new PIXI.Text("Waiting for another player to join...", { fontSize:30 });
waitingText.anchor.set(0.5);
waitingText.x = app.screen.width / 2;
waitingText.y = app.screen.height / 2;

const p1ScoreText = new PIXI.Text("0", roleStyle)

const p2ScoreText = new PIXI.Text("0", roleStyle)

// ------ Map colision ------
var map = [
    "00000000000000000000000000000000000000000000000000",
    "00000000000011111111111111111111111111111111100000",
    "00000000011111111111111111111111111111111111111000",
    "00000111111111111111111111111111111111111111111100",
    "00001111111000111111111111111111111111111111111100",
    "00111111111111111111111111111111111111111111111100",
    "00111111111111111111111001111111111111111111111100",
    "00111111111111111111111001111111111111111111111100",
    "00111111111111111111111111111111111111111111111100",
    "00111111111111111111111111111111111100000111111100",
    "00111111111111111111111111111111111111111111111100",
    "00111111111111111111111111111111111111111111111100",
    "00111111111111111111111111111111111111111111111100",
    "00001111111111111000000001111111111111111111111100",
    "00001111111111111111111111111111111111111111111100",
    "00001111111111111111111111111111111111111111111100", //15
    "00001111111111111111111111111111111111000111111100",
    "00001111101111111111111111111111111111111111111100",
    "00001111110001111111111111111111111111111111111100", // 18
    "00001111111111111111100111111111111111111111111100",
    "00000111111111111111100111111111111111111111100000",
    "00000111111111111111111111111111000111111111100000",
    "00000011111111111111111111111111111111111111000000",
    "00000001111111111111111111000111111111111110000000",
    "00000000011111111111111111000111111111111000000000",
    "00000000000011111111111110000111111111000000000000", //25
    "00000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000"
];


// ------ Backgfloor image ------
const mapSprite = PIXI.Sprite.from('../ressources/terrain.png');

mapSprite.anchor.set(0.5);
const zoomBlur = new PIXI.filters.ZoomBlurFilter()
mapSprite.filters = [zoomBlur];
zoomBlur.strength = 0;
mapSprite.x = app.screen.width / 2;
mapSprite.y = app.screen.height / 2;
mapSprite.scale.set(SCALE, SCALE);
//800, 448

const sky = PIXI.Sprite.from('../ressources/sky.png'); // #00D8FF
sky.anchor.set(0.5);
sky.x = app.screen.width / 2;
sky.y = app.screen.height / 2;
sky.scale.set(SCALE, SCALE);

app.stage.addChild(sky);
app.stage.addChild(mapSprite);

// ------ Character ------
// app.loader.load(setup)

const blur = new PIXI.filters.MotionBlurFilter([0, 0], 5);
const trail = new PIXI.filters.RGBSplitFilter([0, 0], [0, 0], [0, 0])
// trail([-10, 0], [0, 0], [10, 0])
// const glow = new PIXI.filters.GlowFilter({outerStrength: 0, color: 0x00000});

// timerText.filters = [glow]

var animations = [];

let textures = []
for (let i = 0; i < 4; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-idle-0${i}.png`);
    textures.push(texture);
}
const standing = new PIXI.AnimatedSprite(textures);
standing.scale.set(3, )
standing.anchor.set(0.5)
standing.animationSpeed = 0.1;
standing.play();
standing.name = "standing";
animations.push(standing);

textures = []
for (let i = 0; i < 6; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-run-0${i}.png`);
    textures.push(texture);
}
const running = new PIXI.AnimatedSprite(textures);
running.filters = [blur, trail]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
running.scale.set(3, );
running.anchor.set(0.5);
running.animationSpeed = 0.2;
running.play();
running.name = "running";
animations.push(running);

textures = []
for (let i = 0; i < 3; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-jump-0${i}.png`);
    textures.push(texture);
}
const jumping = new PIXI.AnimatedSprite(textures);
jumping.filters = [blur, trail]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
jumping.scale.set(3, );
jumping.anchor.set(0.5);
jumping.animationSpeed = 0.2;
jumping.name = "jumping";
animations.push(jumping);

textures = []
for (let i = 0; i < 4; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-smrslt-0${i}.png`);
    textures.push(texture);
}
const rolling = new PIXI.AnimatedSprite(textures);
rolling.filters = [blur, trail]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
rolling.scale.set(3, );
rolling.anchor.set(0.5);
rolling.animationSpeed = 0.2;
rolling.play()
rolling.name = "rolling";
animations.push(rolling);

textures = []
for (let i = 0; i < 2; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-fall-0${i}.png`);
    textures.push(texture);
}
const falling = new PIXI.AnimatedSprite(textures);
falling.filters = [blur, trail]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
falling.scale.set(3, );
falling.anchor.set(0.5);
falling.animationSpeed = 0.1;
falling.play()
falling.name = "falling";
animations.push(falling);

textures = []
for (let i = 2; i >= 0; i--) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-stand-0${i}.png`);
    textures.push(texture);
}
const initSlide = new PIXI.AnimatedSprite(textures);
initSlide.filters = [blur, trail]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
initSlide.scale.set(3, );
initSlide.anchor.set(0.5);
initSlide.animationSpeed = 0.4;
initSlide.name = "initSlide";
animations.push(initSlide);

textures = []
for (let i = 0; i < 3; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-stand-0${i}.png`);
    textures.push(texture);
}
const endSlide = new PIXI.AnimatedSprite(textures);
endSlide.filters = [blur, trail]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
endSlide.scale.set(3, );
endSlide.anchor.set(0.5);
endSlide.animationSpeed = 0.2;
endSlide.play()
endSlide.name = "endSlide";
animations.push(endSlide);

textures = []
for (let i = 0; i < 2; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-slide-0${i}.png`);
    textures.push(texture);
}
const sliding = new PIXI.AnimatedSprite(textures);
sliding.filters = [blur, trail]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
sliding.scale.set(3, );
sliding.anchor.set(0.5);
sliding.animationSpeed = 0.2;
sliding.play()
sliding.name = "sliding";
animations.push(sliding);

other_player_animations = clone_animations(animations);

function clone_animations(animations) {
    var new_animations = [];
    animations.forEach(function (anim) {
        const new_anim = new PIXI.AnimatedSprite(anim.textures);
        new_anim.name = anim.name;
        new_anim.scale = anim.scale;
        new_anim.anchor.set(0.5);
        new_anim.animationSpeed = anim.animationSpeed;
        new_anim.play()
        new_animations.push(new_anim);
    });
    return new_animations;
}


const skins = [
    [[0, 0, 0], [0, 0, 0], 0],
    [[0, 0, 1], [0, 1, 0], 1],
    [[0, 0, 0], [0, 0, 1], 1.3],
    [[0, 0, 0], [1, 0, 0], 1.3],
    [[0, 0, 0], [1, 0, 1], 1.3],
    [[1, 1, 1], [0, 0, 1], 1],
    [[1, 1, 1], [0, 0, 0], 1],
    [[0, 1, 1], [0, 0, 0], 1]
];
var skin_index = 0;

var changeColor = new PIXI.filters.ColorReplaceFilter();
var otherChangeColor = new PIXI.filters.ColorReplaceFilter();
animations.forEach(x => x.filters = [changeColor, blur, trail]); // glow
other_player_animations.forEach(x => x.filters = [otherChangeColor]); //blur

// Info of the other player, for an accurate display.
var otherPlayer = {
    x: 0,
    y: 0,
    activeAnimName: "standing",
    direction: "right",
    activeAnim: other_player_animations.find(x => x.name === "standing"),
    skinIndex: 0,
    setValues(response) {
        this.x = response.x;
        this.y = response.y;
        this.activeAnimName = response.activeAnim;
        this.direction = response.direction;
        this.activeAnim = other_player_animations.find(x => x.name === response.activeAnim);
        this.skinIndex = response.skinIndex;
    }
}

// Info of the playing character.
let character = {
    x: app.screen.width/3, y: app.screen.height/3,//app.screen.height/1.26,
    vx: 10, vy: 0,
    direction: 0,
    activeAnim: standing,
    activeAnimName: "standing",
    jumped: false,
    dashing: false,
    dashed: false
};

// For easier input management
let kb = {
    ArrowRight: false,
    ArrowLeft: false,
    ArrowDown: false,
    Space: false,
    Akey: false
}

// Communicaiton with server to get info of the other player.
function send_data() {
    let data = {
        id: id[0],
        x: character.x,
        y: character.y,
        activeAnim: character.activeAnim.name,
        direction: standing.scale.x == 3 ? "right" : "left",
        skinIndex: skin_index,
        game_over: game.game_over
    }
    socket.emit('trade_player_pos', data, (response) => {
        otherPlayer.setValues(response.player_info);
        if (response.game_over) {
            end_the_round = true;
        }
    });
}

// Colisions of the map + with other player
const coliding = coord => map[coord[1]][coord[0]] == 0;

function testCollision(worldX, worldY, canStep=false) {
    let hitbox = [
        [Math.floor((worldX-16*SCALE)/(16*SCALE)), Math.floor((worldY-16*SCALE*0.8)/(16*SCALE))+1],
        [Math.floor((worldX-16*SCALE)/(16*SCALE)), Math.floor((worldY-16*SCALE*0.8)/(16*SCALE))],
        [Math.floor((worldX-16*SCALE)/(16*SCALE)), Math.floor((worldY-16*SCALE*0.8)/(16*SCALE))-1],
    ];
    let otherHitbox = [
        [Math.floor((otherPlayer.x-16*SCALE)/(16*SCALE)), Math.floor((otherPlayer.y-16*SCALE*0.8)/(16*SCALE))+3],
        [Math.floor((otherPlayer.x-16*SCALE)/(16*SCALE)), Math.floor((otherPlayer.y-16*SCALE*0.8)/(16*SCALE))+2],
        [Math.floor((otherPlayer.x-16*SCALE)/(16*SCALE)), Math.floor((otherPlayer.y-16*SCALE*0.8)/(16*SCALE))+1],
    ];
    hitbox.forEach(function(x){
        otherHitbox.forEach(function(y){
            if (x[0] == y[0] && x[1] == y[1] && !game.block_input && game.started) {
                console.log("Colision with other player");
                game.game_over = true;
            }
        })
    });
    if (coliding(hitbox[0]) && !coliding([hitbox[1][0], Math.floor((worldY)/(16*SCALE))]) && canStep && bumpCounter < 3) { // Math.floor((worldY+24-0.5*16*SCALE)/(16*SCALE))
        character.y -= 16*SCALE;
        bumpCounter++; // to avoid infinite bump
    }
    if (hitbox.some(coliding)) {
        return true;
    }
    return false;
}

// Anim management
jumping.onLoop = function () {
    jumping.stop();
    character.activeAnim = rolling;
};

initSlide.onLoop = function () {
    initSlide.stop();
    character.activeAnim = sliding;
}

// On keypress
document.addEventListener('keydown', function(e) {
    if (e.key === "ArrowRight") {
        kb.ArrowRight = true;
        if (character.activeAnim != rolling || !character.jumped)
            if (!game.block_input)
                character.activeAnim = running;
        animations.forEach(x => x.scale.x = 3);
    }
    if (e.key === "ArrowLeft") {
        kb.ArrowLeft = true;
        if (character.activeAnim != rolling || !character.jumped)
            if (!game.block_input)
                character.activeAnim = running;
            animations.forEach(x => x.scale.x = -3);
    }
    if (e.key === "ArrowDown") {
        kb.ArrowDown = true;
    }
    if (e.key == "m") {
        skin_index += 1;
        if (skin_index == skins.length) skin_index = 0;
        changeColor.originalColor = skins[skin_index][0];
        changeColor.newColor = skins[skin_index][1];
        changeColor.epsilon = skins[skin_index][2];
    }
    if (e.key === " ") {
        kb.Space = true;
    }
    if (e.key === "ArrowUp") {
        kb.Space = true;
    }
    if (e.key == "a") {
        kb.Akey = true;
    }
    if (e.key == "r")
        window.location.reload();
});

// On keyup
document.addEventListener('keyup', function(e) {
    if (e.key === "ArrowRight" && kb.ArrowRight) {
        kb.ArrowRight = false;
        if (!kb.ArrowLeft) {
            character.direction = 0;
            character.activeAnim = standing
        }
    }
    if (e.key === "ArrowLeft" && kb.ArrowLeft) {
        kb.ArrowLeft = false;
        if (!kb.ArrowRight) {
            character.direction = 0;
            character.activeAnim = standing
        }
    }
    if (e.key === "ArrowDown") {
        kb.ArrowDown = false;
    }
    if (e.key === " ") {
        kb.Space = false;
    }
    if (e.key === "ArrowUp") {
        kb.Space = false;
    }
});

var touchingGround = false;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function dash()
{
    trail.blue = [character.direction == 0 ? 40 : -40, 0];
    trail.red = [0, 0];
    trail.green = [character.direction == 0 ? 20 : -20, 0];
    character.dashing = true;
    await sleep(200);
    trail.red = [0, 0];
    trail.green = [0, 0];
    trail.blue = [0, 0];
    character.dashing = false;
    kb.Akey = false;
    character.dashed = true;
}

async function start_round()
{
    game.block_input = true;
    await sleep(1000);
    app.stage.addChild(readyText);
    await sleep(1300);
    game.block_input = false;
    app.stage.removeChild(readyText);
    app.stage.addChild(goText);
    app.stage.removeChild(p1ScoreText);
    app.stage.removeChild(p2ScoreText);
    game.game_over = false;
    await sleep(1000);
    app.stage.addChild(timerText);
    app.stage.addChild(mapSprite);
    game.started = true;
    app.stage.removeChild(goText);
}

async function end_round()
{
    console.log("end round");
    zoomBlur.strength = 0.3;
    console.log(zoomBlur.strength);
    zoomBlur.center = [character.x, character.y];
    app.ticker.start();
    blur.velocity = [0, 0];
    const endText = new PIXI.Text("TAG!", endStyle);
    endText.anchor.set(0.5);
    endText.x = app.screen.width / 2;
    endText.y = app.screen.height / 2;
    app.stage.addChild(endText);
    app.stage.removeChild(roleText);
    app.ticker.stop();
    await sleep(3000);
    app.stage.removeChild(timerText);
    app.ticker.start();
    app.stage.removeChild(endText);
    zoomBlur.strength = 0;
    game.roles_set = false;
    game.started = false;
    game.p1_is_chaser = !game.p1_is_chaser;
    if (!game.acending_timer) { // need to be before the game.acending update
        game.p1_is_chaser ? game.p1_score++ : game.p2_score++
        timer = 0;
    } else {
        timer++;
    }
    game.acending_timer = !game.acending_timer;
    game.game_over = false;
    end_the_round = false;
}

async function times_up()
{
    console.log("Chased wins !");
    // game.game_state = 2;
    zoomBlur.strength = 0.3;
    // zoomBlur.center = [character.x, character.y];
    // blur.velocity = [0, 0];
    const endText = new PIXI.Text("UP!", endStyle);
    endText.anchor.set(0.5);
    endText.x = app.screen.width / 2;
    endText.y = app.screen.height / 2;
    app.stage.addChild(endText);
    app.stage.removeChild(roleText);
    app.ticker.stop();
    await sleep(3000);
    app.stage.removeChild(timerText);
    app.ticker.start();
    app.stage.removeChild(endText);
    zoomBlur.strength = 0;
    game.roles_set = false;
    game.started = false;
    game.p1_is_chaser = !game.p1_is_chaser;
    if (!game.acending_timer) { // need to be before the game.acending_timer update
        game.p1_is_chaser ? game.p2_score++ : game.p1_score++
        timer = 0;
    }
    game.acending_timer = !game.acending_timer;
    game.game_over = false;
}

async function update_timer()
{
    game.lock_timer = true;
    game.acending_timer ? timer++ : timer--;
    timerText.text = `${timer}`;
    if (timer == 0)
        times_up();
    await sleep(1000);
    game.lock_timer = false;
}

// Controler management. Need to be in game loop
function handle_gamepad()
{
    const gamepad = navigator.getGamepads()[0];
    if (gamepad.buttons[0].pressed) {
        document.dispatchEvent(new KeyboardEvent('keydown', {'key': ' '}));
    } else {
        document.dispatchEvent(new KeyboardEvent('keyup', {'key': ' '}));
    }
    if (gamepad.axes[0] < 0) {
        document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowLeft'}));
    } else {
        document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'ArrowLeft'}));
    }
    if (gamepad.axes[0] > 0) {
        document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowRight'}));
    } else {
        document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'ArrowRight'}));
    }
    if (gamepad.buttons[7].pressed && !character.dashed) {
        kb.Akey = true;
    }
}

// When player is alone.
app.stage.addChild(waitingText);

app.ticker.maxFPS = 60;
// Listen for frame updates
app.ticker.add(() => {
    // if contoler connected
    if (navigator.getGamepads()[0])
        handle_gamepad();
    if (game.started === true && !game.lock_timer)
        update_timer();
    // ------ Initialisation of the game if 2 players connected ------ //
    if (game.block_input)
        Object.keys(kb).forEach(v => kb[v] = false)
    if (game.other_player_left)
        window.location.reload();
    socket.emit('two_player_connected', (response) => {game.setValues(response)});
    if (game.both_players_connected && !game.roles_set) {
        if (id[0] === "player:1") {
            character.x = p1ScoreText.x = game.p1_is_chaser ? 79 : 1105;
            character.y = p1ScoreText.y = game.p1_is_chaser ? 260 : 428;
            otherPlayer.x = game.p1_is_chaser ? 1105 : 79;
            otherPlayer.y = game.p1_is_chaser ? 428 : 260;
            p1ScoreText.y -= 100;
            p2ScoreText.x = otherPlayer.x;
            p2ScoreText.y = otherPlayer.y-100;
            character.activeAnim.scale.x = game.p1_is_chaser ? 3 : -3
            roleStyle.fill = ['#ffffff', game.p1_is_chaser ? '#FF2700' : '#00D8FF'], // gradient
            roleText.text = game.p1_is_chaser ? "Chaser" : "Chased";
        }
        if (id[0] === "player:2") {
            character.x = p2ScoreText.x = game.p1_is_chaser ? 1105 : 79;
            character.y = p2ScoreText.y = game.p1_is_chaser ? 428 : 260;
            otherPlayer.x = game.p1_is_chaser ? 79 : 1105;
            otherPlayer.y = game.p1_is_chaser ? 260 : 428;
            p2ScoreText.y -= 100;
            character.activeAnim.scale.x = game.p1_is_chaser ? -3 : 3
            p1ScoreText.x = otherPlayer.x;
            p1ScoreText.y = otherPlayer.y-100;
            roleStyle.fill = ['#ffffff', game.p1_is_chaser ? '#00D8FF' : '#FF2700'], // gradient
            roleText.text = game.p1_is_chaser ? "Chased" : "Chaser";
        }
        p1ScoreText.text = `${game.p1_score}`;
        p2ScoreText.text = `${game.p2_score}`;
        app.stage.addChild(p1ScoreText);
        app.stage.addChild(p2ScoreText);
        app.stage.addChild(roleText);
        app.stage.removeChild(waitingText);
        start_round();
        game.roles_set = true;
    }
    // ------ Player Movement management ------ //
    character.vy = Math.min(12, character.vy + 1)
    if (character.vx > 0) {
        character.vx -= 1;
    }
    if (character.vx < 0) {
        character.vx += 1;
    }

    let oldTouchedGround = touchingGround;
    // console.log(game.game_over);
    touchingGround = testCollision(
        character.x + 2,
        character.y + 16 * SCALE * 2
        ) || testCollision(
            character.x + 16 * SCALE * 1.5 - 3,
            character.y + 16 * SCALE * 2
        );
    let justTouchedGround = !oldTouchedGround && touchingGround;
    if (touchingGround) // maybe not opti
        bumpCounter = 0;
    if (touchingGround && character.activeAnim == rolling)
        character.activeAnim = standing;
    if (kb.ArrowDown && character.activeAnim === initSlide && touchingGround && character.vy > 0) {
        if (kb.ArrowRight)
            character.vx = 10 + character.vy;
        if (kb.ArrowLeft)
            character.vx = - (10 + character.vy);
    }
    if (character.vy > 0 && !character.dashing) {
        for (let i = 0; i < character.vy; i++) {
            let testX1 = character.x + 2;
            let testX2 = character.x + 16 * SCALE * 1.5 - 3;
            let testY = character.y + 16 * SCALE * 2;
            if (testY > 28 * 16 * SCALE || testCollision(testX1,testY) || testCollision(testX2,testY)) {
                character.vy = 0;
                break;
            }
            character.y = character.y + 1;
        }
    }
    if (character.vy < 0) {
        for (let i = character.vy; i < 0; i++) {
            let testX1 = character.x + 2;
            let testX2 = character.x + 16 * SCALE * 1.5;
            let testY = character.y + 5;
            if (testCollision(testX1, testY) || testCollision(testX2, testY)) {
                    character.vy = 0;
                    break;
            }
            character.y = character.y - 1;
        }
    }
    if (character.vx > 0) {
        character.direction = 0;
        for (let i = 0; i < character.vx; i++) {
            let testX = character.x + 16 * SCALE * 2 - 2;
            let testY1 = character.y + 5;
            let testY2 = character.y + 16 * SCALE;
            let testY3 = character.y + 16 * SCALE * 2 - 1;
            if (testCollision(testX, testY1,true) || testCollision(testX, testY2,true) || testCollision(testX, testY3, true)) {
                character.vx = 0;
                break;
            }
            character.x = character.x + 1;
        }
    }
    // console.log(character.x, character.y);
    if (character.vx < 0) {
        character.direction = 1;
        for (let i = character.vx; i < 0; i++) {
            let testX = character.x + 1;
            let testY1 = character.y + 5;
            let testY2 = character.y + 16 * SCALE;
            let testY3 = character.y + 16 * SCALE * 2 - 1;
            if (testX < 0 || testCollision(testX, testY1, true) || testCollision(testX, testY2, true) || testCollision(testX, testY3, true)) {
                character.vx = 0;
                break;
            }
            character.x = character.x - 1;
        }
    }

    // ------ Input Management ------ //
    if (kb.ArrowRight) {
        character.direction = 0;
        character.vx = Math.min(8, character.vx + 2);
    }
    if (kb.ArrowLeft) {
        character.direction = 1;
        character.vx = Math.max(-8, character.vx - 2);
    }
    if (!kb.Space && touchingGround && character.jumped) {
        character.jumped = false;
    }
    if (kb.Space && touchingGround && !character.jumped) {
        character.vy = -18;
        character.activeAnim = jumping;
        jumping.currentFrame = 0;
        jumping.play();
        character.jumped = true;
    }
    if (kb.Akey) {
        character.vx = character.direction == 0 ? 15 : -15;
        dash();
    }
    if (kb.ArrowDown) {
        character.vx = character.vy;
        initSlide.play();
        if (character.activeAnim != initSlide && character.activeAnim != sliding)
        character.activeAnim = initSlide;
    }
    if ((character.activeAnim == standing || character.activeAnim == running) && character.vy > 10)
        character.activeAnim = falling;
    if (justTouchedGround) {
        character.dashed = false;
        if (kb.ArrowLeft || kb.ArrowRight)
            character.activeAnim = running;
        else character.activeAnim = standing;
    }


    // ------ Player Drawing ------ //
    blur.velocity = [character.vx, character.vy];
    animations.forEach(x => x.visible = false);
    character.activeAnim.position.set(character.x, character.y);

    other_player_animations.forEach(x => x.visible = false);
    otherChangeColor.originalColor = skins[otherPlayer.skinIndex][0];
    otherChangeColor.newColor = skins[otherPlayer.skinIndex][1];
    otherChangeColor.epsilon = skins[otherPlayer.skinIndex][2];
    otherPlayer.activeAnim.position.set(otherPlayer.x, otherPlayer.y);
    otherPlayer.activeAnim.scale.x = otherPlayer.direction === "left" ? -3 : 3
    character.activeAnim.visible = true;
    otherPlayer.activeAnim.visible = true;
    if (game.both_players_connected)
        app.stage.addChild(otherPlayer.activeAnim);
    app.stage.addChild(character.activeAnim);

    // ------ Communication with server ----- //
    send_data();
    if (end_the_round)
        end_round();
});

app.loader.onError.add((error) => console.error(error));