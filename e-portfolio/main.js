import './style.css';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import gsap from 'gsap';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// VARIABLES
let theme = 'light';
let bookCover = null;
let lightSwitch = null;
let titleText = null;
let subtitleText = null;
let mixer;
let isMobile = window.matchMedia('(max-width: 992px)').matches;
let canvas = document.querySelector('.experience-canvas');
const loaderWrapper = document.getElementById('loader-wrapper');
let clipNames = [
  'fan_rotation',
  'fan_rotation.001',
  'fan_rotation.002',
  'fan_rotation.003',
  'fan_rotation.004',
];
let projects = [
  {
    images: ['textures/G!.png', 'textures/G!-2.png', 'textures/G!-3.png'], // Add multiple images
    title: 'G!: A Location-Based Route Planning and Fare Estimation App',
    description: 'The app helps commuters in Davao City by providing a practical, user-centered solution for route planning and fare estimation. It leverages location-based services to enhance the commuting experience, making it easier for users to navigate the city efficiently.',
    tech: ['TypeScript', 'JavaScript', 'Expo' , 'Google Maps API'],
    github: 'https://github.com/paopao-12/G-/tree/main'
  },
  {
    images: ['textures/rizal.png'],
    title: 'A website for Rizal',
    description: 'A digital museum dedicated for Jose Rizal, the national hero of the Philippines. The website showcases his life, works, and contributions to Philippine history through an interactive and engaging platform.',
    tech: ['HTML', 'CSS'],
    github: 'https://github.com/paopao-12/Rizal'
  },
  {
    images: ['textures/Eye.png'],
    title: 'EyeTrackPad for the Disabled',
    description: 'An eye-tracking system that uses computer vision and deep learning to control mouse movements using eye gaze. This project is designed to help people with physical disabilities (PWDs) by providing an alternative input method using eye movements.',
    tech: ['Python', 'CNN-LSTM ML Model', 'OpenCV', 'TensorFlow', 'Keras', 'Dlib'],
    github: 'https://github.com/paopao-12/EyeTrackPad'
  },
  // {
  //   image: 'textures/project-pelotero.jpg',
  //   url: 'https://www.peloterosenlaweb.com/',
  // },
];
let aboutCameraPos = {
  x: 0.12,
  y: 0.2,
  z: 0.55,
};
let aboutCameraRot = {
  x: -1.54,
  y: 0.13,
  z: 1.41,
};
let projectsCameraPos = {
  x: 1,
  y: 0.45,
  z: 0.01,
};
let projectsCameraRot = {
  x: 0.05,
  y: 0.05,
  z: 0,
};

// SCENE & CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
let defaultCameraPos = {
  x: 1.009028643133046,
  y: 0.5463638814987481,
  z: 0.4983449671971262,
};
let defaultCamerRot = {
  x: -0.8313297556598935,
  y: 0.9383399492446749,
  z: 0.7240714481613063,
};
camera.position.set(defaultCameraPos.x, defaultCameraPos.y, defaultCameraPos.z);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// STATS
// const stats = new Stats();
// document.querySelector('.experience').appendChild(stats.dom);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 0.9;
controls.maxDistance = 1.6;
controls.minAzimuthAngle = 0.2;
controls.maxAzimuthAngle = Math.PI * 0.78;
controls.minPolarAngle = 0.3;
controls.maxPolarAngle = Math.PI / 2;
controls.update();

