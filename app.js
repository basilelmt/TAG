const Application = PIXI.Application;

const app = new Application({
    width: 500,
    height: 500,
    transparent: false,
    antialias: true
});

app.renderer.backgroundColor = 0x00D8FF;

app.renderer.resize(window.innerWidth, window.innerHeight);

app.renderer.view.style.position = 'absolute';

const skewStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    dropShadow: true,
    dropShadowAlpha: 0.8,
    dropShadowAngle: 2.1,
    dropShadowBlur: 4,
    dropShadowColor: '0x111111',
    dropShadowDistance: 10,
    fill: ['#00FF7F', '#DAA520'], // ['#00CD66', '#8B4513'],
    stroke: '#000000',
    fontSize: 100,
    fontWeight: 'lighter',
    lineJoin: 'round',
    strokeThickness: 12,
})

const skewText = new PIXI.Text('Tag Duel', skewStyle);
// skewText.skew.set(0.65, -0.3);
skewText.anchor.set(0.5, 0.5);
skewText.x = app.screen.width/2;
skewText.y = app.screen.height/4;
app.stage.addChild(skewText);

document.body.appendChild(app.view);
