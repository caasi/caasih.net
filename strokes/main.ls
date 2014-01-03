zh-stroke-data.loaders.JSON('/json/840c.json').then ->
  strokes = for data in it => new zh-stroke-data.Stroke data
  moe = new zh-stroke-data.Comp strokes
  canvas = document.getElementById \mark-two
  moe.scale-x = moe.scale-y = 0.2
  angle = 1.5
  update = ->
    moe.time = (1 - Math.sin(angle)) / 2
    canvas.width = canvas.width
    moe.render canvas
    angle := angle + 0.01
    requestAnimationFrame update
  requestAnimationFrame update
