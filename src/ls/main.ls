renderer = PIXI.autoDetectRenderer 600 600
document.getElementById(\moe).appendChild renderer.view

stage = new PIXI.Stage 0x16161d

sky = new PIXI.Graphics
center = new PIXI.Point 300 300
r = 300
angle = Math.PI / 6
colors = [0x5ccccc, 0xcfffff]
x = center.x + r
y = center.y
for i from 0 til 12
  sky.beginFill colors[i % 2]
  sky.moveTo center.x, center.y
  sky.lineTo x, y
  sky.lineTo do
    x = center.x + r * Math.cos((i+1) * angle)
    y = center.y + r * Math.sin((i+1) * angle)
  sky.lineTo center.x, center.y
  sky.endFill!
sky.pivot = sky.position = center
stage.addChild sky

main = ->
  moe = new PIXI.Graphics
  moe.beginFill 0x000000
  for stroke in it
    for cmd in stroke.outline
      switch cmd.type
        when \M
          moe.moveTo cmd.x, cmd.y
        when \L
          moe.lineTo cmd.x, cmd.y
        when \Q
          moe.lineTo cmd.begin.x, cmd.begin.y
          moe.lineTo cmd.end.x, cmd.end.y
        when \C
          moe.lineTo cmd.begin.x, cmd.begin.y
          moe.lineTo cmd.mid.x, cmd.mid.y
          moe.lineTo cmd.end.x, cmd.end.y
  moe.endFill!
  moe.scale
    ..x = 0.28
    ..y = 0.28
  stage.addChild moe
  sky.mask = moe

  game-loop = ->
    sky.rotation += 10 * Math.PI / 360
    renderer.render stage
    requestAnimationFrame game-loop
  requestAnimationFrame game-loop

zh-stroke-data.loaders.JSON('./json/840c.json').then main
