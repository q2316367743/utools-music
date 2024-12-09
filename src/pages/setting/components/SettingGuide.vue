<template>
  <div>
    <t-form-item label="颜色模式">
      <t-radio-group v-model="colorMode">
        <t-radio value="auto">跟随系统</t-radio>
        <t-radio value="dark">暗黑</t-radio>
        <t-radio value="light">明亮</t-radio>
      </t-radio-group>
    </t-form-item>
    <t-form-item label="音乐下载目录">
      <folder-input v-model="downloadFolder" title="请选择音乐保存位置" style="width: 400px"/>
    </t-form-item>
    <t-form-item label="播放器样式">
      <t-radio-group v-model="globalSetting.globalControl">
        <t-popup placement="top-left">
          <template #content>
            <t-image :src="ControlImage" style="width: 200px"/>
          </template>
          <t-radio value="0">默认</t-radio>
        </t-popup>
        <t-popup placement="top-left">
          <template #content>
            <t-image :src="Control11Image" style="width: 200px"/>
          </template>
          <t-radio value="1">样式一</t-radio>
        </t-popup>
        <t-popup placement="top-left">
          <template #content>
            <t-image :src="Control12Image" style="width: 200px"/>
          </template>
          <t-radio value="2">样式二</t-radio>
        </t-popup>
      </t-radio-group>
    </t-form-item>
    <t-form-item label="播放器位置">
      <t-input-group style="align-items: center">
        <t-input-number v-model="musicControlsDataX" :clearable="true" :min="0" suffix="px" style="width: 150px"/>
        <close-icon style="margin: 0 8px"/>
        <t-input-number v-model="musicControlsDataY" :clearable="true" :min="0" suffix="px" style="width: 150px"/>
      </t-input-group>
    </t-form-item>
  </div>
</template>
<script lang="ts" setup>
import {colorMode} from "@/store/AppStore";
import {downloadFolder, globalSetting} from "@/store";
import ControlImage from "@/assets/image/preview/control.png";
import Control11Image from "@/assets/image/preview/control1.png";
import Control12Image from "@/assets/image/preview/control2.png";
import {musicControlsDataX, musicControlsDataY} from "@/global/BeanFactory";
import {CloseIcon} from "tdesign-icons-vue-next";
</script>
<style scoped lang="less">

</style>
