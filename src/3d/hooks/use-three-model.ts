import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import mockData from '../__fixtures__/model-data.json';
import { SceneManager } from '../utilities/scene-manager.ts';
import { CameraManager } from '../utilities/camera-manager.ts';
import { RendererManager } from '../utilities/renderer-manager.ts';
import {ControlsManager} from "../utilities/controls-manager.ts";
import {IModelPart} from "../domain/three-model.domain.ts";

export function useThreeScene() {
  const sceneContainer = ref<HTMLElement | null>(null);
  const selectedMesh = ref<Map<string, IModelPart>>(new Map());
  const selectionRect = ref<{ start: THREE.Vector2; end: THREE.Vector2 } | null>(null);
  const isShiftPressed = ref(false);
  const isSelecting = ref(false);
  const selectionElement = ref<HTMLDivElement | null>(null);

  const rendererManager = new RendererManager();
  const cameraManager = new CameraManager();
  const sceneManager = new SceneManager();
  const controlsManager = new ControlsManager(cameraManager.getCamera(), rendererManager.getRenderer());
  const clock = new THREE.Clock();

  const onClick = (event: MouseEvent) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, cameraManager.getCamera());

    const intersects = raycaster.intersectObjects(sceneManager.getParts());


    if (intersects.length > 0) {
      const part = intersects[0].object.userData as IModelPart;

      if (selectedMesh.value.has(part.id.toString())) {
        // Отменить подсветку
        selectedMesh.value.delete(part.id.toString());
        intersects[0].object.material.emissive.set(0x000000);
      } else {
        // Добавить подсветку
        selectedMesh.value.set(part.id.toString(), part);
        intersects[0].object.material.emissive.set(0xff0000);
      }
    }
  };
  onMounted(() => {
    if (sceneContainer.value) {
      sceneContainer.value.appendChild(rendererManager.getRenderer().domElement);
      sceneManager.addParts(mockData as IModelPart[]);
      animate();

      // Создаем элемент для выделения
      selectionElement.value = document.createElement('div');
      selectionElement.value.style.position = 'absolute';
      selectionElement.value.style.border = '2px dashed black';
      selectionElement.value.style.backdropFilter = 'red';
      selectionElement.value.style.pointerEvents = 'none';
      selectionElement.value.style.display = 'none';
      sceneContainer.value.appendChild(selectionElement.value);
    }

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  });

  onUnmounted(() => {
    window.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Shift') {
      isShiftPressed.value = true;
      controlsManager.disable();
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Shift') {
      isShiftPressed.value = false;
      if (!isSelecting.value) {
        controlsManager.enable();
      }
    }
  };

  const onMouseDown = (event: MouseEvent) => {
    if (event.button === 0 && isShiftPressed.value) { // Левая кнопка мыши и Shift
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      selectionRect.value = { start: mouse, end: mouse };
      isSelecting.value = true;

      if (selectionElement.value) {
        selectionElement.value.style.display = 'block';
        selectionElement.value.style.left = `${event.clientX}px`;
        selectionElement.value.style.top = `${event.clientY}px`;
        selectionElement.value.style.width = '0px';
        selectionElement.value.style.height = '0px';
      }
    }
  };

  const onMouseMove = (event: MouseEvent) => {
    if (isSelecting.value && selectionElement.value) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      selectionRect.value!.end = mouse;

      const startX = Math.min(selectionRect.value.start.x, mouse.x) * window.innerWidth / 2;
      const startY = Math.min(selectionRect.value.start.y, mouse.y) * window.innerHeight / 2;
      const width = Math.abs(selectionRect.value.start.x - mouse.x) * window.innerWidth / 2;
      const height = Math.abs(selectionRect.value.start.y - mouse.y) * window.innerHeight / 2;

      selectionElement.value.style.left = `${startX}px`;
      selectionElement.value.style.top = `${startY}px`;
      selectionElement.value.style.width = `${width}px`;
      selectionElement.value.style.height = `${height}px`;
    }
  };

  const onMouseUp = (event: MouseEvent) => {
    if (event.button === 0 && selectionRect.value) { // Левая кнопка мыши
      const start = selectionRect.value.start;
      const end = selectionRect.value.end;

      const intersects = sceneManager.getParts().filter(part => {
        const screenPosition = part.position.clone().project(cameraManager.getCamera());
        return screenPosition.x >= Math.min(start.x, end.x) && screenPosition.x <= Math.max(start.x, end.x) &&
          screenPosition.y >= Math.min(start.y, end.y) && screenPosition.y <= Math.max(start.y, end.y);
      });

      intersects.forEach(part => {
        const partData = part.userData as IModelPart;
        if (selectedMesh.value.has(partData.id.toString())) {
          selectedMesh.value.delete(partData.id.toString());
          part.material.emissive.set(0x000000);
        } else {
          selectedMesh.value.set(partData.id.toString(), partData);
          part.material.emissive.set(0xff0000);
        }
        console.log(partData);
      });

      selectionRect.value = null;
      isSelecting.value = false;
      controlsManager.enable();

      if (selectionElement.value) {
        selectionElement.value.style.display = 'none';
      }
    }
  };

  const animate = () => {
    const delta = clock.getDelta();
    if (isShiftPressed) {
      controlsManager.update(delta);
    }
    rendererManager.render(sceneManager.getScene(), cameraManager.getCamera());
    requestAnimationFrame(animate);
  };

  return {
    sceneContainer,
    onClick,
    selectedMesh,
  };
}
