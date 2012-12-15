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
        { id: "villain", url: "./img/villain.png" }
      ]
    },
    level: {
      villain: {
        x: 60,
        y: 40
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
    /* Actors */
    var far_buildings = new CAAT.Actor().setBackgroundImage("far_buildings");
    var buildings = new CAAT.Actor().setBackgroundImage("buildings");
    var villain = new CAAT.Actor().
      setBackgroundImage("villain").
      setLocation(config.level.villain.x, config.level.villain.y);
    villain.jumping = false;
    villain.vX = 0;
    villain.vY = 0;
    villain.aX = 0;
    villain.aY = .5;

    var initLevel = function() {
      far_buildings.setLocation(config.video.width - far_buildings.width, 0);
      buildings.setLocation(config.video.width - buildings.width, 0);
    };

    var scene = director.createScene().
      setScaleAnchored(config.video.scale, config.video.scale, 0, 0).
      setFillStyle("#101010");

    scene.addChild(far_buildings);
    scene.addChild(buildings);
    scene.addChild(villain);

    CAAT.registerKeyListener(function(e) {
      if (e.keyCode < 37 || e.keyCode > 40) return;
      control[keyName[e.keyCode]] = e.action === "down";
    });

    director.onRenderStart = function() {
      var dampingX = .1;

      // update world
      if (buildings.x < 0) {
        far_buildings.x += .5;
        buildings.x += 1;
      }

      // update character
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

      control.prev.left = control.left;
      control.prev.up = control.up;
      control.prev.right = control.right;
      control.prev.down = control.down;
    };

    initLevel();
  };

  init();
}());