// LOAD MODEL & ASSET
// const loadingManager = new THREE.LoadingManager();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(
  'models/room.glb',
  function (room) {
    // hide loader on loade
    loaderWrapper.style.display = 'none';

    // load video
    const video = document.createElement('video');
    video.src = 'textures/arcane.mp4';
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;

    // create video texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.encoding = THREE.sRGBEncoding;

    room.scene.children.forEach((child) => {
      // disable shadow by wall
      if (child.name !== 'Wall') {
        child.castShadow = true;
      }
      child.receiveShadow = true;

      if (child.children) {
        child.children.forEach((innerChild) => {
          // disable shadow by book cover & switch btn
          if (innerChild.name !== 'Book001' && innerChild.name !== 'Switch') {
            innerChild.castShadow = true;
          }

          // add texture to book cover
          if(innerChild.name === 'Book001') {
            const bookCoverTexture = new THREE.TextureLoader().load(
              'textures/image.png'
            );
            bookCoverTexture.flipY = false;
            innerChild.material = new THREE.MeshStandardMaterial({
              side: THREE.DoubleSide,
              color: 0xffffff,
              map: bookCoverTexture,
            });
          }

          innerChild.receiveShadow = true;
        });
      }

      if (child.name === 'Stand') {
        child.children[0].material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        });
        video.play();
      }

      // transparent texture for glass
      if (child.name === 'CPU') {
        child.children[0].material = new THREE.MeshPhysicalMaterial();
        child.children[0].material.roughness = 0;
        child.children[0].material.color.set(0x999999);
        child.children[0].material.ior = 3;
        child.children[0].material.transmission = 2;
        child.children[0].material.opacity = 0.8;
        child.children[0].material.depthWrite = false;
        child.children[0].material.depthTest = false;
        child.children[1].material = new THREE.MeshPhysicalMaterial();
        child.children[1].material.roughness = 0;
        child.children[1].material.color.set(0x999999);
        child.children[1].material.ior = 3;
        child.children[1].material.transmission = 1;
        child.children[1].material.opacity = 0.8;
        child.children[1].material.depthWrite = false;
        child.children[1].material.depthTest = false;
      }

      if (child.name === 'Book') {
        bookCover = child.children[0];

        // Create custom texture instead of loading image
        const bookTexture = createTextTexture();
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: bookTexture,
        });
      }

      if (child.name === 'SwitchBoard') {
        lightSwitch = child.children[0];
      }
    });

    scene.add(room.scene);
    animate();

    // add animation
    mixer = new THREE.AnimationMixer(room.scene);
    const clips = room.animations;
    clipNames.forEach((clipName) => {
      const clip = THREE.AnimationClip.findByName(clips, clipName);
      if (clip) {
        const action = mixer.clipAction(clip);
        action.play();
      }
    });

    loadIntroText();

    // add event listeners
    logoListener();
    aboutMenuListener();
    projectsMenuListener();
    init3DWorldClickListeners();
    initResponsive(room.scene);
  },
  function (error) {
    console.error(error);
  }
);

// Add this function before the gltfLoader.load()
function createTextTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext('2d');

  // Set background
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Configure text
  context.fillStyle = '#000000';
  context.font = 'bold 40px Arial';
  
  // Text content
  const text = [
    "Hello, I'm Jose Paolo Gigayon,",
    "a 4th year BS Computer Science student.",
    "",
    "I am an inspiring full-stack developer with",
    "proficiency in languages like javascript,", 
    "html, css, python, java, sql, node and more.",
    "",
    "I like to take inspiration from different",
    "creations to build websites with modern",
    "technologies like React JS, Next JS, Node JS.",
    "",
    "What sets me apart is my ability to learn",
    "new things and find ways to combine them",
    "to deliver high-quality work."
  ];

  // Draw text
  let y = 150;
  text.forEach(line => {
    context.fillText(line, 100, y);
    y += 50; // Line spacing
  });

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  return texture;
}

// ADD LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const roomLight = new THREE.PointLight(0xffffff, 2.5, 10);
roomLight.position.set(0.3, 2, 0.5);
roomLight.castShadow = true;
roomLight.shadow.radius = 5;
roomLight.shadow.mapSize.width = 2048;
roomLight.shadow.mapSize.height = 2048;
roomLight.shadow.camera.far = 2.5;
// roomLight.shadow.camera.fov = 100;
roomLight.shadow.bias = -0.002;
scene.add(roomLight);
// add light for pc fans
const fanLight1 = new THREE.PointLight(0xff0000, 30, 0.2);
const fanLight2 = new THREE.PointLight(0x00ff00, 30, 0.12);
const fanLight3 = new THREE.PointLight(0x00ff00, 30, 0.2);
const fanLight4 = new THREE.PointLight(0x00ff00, 30, 0.2);
const fanLight5 = new THREE.PointLight(0x00ff00, 30, 0.05);
fanLight1.position.set(0, 0.29, -0.29);
fanLight2.position.set(-0.15, 0.29, -0.29);
fanLight3.position.set(0.21, 0.29, -0.29);
fanLight4.position.set(0.21, 0.19, -0.29);
fanLight5.position.set(0.21, 0.08, -0.29);
scene.add(fanLight1);
scene.add(fanLight2);
scene.add(fanLight3);
scene.add(fanLight4);
scene.add(fanLight5);
// add point light for text on wall
const pointLight1 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight2 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight3 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight4 = new THREE.PointLight(0xff0000, 0, 1.1);
pointLight1.position.set(-0.2, 0.6, 0.24);
pointLight2.position.set(-0.2, 0.6, 0.42);
pointLight3.position.set(-0.2, 0.6, 0.01);
pointLight4.position.set(-0.2, 0.6, -0.14);
scene.add(pointLight1);
scene.add(pointLight2);
scene.add(pointLight3);
scene.add(pointLight4);

