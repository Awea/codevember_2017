import * as THREE from 'three'

import vertexShaderSource from '../shaders/26.vert'
import fragmentShaderSource from '../shaders/26.frag'

var canvas;
var camera, scene, renderer, controls;
var mesh;
var noise, displacement;
var ready = false

function fitCanvas(event) {
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', fitCanvas, false );

function init() {
  canvas = document.getElementById('c');

  // Set Camera
  camera =  new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  scene    = new THREE.Scene()

  var geometry    = new THREE.SphereBufferGeometry(25, 128, 64)

  displacement = new Float32Array(geometry.attributes.position.count);
  noise = new Float32Array(geometry.attributes.position.count);

  for ( var i = 0; i < displacement.length; i ++ ) {
    noise[i] = Math.random() * 5;
  }

  geometry.addAttribute('displacement', new THREE.BufferAttribute(displacement, 1));

  var material = new THREE.ShaderMaterial( {
    uniforms: {
      amplitude: {value: 1.0}
    },
    vertexShader:   vertexShaderSource,
    fragmentShader: fragmentShaderSource
  });

  mesh = new THREE.Line(geometry, material)

  scene.add(mesh)

  var bb = new THREE.Box3()
  bb.setFromObject(mesh);

  var dist = bb.getSize().x / (2 * Math.tan( camera.fov * Math.PI / 360))

  camera.position.set(bb.getCenter().x, bb.getCenter().y, 10 + dist)

  ready = true

  renderer = new THREE.WebGLRenderer({canvas: canvas, antialias:true});
  renderer.setPixelRatio(window.devicePixelRatio);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function animate() {
  if (ready){
    var time = Date.now() * 0.02;

    mesh.rotation.y = time

    mesh.material.uniforms.amplitude.value = 1.5 * Math.sin(mesh.rotation.y * 0.125);

    for (var i = 0; i < displacement.length; i ++) {
      displacement[i]  = Math.sin(0.1 * i + time);
      noise[i]        += 0.5 * (0.5 - Math.random() );
      noise[i]         = THREE.Math.clamp(noise[i], -5, 5);
      displacement[i] += noise[ i ];
    }
    mesh.geometry.attributes.displacement.needsUpdate = true;
  }

  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}

init()
fitCanvas();
animate();
