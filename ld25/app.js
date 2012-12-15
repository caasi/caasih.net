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
        { id: "buildings", url: "./img/buildings.png" }
      ]
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
    var initLevel;

    var far_buildings = new CAAT.Actor().setBackgroundImage("far_buildings");
    var buildings = new CAAT.Actor().setBackgroundImage("buildings");

    /* base resolution is 80x60 */
    var scene = director.createScene().
      setScaleAnchored(config.video.scale, config.video.scale, 0, 0).
      setFillStyle("#101010");

    scene.addChild(far_buildings);
    scene.addChild(buildings);

    director.onRenderStart = function() {
      if (buildings.x < 0) {
        far_buildings.x += .5;
        buildings.x += 1;
      }
    };

    initLevel = function() {
      far_buildings.setLocation(config.video.width - far_buildings.width, 0);
      buildings.setLocation(config.video.width - buildings.width, 0);
    };

    initLevel();
  };

  init();
}());
