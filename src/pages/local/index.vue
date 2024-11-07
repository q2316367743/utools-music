<template>
  <t-card class="local-music" title="本地音乐">
    <template #actions>
      <music-scanner/>
    </template>
  </t-card>
</template>
<script lang="ts" setup>
import MusicScanner from "@/pages/local/components/MusicScanner/MusicScanner.vue";
</script>
<style scoped>
.local-music {
  position: relative;
  height: 100%;
  width: 100%;
}
</style>