// SETUP HELPERS
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
// const gridHelper = new THREE.GridHelper(30, 30);
// scene.add(gridHelper);
// const shadowCameraHelper = new THREE.CameraHelper(roomLight.shadow.camera);
// scene.add(shadowCameraHelper);
// const pointLightHelper = new THREE.PointLightHelper(fanLight3, 0.03);
// scene.add(pointLightHelper);

// ADD GUI
// const gui = new dat.GUI();
// const options = {
//   lightX: 0,
//   lightY: 0.08,
//   lightZ: 0,
// };
// gui.add(options, 'lightX').onChange((e) => {
//   mobileLight.position.setX(e);
// });
// gui.add(options, 'lightY').onChange((e) => {
//   mobileLight.position.setY(e);
// });
// gui.add(options, 'lightZ').onChange((e) => {
//   mobileLight.position.setZ(e);
// });

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  renderer.render(scene, camera);
  // stats.update();
}

function loadIntroText() {
  const loader = new FontLoader();
  loader.load('fonts/unione.json', function (font) {
    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    ];
    const titleGeo = new TextGeometry('JOSE PAOLO GIGAYON', {
      font: font,
      size: 0.08,
      height: 0.01,
    });
    titleText = new THREE.Mesh(titleGeo, textMaterials);
    titleText.rotation.y = Math.PI * 0.5;
    titleText.position.set(-0.27, 0.55, 0.5);
    scene.add(titleText);
  });

  loader.load('fonts/helvatica.json', function (font) {
    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    ];
    const subTitleGeo = new TextGeometry(
      'Full-Stack Developer & Computer Science Student',
      {
        font: font,
        size: 0.018,
        height: 0,
      }
    );
    subtitleText = new THREE.Mesh(subTitleGeo, textMaterials);
    subtitleText.rotation.y = Math.PI * 0.5;
    subtitleText.position.set(-0.255, 0.5, 0.5);
    scene.add(subtitleText);
  });
}

