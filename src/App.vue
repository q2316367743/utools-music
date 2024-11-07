<template>
  <div class="main">
    <div class="main-container">
      <div class="main-content">
        <router-view/>
      </div>
      <menu-side class="main-side"></menu-side>
    </div>
    <div class="main-player">
      <music-player/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useDark} from "@vueuse/core";
import {detach} from "@/store/AppStore";
import MusicPlayer from "@/components/MusicPlayer/MusicPlayer.vue";
import MenuSide from "@/components/MenuSide/MenuSide.vue";

const route = useRoute();
const router = useRouter();
const selectedKeys = ref(['/home']);

watch(() => selectedKeys.value, value => router.push(value[0]));

watch(() => route.path, value => {
  if (value !== selectedKeys.value[0]) {
    selectedKeys.value[0] = value;
  }
})

useDark({
  selector: 'html',
  attribute: 'theme-mode',
  valueDark: 'dark',
  valueLight: 'light',
  storage: utools.dbStorage
})

utools.onPluginEnter(action => {
  console.log(action);
  detach.value = utools.getWindowType() !== 'main';
});


</script>
<style scoped lang="less">
.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--td-text-color-primary);
  background-color: var(--td-bg-color-container);

  .main-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 60px;

    .main-side {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 200px
    }

    .main-content {
      position: absolute;
      top: 0;
      left: 200px;
      right: 0;
      bottom: 0;

    }
  }

  .main-player {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60px;
  }
}
</style>
