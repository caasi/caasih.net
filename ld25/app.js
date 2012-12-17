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
        { id: "sky", url: "./img/sky.png" },
        { id: "far_buildings", url: "./img/far_buildings.png" },
        { id: "buildings", url: "./img/buildings.png" },
        { id: "villain", url: "./img/villain.png" },
        { id: "detective", url: "./img/detective.png" }
      ]
    },
    level: {
      score: "0000",
      best_distance: 10,
      g: .05,
      villain: {
        x: 30,
        y: 42,
        jump: 1.1,
        dash: .3
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
    var state = "intro";
    /* key status */
    var keyName = {
      37: "left",
      38: "up",
      39: "right",
      40: "down"
    };
    var control = {
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
    control.update = function() {
      this.leftPressed = false;
      this.upPressed = false;
      this.rightPressed = false;
      this.downPressed = false;
      this.leftReleased = false;
      this.upReleased = false;
      this.rightReleased = false;
      this.downReleased = false;
    }
    CAAT.registerKeyListener(function(e) {
      if (e.keyCode == 82 && e.action === "up") state = "reset";
      if (e.keyCode < 37 || e.keyCode > 40) return;
      control[keyName[e.keyCode]] = e.action === "down";
      control[keyName[e.keyCode] + "Pressed"] = e.action === "down";
      control[keyName[e.keyCode] + "Released"] = e.action === "up";
    });
    /* Background */
    var background = (function init_background() {
      var bg = {};

      bg.sky = new CAAT.Actor().setBackgroundImage("sky");
      bg.far_buildings = new CAAT.Actor().
        setBackgroundImage("far_buildings");
      bg.far_buildings.setLocation(config.video.width - bg.far_buildings.width, 0);
      bg.buildings = new CAAT.Actor().
        setBackgroundImage("buildings");
      bg.buildings.setLocation(config.video.width - bg.buildings.width, 0);
      bg.update = function() {
        if (state === "reset") {
          this.far_buildings.setLocation(config.video.width - bg.far_buildings.width, 0);
          this.buildings.setLocation(config.video.width - bg.buildings.width, 0);
        }
        if (state === "playing") {
          this.far_buildings.x += .5;
          this.buildings.x += 1;
          if (this.buildings.x >= 0) {
            state = "end";
          }
        } else if (state === "end") {
          state = "ending";
        }
      }

      return bg;
    }());
    /* UI */
    var scoreboard = (function init_scoreboard() {
      var ui = new CAAT.TextActor().
        setText(config.level.score).
        setTextAlign("center").
        setFont("10px monospace").
        cacheAsBitmap().
        setLocation(config.video.width / 2, 1);
      
      ui.score = 0;
      ui.update = function(v, d) {
        var new_score = 0;
        var distance = d.x - v.x;

        if (state === "reset") {
          this.setText(config.level.score).cacheAsBitmap();
          this.score = 0;
        }
        if (state === "playing") {
          if (distance < 5) {
            state = "touch";
            this.setText("BUSTED").cacheAsBitmap();
            return;
          }

          new_score = Math.abs(Math.abs(distance) - config.level.best_distance);
          if (new_score > 20) {
            new_score = 0;
          } else if (new_score > 10) {
            new_score = .1;
          } else if (new_score > 5) {
            new_score = 15;
          }
          ui.score += new_score;
          new_score = ui.score;
          new_score = (~~new_score).toString();
          while (new_score.length < config.level.score.length) {
            new_score = "0" + new_score;
          }
          this.setText(new_score).cacheAsBitmap();
        } else if (state === "touch") {
          state = "busted";
        }
      };

      return ui;
    }());
    /* Characters */
    var villain = (function init_villain() {
      /* init character with CAAT's Actor */
      var character = new CAAT.Actor().
        setBackgroundImage(
          new CAAT.SpriteImage().
            initialize(director.getImage("villain"), 2, 6)
        ).
        addAnimation("still", [2]).
        addAnimation("walk", [0, 1, 2, 3, 4, 5], 33.3).
        addAnimation("slow", [0, 1, 2, 3, 4, 5], 133.3).
        addAnimation("float", [6, 7], 133.3).
        addAnimation("jump", [8]).
        playAnimation("walk").
        setLocation(config.level.villain.x + 30, config.level.villain.y - 40);

      /* customize */
      character.forces = [];
      character.jumping = false;
      character.vX = 0;
      character.vY = 0;
      character.update = function(control) {
        var f, v;

        /* gravity */
        this.forces.push({x: 0, y: config.level.g});
        /* support form the ground and wall */
        if (this.y >= config.level.villain.y) this.forces.push({x: 0, y: config.level.villain.y - this.y - config.level.g - this.vY});
        /* drag force */
        this.forces.push({x: Math.abs(this.vX) < .01 ? -this.vX : -this.vX / 2, y: 0});

        if (state === "reset") {
          this.
            playAnimation("walk").
            setLocation(config.level.villain.x + 30, config.level.villain.y - 40);
        }
        if (state === "intro") {
          this.forces.push({x: -.2, y: 0});
          if (this.x < config.level.villain.x) {
            state = "playing";
          }
        }
        if (state === "playing") {
          if (this.x < 0) this.forces.push({x: -this.x, y: 0});
        }
        if (state === "touch") {
          this.playAnimation("still");
        }
        if (state === "end") {
          this.playAnimation("slow");
        }
        if (state === "ending") {
          this.forces.push({x: -.1, y: 0});
        }

        if (control !== undefined) {
          if (control.left) {
            this.forces.push({x: -config.level.villain.dash, y: 0});
          }
          if (control.right) {
            this.forces.push({x: config.level.villain.dash, y: 0});
          };
          if (control.up && this.y === config.level.villain.y) {
            this.forces.push({x: 0, y: -config.level.villain.jump});
          }
        }

        v = this.vY;

        while (this.forces.length !== 0) {
          f = this.forces.pop();
          this.vX += f.x;
          this.vY += f.y;
        }

        if (state === "playing") {
          if (v * this.vY <= 0) {
            if (this.vY < 0) {
              this.playAnimation("jump");
            }
            if (this.vY > 0) {
              this.playAnimation("float");
            }
            if (this.vY === 0) {
              this.playAnimation("walk");
            }
          }
        }

        this.x += this.vX;
        this.y += this.vY;
      };

      return character;
    }());
    var detective = (function init_detective() {
      var character = new CAAT.Actor().
        setBackgroundImage(
          new CAAT.SpriteImage().
            initialize(director.getImage("detective"), 2, 6)
        ).
        addAnimation("still", [2]).
        addAnimation("walk", [0, 1, 2, 3, 4, 5], 66.6).
        addAnimation("dash", [0, 1, 2, 3, 4, 5], 25).
        addAnimation("fall", [6]).
        playAnimation("walk").
        setLocation(config.level.detective.x + 15, config.level.detective.y);

      character.forces = [];
      character.dashing = false;
      character.energy = 0;
      character.vX = 0;
      character.vY = 0;
      character.update = function() {
        var f, rand;
        
        /* drag force */
        this.forces.push({x: Math.abs(this.vX) < .01 ? -this.vX : -this.vX / 2, y: 0});

        if (state === "reset") {
          this.
            playAnimation("walk").
            setLocation(config.level.detective.x + 15, config.level.detective.y);
        }
        if (state === "intro") {
          this.forces.push({x: -.2, y: 0});
        }
        if (state === "playing") {
          if (!this.dashing) {
            if (this.x < config.level.detective.x) {
              this.forces.push({x: .2, y: 0});
            } else {
              if (Math.random() < .03) {
                this.energy = Math.random() < .3 ? 140 : 140 * Math.random();
                this.dashing = true;
                this.playAnimation("dash");
              }
            }
          } else {
            if (this.energy > 0) {
              this.forces.push({x: -.2, y: 0});
              this.energy -= 1;
            } else {
              this.dashing = false;
              this.playAnimation("walk");
            }
          }
        }
        if (state === "touch") {
          this.playAnimation("still");
        }
        if (state === "end") {
          this.playAnimation("fall");
        }

        while (this.forces.length) {
          f = this.forces.pop();
          this.vX += f.x;
          this.vY += f.y;
        }

        this.x += this.vX;
        this.y += this.vY;
      };

      return character;
    }());

    var initLevel = function() {
    };

    var scene = director.createScene().
      setScaleAnchored(
        config.video.scaleCanvas ? 1 : config.video.scale,
        config.video.scaleCanvas ? 1 : config.video.scale,
        0, 0
      ).
      setFillStyle("#101010");

    scene.addChild(background.sky);
    scene.addChild(background.far_buildings);
    scene.addChild(background.buildings);
    scene.addChild(scoreboard);
    scene.addChild(villain);
    scene.addChild(detective);

    /* game loop */
    director.onRenderStart = function(time) {
      var new_score;

      // update world
      background.update();
      detective.update();
      villain.update(state === "playing" ? control : undefined);
      scoreboard.update(villain, detective);
      control.update();

      if (state === "reset") {
        state = "intro";
      }
    };

    initLevel();
  };

  init();
}());
