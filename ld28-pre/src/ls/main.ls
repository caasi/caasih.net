Crafty
  ..init 600 300 \wrap
  ..background "rgb(127,127,127)"
  ..e "Paddle, 2D, DOM, Color, Multiway"
    .color "rgb(255,0,0)"
    .attr x: 20, y: 100, w: 10, h: 100
    .multiway 4, W: -90, S: 90
  ..e "Paddle, 2D, DOM, Color, Multiway"
    .color "rgb(0,255,0)"
    .attr x: 580, y: 100, w: 10, h: 100
    .multiway 4, UP_ARROW: -90, DOWN_ARROW: 90
  ..e "2D, DOM, Color, Collision"
    .color "rgb(0,0,255)"
    .attr do
      x: 300, y: 150, w: 10, h: 10,
      dX: Crafty.math.randomInt(2, 5)
      dY: Crafty.math.randomInt(2, 5)
    .bind \EnterFrame ->
      if @y <= 0 or @y >= 290 then @dY *= -1;
      if @x > 600
        @x = 300;
        Crafty(\LeftPoints).each -> @text(++@points + " Points")
      if @x < 10
        @x = 300;
        Crafty(\RightPoints).each -> @text(++@points + " Points")
      @x += @dX;
      @y += @dY;
    .onHit \Paddle -> @dX *= -1;
  ..e "LeftPoints, DOM, 2D, Text"
    .attr x: 20, y: 20, w: 100, h: 20, points: 0
    .text "0 Points"
  ..e "RightPoints, DOM, 2D, Text"
    .attr x: 515, y: 20, w: 100, h: 20, points: 0
    .text "0 Points"

