import * as THREE from 'three';
import { IModelPart } from "../domain/three-model.domain.ts";

export class PartMesh {
  id: number;
  name: string;
  geometry: THREE.BufferGeometry;
  position: THREE.Vector3;
  color: THREE.Color;
  opacity: number;

  constructor(data: IModelPart) {
    this.id = data.id;
    this.name = data.name;
    this.geometry = new THREE.BoxGeometry(data.geometry.width, data.geometry.height, data.geometry.depth);
    this.position = new THREE.Vector3(data.position.x, data.position.y, data.position.z);
    this.color = new THREE.Color(data.color.r / 255, data.color.g / 255, data.color.b / 255);
    this.opacity = data.color.a;
  }

  createMesh(): THREE.Mesh {
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      opacity: this.opacity,
      transparent: true,
      metalness: 0.5, // Металлический эффект
      roughness: 0.5 // Шероховатость
    });
    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.position.copy(this.position);
    mesh.userData = {
      id: this.id,
      name: this.name,
      geometry: {
        width: this.geometry.parameters.width,
        height: this.geometry.parameters.height,
        depth: this.geometry.parameters.depth
      },
      position: {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z
      },
      color: {
        r: this.color.r * 255,
        g: this.color.g * 255,
        b: this.color.b * 255,
        a: this.opacity
      }
    };
    return mesh;
  }
}
