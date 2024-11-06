import * as THREE from 'three';
import { IModelPart } from '../domain/three-model.domain.ts';
import { PartMesh } from "./part-mesh.ts";

export class SceneManager {
  scene: THREE.Scene;
  parts: THREE.Mesh[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff); // Белый фон
    this.scene.add( new THREE.GridHelper(50, 50)); // Сетка


    // Добавляем освещение для металлического эффекта
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Мягкий свет
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Направленный свет
    directionalLight.position.set(1, 10, 2);
    this.scene.add(ambientLight);
    this.scene.add(directionalLight);
  }

  addParts(partsData: IModelPart[]) {
    partsData.forEach((partData: IModelPart) => {
      const part = new PartMesh(partData);
      const mesh = part.createMesh();
      this.scene.add(mesh);
      this.parts.push(mesh);
    });
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getParts(): THREE.Mesh[] {
    return this.parts;
  }
}
