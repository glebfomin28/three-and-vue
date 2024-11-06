import CameraControls from 'camera-controls';
import * as THREE from 'three';

export class ControlsManager {
  controls: CameraControls;
  enabled: boolean;

  constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    CameraControls.install({ THREE });
    this.controls = new CameraControls(camera, renderer.domElement);
    this.enabled = true;
  }

  update(delta: number) {
    this.controls.update(delta);
  }
  disable() {
    this.controls.enabled = false;
  }

  enable() {
    this.controls.enabled = true;
  }
}
