<template>
  <t-form :data="globalSetting" label-align="top" class="global-setting">
    <t-tabs v-model="active">
      <t-tab-panel label="全局" value="guide" style="padding: 8px">
        <setting-guide/>
      </t-tab-panel>
      <t-tab-panel label="背景" value="bg" style="padding: 8px">
        <setting-bg/>
      </t-tab-panel>
      <t-tab-panel label="播放" value="play" style="padding: 8px;overflow: auto">
        <setting-play/>
      </t-tab-panel>
      <t-tab-panel label="歌词" value="lyric" style="padding: 8px;overflow: auto">
        <setting-lyric/>
      </t-tab-panel>
      <t-tab-panel label="插件" value="plugin" style="padding: 8px">
        <setting-plugin/>
      </t-tab-panel>
      <t-tab-panel label="代理" value="proxy" style="padding: 8px">
        <setting-proxy/>
      </t-tab-panel>
    </t-tabs>
  </t-form>
</template>
<script lang="ts" setup>
import {globalSetting} from "@/store";
import SettingGuide from "@/pages/setting/components/SettingGuide.vue";
import SettingBg from "@/pages/setting/components/SettingBg.vue";
import SettingPlay from "@/pages/setting/components/SettingPlay.vue";
import SettingLyric from "@/pages/setting/components/SettingLyric.vue";
import SettingPlugin from "@/pages/setting/components/SettingPlugin.vue";
import SettingProxy from "@/pages/setting/components/SettingProxy.vue";

const active = ref('guide');

</script>
<style scoped lang="less">
.global-setting {
  position: relative;
  width: 100%;
  height: 100%;

  .t-tabs {
    position: relative;
    width: 100%;
    height: 100%;

    :deep(.t-tabs__content) {
      height: calc(100% - 48px);
      overflow: auto;
    }
  }
}
</style>
