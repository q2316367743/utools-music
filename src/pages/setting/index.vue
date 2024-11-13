<template>
  <t-form :data="globalSetting" label-align="top" class="global-setting">
    <t-tabs v-model="active">
      <t-tab-panel label="下载" value="download" style="padding: 8px">
        <t-form-item label="音乐下载目录">
          <t-input-group style="min-width: 400px">
            <t-input :disabled="true" v-model="globalSetting.downloadFolder"/>
            <t-button theme="primary" @click="updateDownloadFolder">
              <template #icon>
                <t-icon name="file"/>
              </template>
            </t-button>
          </t-input-group>
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
      <t-tab-panel label="关于" value="about" style="padding: 8px">
        <about/>
      </t-tab-panel>
    </t-tabs>
  </t-form>
</template>
<script lang="ts" setup>
import {globalSetting} from "@/store";
import About from "@/pages/setting/about.vue";

const active = ref('download');

function updateDownloadFolder() {
  const paths = utools.showOpenDialog({
    title: '请选择音乐保存位置',
    defaultPath: utools.getPath("music"),
    properties: ['openDirectory'],
    buttonLabel: '下载'
  });
  if (paths && paths[0]) {
    globalSetting.value.downloadFolder = paths[0];
  }
}

</script>
<style scoped lang="less">
.global-setting {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
