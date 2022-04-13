console.log("The app is loaded !")
const sock = io()

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const app = new PIXI.Application();
app.renderer.backgroundColor = 0x211f30;
app.renderer.view.style.position = 'absolute';
app.renderer.resize(1503, 948);
// app.renderer.resize(window.innerWidth, window.innerHeight);
console.log(app.screen.width, app.screen.height); // classic: 1503 948, with server: 1202 758
const graphics = new PIXI.Graphics();
const pixel = new PIXI.Graphics();
const SCALE = 1.8
const OFFSETX = (app.screen.width/2)-800*0.9
const OFFSETY = (app.screen.height/2)-448*0.9

document.body.appendChild(app.view);

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
    "00001111110001111111111111111111111111111111111100",
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
// mapSprite.filters = [new PIXI.filters.GlitchFilter(10)]
mapSprite.x = app.screen.width / 2;
mapSprite.y = app.screen.height / 2;
mapSprite.scale.set(SCALE, SCALE);
//800, 448

graphics.beginFill(0x00D8FF);
graphics.drawRect(OFFSETX, OFFSETY, 800*SCALE, 448*SCALE);
graphics.endFill();
app.stage.addChild(graphics);
app.stage.addChild(mapSprite);

// ------ Character ------
// app.loader.load(setup)

const blur = new PIXI.filters.MotionBlurFilter([0, 0], 5);

var animations = [];

let textures = []
for (let i = 0; i < 4; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-idle-0${i}.png`);
    textures.push(texture);
}
const standing = new PIXI.AnimatedSprite(textures);
standing.scale.set(4, 4)
standing.anchor.set(0.5)
standing.animationSpeed = 0.1;
standing.play();
animations.push(standing);

textures = []
for (let i = 0; i < 6; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-run-0${i}.png`);
    textures.push(texture);
}
const running = new PIXI.AnimatedSprite(textures);
running.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
running.scale.set(4, 4);
running.anchor.set(0.5);
running.animationSpeed = 0.2;
running.play();
animations.push(running);

textures = []
for (let i = 0; i < 3; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-jump-0${i}.png`);
    textures.push(texture);
}
const jumping = new PIXI.AnimatedSprite(textures);
jumping.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
jumping.scale.set(4, 4);
jumping.anchor.set(0.5);
jumping.animationSpeed = 0.2;
animations.push(jumping);

textures = []
for (let i = 0; i < 4; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-smrslt-0${i}.png`);
    textures.push(texture);
}
const rolling = new PIXI.AnimatedSprite(textures);
rolling.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
rolling.scale.set(4, 4);
rolling.anchor.set(0.5);
rolling.animationSpeed = 0.2;
rolling.play()
animations.push(rolling);

textures = []
for (let i = 0; i < 2; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-fall-0${i}.png`);
    textures.push(texture);
}
const falling = new PIXI.AnimatedSprite(textures);
falling.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
falling.scale.set(4, 4);
falling.anchor.set(0.5);
falling.animationSpeed = 0.1;
falling.play()
animations.push(falling);

textures = []
for (let i = 2; i >= 0; i--) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-stand-0${i}.png`);
    textures.push(texture);
}
const initSlide = new PIXI.AnimatedSprite(textures);
initSlide.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
initSlide.scale.set(4, 4);
initSlide.anchor.set(0.5);
initSlide.animationSpeed = 0.4;
animations.push(initSlide);

