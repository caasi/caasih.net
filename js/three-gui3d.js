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

  return {
    plane: function(w, h) {
      obj = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff,
        opacity: 0.5,
        transparent: true
        })
      );

      return {
        object: obj,
        width: w,
        height: h,
        parent: null,
        children: [],
        add: function(plane) {
          this.children.push(plane);
          plane.parent = this;
          this.object.add(plane.object);

          return this;
        },
        hit: function() {
          var e,
              current,
              p,
              result = false;

          this.children.forEach(function(plane) {
            result = result || plane.hit();
          });

          if (!result) {
            p = mouseIntersectWithPlane(this);
            if (p) {
              e = {
                target: this,
                clientX: p.x,
                clientY: p.y
              };

              current = this;
              while (current) {
                if (current.onMouseDown) {
                  current.onMouseDown(e);
                }
                current = current.parent;
              }

              result = true;
            }
          }

          return result;
        },
        onMouseMove: null,
        onMouseDown: null
      };
    },
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
