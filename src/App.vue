<template>
  <div class="main">
    <customer-bg/>
    <t-layout class="main-container">
      <menu-side class="main-side"></menu-side>
      <t-content class="main-content-wrapper">
        <div class="main-content">
          <router-view v-slot="{ Component }">
            <keep-alive :exclude>
              <component :is="Component"/>
            </keep-alive>
          </router-view>
        </div>
      </t-content>
    </t-layout>
    <music-display/>
    <div class="main-player">
      <music-player/>
    </div>
    <music-list-drawer/>
  </div>
</template>
<script lang="ts" setup>
import {ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {detach} from "@/store/AppStore";
import {usePluginStore} from "@/store";
import {useMainPush} from "@/hooks/MainPush";
import MusicPlayer from "@/components/MusicPlayer/MusicPlayer.vue";
import MenuSide from "@/components/MenuSide/MenuSide.vue";
import {versionCheck} from "@/components/UpdateLog";
import MessageUtil from "@/utils/modal/MessageUtil";
import CustomerBg from "@/components/CustomerBg/CustomerBg.vue";
import MusicListDrawer from "@/components/MusicPlayer/MusicListDrawer.vue";

const route = useRoute();
const router = useRouter();
const selectedKeys = ref(['/home']);

const exclude = ref(['MusicGroupInfo', 'FolderInfo']);


watch(() => selectedKeys.value, value => router.push(value[0]));

watch(() => route.path, value => {
  if (value !== selectedKeys.value[0]) {
    selectedKeys.value[0] = value;
  }
})

utools.onPluginEnter(action => {
  console.log(action);
  // 后期加入播放指定
  detach.value = utools.getWindowType() !== 'main';
});


const {onMainPush, onSelectCallback} = useMainPush();
utools.onMainPush<any>(onMainPush, onSelectCallback);

// 插件初始化
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


  .main-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 60px;
    contain: strict;
    background-color: transparent;

    .main-side {
      background-color: var(--music-bg-color-3);

      :deep(.t-default-menu) {
        background-color: transparent;
      }
    }

    .main-content-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: transparent;

      .main-content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;
      }
    }

  }

  .main-player {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60px;
    color: var(--td-text-color-primary);
  }
}
</style>