textures = []
for (let i = 0; i < 3; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-stand-0${i}.png`);
    textures.push(texture);
}
const endSlide = new PIXI.AnimatedSprite(textures);
endSlide.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
endSlide.scale.set(4, 4);
endSlide.anchor.set(0.5);
endSlide.animationSpeed = 0.2;
endSlide.play()
animations.push(endSlide);

textures = []
for (let i = 0; i < 2; i++) {
    const texture = PIXI.Texture.from(`../ressources/character/adventurer-slide-0${i}.png`);
    textures.push(texture);
}
const sliding = new PIXI.AnimatedSprite(textures);
sliding.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
sliding.scale.set(4, 4);
sliding.anchor.set(0.5);
sliding.animationSpeed = 0.2;
sliding.play()
animations.push(sliding);

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
var skin_index = 1;

var changeColor = new PIXI.filters.ColorReplaceFilter();
animations.forEach(x => x.filters = [changeColor, blur]);

let character = {
    x: app.screen.width/3, y: 700,//app.screen.height/1.26,
    vx: 10, vy: 0,
    direction: 0,
    activeAnim: standing,
    jumped: false
};

let kb = {
    ArrowRight: false,
    ArrowLeft: false,
    ArrowDown: false,
    Space: false
}

const coliding = coord => map[coord[1]][coord[0]] == 0;

function testCollision(worldX, worldY, canStep=false) {
    let hitbox = [
        [Math.floor((worldX-3*16*SCALE+OFFSETX)/(16*SCALE)), Math.floor((worldY-OFFSETY-0.5*16*SCALE)/(16*SCALE))+1],
        [Math.floor((worldX-3*16*SCALE+OFFSETX)/(16*SCALE)), Math.floor((worldY-OFFSETY-0.5*16*SCALE)/(16*SCALE))],
        [Math.floor((worldX-3*16*SCALE+OFFSETX)/(16*SCALE)), Math.floor((worldY-OFFSETY-0.5*16*SCALE)/(16*SCALE))-1],
        // [Math.floor((worldX-3*16*SCALE+OFFSETX)/(16*SCALE)), Math.floor((worldY-OFFSETY-0.5*16*SCALE)/(16*SCALE))-2]
    ]
    // console.log(
    //     map[hitbox[0][1]][hitbox[0][0]],
    //     map[hitbox[1][1]][hitbox[1][0]],
    //     map[hitbox[2][1]][hitbox[2][0]],
    //     map[hitbox[3][1]][hitbox[3][0]],
    // );
    if (coliding(hitbox[0]) && !coliding([hitbox[1][0], Math.floor((worldY+24-OFFSETY-0.5*16*SCALE)/(16*SCALE))]) && canStep) { //&& (endTime - startTime > 200 || stepCount % 2 === 0)
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
        animations.forEach(x => x.scale.x = 4);
    }
    if (e.key === "ArrowLeft") {
        kb.ArrowLeft = true;
        if (character.activeAnim != rolling || !character.jumped)
            character.activeAnim = running;
        animations.forEach(x => x.scale.x = -4);
    }
    if (e.key === "ArrowDown") {
        kb.ArrowDown = true;
    }
    if (e.key == "m") {
        if (skin_index == skins.length) skin_index = 0;
        changeColor.originalColor = skins[skin_index][0];
        changeColor.newColor = skins[skin_index][1];
        changeColor.epsilon = skins[skin_index][2];
        skin_index += 1;
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

// Listen for frame updates
app.ticker.add((time) => {

    // console.log("x =", Math.floor((character.x+OFFSETX)/(16*SCALE))-4, "y =", Math.floor((character.y+OFFSETY)/(16*SCALE))-3)
    // console.log("TRUEx =", character.x, "TRUEy =", character.y)

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
    console.log(character.vx);
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
        character.vy = -20;
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
    // console.log("vy = ", character.vy);
    // console.log("touchingGround:", touchingGround);

    blur.velocity = [character.vx, character.vy];
    animations.forEach(x => x.visible = false);
    character.activeAnim.position.set(character.x, character.y);
    character.activeAnim.visible = true;
    app.stage.addChild(character.activeAnim);
});

app.loader.onError.add((error) => console.error(error));

pixel.beginFill(0xFFFFFF);
// pixel.drawRect(character.x + 2 + OFFSETX, character.y + 16 * SCALE + OFFSETY, 16*SCALE, 16*SCALE);
// pixel.drawRect(character.x + 16 * SCALE - 3 + OFFSETX, character.y + 16 * SCALE * 4 - OFFSETY, 16*SCALE, 16*SCALE);
pixel.endFill();
app.stage.addChild(pixel);