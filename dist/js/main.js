(function(){
  var renderer, stage, sky, center, r, angle, colors, x, y, i$, i, main;
  renderer = new PIXI.WebGLRenderer(600, 600);
  document.getElementById('moe').appendChild(renderer.view);
  stage = new PIXI.Stage(0x16161d);
  sky = new PIXI.Graphics;
  center = new PIXI.Point(300, 300);
  r = 300;
  angle = Math.PI / 6;
  colors = [0x5ccccc, 0xcfffff];
  x = center.x + r;
  y = center.y;
  for (i$ = 0; i$ < 12; ++i$) {
    i = i$;
    sky.beginFill(colors[i % 2]);
    sky.moveTo(center.x, center.y);
    sky.lineTo(x, y);
    sky.lineTo(x = center.x + r * Math.cos((i + 1) * angle), y = center.y + r * Math.sin((i + 1) * angle));
    sky.lineTo(center.x, center.y);
    sky.endFill();
  }
  sky.pivot = sky.position = center;
  stage.addChild(sky);
  main = function(it){
    var moe, i$, len$, stroke, j$, ref$, len1$, cmd, x$, gameLoop, checker;
    moe = new PIXI.Graphics;
    moe.beginFill(0x000000);
    for (i$ = 0, len$ = it.length; i$ < len$; ++i$) {
      stroke = it[i$];
      for (j$ = 0, len1$ = (ref$ = stroke.outline).length; j$ < len1$; ++j$) {
        cmd = ref$[j$];
        switch (cmd.type) {
        case 'M':
          moe.moveTo(cmd.x, cmd.y);
          break;
        case 'L':
          moe.lineTo(cmd.x, cmd.y);
          break;
        case 'Q':
          moe.lineTo(cmd.begin.x, cmd.begin.y);
          moe.lineTo(cmd.end.x, cmd.end.y);
          break;
        case 'C':
          moe.lineTo(cmd.begin.x, cmd.begin.y);
          moe.lineTo(cmd.mid.x, cmd.mid.y);
          moe.lineTo(cmd.end.x, cmd.end.y);
        }
      }
    }
    moe.endFill();
    x$ = moe.scale;
    x$.x = 0.28;
    x$.y = 0.28;
    stage.addChild(moe);
    sky.mask = moe;
    gameLoop = function(){
      sky.rotation += Math.PI / 360;
      renderer.render(stage);
      return requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
    checker = new ModifiedChecker;
    return checker.run(function(){
      console.log('page updated');
      return window.location.reload(true);
    });
  };
  zhStrokeData.loaders.JSON('./json/840c.json').then(main);
}).call(this);
