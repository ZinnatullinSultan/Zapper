import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/STLLoader.js';

  
/*================================================
ThreeJS Canvas
==================================================*/

var threeJSCanvasElement = null;
var canvasContainerElement = null;
var threeJSScene = null;
var threeJSCamera = null;
var meshRotationSpeed = 0.0;
var pointer3DMesh = false;
const raycaster = new THREE.Raycaster();
const mousePos = new THREE.Vector2();

(function ($) {
  "use strict";

  function addSceneLights(scene) {
	// Top light
	const directionalLightTop = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLightTop.position.set(0, 1, 0).normalize();
	scene.add(directionalLightTop);

	// Bottom light
	const directionalLighBottom = new THREE.DirectionalLight(0xffffff, 0.2);
	directionalLighBottom.position.set(0, -1, 0).normalize();
	scene.add(directionalLighBottom);

	// Front light
	const directionalLightFront = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLightFront.position.set(0, 0, 1).normalize();
	scene.add(directionalLightFront);

	// Back
	const directionalLightBack = new THREE.DirectionalLight(0xffffff, 0.3);
	directionalLightBack.position.set(0, 0, -1).normalize();
	scene.add(directionalLightBack);

	// Left
	const directionalLightLeft = new THREE.DirectionalLight(0xffffff, 0.3);
	directionalLightLeft.position.set(-1, 0, 0).normalize();
	scene.add(directionalLightLeft);

	// Right
	const directionalLightRight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLightRight.position.set(1, 0, 0).normalize();
	scene.add(directionalLightRight);
  }

  function setupCanvas(canvasElement, geometry){   
    if (!geometry) {
      console.log("fallback geometry");
      $("#threejs-fallback").show(); 
      return;   
    } else {
      $("#threejs-fallback").hide(); 
    }

    const renderer = new THREE.WebGLRenderer( { canvas: canvasElement, antialias: true, alpha: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( canvasElement.clientWidth, canvasElement.clientHeight );

    threeJSScene = new THREE.Scene();
    //threeJSScene.background = new THREE.Color( 0x001D21 );
    threeJSScene.background = null;
    addSceneLights(threeJSScene);

    threeJSCamera = new THREE.PerspectiveCamera( 40, canvasElement.clientWidth / canvasElement.clientHeight, 1, 100 );
    threeJSCamera.position.set( 5, 2, 8 );
    threeJSCamera.lookAt(new THREE.Vector3(0, 0, 0));

    const controls = new OrbitControls( threeJSCamera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.rotateSpeed = 0.5;
    controls.update();
    controls.enablePan = false;
   
    // Center geometry in (0, 0, 0) by bounding box
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    const offset = center.negate();
    geometry.translate(offset.x, offset.y, offset.z);

    // Create mesh and material
    const material = new THREE.MeshPhongMaterial({ color: 0x00C5E0, specular: 0xFFFFFF, shininess: 5 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set( 1, 1, 1);
    mesh.position.set(0, 0, 0);

    // STL files must be rotated -90 degrees on the X axis
    mesh.rotation.x = -Math.PI / 2;
    mesh.frustrumCulled = false;

    // Add the mesh to the scene
    threeJSScene.add(mesh);

    // Reposition camera to make it focus on the mesh
    const boundingBoxSize = new THREE.Vector3();
    boundingBox.getSize(boundingBoxSize);
    const radius = boundingBoxSize.length() / 2;
    threeJSCamera.position.set(radius / 2, radius / 2, radius * 3);
    threeJSCamera.lookAt(0, 0, 0);
    threeJSCamera.far = radius * 10; 
    threeJSCamera.updateProjectionMatrix();
    
    // Show axis 
    const axesHelper = new THREE.AxesHelper( radius * 2);
    threeJSScene.add( axesHelper );

    // Create the Pointer3D, but don't show it yet
    // Step 1: Create the cube geometry and material
    const pointerGeometry = new THREE.BoxGeometry(radius / 3, radius / 20, radius / 3); // Size of the cube
    const pointerMaterial = new THREE.MeshBasicMaterial({ color: 0x30ff30 }); // Green color

    // Step 2: Create the mesh
    pointer3DMesh = new THREE.Mesh(pointerGeometry, pointerMaterial);
    pointer3DMesh.visible = false;
    threeJSScene.add(pointer3DMesh);

    window.onresize = function () {
      threeJSCamera.aspect = canvasElement.clientWidth / canvasElement.clientHeight;
      threeJSCamera.updateProjectionMatrix();
      renderer.setSize( canvasElement.clientWidth, canvasElement.clientHeight );
    };

    meshRotationSpeed = 0.0;

    function animate() {
      mesh.rotation.z += meshRotationSpeed;
      renderer.render( threeJSScene, threeJSCamera );
    }
    renderer.setAnimationLoop( animate );
  }

  function addObjectToScene(geometry) {
    if (!threeJSScene) {
      return;
    }

    // Center geometry in (0, 0, 0) by bounding box
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    const offset = center.negate();
    geometry.translate(offset.x, offset.y, offset.z);

    // Create mesh and material
    const material = new THREE.MeshPhongMaterial({ color: 0x00C5E0, specular: 0xFFFFFF, shininess: 5 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set( 1, 1, 1);

    // STL files must be rotated -90 degrees on the X axis
    mesh.rotation.x = -Math.PI / 2;

    if (pointer3DMesh) {
      pointer3DMesh.visible = false;
      mesh.position.set(pointer3DMesh.position.x, pointer3DMesh.position.y, pointer3DMesh.position.z);
    }

    mesh.frustrumCulled = false;
    
    threeJSScene.add(mesh);
  }

  function loadSTLFile(file) {
    
    console.log("Loading STL file: ", file.name);

    var reader = new FileReader();
    reader.onload = function(event) {
        var contents = event.target.result;
        // Load the STL file and show it in ThreeJS canvas
        var loader = new STLLoader();
        var geometry = loader.parse(contents);
        setupCanvas(document.querySelector('#threejs-canvas'), geometry);
    };
    reader.readAsArrayBuffer(file);
  }

  function loadSTLFromURL(url) {
    console.log("Loading STL url: ", url);
    var loader = new STLLoader();
    loader.load(url, function(geometry) {
      setGenerateProgress(100);
      setupCanvas(document.querySelector('#threejs-canvas'), geometry);
    });
  }

  function setGenerateProgress(value) {
    $("#generate-progress-parent").show();
    $("#generate-progress").css('width', value + '%').attr('aria-valuenow', value);
  }

  $(document).ready(function () {
    threeJSCanvasElement = document.querySelector('#threejs-canvas');
    canvasContainerElement = document.querySelector('#canvas-container');
    $("#threejs-fallback").hide(); 
    $("#generate-progress-parent").hide(); 
    setupCanvas(threeJSCanvasElement);
    // setupDragAndDrop(threeJSCanvasElement);

    $("#generate-button").on('click', function(event) {
      var inputValue = $("#generate-input").val();
      if (inputValue == "") {
        console.log("No input value");
        return;
      }
      console.log("generate: ", inputValue);
      setGenerateProgress(0);
      // Call with a small timeout to allow the progress bar animation to reset
      setTimeout(function() {
        loadSTLFromURL(`/samples/${inputValue}.stl`);
      }, 200);   
    });

  }); 
})(jQuery, window);