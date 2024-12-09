<template>
  <div class="main-mask"/>
  <div class="customer-bg" v-if="show" :style="bgStyle">
    <img v-if="imgSrc" :src="imgSrc" alt="背景图片" class="customer-img"/>
    <div v-if="imgSrc" class="customer-img-mask"/>
  </div>
</template>
<script lang="ts" setup>
import {nativeSetting} from "@/store";

const show = computed(() => nativeSetting.value.bgType !== 'none');
const imgSrc = computed(() => {
  if (nativeSetting.value.bgType !== 'image') {
    return '';
  }
  return nativeSetting.value.bgImage;
});
const bgStyle = computed(() => {
  if (nativeSetting.value.bgType === 'color') {
    return {
      backgroundColor: nativeSetting.value.bgColor,
    }
  } else if (nativeSetting.value.bgType === 'linearGradient') {
    return {
      background: nativeSetting.value.bgGradient,
    }
  }
  return {};
});
</script>
<style scoped lang="less">
.customer-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .customer-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    filter: blur(10px);
    transform: scale(1.1);
  }
  .customer-img-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--music-bg-color-3);
    opacity: 0.3;
  }
}
</style>
