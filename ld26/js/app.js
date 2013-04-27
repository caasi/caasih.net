(function(jaws) {
  var player;
  var gameState = {
    setup: function() {
      var anim = jaws.Animation({
        sprite_sheet: "s.gif",
        frame_size: [1, 1],
        frame_duration: 16.66666,
        orientation: "right",
        scale_image: 300
      });

      player = new jaws.Sprite({});
      player.y = 20;
      player.anim_default = anim.slice(0, 9);
      player.anim_heal = anim.slice(10, 19);
      player.anim_hurt = anim.slice(20, 29);
      player.anim_armor = anim.slice(30, 39);
      player.anim_goal = anim.slice(40, 49);
      player.setImage(player.anim_default.next());

      jaws.context.mozImageSmoothingEnabled = false;
      jaws.preventDefaultKeys([
        "up",
        "down",
        "left",
        "right",
        "space"
      ]);
    },
    update: function() {
      var img;
      img = player.anim_default.next();
      if (jaws.pressed("up")) {
        img = player.anim_heal.next();
      }
      if (jaws.pressed("down")) {
        img = player.anim_hurt.next();
      }
      if (jaws.pressed("left")) {
        img = player.anim_armor.next();
      }
      if (jaws.pressed("right")) {
        img = player.anim_goal.next();
      }
      player.setImage(img);
    },
    draw: function() {
      player.draw();
    }
  };

  jaws.onload = function() {
    jaws.assets.add("s.gif");
    jaws.start(gameState);
  }
}(jaws));
