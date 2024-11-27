<template>
  <div class="main">
    <div class="main-container">
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component"/>
          </keep-alive>
        </router-view>
      </div>
      <menu-side class="main-side"></menu-side>
    </div>
    <music-display/>
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
import {usePluginStore} from "@/store";
import {useMainPush} from "@/hooks/MainPush";
import MusicPlayer from "@/components/MusicPlayer/MusicPlayer.vue";
import MenuSide from "@/components/MenuSide/MenuSide.vue";
import {versionCheck} from "@/components/UpdateLog";
import MessageUtil from "@/utils/modal/MessageUtil";

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
  // 后期加入播放指定
  detach.value = utools.getWindowType() !== 'main';
});


const {onMainPush, onSelectCallback} = useMainPush();
utools.onMainPush<any>(onMainPush, onSelectCallback);

// 插件初始刷
usePluginStore().init();
// 版本检查
versionCheck().catch(e => MessageUtil.error("版本检查错误", e));

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
    contain: strict;

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
    background-color: var(--td-bg-color-container);
    color: var(--td-text-color-primary);
  }
}
</style>
