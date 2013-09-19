var camera, scene, renderer, projector;

var objects = [];

var radius, theta;

var mouse = new THREE.Vector2();

var $site = $(".site"),
    $three = $("#three");

init();
animate();

function init() {
  var width = $site.width();

  $three.width(width).height(width / 4.0 * 3.0);

  camera = new THREE.PerspectiveCamera(75, $three.width() / $three.height(), 1, 10000);
  camera.position.set(0, 200, 200);

  scene = new THREE.Scene();

  var geometry = new THREE.PlaneGeometry(100, 100);

  for (var i = 0; i < 3; ++i) {
    var object = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: (i * 0.6 + 0.2) * 0xffffff,
        opacity: 0.5,
        transparent: true
      })
    );
    object.position.x = i * 110 - 110;
    object.rotation.x = - Math.PI / 4;

    scene.add(object);

    objects.push(object);
  }

  projector = new THREE.Projector();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize($three.width(), $three.height());

  $three.
    append(renderer.domElement).
    mousemove(mouseMove).
    mousedown(mouseDown);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

radius = 300;
theta = 0;

function render() {
  var rad = THREE.Math.degToRad(theta);

  camera.position.x = radius * Math.sin(rad);
  //camera.position.y = radius * Math.sin(rad);
  //camera.position.z = radius * Math.cos(rad);
  camera.lookAt(scene.position);

  renderer.render(scene, camera);

  theta += 0.01;
}

function mouseMove(e) {
  var $target = $(this),
      parentOffset = $target.parent().offset();

  e.preventDefault();

  mouse.x =   ((e.pageX - parentOffset.left) / $target.width ()) * 2 - 1;
  mouse.y = - ((e.pageY - parentOffset.top ) / $target.height()) * 2 + 1;
}

function mouseDown(e) {
  var vector, raycaster, intersects;
  var intersect, point, cam, object, m, result;

  e.preventDefault();

  vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  projector.unprojectVector(vector, camera);

  raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
  intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {
    intersect = intersects[0];
    object = intersect.object;
    // bad idea D:
    m = new THREE.Matrix4().getInverse(object.matrix);
    point = intersect.point.clone().
              applyMatrix4(m);

    cam = new THREE.OrthographicCamera(-50, 50, -50, 50, 0.1, 10);
    projector.projectVector(point, cam);

    result = new THREE.Vector2(
      (point.x + 1) / 2 * 100,
      (point.y + 1) / 2 * 100
    );

    console.log(result);
  }
}
