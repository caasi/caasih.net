(function() {
  var config = {
    video: {
      width: 80,
      height: 60,
      scale: 8,
      fps: 60
    },
    resources: {
      images: [
        { id: "far_buildings", url: "./img/far_buildings.png" },
        { id: "buildings", url: "./img/buildings.png" },
        { id: "villain", url: "./img/villain.png" },
        { id: "detective", url: "./img/detective.png" }
      ]
    },
    level: {
      score: "0000",
      best_distance: 20,
      villain: {
        x: 30,
        y: 42
      },
      detective: {
        x: 60,
        y: 42
      }
    }
  };

  var director = new CAAT.Director().initialize(
    config.video.width * config.video.scale,
    config.video.height * config.video.scale,
    document.getElementById("game")
  );

  director.ctx.mozImageSmoothingEnabled = false;
  director.ctx.webkitImageSmoothingEnabled = false;

  var init = function() {
    new CAAT.ImagePreloader().loadImages(
      config.resources.images,
      function(numOfImagesLoaded, images) {
        if (numOfImagesLoaded == config.resources.images.length) {
          director.setImagesCache(images);
          onResourcesLoaded();
        }
      }
    );

    CAAT.loop(config.video.fps);
  };

  var onResourcesLoaded = function() {
    /* key status */
    var keyName = {
      37: "left",
      38: "up",
      39: "right",
      40: "down"
    };
    var control = {
      prev: {
        left: false,
        up: false,
        right: false,
        down: false
      },
      left: false,
      up: false,
      right: false,
      down: false
    };
    /* Background */
    var far_buildings = new CAAT.Actor().setBackgroundImage("far_buildings");
    var buildings = new CAAT.Actor().setBackgroundImage("buildings");
    /* UI */
    var scoreboard = new CAAT.TextActor().
      setText(config.level.score).
      setTextAlign("center").
      setFont("10px monospace").
      cacheAsBitmap();
    scoreboard.setLocation(config.video.width / 2, 1);
    scoreboard.score = 0;
    /* Characters */
    var villain = new CAAT.Actor().
      setBackgroundImage("villain").
      setLocation(config.level.villain.x, config.level.villain.y);
    villain.jumping = false;
    villain.vX = 0;
    villain.vY = 0;
    villain.aX = 0;
    villain.aY = .5;
    var detective = new CAAT.Actor().
      setBackgroundImage("detective").
      setLocation(config.level.detective.x, config.level.detective.y);
    detective.angle = 0;

    var initLevel = function() {
      far_buildings.setLocation(config.video.width - far_buildings.width, 0);
      buildings.setLocation(config.video.width - buildings.width, 0);
    };

    var scene = director.createScene().
      setScaleAnchored(config.video.scale, config.video.scale, 0, 0).
      setFillStyle("#101010");

    scene.addChild(far_buildings);
    scene.addChild(buildings);
    scene.addChild(scoreboard);
    scene.addChild(villain);
    scene.addChild(detective);

    CAAT.registerKeyListener(function(e) {
      if (e.keyCode < 37 || e.keyCode > 40) return;
      control[keyName[e.keyCode]] = e.action === "down";
    });

    director.onRenderStart = function() {
      var new_score;
      var dampingX = .2;

      // update world
      if (buildings.x < 0) {
        far_buildings.x += .5;
        buildings.x += 1;
      }

      /* update detective */
      detective.x = config.level.detective.x + 5 * Math.cos(detective.angle * Math.PI / 180);
      detective.angle++;
      /* update villain */
      if (control.left) villain.vX = -1;
      if (control.right) villain.vX = 1;
      if (!control.prev.up && control.up && !villain.jumping) {
        villain.vY = -4;
        villain.jumping = true;
      }

      villain.x += villain.vX;
      villain.y += villain.vY;
      villain.vX += villain.aX;
      villain.vY += villain.aY;

      if (villain.y > config.level.villain.y) {
        villain.y = config.level.villain.y;
        villain.vY = 0;
        villain.jumping = false;
      }

      if (villain.vX !== 0) {
        if (villain.vX < 0) {
          if (villain.vX * (villain.vX + dampingX) < 0) {
            villain.vX = 0;
          } else {
            villain.vX += dampingX;
          }
        }
        if (villain.vX > 0) {
          if (villain.vX * (villain.vX - dampingX) < 0) {
            villain.vX = 0;
          } else {
            villain.vX -= dampingX;
          }
        }
      }

      if (buildings.x < 0) {
        new_score = Math.abs((detective.x - villain.x) - config.level.best_distance);
        if (new_score > 20) {
          new_score = 0;
        } else if (new_score > 10) {
          new_score = .1;
        } else if (new_score > 5) {
          new_score = 15;
        }
        scoreboard.score += new_score;
        new_score = scoreboard.score;
        new_score = (~~new_score).toString();
        while (new_score.length < config.level.score.length) {
          new_score = "0" + new_score;
        }
        scoreboard.setText(new_score).cacheAsBitmap();
      }

      control.prev.left = control.left;
      control.prev.up = control.up;
      control.prev.right = control.right;
      control.prev.down = control.down;
    };

    initLevel();
  };

  init();
}());
