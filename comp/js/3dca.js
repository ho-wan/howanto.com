/**
 * 3D Game of Life: Cellular Automata, by Ho-Wan To © 2018
 */
// three.js scene variables
var scene, camera, renderer, orbitCam, stats;
// screen variables
var HEIGHT, WIDTH, mouseX, mouseY;
// number of cells and cellsize
var numX, numY, numZ, CELLSIZE;
// cube draw properties
var geo_cube;
// timer variables
var stateUpdatePeriod, previousStateTime, currentTime, iterationCount, spawnPeriod, previousSpawnTime;
// fade out time
var fadeOut;
// set number of starting gliders, and number of new gliders being added
var numStartingGliders, spawnNewGliders, spawnNewCells, probOscSpawn;
// store CA cells and rule
var cells, rule;
// interaction and cam
var isUserInteracting, pause, pauseCam, radX, radY, camRadius, rotateX, rotateY;
// light rotation
var dirLightMain, lightRadX, lightRadY, lightRadius, lightRotateX, lightRotateY, pauseLight;
// document container and UI
var container, show_panel, show_stats, btn2_state, btn3_state, btn4_state, btn5_state;

// set initial variables here
function initVariables() {
  // set manual variables here
  rule = [5, 7, 6, 6];
  numX = 30;
  numY = 30;
  numZ = 30;
  // tickPeriod sets time in milliseconds between each iteration update
  stateUpdatePeriod = 150;
  numStartingGliders = 1;
  spawnPeriod = 500;
  spawnNewGliders = 1;
  spawnNewCells = 0;
  // time for dead cells to fade out using Tween
  fadeOut = 300;
  // probability of adding new Oscillators
  probOscSpawn = 0.05;
  // camera interactions
  isUserInteracting = false;
  pause = false;
  FOV = 90;
  camRadius = 20;
  rotateX = 0.01;
  rotateY = 0.001;
  radX = 0;
  radY = 0;
  // light rotations
  lightRadius = 15;
  lightRotateX = -0.02;
  lightRotateY = -0.002;
  lightRadX = 0;
  lightRadY = 0;
  // following variables intended to be left as default
  CELLSIZE = 1;
  HEIGHT = container.clientHeight;
  WIDTH = container.clientWidth;
  previousStateTime = new Date().getTime();
  previousSpawnTime = previousStateTime;
  iterationCount = 0;

  cells = new CellularAutomata;
  geo_cube = new THREE.BoxBufferGeometry(CELLSIZE, CELLSIZE, CELLSIZE);
}
// init scene, camera, renderer;
function initScene() {
  // get HTML container
  container = document.getElementById('threejs');
  initDOM();
  // initialize variables
  initVariables();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e1e1e);
  camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, 0.1, 200);
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setSize(WIDTH, HEIGHT);
  container.appendChild(renderer.domElement);
  // set renderer properties
  renderer.shadowCameraFov = camera.fov;
  renderer.shadowMapBias = 0.001;
  renderer.shadowMapDarkness = 0.5;
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  // Use OrbitControls camera
  orbitCam = new THREE.OrbitControls(camera);
  orbitCam.enablePan = false;
  camera.position.set(20, 10, 10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  // add Event Listeners
  window.addEventListener('mousedown', onmousedown, false);
  window.addEventListener('keydown', onWindowKeyDown, false);
  window.addEventListener('resize', onWindowResize, false);

  // add stats - 0: fps, 1: ms, 2: mb, 3+: custom
  stats = new Stats();
  stats.showPanel(0);

  // init functions
  createLights();
  loadBoundary();
  initCells();
  addGliders(numStartingGliders);
  drawCells();
}
// attach event listeners to HTML elements
function initDOM() {
  // init UI variables
  show_panel = true;
  show_stats = false;
  togglePanel();
  initButtons();
  document.getElementById("btn1").addEventListener("click", function () {
    btnClick(1);
  });
  document.getElementById("btn2").addEventListener("click", function () {
    btnClick(2);
  });
  document.getElementById("btn3").addEventListener("click", function () {
    btnClick(3);
  });
  document.getElementById("btn4").addEventListener("click", function () {
    btnClick(4);
  });
  document.getElementById("btn5").addEventListener("click", function () {
    btnClick(5);
  });
}
// init buttons
function initButtons() {
  btn2_state = true;
  btn3_state = true
  btn4_state = true;
  btn5_state = false;
  $("#btn2").addClass("button-on");
  $("#btn3").addClass("button-on");
  $("#btn4").addClass("button-on");
}
// toggles UI panel
function togglePanel() {
  show_panel = !show_panel;
  if (show_panel) {
    $(".panel").removeClass("disable-panel");
  } else {
    $(".panel").addClass("disable-panel");
  }
}
// toggles stats panel
function toggleStats(btn5_state) {
  show_stats = btn5_state;
  if (show_stats) {
    container.appendChild(stats.dom);
  } else {
    container.removeChild(stats.dom);
  }
}
// toggles button
function toggleButton(btn_state, btn_id) {
  btn_state = !btn_state;
  if (btn_state) {
    $(btn_id).addClass("button-on");
  } else {
    $(btn_id).removeClass("button-on");
  }
  return btn_state;
}

