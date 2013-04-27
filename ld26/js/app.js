(function(jaws) {
  var player;
  var gameState = {
    setup: function() {
      var i, j, w, h;
      var anim = jaws.Animation({
        sprite_sheet: "s.gif",
        frame_size: [1, 1],
        frame_duration: 33.33,
        orientation: "right",
        scale_image: 300
      });

      player = {
        x: 0,
        y: 0,
        z: 0,
        hp: 10,
        maxHp: 10,
        sprite: new jaws.Sprite({})
      };
      player.sprite.y = 20;
      player.sprite.stand = anim.slice(0, 1);
      player.sprite.wall = anim.slice(0, 3);
      player.sprite.walk = anim.slice(0, 10);
      player.sprite.heal = anim.slice(10, 20);
      player.sprite.hurt = anim.slice(20, 30);
      player.sprite.level = anim.slice(30, 40);
      player.sprite.goal = anim.slice(40, 50);
      player.sprite.setImage(player.sprite.stand.currentFrame());

      w = map[0][0].length;
      h = map[0].length;
      for (j = 0; j < h; ++j) {
        for (i = 0; i < w; ++i) {
          if (map[0][j][i] === "S") {
            player.x = i;
            player.y = j;
          }
        }
      }

      jaws.context.mozImageSmoothingEnabled = false;
      jaws.preventDefaultKeys([
        "up",
        "down",
        "left",
        "right"
      ]);
    },
    update: function() {
      var pos = {
        x: player.x,
        y: player.y,
        z: player.z
      };
      var shouldMove = false,
          img = player.sprite.stand.next();

      if (jaws.pressed("up")) pos.y -= 1;
      if (jaws.pressed("down")) pos.y += 1;
      if (jaws.pressed("left")) pos.x -= 1;
      if (jaws.pressed("right")) pos.x += 1;

      if (pos.x !== player.x || pos.y !== player.y) {
        switch(map[pos.z][pos.y][pos.x]) {
          case " ":
            shouldMove = true;
            img = player.sprite.walk.next();
            break;
          case "#":
            img = player.sprite.wall.next();
            break;
          case "U":
            shouldMove = true;
            pos.z -= 1;
            img = player.sprite.level.next();
            break;
          case "D":
            shouldMove = true;
            pos.z += 1;
            img = player.sprite.level.next();
            break;
          case "T":
            shouldMove = true;
            player.hp = player.hp === 0 ? player.hp : player.hp - 1;
            img = player.sprite.hurt.next();
            break;
          case "H":
            shouldMove = true;
            player.hp = player.hp === 10 ? player.hp : player.hp + 1;
            img = player.sprite.heal.next();
            break;
          case "E":
            shouldMove = true;
            img = player.sprite.goal.next();
            break;
        }
      }

      if (shouldMove) {
        player.x = pos.x;
        player.y = pos.y;
        player.z = pos.z;
      }

      player.sprite.setImage(img);
    },
    draw: function() {
      player.sprite.draw();
    }
  };

  jaws.onload = function() {
    jaws.assets.add("s.gif");
    jaws.start(gameState);
  }
}(jaws));
