# models
map =
  * <[ G G G G G G G G ]>
    <[ G G G G G G G G ]>
    <[ G G G R G G G G ]>
    <[ G R R R R R G G ]>
    <[ G G G R G R R G ]>
    <[ G R G R G G R G ]>
    <[ G R G R G G R G ]>
    <[ G R G R G G R G ]>

# views
screen =
  width:  320
  height: 320
renderer = PIXI.autoDetectRenderer screen.width, screen.height
document.body.appendChild renderer.view

class MapView
  (@model) ->
    @view = new PIXI.Graphics
  draw: !->
    for y, row of @model
      for x, grid of row
        color = if grid is \G then 0x00ff00 else 0xff6600
        @view
          ..beginFill color
          ..drawRect +x * 40, +y * 40, 40, 40
          ..endFill!
map-view = new MapView map

stage = new PIXI.Stage 0x16161d
stage.addChild map-view.view

# the loop
game-loop = ->
  map-view.draw!
  renderer.render stage
  requestAnimationFrame game-loop
requestAnimationFrame game-loop
