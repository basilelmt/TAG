const socket = io()

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const id = []
const SCALE = 1.5
var time = Date.now();
var game = {
    roles_set: false,
    both_players_connected: false,
    setValues(data) {
        this.both_players_connected = data
    }
};

socket.on('playerInfo', (data) => {
    id.push(data.name);
});

console.log(id);

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

const endText = new PIXI.Text("GAME!", endStyle);
endText.anchor.set(0.5);
endText.x = app.screen.width / 2;
endText.y = app.screen.height / 2;

const roleText = new PIXI.Text("...", roleStyle);
roleText.x = 50;
roleText.y = 0;

var countdown = [];
for (let i = 3; i > -1; i--) {
    let tmp = new PIXI.Text(i == 0 ? "GO!" : `${i}`, endStyle);
    tmp.anchor.set(0.5);
    tmp.x = app.screen.width / 2;
    tmp.y = app.screen.height / 2;
    countdown.push(tmp);
}

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

const sky = PIXI.Sprite.from('../ressources/sky.png');
sky.anchor.set(0.5);
sky.x = app.screen.width / 2;
sky.y = app.screen.height / 2;
sky.scale.set(SCALE, SCALE);

app.stage.addChild(sky);
app.stage.addChild(mapSprite);

// ------ Character ------
// app.loader.load(setup)

const blur = new PIXI.filters.MotionBlurFilter([0, 0], 5);
// const glow = new PIXI.filters.GlowFilter({outerStrength: 1});

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
running.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
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
jumping.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
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
rolling.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
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
falling.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
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
initSlide.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
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
endSlide.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
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
sliding.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
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


// ------------- Faire slide après une chute + anim chute

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
animations.forEach(x => x.filters = [changeColor, blur]); // glow
other_player_animations.forEach(x => x.filters = [otherChangeColor]); //blur
// animations.forEach(x => x.scale.set(SCALE, SCALE));

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

let character = {
    x: app.screen.width/3, y: app.screen.height/3,//app.screen.height/1.26,
    vx: 10, vy: 0,
    direction: 0,
    activeAnim: standing,
    activeAnimName: "standing",
    jumped: false
};

let kb = {
    ArrowRight: false,
    ArrowLeft: false,
    ArrowDown: false,
    Space: false
}

function send_data() {
    let data = {
        id: id[0],
        x: character.x,
        y: character.y,
        activeAnim: character.activeAnim.name,
        direction: standing.scale.x == 3 ? "right" : "left",
        skinIndex: skin_index
    }
    socket.emit('trade_player_pos', data, (response) => {
        otherPlayer.setValues(response);
    });
}

const coliding = coord => map[coord[1]][coord[0]] == 0;

function debug_coliding (coord) {
    try {
        return map[coord[1]][coord[0]] == 0;
    } catch {
        console.log(`ERROR !!!\n${coord} don't exist !!!`)
        return true;
    }
}


function testCollision(worldX, worldY, canStep=false) {
    let hitbox = [
        [Math.floor((worldX-16*SCALE)/(16*SCALE)), Math.floor((worldY-16*SCALE*0.8)/(16*SCALE))+1],
        [Math.floor((worldX-16*SCALE)/(16*SCALE)), Math.floor((worldY-16*SCALE*0.8)/(16*SCALE))],
        [Math.floor((worldX-16*SCALE)/(16*SCALE)), Math.floor((worldY-16*SCALE*0.8)/(16*SCALE))-1],
    ]
    if (coliding(hitbox[0]) && !coliding([hitbox[1][0], Math.floor((worldY)/(16*SCALE))]) && canStep) { // Math.floor((worldY+24-0.5*16*SCALE)/(16*SCALE))
        character.y -= 16*SCALE;
    }
    if (hitbox.some(coliding)) {
        return true;
    }
    return false;
}

jumping.onLoop = function () {
    jumping.stop();
    character.activeAnim = rolling;
};

