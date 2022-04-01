PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const app = new PIXI.Application();
const graphics = new PIXI.Graphics();
const OFFSETX = -322
const OFFSETY = -54

document.body.appendChild(app.view);

app.renderer.backgroundColor = 0x00D8FF;
app.renderer.view.style.position = 'absolute';
app.renderer.resize(window.innerWidth, window.innerHeight);

// ------ Map colision ------

var map = [
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111110000000000000000000000000011111111111111111111111",
    "111111111111111111110001111111111111111111111111100011111111111111111111",
    "111111111111111111001111111111111111111111111111111100111111111111111111",
    "111111111111111110111111111111111111111111111111111111011111111111111111",
    "111111111111111101111100011111111111111111111111111111101111111111111111",
    "111111111111111011111111111111111111111111111111111111110111111111111111",
    "111111111111100011111111111111111100111111111111111111110001111111111111",
    "111111111111011111111111111111111100111111111111111111111110111111111111",
    "111111111111011111111111111111111111111111111111111111111110111111111111",
    "111111111111011111111111111111111111111111111110000011111110111111111111", //15
    "111111111111011111111111111111111111111111111111111111111110111111111111",
    "111111111111011111111111111111111111111111111111111111111110111111111111",
    "111111111111011111111111111111111111111111111111111111111110111111111111",
    "111111111111000111111111111100000000111111111111111111111110111111111111",
    "111111111111011111111111111111111111111111111111111111111110111111111111", //20
    "111111111111011111111111111111111111111111111111111111111110111111111111",
    "111111111111011111111111111111111111111111111111100011111110111111111111",
    "111111111111011111110111111111111111111111111111111111111110111111111111", // 23
    "111111111111011111111000111111111111111111111111111111111110111111111111",
    "111111111111011111111111111111110011111111111111111111111110111111111111",
    "111111111111100011111111111111110011111111111111111111110001111111111111",
    "111111111111111011111111111111111111111111100011111111110111111111111111",
    "111111111111111101111111111111111111111111111111111111101111111111111111",
    "111111111111111110111111111111111111111111111111111111011111111111111111",
    "111111111111111111001111111111111111111111111111111100111111111111111111", //30
    "111111111111111111110001111111111111111111111111100011111111111111111111",
    "111111111111111111111110000000000000000000000000011111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111",
    "111111111111111111111111111111111111111111111111111111111111111111111111"
];

// ------ Background image ------
const mapSprite = PIXI.Sprite.from('./terrain.png');

mapSprite.anchor.set(0.5);
// mapSprite.filters = [new PIXI.filters.GlitchFilter(10)]
app.stage.addChild(mapSprite);
mapSprite.x = app.screen.width / 2;
mapSprite.y = app.screen.height / 2;
mapSprite.scale.set(2, 2);

// ------ Character ------
// app.loader.load(setup)

const blur = new PIXI.filters.MotionBlurFilter([0, 0], 5);

let textures = []
for (let i = 0; i < 4; i++) {
    const texture = PIXI.Texture.from(`./character/adventurer-idle-0${i}.png`);
    textures.push(texture);
}
const standing = new PIXI.AnimatedSprite(textures);
standing.scale.set(4, 4)
standing.anchor.set(0.5)
standing.animationSpeed = 0.1
standing.play();

textures = []
for (let i = 0; i < 6; i++) {
    const texture = PIXI.Texture.from(`./character/adventurer-run-0${i}.png`);
    textures.push(texture);
}
const running = new PIXI.AnimatedSprite(textures);
running.filters = [blur]; //MotionBlurFilter //GlowFilter //ColorOverlayFilter
running.scale.set(4, 4);
running.anchor.set(0.5);
running.animationSpeed = 0.2;
running.animationSpeed = 0.2;
running.play();

let character = {
    x: app.screen.width/2.5, y: app.screen.height/1.178,
    vx: 5, vy: 0,
    direction: 0,
    activeAnim: standing,
    touchingGround: true,
    jumped: false
};

const coliding = coord => map[coord[1]][coord[0]] == 0

function testColision(hitbox, index, movement) {

    for (let i = 0; i < 4; i++)
        hitbox[i][index] = hitbox[i][index] + movement;
    if (hitbox.some(coliding))
        return false
    return true
}

document.addEventListener('keydown', function(e) {
    if (e.key === "ArrowRight") {
        character.direction = 1;
        character.activeAnim = running
        running.scale.x = 4;
        standing.scale.x = 4;
    }
    if (e.key === "ArrowLeft") {
        character.direction = -1;
        character.activeAnim = running
        running.scale.x = -4;
        standing.scale.x = -4;
    }
    if (e.key === " " && !character.jumped) {
        character.touchingGround = false;
        character.jumped = true;
        character.vy = 25;
    }
})

document.addEventListener('keyup', function(e) {
    if (e.key === "ArrowRight" && character.direction === 1) {
        character.direction = 0;
        character.activeAnim = standing
    }
    if (e.key === "ArrowLeft" && character.direction === -1) {
        character.direction = 0;
        character.activeAnim = standing
    }
})

app.ticker.add((time) => {
    let hitbox = [
        [Math.round((character.x+OFFSETX)/32)+21, Math.round((character.y+OFFSETY)/32)+5],
        [Math.round((character.x+OFFSETX)/32)+21, Math.round((character.y+OFFSETY)/32)+6],
        [Math.round((character.x+OFFSETX)/32)+21, Math.round((character.y+OFFSETY)/32)+7],
        [Math.round((character.x+OFFSETX)/32)+21, Math.round((character.y+OFFSETY)/32)+8]
    ]
    // console.log(
    //     map[hitbox[0][1]][hitbox[0][0]],
    //     map[hitbox[1][1]][hitbox[1][0]],
    //     map[hitbox[2][1]][hitbox[2][0]],
    //     map[hitbox[3][1]][hitbox[3][0]],
    // )
    if (character.direction === 1 && testColision(hitbox, 0, 1)) {
        character.x += character.vx;
    }
    if (character.direction === -1 && testColision(hitbox, 0, -1)) {
        character.x -= character.vx;
    }
    if (character.vy > 0 && testColision(hitbox, 1, -1)) {
        character.y -= character.vy;
        character.vy -= 1;
    }
    if (!character.touchingGround) {
        character.vy -= 1;
        if (character.vy < 0)
            character.y -= character.vy;
    }
    if (character.touchingGround) {
        character.vy = 0;
    }
    if (character.touchingGround)
        jumped = false;
    console.log(character.vy);
    character.touchingGround = testColision(hitbox, 1, 1) ? false : true;
    console.log(character.touchingGround);
    if (character.vy === 0)
        character.jumped = false;
    blur.velocity = [character.vx, character.vy]
    running.position.set(character.x, character.y);
    standing.position.set(character.x, character.y)
    running.visible = false
    standing.visible = false
    character.activeAnim.visible = true
    app.stage.addChild(character.activeAnim);
});

// ------ Title ------
const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    dropShadow: true,
    dropShadowAlpha: 0.8,
    dropShadowAngle: 2.1,
    dropShadowBlur: 4,
    dropShadowColor: '0x111111',
    dropShadowDistance: 10,
    fill: ['#FFE800'], // ['#00CD66', '#8B4513'],
    stroke: '#000000',
    fontSize: 100,
    fontWeight: 'lighter',
    lineJoin: 'round',
    strokeThickness: 12,
})


const title = new PIXI.Text('Tag Duel', style);
title.anchor.set(0.5, 0.5);
title.x = app.screen.width/2;
title.y = app.screen.height/4;
// app.stage.addChild(title);