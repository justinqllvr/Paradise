import * as THREE from 'three';
import { gsap } from "gsap";
import OrbitControls from "./utils/orbitcontrols";
import Reflector from "./utils/reflector";
import GLTFLoader from "./utils/gltfLoader";

import Engine from "./utils/engine";
//Tige
import tigeVertexShader from "./shader/tige.vert?raw";
import tigeFragmentShader from "./shader/tige.frag?raw";
import CustomSinCurve from "./utils/CustomSinCurve";

//Flower
import flowerVertexShader from "./shader/flower.vert?raw";
import flowerFragmentShader from "./shader/flower.frag?raw";

//Particules
import particulesVertexShader from "./shader/particules.vert?raw";
import particulesFragmentShader from "./shader/particules.frag?raw";

//Audio
import Audio from "./utils/audio";

//Setup
let scene = null;
let camera = null;
let audio = null;
let particlesMaterial = null;
let globalScale = 1;
const button = document.querySelector("button");
let orbitControl = null;


//Uniform
let uTransparence = { value: 1 };
let uTime = { value: null };
let uForce = { value: 1.5 };
let uProgress = { value: 0 };
let uVolume = { value: 0 };
let uAudioValue1 = { value: 0 };
let uParticuleColorFromCenter = { value: 0 };

//Progress de la scene
let nbFrame = 0;
let created = {
  tige: false,
  flower: false,
  particules: false,
};

let progress = {
  tige: { value: 0 },
  flower: { value: 0 },
  particules: { value: 0 },
};

let globalDelay = .5;

let volume;
let volumeTarget;

//Loader 
console.log(window)

// Pour nous faciliter la vie : s'occupe du resize de la window auto
// et de creer notre THREE.WebGLRenderer
const engine = new Engine();

function init() {
  uTime.value = 0;
  const container = document.querySelector(".container")
  container.style.opacity = 0;
  setTimeout(() => {
    container.style.display = "none";
    document.querySelector("canvas").style.zIndex = 1;
  }, 500);
  // document.querySelector(".dg").style.zIndex = 10;
  volume = audio.volume;
}

function setup() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    50,
    engine.width / engine.height,
    0.1,
    1000
  );
  camera.position.x = 4;
  camera.position.z = 2;
  camera.position.y = 4;
  camera.lookAt(0, 2, 0);

  // new OrbitControls(camera, engine.renderer.domElement);
  window.addEventListener("resize", onResize);
}

function onResize() {
  camera.aspect = engine.width / engine.height;
  camera.updateProjectionMatrix();
}

function setupScene() {
  const ambient = new THREE.AmbientLight(0x202020);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xfff0dd, 1);
  light.position.set(0, 5, 10);
  scene.add(light);

  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);
}

function createSkybox() {
  const cubeTextureLoader = new THREE.CubeTextureLoader();

  const environmentMapTexture = cubeTextureLoader.load([
    new URL("/assets/skybox/px.png", import.meta.url).href,
    new URL("/assets/skybox/nx.png", import.meta.url).href,
    new URL("/assets/skybox/py.png", import.meta.url).href,
    new URL("/assets/skybox/ny.png", import.meta.url).href,
    new URL("/assets/skybox/pz.png", import.meta.url).href,
    new URL("/assets/skybox/nz.png", import.meta.url).href,
  ]);
  environmentMapTexture.encoding = THREE.sRGBEncoding;

  scene.background = environmentMapTexture;
}

function createMiror() {
  const geometry = new THREE.PlaneGeometry(60, 5);
  const groundMirror = new Reflector(geometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x777777,
  });
  groundMirror.position.y = 0.5;
  groundMirror.rotateX(-Math.PI / 2);
  scene.add(groundMirror);
}

