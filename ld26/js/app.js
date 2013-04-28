(function(jaws) {
  var player,
      sprite;

  var gameState = {
    setup: function() {
      var i, j, w, h, anim;

      anim = jaws.Animation({
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
        hp: 5,
        maxHp: 10,
        sprite: new jaws.Sprite({})
      };
      player.sprite.y = 20;
      player.sprite.stand = anim.slice(0, 1);
      player.sprite.wall = anim.slice(0, 3);
      player.sprite.walk = anim.slice(0, 10);
      player.sprite.heal = anim.slice(10, 20);
      player.sprite.hurt = anim.slice(20, 30);
      player.sprite.level = anim.slice(30, 39);
      player.sprite.goal = anim.slice(40, 50);
      sprite = player.sprite.stand;
      player.sprite.setImage(sprite.currentFrame());

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
      var pos, updatePosition, actions, action;

      pos = {
        x: player.x,
        y: player.y,
        z: player.z
      };

      updatePosition = function(player, pos) {
        player.x = pos.x;
        player.y = pos.y;
        player.z = pos.z;
      };

      actions = {
        " ": function(player, pos) {
          updatePosition(player, pos);
          return player.sprite.walk;
        },
        "#": function(player, pos) {
          return player.sprite.wall;
        },
        "U": function(player, pos) {
          pos.z -= 1;
          updatePosition(player, pos);
          return player.sprite.level;
        },
        "D": function(player, pos) {
          pos.z += 1;
          updatePosition(player, pos);
          return player.sprite.level;
        },
        "T": function(player, pos) {
          player.hp -= 1;
          updatePosition(player, pos);
          return player.sprite.hurt;
        },
        "H": function(player, pos) {
          player.hp += 1;
          updatePosition(player, pos);
          return player.sprite.heal;
        },
        "E": function(player, pos) {
          updatePosition(player, pos);
          return player.sprite.goal;
        }
      };

      player.sprite.setImage(sprite.next());

      if (sprite !== player.sprite.stand) {
        if (sprite.atLastFrame()) {
          sprite = player.sprite.stand;
        }
        return;
      }
      
      if (jaws.pressed("up")) pos.y -= 1;
      if (jaws.pressed("down")) pos.y += 1;
      if (jaws.pressed("left")) pos.x -= 1;
      if (jaws.pressed("right")) pos.x += 1;

      if (pos.x !== player.x || pos.y !== player.y) {
        action = actions[map[pos.z][pos.y][pos.x]];
        if (action) sprite = action(player, pos);
      }

      if (player.hp > player.maxHp) {
        player.hp = player.maxHp;
      }

      if (player.hp === 0) {
        console.log("dead");
      }
    },
    draw: function() {
      jaws.context.clearRect(0, 0, jaws.width, jaws.height);
      jaws.context.fillStyle = "#FF0000";
      jaws.context.fillRect(0, 0, 300 * player.hp / 10, 20);
      player.sprite.draw();
    }
  };

  jaws.onload = function() {
    jaws.assets.add("s.gif");
    jaws.start(gameState);
  }
}(jaws));
