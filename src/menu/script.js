const SCALE = 1.5

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

document.body.appendChild(app.view);

const mapSprite = PIXI.Sprite.from('../ressources/terrain.png');

mapSprite.anchor.set(0.5);
mapSprite.x = app.screen.width / 2;
mapSprite.y = app.screen.height / 2;
mapSprite.scale.set(SCALE, SCALE);

const sky = PIXI.Sprite.from('../ressources/sky.png');
sky.anchor.set(0.5);
sky.x = app.screen.width / 2;
sky.y = app.screen.height / 2;
sky.scale.set(SCALE, SCALE);

// Button
const playStyle = new PIXI.TextStyle({
  fill: "#4de4ff",
  fontSize: 455,
  fontWeight: "bolder"
});

const playText = new PIXI.Text(`PLAY`, playStyle);
playText.height = app.screen.height+400;
playText.anchor.set(0.5);
playText.x = app.screen.width / 2;
playText.y = app.screen.height / 2;

playText.interactive = true;
playText.buttonMode = true;
playText.on('pointerover', onButtonOver)
playText.on('pointerout', onButtonOut)
playText.on('pointerdown', onClick);

app.stage.addChild(sky);
app.stage.addChild(playText);
app.stage.addChild(mapSprite);

function onButtonOver() {
  playText.style.fill = "#211f30";
}

function onButtonOut() {
  playText.style.fill = "#4de4ff";
}

let circle = new PIXI.Graphics();
circle.beginFill(0x211f30);
circle.drawCircle(50, 50, 50);
circle.endFill();
circle.x = 0;
circle.y = 0;
circle.pivot.x = circle.width / 2;
circle.pivot.y = circle.height / 2;
app.stage.addChild(circle);

let scale = 1;

app.ticker.maxFPS = 60;

async function wait_and_play()
{
    await new Promise(r => setTimeout(r, 500));
    window.location.href += 'game';
}

function onClick() {
  circle.x = app.renderer.plugins.interaction.mouse.global.x;
  circle.y = app.renderer.plugins.interaction.mouse.global.y;
  app.ticker.add(() => animateLoop());
  wait_and_play();
}

document.addEventListener('keydown', function(e) {
  if (e.key == "Shift" || e.key == "Control")
    return;
  for (let i = 1; i < 13; i++)
    if (e.key == `F${i}`)
      return;
  circle.x = app.renderer.plugins.interaction.mouse.global.x;
  circle.y = app.renderer.plugins.interaction.mouse.global.y;
  app.ticker.add(() => animateLoop());
  wait_and_play();
});

function animateLoop() {
  scale += 0.8;
  circle.scale.set(scale, scale);
}