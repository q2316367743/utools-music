<template>
  <canvas ref="canvasRef" class="music-display-canvas"></canvas>
</template>

<script lang="ts" setup>
import {audio} from './MusicPlayer';
import {useAudioVisualizer} from "@/hooks/AudioVisualizer";

const canvasRef = ref<HTMLCanvasElement>();

onMounted(() => {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;

  useAudioVisualizer(canvas, audio, {
    fftSize: 128
  });
});

</script>

<style scoped lang="less">
.music-display-canvas {
  width: 100%;
  height: 110px;
  background-color: transparent;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
}
</style>
