import * as THREE from 'three';

export class CameraManager {
  camera: THREE.PerspectiveCamera;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.z = 5;
    this.camera.position.y = 2;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
}