function switchTheme(themeType) {
  if (themeType === 'dark') {
    lightSwitch.rotation.z = Math.PI / 7;
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');

    // main lights
    gsap.to(roomLight.color, {
      r: 0.27254901960784313,
      g: 0.23137254901960785,
      b: 0.6862745098039216,
    });
    gsap.to(ambientLight.color, {
      r: 0.17254901960784313,
      g: 0.23137254901960785,
      b: 0.6862745098039216,
    });
    gsap.to(roomLight, {
      intensity: 1.5,
    });
    gsap.to(ambientLight, {
      intensity: 0.3,
    });

    // fan lights
    gsap.to(fanLight5, {
      distance: 0.07,
    });

    // text color
    gsap.to(titleText.material[0].color, {
      r: 8,
      g: 8,
      b: 8,
      duration: 0,
    });
    gsap.to(titleText.material[1].color, {
      r: 5,
      g: 5,
      b: 5,
      duration: 0,
    });
    gsap.to(subtitleText.material[0].color, {
      r: 8,
      g: 8,
      b: 8,
      duration: 0,
    });
    gsap.to(subtitleText.material[1].color, {
      r: 5,
      g: 5,
      b: 5,
      duration: 0,
    });

    // text light
    gsap.to(pointLight1, {
      intensity: 0.6,
    });
    gsap.to(pointLight2, {
      intensity: 0.6,
    });
    gsap.to(pointLight3, {
      intensity: 0.6,
    });
    gsap.to(pointLight4, {
      intensity: 0.6,
    });
  } else {
    lightSwitch.rotation.z = 0;
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');

    // main light
    gsap.to(roomLight.color, {
      r: 1,
      g: 1,
      b: 1,
    });
    gsap.to(ambientLight.color, {
      r: 1,
      g: 1,
      b: 1,
    });
    gsap.to(roomLight, {
      intensity: 2.5,
    });
    gsap.to(ambientLight, {
      intensity: 0.6,
    });

    // fan light
    gsap.to(fanLight5, {
      distance: 0.05,
    });

    // text color
    gsap.to(titleText.material[0].color, {
      r: 0.09019607843137255,
      g: 0.12156862745098039,
      b: 0.15294117647058825,
      duration: 0,
    });
    gsap.to(titleText.material[1].color, {
      r: 1,
      g: 1,
      b: 1,
      duration: 0,
    });
    gsap.to(subtitleText.material[0].color, {
      r: 0.09019607843137255,
      g: 0.12156862745098039,
      b: 0.15294117647058825,
      duration: 0,
    });
    gsap.to(subtitleText.material[1].color, {
      r: 1,
      g: 1,
      b: 1,
      duration: 0,
    });

    // text light
    gsap.to(pointLight1, {
      intensity: 0,
    });
    gsap.to(pointLight2, {
      intensity: 0,
    });
    gsap.to(pointLight3, {
      intensity: 0,
    });
    gsap.to(pointLight4, {
      intensity: 0,
    });
  }
}

function enableOrbitControls() {
  controls.enabled = true;
}

function disableOrbitControls() {
  controls.enabled = false;
}

function enableCloseBtn() {
  document.getElementById('close-btn').style.display = 'block';
}

function disableCloseBtn() {
  document.getElementById('close-btn').style.display = 'none';
}

function resetBookCover() {
  if (!bookCover) return;

  gsap.to(bookCover.rotation, {
    x: 0,
    duration: 1.5,
  });
}

function resetProjects() {
  if (projects.length === 0) return;

  projects.forEach((project, i) => {
    gsap.to(project.mesh.material, {
      opacity: 0,
      duration: 1,
    });
    gsap.to(project.mesh.position, {
      y: project.y,
      duration: 1,
    });
    gsap.to(project.mesh.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0,
      delay: 1,
    });
  });
}

function resetCamera() {
  resetBookCover();
  resetProjects();
  disableCloseBtn();
  gsap.to(camera.position, {
    ...defaultCameraPos,
    duration: 1.5,
  });
  gsap.to(camera.rotation, {
    ...defaultCamerRot,
    duration: 1.5,
  });
  gsap.delayedCall(1.5, enableOrbitControls);

  // reset dimmed light for about display
  if (theme !== 'dark') {
    gsap.to(roomLight, {
      intensity: 2.5,
      duration: 1.5,
    });
  }
}

function logoListener() {
  document.getElementById('logo').addEventListener('click', function (e) {
    e.preventDefault();
    resetCamera();
  });
}

function cameraToAbout() {
  if (!bookCover) return;

  gsap.to(camera.position, {
    ...aboutCameraPos,
    duration: 1.5,
  });
  gsap.to(camera.rotation, {
    ...aboutCameraRot,
    duration: 1.5,
  });
  gsap.to(bookCover.rotation, {
    x: Math.PI,
    duration: 1.5,
    delay: 1.5,
  });

  // prevent about text clutter due to bright light
  if (theme !== 'dark') {
    gsap.to(roomLight, {
      intensity: 1,
      duration: 1.5,
    });
  }
}

function aboutMenuListener() {
  document.getElementById('about-menu').addEventListener('click', function (e) {
    e.preventDefault();
    disableOrbitControls();
    resetProjects();
    cameraToAbout();
    gsap.delayedCall(1.5, enableCloseBtn);
  });
}