function createModels() {
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(new URL("/assets/models/table.glb", import.meta.url).href, (table) => {
    const mesh = table.scene.children[0].children[0].children[0].children[0];
    mesh.material = new THREE.MeshStandardMaterial(0xffffff);
    mesh.position.z = 1;
    // console.log(table.scene.children[0].children[0].children[0].children[0])
    scene.add(table.scene);
  });

  gltfLoader.load(new URL("/assets/models/vase.glb", import.meta.url).href, (vase) => {
    let scale = 0.7;
    const mesh = vase.scene.children[0];
    mesh.material = new THREE.MeshPhysicalMaterial({
      // depthWrite: false,
      // depthTest: false, 
      metalness: 0,
      roughness: 0.3,
      transmission: 1,
      thickness: 0.2,
      opacity: 0.5,
    });
    mesh.position.y = 1.2;
    mesh.scale.x = scale;
    mesh.scale.y = scale;
    mesh.scale.z = scale;
    scene.add(vase.scene);

  });
}

function createTige() {
  const scale = 0.013;
  const path = new CustomSinCurve(5);
  const geometry = new THREE.TubeGeometry(path, 64, 1, 8, false);
  const shaderMaterial = new THREE.RawShaderMaterial({
    vertexShader: tigeVertexShader,
    fragmentShader: tigeFragmentShader,
    transparent: true,
    // depthTest: false,
    // depthWrite: false,
    uniforms: {
      uTime: progress.tige,
    },
  });
  const mesh = new THREE.Mesh(geometry, shaderMaterial);
  mesh.scale.x = scale;
  mesh.scale.y = scale;
  mesh.scale.z = scale;
  mesh.position.y = 1.2;
  scene.add(mesh);

}

