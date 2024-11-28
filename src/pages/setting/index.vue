<template>
  <t-form :data="globalSetting" label-align="top" class="global-setting">
    <t-tabs v-model="active">
      <t-tab-panel label="全局" value="guide" style="padding: 8px">
        <t-form-item label="颜色模式">
          <t-radio-group v-model="colorMode">
            <t-radio value="auto">跟随系统</t-radio>
            <t-radio value="dark">暗黑</t-radio>
            <t-radio value="light">明亮</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-tab-panel>
      <t-tab-panel label="下载" value="download" style="padding: 8px">
        <t-form-item label="音乐下载目录">
          <t-input-group style="min-width: 400px">
            <t-input :disabled="true" v-model="downloadFolder"/>
            <t-button theme="primary" @click="updateDownloadFolder">
              <template #icon>
                <file-icon/>
              </template>
            </t-button>
          </t-input-group>
        </t-form-item>
      </t-tab-panel>
      <t-tab-panel label="播放" value="play" style="padding: 8px;overflow: auto">
        <t-form-item label="播放失败时">
          <t-radio-group v-model="globalSetting.playError" :default-value="GlobalSettingPlayErrorType.NEXT">
            <t-radio label="下一曲" :value="GlobalSettingPlayErrorType.NEXT"></t-radio>
            <t-radio label="暂停" :value="GlobalSettingPlayErrorType.PAUSE"></t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="边听边存" help="开启后，当播放网络音乐时，会自动将音乐下载">
          <t-switch v-model="globalSetting.playDownload"></t-switch>
        </t-form-item>
        <t-form-item label="默认播放质量" help="优先获取默认播放质量的音乐，如果不存在，再获取其他质量的音乐">
          <t-radio-group v-model="globalSetting.playQuality" default-value="super">
            <t-radio value="low" label="低"/>
            <t-radio value="standard" label="标准"/>
            <t-radio value="high" label="高"/>
            <t-radio value="super" label="极高"/>
          </t-radio-group>
        </t-form-item>
      </t-tab-panel>
      <t-tab-panel label="歌词" value="lyric" style="padding: 8px;overflow: auto">
        <t-form-item label="字体大小">
          <t-input-number :clearable="true" v-model="globalSetting.lyricFontSize"></t-input-number>
        </t-form-item>
        <t-form-item label="字体颜色">
          <t-color-picker-panel :clearable="true" v-model="globalSetting.lyricColor"
                                :color-modes="['monochrome']"
                                :enable-alpha="true"></t-color-picker-panel>
        </t-form-item>
        <t-form-item label="边框颜色">
          <t-color-picker-panel :clearable="true" v-model="globalSetting.lyricBorderColor"
                                :color-modes="['monochrome']"
                                :enable-alpha="true"></t-color-picker-panel>
        </t-form-item>
      </t-tab-panel>
      <t-tab-panel label="插件" value="plugin" style="padding: 8px">
        <t-paragraph>
          <t-checkbox v-model="globalSetting.pluginAutoUpdate">
            打开插件时自动更新插件
          </t-checkbox>
        </t-paragraph>
        <t-paragraph>
          <t-checkbox v-model="globalSetting.pluginIgnoreVersion">
            安装插件式不校验版本
          </t-checkbox>
        </t-paragraph>
      </t-tab-panel>
      <t-tab-panel label="代理" value="proxy" style="padding: 8px">
        <t-paragraph>
          <t-checkbox v-model="globalSetting.proxyEnabled">
            启用网络代理
          </t-checkbox>
        </t-paragraph>
        <t-row :gutter="[16, 16]">
          <t-col :span="6">
            <t-form-item label="主机">
              <t-input :disabled="!globalSetting.proxyEnabled" :clearable="true"
                       v-model="globalSetting.proxyHost"></t-input>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="端口">
              <t-input-number :disabled="!globalSetting.proxyEnabled" :clearable="true"
                              v-model="globalSetting.proxyPort"></t-input-number>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="用户名">
              <t-input :disabled="!globalSetting.proxyEnabled" :clearable="true"
                       v-model="globalSetting.proxyUser"></t-input>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="密码">
              <t-input :disabled="!globalSetting.proxyEnabled" :clearable="true"
                       v-model="globalSetting.proxyPassword"></t-input>
            </t-form-item>
          </t-col>
        </t-row>
      </t-tab-panel>
    </t-tabs>
  </t-form>
</template>
<script lang="ts" setup>
import {downloadFolder, globalSetting} from "@/store";
import {GlobalSettingPlayErrorType} from "@/entity/GlobalSetting";
import {FileIcon} from 'tdesign-icons-vue-next';
import {colorMode} from "@/store/AppStore";

const active = ref('guide');

function updateDownloadFolder() {
  const paths = utools.showOpenDialog({
    title: '请选择音乐保存位置',
    defaultPath: utools.getPath("music"),
    properties: ['openDirectory'],
    buttonLabel: '下载'
  });
  if (paths && paths[0]) {
    downloadFolder.value = paths[0];
  }
}

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