function projectsMenuListener() {
  // create project planes with textures
  projects.forEach((project, i) => {
    const colIndex = i % 3 === 0 ? 0 : 1;
    const rowIndex = Math.floor(i / 3);
    const geometry = new THREE.PlaneGeometry(0.71, 0.4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: new THREE.TextureLoader().load(project.images[0]),
      transparent: true,
      opacity: 0.0,
    });
    const projectPlane = new THREE.Mesh(geometry, material);
    projectPlane.name = 'project';
    projectPlane.userData = {
      url: project.url,
      index: i, // store the index for later use
    };
    projectPlane.position.set(
      0.3 + i * 0.8 * colIndex,
      1 - rowIndex * 0.5,
      -1.15
    );
    projectPlane.scale.set(0, 0, 0);
    // mesh & y vars needed for animation
    projects[i].mesh = projectPlane;
    projects[i].y = 1 - rowIndex * 0.5;
    scene.add(projectPlane);
  });

  document
    .getElementById('projects-menu')
    .addEventListener('click', function (e) {
      e.preventDefault();
      disableOrbitControls();
      resetBookCover();
      gsap.to(camera.position, {
        ...projectsCameraPos,
        duration: 1.5,
      });
      gsap.to(camera.rotation, {
        ...projectsCameraRot,
        duration: 1.5,
      });
      gsap.delayedCall(1.5, enableCloseBtn);

      // animate & show project items
      projects.forEach((project, i) => {
        project.mesh.scale.set(1, 1, 1);
        gsap.to(project.mesh.material, {
          opacity: 1,
          duration: 1.5,
          delay: 1.5 + i * 0.1,
        });
        gsap.to(project.mesh.position, {
          y: project.y + 0.05,
          duration: 1,
          delay: 1.5 + i * 0.1,
        });
      });
    });
}

function init3DWorldClickListeners() {
  const mousePosition = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let intersects;

  window.addEventListener('click', function (e) {
    // store value set to prevent multi time update in foreach loop
    const newTheme = theme === 'light' ? 'dark' : 'light';

    // prevent about focus on button click which are positioned above book in mobile view
    const closeBtn = document.getElementById('close-btn');
    const projectsBtn = document.getElementById('projects-menu');
    if (
      e.target === closeBtn ||
      closeBtn.contains(e.target) ||
      e.target === projectsBtn ||
      projectsBtn.contains(e.target)
    ) {
      return false;
    }

    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach((intersect) => {
      if (intersect.object.name === 'project') {
        const projectData = projects[intersect.object.userData.index];
        if (projectData) {
          showProjectModal(projectData);
        }
      }

      if (
        intersect.object.name === 'Book' ||
        intersect.object.name === 'Book001'
      ) {
        disableOrbitControls();
        cameraToAbout();
        gsap.delayedCall(1.5, enableCloseBtn);
      }

      if (
        intersect.object.name === 'SwitchBoard' ||
        intersect.object.name === 'Switch'
      ) {
        theme = newTheme;
        switchTheme(theme);
      }
    });
  });
}

// RESPONSIVE
function initResponsive(roomScene) {
  if (isMobile) {
    roomScene.scale.set(0.95, 0.95, 0.95);
    aboutCameraPos = {
      x: 0.09,
      y: 0.23,
      z: 0.51,
    };
    aboutCameraRot = {
      x: -1.57,
      y: 0,
      z: 1.57,
    };

    // rect light
    // rectLight.width = 0.406;
    // rectLight.height = 0.3;
    // rectLight.position.z = -0.34;

    // project
    projectsCameraPos = {
      x: 1.1,
      y: 0.82,
      z: 0.5,
    };
    projectsCameraRot = {
      x: 0,
      y: 0,
      z: 1.55,
    };
    projects.forEach((project, i) => {
      project.mesh.position.z = -1.13;
    });

    controls.maxDistance = 1.5;
    controls.maxAzimuthAngle = Math.PI * 0.75;
  }
}

// close button
document.getElementById('close-btn').addEventListener('click', (e) => {
  e.preventDefault();
  resetCamera();
});

// contact menu
document.getElementById('contact-btn').addEventListener('click', (e) => {
  e.preventDefault();
  document
    .querySelector('.contact-menu__dropdown')
    .classList.toggle('contact-menu__dropdown--open');
});

document.addEventListener('mouseup', (e) => {
  const container = document.querySelector('.contact-menu');
  if (!container.contains(e.target)) {
    container
      .querySelector('.contact-menu__dropdown')
      .classList.remove('contact-menu__dropdown--open');
  }
});