initSlide.onLoop = function () {
    initSlide.stop();
    character.activeAnim = sliding;
}

document.addEventListener('keydown', function(e) {
    if (e.key === "ArrowRight") {
        kb.ArrowRight = true;
        if (character.activeAnim != rolling || !character.jumped)
            character.activeAnim = running;
        animations.forEach(x => x.scale.x = 3);
    }
    if (e.key === "ArrowLeft") {
        kb.ArrowLeft = true;
        if (character.activeAnim != rolling || !character.jumped)
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
    if (e.key == "a") {
        if (character.vx > 0)
            character.vx += 100;
        if (character.vx < 0)
            character.vx -= 100;
    }
});

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
});

var touchingGround = false;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function display_countdown()
{
    for (let i = 0; i < 4; i++) {
        await sleep(1000);
        app.stage.addChild(countdown[i]);
        if (i > 0)
            app.stage.removeChild(countdown[i-1]);
    }
    await sleep(1000);
    app.stage.removeChild(countdown[3]);
}

// app.ticker.speed = 1;
// Listen for frame updates
app.ticker.maxFPS = 60;
app.ticker.add(() => {
    console.log(app.ticker.FPS);
    // ------ Initialisation of the game if 2 players connected ------ //
    if (!game.both_players_connected)
        socket.emit('two_player_connected', (response) => {game.setValues(response)});
    if (game.both_players_connected && !game.roles_set) {
        character.x = id[0] === "player:1" ? 79 : 1105;
        character.y = id[0] === "player:1" ? 260 : 428;
        character.activeAnim.scale.x = id[0] === "player:1" ? 3 : -3
        roleStyle.fill = ['#ffffff', id[0] === "player:1" ? '#FF2700' : '#00D8FF'], // gradient
        roleText.text = id[0] === "player:1" ? "Chaser" : "Chased";
        app.stage.addChild(roleText);
        // app.ticker.stop();
        display_countdown();
        // app.ticker.start();
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

    touchingGround = testCollision(
        character.x + 2,
        character.y + 16 * SCALE * 2
        ) || testCollision(
            character.x + 16 * SCALE * 1.5 - 3,
            character.y + 16 * SCALE * 2
        );
    let justTouchedGround = !oldTouchedGround && touchingGround;

    if (kb.ArrowDown && character.activeAnim === initSlide && touchingGround && character.vy > 0) {
        if (kb.ArrowRight)
            character.vx = 10 + character.vy;
        if (kb.ArrowLeft)
            character.vx = - (10 + character.vy);
    }
    if (character.vy > 0) {
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
    if (kb.ArrowDown) {
        character.vx = character.vy;
        initSlide.play();
        if (character.activeAnim != initSlide && character.activeAnim != sliding)
            character.activeAnim = initSlide;
    }
    if ((character.activeAnim == standing || character.activeAnim == running) && character.vy > 10)
        character.activeAnim = falling;
    if (justTouchedGround) {
        if (kb.ArrowLeft || kb.ArrowRight)
            character.activeAnim = running;
        else character.activeAnim = standing;
    }

    // ------ Communication with server ----- //
    send_data();

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

    if (character.x >= otherPlayer.x && character.x <= otherPlayer.x + 16*SCALE
    && character.y >= otherPlayer.y && character.y <= otherPlayer.y + 3*16*SCALE
    && game.both_players_connected) {
        console.log("Chaser wins !");
        zoomBlur.strength = 0.3;
        zoomBlur.center = [character.x, character.y];
        blur.velocity = [0, 0];
        const endText = new PIXI.Text("GAME!", endStyle);
        endText.anchor.set(0.5);
        endText.x = app.screen.width / 2;
        endText.y = app.screen.height / 2;
        app.stage.addChild(endText);
        app.stage.removeChild(roleText);
        app.ticker.stop();
    }
});

app.loader.onError.add((error) => console.error(error));