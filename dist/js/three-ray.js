var camera, scene, renderer, light;
var radius, theta;

var $site = $(".site"),
    $three = $("#three");

init();
animate();

function init() {
  var width = $site.width();

  $three.width(width).height(width / 4.0 * 3.0);

  camera = new THREE.PerspectiveCamera(75, $three.width() / $three.height(), 1, 10000);
  camera.position.set(0, 200, 200);

  var plane = new GUI3D.Plane(200, 150);
  plane.addEventListener("mousedown", function(e) {
    var tmpHex = 0xff0000;

    if (e.initialTarget !== this) {
      if (this.object.prevHex !== undefined) {
        tmpHex = this.object.prevHex
      }
      this.object.prevHex = this.object.material.emissive.getHex();
      this.object.material.emissive.setHex(tmpHex);
    }
  });

  var button_plane = new GUI3D.Plane(50, 50);
  button_plane.addEventListener("mousedown", function(e) {
    console.log("x: " + e.clientX + ", y: " + e.clientY);
  });
  button_plane.object.position.x = 20;
  button_plane.object.position.y = 30;
  button_plane.object.position.z = 50;
  plane.add(button_plane);

  var useless_plane = new GUI3D.Plane(20, 20);
  useless_plane.addEventListener("mousedown", function(e) {
    e.stopPropagation();
    console.log("x: " + e.clientX + ", y: " + e.clientY);
  });
  useless_plane.object.position.x = -20;
  useless_plane.object.position.y = 30;
  useless_plane.object.position.z = 50;
  plane.add(useless_plane);

  scene = new THREE.Scene();
  scene.add(plane.object);

  light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(-1, -1, -1).normalize();
  scene.add(light);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize($three.width(), $three.height());

  GUI3D.
    init(renderer.domElement, camera).
    add(plane);

  $three.append(renderer.domElement);
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
  camera.lookAt(scene.position);

  renderer.render(scene, camera);

  theta += 0.2;
}
