(stats = new Stats).domElement.style
  ..position = \absolute
  ..left     = \0
  ..top      = \0
(renderer = PIXI.autoDetectRenderer 400 300).view.style
  ..position = \absolute
  ..margin   = \auto
  ..left     = \0
  ..top      = \0
  ..right    = \0
  ..bottom   = \0
document.body
  ..appendChild renderer.view
  ..appendChild stats.domElement

stage = new PIXI.Stage 0x16161D
texture = PIXI.Texture.fromImage './img/mine.png'
mine = new PIXI.Sprite texture
mine
  ..position
    ..x = 200
    ..y = 150
  ..anchor
    ..x = 0.5
    ..y = 0.5
stage.addChild mine

game-loop = ->
  stats.begin!
  mine.rotation += 5 * Math.PI / 360
  renderer.render stage
  requestAnimationFrame game-loop
  stats.end!
requestAnimationFrame game-loop
