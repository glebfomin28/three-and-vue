<script setup lang="ts">
import { useThreeScene } from './hooks/use-three-model.ts';

const { sceneContainer, selectedMesh, onClick } = useThreeScene();
</script>

<template>
  <div>{{Array.from(selectedMesh)}}</div>
  <div ref="sceneContainer" class="sceneContainer" @click="onClick"></div>
</template>

<style scoped>
.sceneContainer {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
