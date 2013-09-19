var GUI3D = (function() {
  var projector = new THREE.Projector();
  var planes = [];
  var camera, mouseNDC, hitMouse, mouseMove, mouseDown;

  mouseNDC = new THREE.Vector3();
  mouseNDC.z = 0.5;

  mouseIntersectWithPlane = function(plane) {
    var vector, raycaster;

    vector = mouseNDC.clone();
    projector.unprojectVector(vector, camera);

    raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    var intersects, m, point, cam;

    intersects = raycaster.intersectObject(plane.object);

    if (intersects.length > 0) {
      m = new THREE.Matrix4().getInverse(intersects[0].object.matrix);
      point = intersects[0].point.clone().applyMatrix4(m);
      cam = new THREE.OrthographicCamera(
        - plane.width  / 2, plane.width  / 2,
        - plane.height / 2, plane.height / 2,
          0.1, 10
      );
      projector.projectVector(point, cam);

      return new THREE.Vector2(
        (point.x + 1) / 2 * plane.width,
        (point.x + 1) / 2 * plane.height
      );
    } else {
      return null;
    }
  };

  mouseMove = function(e) {
    var $target = $(this),
        parentOffset = $target.parent().offset();

    e.preventDefault();

    mouseNDC.x =   ((e.pageX - parentOffset.left) / $target.width ()) * 2 - 1;
    mouseNDC.y = - ((e.pageY - parentOffset.top ) / $target.height()) * 2 + 1;
  };

  mouseDown = function(e) {
    e.preventDefault();

    planes.forEach(function(plane) {
      plane.hit();
    });
  };

  var Plane = function(width, height) {
    Object.defineProperty(
      this,
      "object",
      {
        value: new THREE.Mesh(
          new THREE.PlaneGeometry(width, height),
          new THREE.MeshLambertMaterial({
            color: Math.random() * 0xffffff,
            opacity: 0.5,
            transparent: true
          })
        )
      }
    );

    Object.defineProperty(
      this,
      "width",
      {
        get: function() { return width; }
      }
    );

    Object.defineProperty(
      this,
      "height",
      {
        get: function() { return height; }
      }
    );

    this.parent = null;
    this.children = [];
  };

  Plane.prototype = Object.create(THREE.EventDispatcher.prototype);

  Plane.prototype.add = function(plane) {
    this.children.push(plane);
    plane.parent = this;
    this.object.add(plane.object);

    return this;
  };

  Plane.prototype.hit = function() {
    var current,
        point,
        event,
        result = false;

    this.children.forEach(function(plane) {
      result = result || plane.hit();
    });

    if (!result) {
      if (point = mouseIntersectWithPlane(this)) {
        event = {
          type: "mousedown",
          /**
           * THREE.EventDispatcher.dispatch() will overwrite event.target,
           * so use initialTarget as target in DOM event
           */
          initialTarget: this,
          propagation: true,
          stopPropagation: function() {
            this.propagation = false;
          },
          clientX: point.x,
          clientY: point.y
        };

        current = this;
        while (event.propagation && current) {
          current.dispatchEvent(event);
          current = current.parent;
        }

        result = true;
      }
    }

    return result;
  };

  return {
    Plane: Plane,
    init: function(domElement, cam) {
      $(domElement).
        mousemove(mouseMove).
        mousedown(mouseDown);

      camera = cam;

      return this;
    },
    add: function(plane) {
      planes.push(plane);

      return this;
    }
  };
}());