// manage button clicks
function btnClick(btn) {
  switch (btn) {
    case 1:
      togglePanel();
      break;
    case 2:
      btn2_state = toggleButton(btn2_state, "#btn2");
      pauseLight = !pauseLight;
      break;
    case 3:
      btn3_state = toggleButton(btn3_state, "#btn3");
      pause = !pause;
      break;
    case 4:
      btn4_state = toggleButton(btn4_state, "#btn4");
      pauseCam = !pauseCam;
      break;
    case 5:
      btn5_state = toggleButton(btn5_state, "#btn5");
      toggleStats(btn5_state);
      break;
  }

}
// create lights
function createLights() {
  var hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.4);
  hemiLight.position.set(0, 30, 0);
  // directional light in top corner
  dirLightMain = new THREE.DirectionalLight(0xffee88, 0.8);
  // dirLightMain.position.set(50, 40, 25);
  dirLightMain.castShadow = true;
  dirLightMain.add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshBasicMaterial({
    color: 0xffee88
  })));
  // spotlight in middle
  var dirLightMid = new THREE.PointLight(0xffffff, 0.6);
  dirLightMid.position.set(0, 0, 0);
  dirLightMid.castShadow = true;
  dirLightMid.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({
    color: 0xffffff
  })));

  // add lights
  scene.add(hemiLight);
  scene.add(dirLightMain);
  scene.add(dirLightMid);
}
// updates window if resized
function onWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
  // reload page from cache to fix UI scaling.
  // location.reload(false);
}
/* keyboard event handler */
function onWindowKeyDown(event) {
  switch (event.keyCode) {
    // z pauses light
    case 90:
    case 122:
      btn2_state = toggleButton(btn2_state, "#btn2");
      pauseLight = !pauseLight;
      break;
      // space bar or x pauses cell update
    case 32:
    case 88:
    case 120:
      btn3_state = toggleButton(btn3_state, "#btn3");
      pause = !pause;
      break;
    case 67:
    case 99:
      btn4_state = toggleButton(btn4_state, "#btn4");
      pauseCam = !pauseCam;
      break;
  }
}
/* mouse button event handler */
function onmousedown() {
  switch (event.button) {
    // right mouse button toggles camera rotation
    case 2:
      btn2_state = toggleButton(btn2_state, "#btn2");
      pauseLight = !pauseLight;
      btn3_state = toggleButton(btn3_state, "#btn3");
      pause = !pause;
      btn4_state = toggleButton(btn4_state, "#btn4");
      pauseCam = !pauseCam;
      break;
  }
}
// draws boundary box, axes helper and bottom cross
function loadBoundary() {
  // assign box size
  var boundX = numX * CELLSIZE;
  var boundY = numY * CELLSIZE;
  var boundZ = numZ * CELLSIZE;
  // draw axes helper
  var axes = new THREE.AxesHelper(1);
  // scene.add(axes);
  // draw bounding box
  var geoBoundBox = new THREE.BoxGeometry(boundX, boundY, boundZ);
  var matWire = new THREE.MeshBasicMaterial({
    color: 0x444444
  });
  var BoundaryBox = new THREE.Mesh(geoBoundBox, matWire);
  var BoundaryEdge = new THREE.BoxHelper(BoundaryBox, 0x444444);
  scene.add(BoundaryEdge);
  // draw lines on bottom face for orientation
  var matLine = new THREE.LineBasicMaterial({
    color: 0x444444
  });
  var geoLine1 = new THREE.Geometry();
  geoLine1.vertices.push(new THREE.Vector3(-boundX * 0.5, -boundY * 0.5, -boundZ * 0.5));
  geoLine1.vertices.push(new THREE.Vector3(boundX * 0.5, -boundY * 0.5, boundZ * 0.5));
  var diagonalLine1 = new THREE.Line(geoLine1, matLine);
  var geoLine2 = new THREE.Geometry();
  geoLine2.vertices.push(new THREE.Vector3(-boundX * 0.5, -boundY * 0.5, boundZ * 0.5));
  geoLine2.vertices.push(new THREE.Vector3(boundX * 0.5, -boundY * 0.5, -boundZ * 0.5));
  var diagonalLine2 = new THREE.Line(geoLine2, matLine);
  scene.add(diagonalLine1);
  scene.add(diagonalLine2);
}
// instantiate nested array of CA class objects
function initCells() {
  cells = new Array(numX);
  for (let i = 0; i < numX; i++) {
    cells[i] = new Array(numY);
    for (let j = 0; j < numY; j++) {
      cells[i][j] = new Array(numZ);
      for (let k = 0; k < numZ; k++) {
        cells[i][j][k] = new CellularAutomata(i, j, k, geo_cube);
        // turn random cells on
        cells[i][j][k]._nextState = (Math.random() < .00) ? true : false;
      }
    }
  }
}
// create starting gliders in random positions, avoid sides
function addGliders(numGliders) {
  for (let i = 0; i < numGliders; i++) {
    let mx = 2 + Math.floor(Math.random() * (numX - 4));
    let my = 2 + Math.floor(Math.random() * (numY - 4));
    let mz = 2 + Math.floor(Math.random() * (numZ - 4));
    makeGlider(mx, my, mz);
  }
}
// call makeOsc function
function addOsc(makeOscFunc, probOscSpawn, padding) {
  if (Math.random() < probOscSpawn) {
    let mx = padding + Math.floor(Math.random() * (numX - padding * 2));
    let my = padding + Math.floor(Math.random() * (numY - padding * 2));
    let mz = padding + Math.floor(Math.random() * (numZ - padding * 2));
    makeOscFunc(mx, my, mz);
  }
}