// update camera, renderer on resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add this after your other HTML elements

const modalHTML = document.createElement('div');
modalHTML.innerHTML = `
  <div id="project-modal" class="modal">
    <div class="modal-content">
      <span class="close">&times;</span>
      <div class="slider-container">
        <div class="slider">
          <!-- Images will be inserted here -->
        </div>
        <div class="slider-dots">
          <!-- Dots will be inserted here -->
        </div>
      </div>
      <h2 id="modal-title"></h2>
      <p id="modal-description"></p>
      <div id="modal-tech"></div>
      <a id="github-link" class="github-btn" target="_blank" rel="noopener">
        <i class="fab fa-github"></i> View on GitHub
      </a>
    </div>
  </div>
`;

const modalStyle = document.createElement('style');
modalStyle.textContent = `
  .modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
  }

  .modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 600px;
    border-radius: 8px;
    position: relative;
  }

  .close {
    position: absolute;
    right: 20px;
    top: 15px;
    color: #aaa;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  }

  .github-btn {
    display: inline-flex;
    align-items: center;
    background: #24292e;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    margin-top: 16px;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .github-btn:hover {
    background: #2f363d;
  }

  .github-btn i {
    margin-right: 8px;
  }

  #modal-title {
    margin-top: 0;
    margin-bottom: 16px;
    color: #333;
  }

  #modal-description {
    line-height: 1.5;
    color: #666;
    margin-bottom: 16px;
  }

  #modal-tech {
    margin-top: 16px;
    color: #666;
  }

  .slider-container {
    position: relative;
    width: 100%;
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
  }

  .slider {
    display: flex;
    transition: transform 0.5s ease-in-out;
  }

  .slider img {
    width: 100%;
    flex-shrink: 0;
    object-fit: cover;
  }

  .slider-dots {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .dot.active {
    background: white;
  }
`;

document.head.appendChild(modalStyle);
document.body.appendChild(modalHTML);

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('project-modal').style.display = 'none';
});

window.addEventListener('click', function(event) {
  const modal = document.getElementById('project-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Add this function to show project modal
function showProjectModal(projectData) {
  const modal = document.getElementById('project-modal');
  const slider = modal.querySelector('.slider');
  const dotsContainer = modal.querySelector('.slider-dots');
  
  // Clear previous content
  slider.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  // Add images to slider
  projectData.images.forEach((imgSrc, index) => {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = `${projectData.title} screenshot ${index + 1}`;
    slider.appendChild(img);
    
    // Add dot
    const dot = document.createElement('div');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  
  // Set up other modal content
  document.getElementById('modal-title').textContent = projectData.title;
  document.getElementById('modal-description').textContent = projectData.description;
  document.getElementById('modal-tech').innerHTML = 
    `<p>Technologies: ${projectData.tech.join(', ')}</p>`;
  
  const githubLink = document.getElementById('github-link');
  if (projectData.github) {
    githubLink.href = projectData.github;
    githubLink.style.display = 'inline-flex';
  } else {
    githubLink.style.display = 'none';
  }
  
  modal.style.display = 'block';
  
  // Start automatic sliding
  startSlideShow();
}

// Slider functionality
let slideInterval;
let currentSlide = 0;

function startSlideShow() {
  stopSlideShow(); // Clear any existing interval
  slideInterval = setInterval(() => {
    const slider = document.querySelector('.slider');
    const dots = document.querySelectorAll('.dot');
    if (!slider || !dots.length) return;
    
    currentSlide = (currentSlide + 1) % dots.length;
    goToSlide(currentSlide);
  }, 3000); // Change slide every 3 seconds
}

function stopSlideShow() {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
}

function goToSlide(index) {
  const slider = document.querySelector('.slider');
  const dots = document.querySelectorAll('.dot');
  if (!slider || !dots.length) return;
  
  currentSlide = index;
  slider.style.transform = `translateX(-${index * 100}%)`;
  
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// Update the modal close handlers to stop the slideshow
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('project-modal').style.display = 'none';
  stopSlideShow();
});

window.addEventListener('click', function(event) {
  const modal = document.getElementById('project-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
    stopSlideShow();
  }
});