function createFlower() {
  // console.log(time)
  const scale = 0.07;

  const geometry = new THREE.SphereGeometry(1.4, 256, 256);
  const material = new THREE.RawShaderMaterial({
    vertexShader: flowerVertexShader,
    fragmentShader: flowerFragmentShader,
    transparent: true,
    uniforms: {
      uTime: progress.flower,
      uForce: uForce,
      uTransparence: uTransparence,
    },
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.x = scale;
  mesh.scale.y = scale;
  mesh.scale.z = scale;
  mesh.position.y = 2.5;
  mesh.position.x = 0.05;
  mesh.rotation.z = Math.PI / 4;
  // mesh.rotation.x = Math.PI/2;
  console.log(mesh);

  scene.add(mesh);
}

function createParticules() {
  const nbParticles = 50000;
  const verticesStart = [];
  const verticesEclate = [];
  const verticesFinale = [];
  const colors = [];
  const randoms = [];
  const randoms1 = [];
  const randoms2 = [];
  const origine = { x: 0, y: 4, z: 0 };

  for (let i = 0; i < nbParticles; i++) {
    let x = origine.x;
    let y = origine.y;
    let z = origine.z;
    verticesStart.push(x, y, z);

    //Second step
    const eclatax = 25
    const recentrer = eclatax / 2;
    x = origine.x + Math.random() * eclatax - recentrer;
    y = origine.y + Math.random() * eclatax - recentrer;
    z = origine.z + Math.random() * eclatax - recentrer;
    verticesEclate.push(x, y, z);

    //Finale in the shader
    let theta = Math.random() * Math.PI * 2;
    let phi = Math.random() * Math.PI * 2;
    let radius = 1;
    x = origine.x + Math.cos(theta) * Math.sin(phi) * radius;
    y = origine.y + Math.sin(theta) * Math.sin(phi) * radius;
    z = origine.z + Math.cos(phi) * radius;
    verticesFinale.push(x, y, z);

    const r = 1;
    const g = 1;
    const b = 1;
    colors.push(r, g, b);
    randoms.push(Math.random());
    randoms1.push(Math.random());
    randoms2.push(Math.random());
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(verticesStart, 3)
  );
  geometry.setAttribute(
    "positionEclate",
    new THREE.Float32BufferAttribute(verticesEclate, 3)
  );
  geometry.setAttribute(
    "positionFinale",
    new THREE.Float32BufferAttribute(verticesFinale, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("random", new THREE.Float32BufferAttribute(randoms, 1));
  geometry.setAttribute(
    "random1",
    new THREE.Float32BufferAttribute(randoms1, 1)
  );
  geometry.setAttribute(
    "random2",
    new THREE.Float32BufferAttribute(randoms2, 1)
  );

  particlesMaterial = new THREE.RawShaderMaterial({
    vertexShader: particulesVertexShader,
    fragmentShader: particulesFragmentShader,
    transparent: false,
    uniforms: {
      uTime: progress.particules,
      uProgress: uProgress,
      uVolume: uVolume,
      uOrigine: new THREE.Uniform(
        new THREE.Vector3(origine.x, origine.y, origine.z)
      ),
      uParticuleColorFromCenter: uParticuleColorFromCenter,
    },
  });

  const points = new THREE.Points(geometry, particlesMaterial);
  points.frustumCulled = false;
  scene.add(points);
}

function createAudio() {
  audio = new Audio();

  audio.start({
    onload: init(),
    live: false,
    src: new URL("/assets/audio/ori.mp3", import.meta.url).href,
  });
}

function animCamera() {
  const tl = gsap.timeline();
  tl.to(camera.position, {
    x: 0,
    y: 6,
    z: 0,
    duration: 5,
    ease: "power1.inOut",
    onUpdate: () => {
      camera.lookAt(-0.01, 2, 0);
      camera.updateProjectionMatrix();
    },
  })
    .to(
      camera.position,
      {
        x: 0,
        y: 15,
        z: 0,
        duration: 5,
        ease: "power1.inOut",
        onUpdate: () => {
          camera.lookAt(-0.01, 2, 0);
        },
      },
      5
    )
    .to(
      camera.position,
      {
        x: 10,
        y: 10,
        z: 0,
        duration: 5,
        ease: "power1.inOut",
        onUpdate: () => {
          camera.lookAt(-0.01, 2, 0);
        },
        onComplete: () => {
          setTimeout(() => {
            orbitControl = new OrbitControls(camera, engine.renderer.domElement);
            orbitControl.target = new THREE.Vector3(-0.01,2,0)
            orbitControl.autoRotate = true;
            orbitControl.autoRotateSpeed = -4;
          }, 0);
        }
      },
      10
    );
}

button.addEventListener("click", () => {
  createAudio();
});

setup();
setupScene();
createSkybox();
createMiror();
createModels();
onFrame();

function render() {
  engine.renderer.render(scene, camera);
}

// Notre frame loop
function onFrame() {
  //Gestion du progress et de l'apparition des éléments
  if (uTime.value !== null) {
    uTime.value += 0.05;
    progress.tige.value += 0.05;
    if (progress.flower.value >= 0.01) {
      progress.flower.value += 0.05;
    }
    if (progress.particules.value >= 0.01) {
      progress.particules.value += 0.05;
    }
  }
  if (uTime.value >= 1 + globalDelay && created.tige == false) {
    progress.tige.value = 0;
    createTige();
    createFlower();
    createParticules();
    created.tige = true;
    setTimeout(() => {
      animCamera();
    }, 200);
  }
  if (uTime.value >= 4.7 + globalDelay && created.flower == false) {
    progress.flower.value = 0.01;
    created.flower = true;
  }
  if (uTime.value >= 8 + globalDelay && created.particules == false) {
    progress.particules.value = 0.01;
    created.particules = true;
  }
  let timingBeforeExplosion = 28 + globalDelay;
  if (
    created.particules == true &&
    uProgress.value < 1 &&
    uTime.value >= timingBeforeExplosion
  ) {
    uProgress.value += 0.005;
  }
  //Orbit Control
  if(orbitControl !== null) {
    orbitControl.update()
  }

  //Audio
  if (audio) {
    audio.update();
    volumeTarget = audio.values[2] * 10;
    uVolume.value += (volumeTarget - uVolume.value) * 0.2;
  }

  render();
  requestAnimationFrame(onFrame);
}