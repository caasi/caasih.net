var camera,
    scene,
    renderer,
    geometry,
    material,
    mesh,
    $site = $(".site"),
    $three = $("#three");

    init();
    animate();

function init() {
  var width = $site.width();

  $three.width(width).height(width / 4.0 * 3.0);

  camera = new THREE.PerspectiveCamera(75, $three.width() / $three.height(), 1, 10000);
  camera.position.z = 400;

  scene = new THREE.Scene();

  geometry = new THREE.CubeGeometry(200, 200, 200);
  material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize($three.width(), $three.height());

  $three.append(renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  renderer.render(scene, camera);
}
