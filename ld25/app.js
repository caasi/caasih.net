(function() {
  var config = {
    video: {
      scaleCanvas: false,
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
    config.video.scaleCanvas ? config.video.width : config.video.width * config.video.scale,
    config.video.scaleCanvas ? config.video.height : config.video.height * config.video.scale,
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
      down: false,
      leftPressed: false,
      upPressed: false,
      rightPressed: false,
      downPressed: false,
      leftReleased: false,
      upReleased: false,
      rightReleased: false,
      downReleased: false
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
    var villain = (function init_villain() {
      var dampingX = .2;

      /* init character with CAAT's Actor */
      var character = new CAAT.Actor().
        setBackgroundImage(
          new CAAT.SpriteImage().
            initialize(director.getImage("villain"), 2, 4)
        ).
        addAnimation("still", [0], 133.3).
        addAnimation("walk", [0, 1, 2], 133.3).
        addAnimation("float", [3, 4], 133.3).
        addAnimation("jump", [5], 133.3).
        playAnimation("walk").
        setLocation(config.level.villain.x, config.level.villain.y);

      /* customize */
      character.forces = [];
      character.jumping = false;
      character.vX = 0;
      character.vY = 0;
      character.update = function(control) {
        var f, v;

        this.forces.push({x: 0, y: .25});
        this.forces.push({x: Math.abs(this.vX) < .01 ? -this.vX : -this.vX / 2, y: 0});

        if (control.left) {
          this.forces.push({x: -.5, y: 0});
        }
        if (control.right) {
          this.forces.push({x: .5, y: 0});
        };
        if (control.up && this.y === config.level.villain.y) {
          this.forces.push({x: 0, y: -3});
          this.jumping = true;
        }

        v = this.vY;

        while (this.forces.length !== 0) {
          f = this.forces.pop();
          this.vX += f.x;
          this.vY += f.y;
        }

        if (v * this.vY <= 0) {
          this.playAnimation(this.vY < 0 ? "jump" : "float");
        }

        this.x += this.vX;
        this.y += this.vY;

        if (this.y > config.level.villain.y) {
          this.y = config.level.villain.y;
          this.vY = 0;
          this.playAnimation("walk");
        }
      };

      return character;
    }());
    var detective = new CAAT.Actor().
      setBackgroundImage("detective").
      setLocation(config.level.detective.x, config.level.detective.y);
    detective.angle = 0;

    var initLevel = function() {
      far_buildings.setLocation(config.video.width - far_buildings.width, 0);
      buildings.setLocation(config.video.width - buildings.width, 0);
    };

    var scene = director.createScene().
      setScaleAnchored(
        config.video.scaleCanvas ? 1 : config.video.scale,
        config.video.scaleCanvas ? 1 : config.video.scale,
        0, 0
      ).
      setFillStyle("#101010");

    scene.addChild(far_buildings);
    scene.addChild(buildings);
    scene.addChild(scoreboard);
    scene.addChild(villain);
    scene.addChild(detective);

    CAAT.registerKeyListener(function(e) {
      if (e.keyCode < 37 || e.keyCode > 40) return;
      control[keyName[e.keyCode]] = e.action === "down";
      control[keyName[e.keyCode] + "Pressed"] = e.action === "down";
      control[keyName[e.keyCode] + "Released"] = e.action === "up";
    });

    director.onRenderStart = function(time) {
      var new_score;

      // update world
      if (buildings.x < 0) {
        far_buildings.x += .5;
        buildings.x += 1;
      }

      /* update detective */
      detective.x = config.level.detective.x + 5 * Math.cos(detective.angle * Math.PI / 180);
      detective.angle++;
      villain.update(control);

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
      control.leftPressed = false;
      control.upPressed = false;
      control.rightPressed = false;
      control.downPressed = false;
      control.leftReleased = false;
      control.upReleased = false;
      control.rightReleased = false;
      control.downReleased = false;
    };

    initLevel();
  };

  init();
}());