function callGUI() {
  // TODO: call GUI
}
// adds new cells every cycle
function addNewCells() {
  // add new gliders in random location
  addGliders(spawnNewGliders);
  // add new Oscillators based on proability
  addOsc(makeOsc1, probOscSpawn, 2);
  addOsc(makeOsc2, probOscSpawn, 3);
  addOsc(makeOsc3, probOscSpawn, 2);
  addOsc(makeOsc4, probOscSpawn, 3);
}
/* Gliders and Oscillators taken from "Candidates for the Game of Life in Three Dimensions: Carter Bays 1987" */
// make a new glider in random direction
function makeGlider(x, y, z) {
  let kern = [
    [
      [0, 1, 0],
      [0, 1, 0]
    ],
    [
      [0, 0, 1],
      [0, 0, 1]
    ],
    [
      [1, 1, 1],
      [1, 1, 1]
    ]
  ];
  // mx, my and mz to be either -1 or 1, to set kern direction
  let mx = Math.floor(Math.random() * 2) * 2 - 1;
  let my = Math.floor(Math.random() * 2) * 2 - 1;
  let mz = Math.floor(Math.random() * 2) * 2 - 1;
  // set random axis of kern
  let axis = Math.floor(Math.random() * 6);
  for (let i = 0; i < kern.length; i++) {
    for (let j = 0; j < kern[0].length; j++) {
      for (let k = 0; k < kern[0][0].length; k++) {
        switch (axis) {
          case 0:
            cells[x + i * mx][y + k * my][z + j * mz]._nextState = (kern[i][j][k] === 1);
            break;
          case 1:
            cells[x + i * mx][y + j * my][z + k * mz]._nextState = (kern[i][j][k] === 1);
            break;
          case 2:
            cells[x + j * mx][y + k * my][z + i * mz]._nextState = (kern[i][j][k] === 1);
            break;
          case 3:
            cells[x + j * mx][y + i * my][z + k * mz]._nextState = (kern[i][j][k] === 1);
            break;
          case 4:
            cells[x + k * mx][y + i * my][z + j * mz]._nextState = (kern[i][j][k] === 1);
            break;
          case 5:
            cells[x + k * mx][y + j * my][z + i * mz]._nextState = (kern[i][j][k] === 1);
            break;
        }
      }
    }
  }
}
// make Oscillator type 1
function makeOsc1(x, y, z) {
  let kern = [
    [
      [0, 0, 0],
      [0, 0, 0]
    ],
    [
      [1, 1, 1],
      [1, 1, 1]
    ],
    [
      [0, 0, 0],
      [0, 0, 0]
    ]
  ];
  let axis = Math.floor(Math.random() * 6);
  for (let i = 0; i < kern.length; i++) {
    for (let j = 0; j < kern[0].length; j++) {
      for (let k = 0; k < kern[0][0].length; k++) {
        // set random axis of oscillator
        switch (axis) {
          case 0:
            cells[x + i][y + k][z + j]._nextState = (kern[i][j][k] === 1);
            break;
          case 1:
            cells[x + i][y + j][z + k]._nextState = (kern[i][j][k] === 1);
            break;
          case 2:
            cells[x + j][y + k][z + i]._nextState = (kern[i][j][k] === 1);
            break;
          case 3:
            cells[x + j][y + i][z + k]._nextState = (kern[i][j][k] === 1);
            break;
          case 4:
            cells[x + k][y + i][z + j]._nextState = (kern[i][j][k] === 1);
            break;
          case 5:
            cells[x + k][y + j][z + i]._nextState = (kern[i][j][k] === 1);
            break;
        }
      }
    }
  }
}
// make Oscillator type 2
function makeOsc2(x, y, z) {
  let kern = [
    [
      [1, 1, 0, 0],
      [1, 1, 0, 0]
    ],
    [
      [1, 1, 0, 0],
      [1, 1, 0, 0]
    ],
    [
      [0, 0, 1, 1],
      [0, 0, 1, 1]
    ],
    [
      [0, 0, 1, 1],
      [0, 0, 1, 1]
    ]
  ];
  let axis = Math.floor(Math.random() * 6);
  for (let i = 0; i < kern.length; i++) {
    for (let j = 0; j < kern[0].length; j++) {
      for (let k = 0; k < kern[0][0].length; k++) {
        // set random axis of oscillator
        switch (axis) {
          case 0:
            cells[x + i][y + k][z + j]._nextState = (kern[i][j][k] === 1);
            break;
          case 1:
            cells[x + i][y + j][z + k]._nextState = (kern[i][j][k] === 1);
            break;
          case 2:
            cells[x + j][y + k][z + i]._nextState = (kern[i][j][k] === 1);
            break;
          case 3:
            cells[x + j][y + i][z - k]._nextState = (kern[i][j][k] === 1);
            break;
          case 4:
            cells[x - k][y + i][z + j]._nextState = (kern[i][j][k] === 1);
            break;
          case 5:
            cells[x - k][y + j][z + i]._nextState = (kern[i][j][k] === 1);
            break;
        }
      }
    }
  }
}
// make Oscillator type 3
function makeOsc3(x, y, z) {
  let kern = [
    [
      [1, 1, 1],
      [0, 1, 0]
    ],
    [
      [1, 0, 1],
      [0, 1, 0]
    ],
    [
      [0, 1, 0],
      [0, 0, 0]
    ]
  ];
  let mx = Math.floor(Math.random() * 2) * 2 - 1;
  let my = Math.floor(Math.random() * 2) * 2 - 1;
  let mz = Math.floor(Math.random() * 2) * 2 - 1;
  let axis = Math.floor(Math.random() * 6);
  for (let i = 0; i < kern.length; i++) {
    for (let j = 0; j < kern[0].length; j++) {
      for (let k = 0; k < kern[0][0].length; k++) {
        // set random axis of oscillator
        switch (axis) {
          case 0:
            cells[x + i * mx][y + k * my][z + j * mz]._nextState = (kern[i][j][k] === 1);
            break;
          case 1:
            cells[x + i * mx][y + j * my][z + k * mz]._nextState = (kern[i][j][k] === 1);
            break;
          case 2:
            cells[x + j * mx][y + k * my][z + i * mz]._nextState = (kern[i][j][k] === 1);
            break;
          case 3:
            cells[x + j * mx][y + i * my][z + k * mz]._nextState = (kern[i][j][k] === 1);
            break;
          case 4:
            cells[x + k * mx][y + i * my][z + j * mz]._nextState = (kern[i][j][k] === 1);
            break;
          case 5:
            cells[x + k * mx][y + j * my][z + i * mz]._nextState = (kern[i][j][k] === 1);
            break;
        }
      }
    }
  }
}
// make Oscillator type 4
function makeOsc4(x, y, z) {
  let kern = [
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ],
    [
      [0, 1, 0, 1],
      [0, 1, 0, 1]
    ],
    [
      [1, 0, 1, 0],
      [1, 0, 1, 0]
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0]
    ]
  ];
  let axis = Math.floor(Math.random() * 6);
  for (let i = 0; i < kern.length; i++) {
    for (let j = 0; j < kern[0].length; j++) {
      for (let k = 0; k < kern[0][0].length; k++) {
        // set random axis of oscillator
        switch (axis) {
          case 0:
            cells[x + i][y + k][z + j]._nextState = (kern[i][j][k] === 1);
            break;
          case 1:
            cells[x + i][y + j][z + k]._nextState = (kern[i][j][k] === 1);
            break;
          case 2:
            cells[x + j][y + k][z + i]._nextState = (kern[i][j][k] === 1);
            break;
          case 3:
            cells[x + j][y + i][z - k]._nextState = (kern[i][j][k] === 1);
            break;
          case 4:
            cells[x - k][y + i][z + j]._nextState = (kern[i][j][k] === 1);
            break;
          case 5:
            cells[x - k][y + j][z + i]._nextState = (kern[i][j][k] === 1);
            break;
        }
      }
    }
  }
}
// positive modulo function
function mod(n, m) {
  return ((n % m) + m) % m;
};
// loops through all cells, counts neighbours, sets next state
function getCellState() {
  for (let i = 0; i < numX; i++) {
    for (let j = 0; j < numY; j++) {
      for (let k = 0; k < numZ; k++) {
        let aliveCount = getAliveNeighbours(i, j, k);
        setNextState(i, j, k, aliveCount);
      }
    }
  }
}
// sets nextState of cell depending on rules
function setNextState(i, j, k, aliveCount) {
  // condition to stay alive if cell is currently alive
  if (cells[i][j][k]._state) {
    if (aliveCount >= rule[0] && aliveCount <= rule[1]) {
      cells[i][j][k]._nextState = true;
    } else {
      cells[i][j][k]._nextState = false;
    }
    // condition to become alive if cell is currently dead
  } else {
    if (aliveCount >= rule[2] && aliveCount <= rule[3]) {
      cells[i][j][k]._nextState = true;
    } else {
      cells[i][j][k]._nextState = false;
    }
  }
}
// returns number of cells alive surrounding the current cell
function getAliveNeighbours(i, j, k) {
  // count number of alive neighbours
  cells[i][j][k]._aliveCount = 0;
  for (let ni = -1; ni <= 1; ni++) {
    for (let nj = -1; nj <= 1; nj++) {
      for (let nk = -1; nk <= 1; nk++) {
        if (!(ni === 0 && nj === 0 && nk === 0)) {
          // wrap around sides using positive modulo function
          if (cells[mod(i + ni, numX)][mod(j + nj, numY)][mod(k + nk, numZ)]._state) {
            cells[i][j][k]._aliveCount++;
          }
        }
      }
    }
  }
  return cells[i][j][k]._aliveCount;
}
/* draws cells and assigns nextState to state */
function drawCells() {
  // Loop over all cells and draw them if state = true
  for (let i = 0; i < numX; i++) {
    for (let j = 0; j < numY; j++) {
      for (let k = 0; k < numZ; k++) {
        let mesh = cells[i][j][k]._mesh;
        mesh.position.x = i - numX * 0.5 + CELLSIZE * 0.5;
        mesh.position.y = j - numY * 0.5 + CELLSIZE * 0.5;
        mesh.position.z = k - numZ * 0.5 + CELLSIZE * 0.5;
        if (cells[i][j][k]._state === false && cells[i][j][k]._nextState === true) {
          if (cells[i][j][k]._tweenOut != null) {
            cells[i][j][k]._tweenOut.stop();
            cells[i][j][k]._tweenOut = null;
            mesh.material.opacity = 1.0;
          }
          scene.add(mesh);
        } else if (cells[i][j][k]._state === true && cells[i][j][k]._nextState === false) {
          // use tween.js to fade out cubes : TODO fix opacity reset for oscillators
          cells[i][j][k]._tweenOut = new TWEEN.Tween(mesh.material)
            .to({
              opacity: 0
            }, fadeOut)
            .onComplete(function () {
              scene.remove(mesh);
              mesh.receiveShadow = true;
              mesh.castShadow = true;
            })
            .start();
          mesh.receiveShadow = false;
          mesh.castShadow = false;
        }
      }
    }
  }
  // assign nextState to state
  for (let i = 0; i < numX; i++) {
    for (let j = 0; j < numY; j++) {
      for (let k = 0; k < numZ; k++) {
        cells[i][j][k]._laststate = cells[i][j][k]._state;
        cells[i][j][k]._state = cells[i][j][k]._nextState;
      }
    }
  }
  iterationCount++;
}
// rotate camera, source: https://codepen.io/uriuriuriu/pen/cvqBL
function rotateCam() {
  radX += rotateX;
  radY += rotateY;

  let x = camRadius * Math.sin(radX) * Math.cos(radY);
  let y = camRadius * Math.sin(radX) * Math.sin(radY);
  let z = camRadius * Math.cos(radX);

  camera.position.set(x, y, z);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
}
// rotate light
function rotateLight() {
  lightRadX += lightRotateX;
  lightRadY += lightRotateY;

  let x = lightRadius * Math.sin(lightRadX) * Math.cos(lightRadY);
  let y = lightRadius * Math.sin(lightRadX) * Math.sin(lightRadY);
  let z = lightRadius * Math.cos(lightRadX);

  dirLightMain.position.set(x, y, z);
  dirLightMain.lookAt(new THREE.Vector3(0, 0, 0));

  // dirLightMain.color.set;
}
// CA class
class CellularAutomata {
  constructor(x, y, z, geometry) {
    this._x = x;
    this._y = y;
    this._z = z;

    this._lastState = false;
    this._state = false;
    this._nextState = false;
    this._aliveCount = 0;
    this._tweenOut = null;

    this._cellColor = new THREE.Color(x / numX, y / numY, z / numZ);
    // lambert material has bug with shadows
    // this._material = new THREE.MeshLambertMaterial({ color: this._cellColor, transparent: true});
    this._material = new THREE.MeshPhongMaterial({
      color: this._cellColor,
      transparent: true,
      specular: 0x222222,
      shininess: 100
    });
    this._mesh = new THREE.Mesh(geometry, this._material);
    this._mesh.castShadow = true;
    this._mesh.receiveShadow = true;
  }

}
// returns true if time elapsed > tickPeriod
function checkTime(period, time, previousTime) {
  if (time - previousTime > period) {
    return true;
  } else {
    return false;
  }
}

function callCheckTime() {
  currentTime = new Date().getTime();
  if (checkTime(stateUpdatePeriod, currentTime, previousStateTime) && !pause) {
    previousStateTime = currentTime;
    getCellState();
    if (checkTime(spawnPeriod, currentTime, previousSpawnTime) && !pause) {
      addNewCells();
      previousSpawnTime = currentTime;
    }
    drawCells();
  }
}
// animation loop
function animate() {
  stats.begin();
  requestAnimationFrame(animate);
  TWEEN.update();

  if (!pauseCam) rotateCam();
  if (!pauseLight) rotateLight();
  callCheckTime();

  renderer.render(scene, camera);
  stats.end();
}
// main function
function main() {
  initScene();
  orbitCam.update();
  animate();
}

main();