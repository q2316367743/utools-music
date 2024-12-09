<template>
  <div>
    <t-paragraph>
      <t-checkbox v-model="globalSetting.playDownload">边听边存</t-checkbox>
    </t-paragraph>
    <t-paragraph>
      <t-checkbox v-model="globalSetting.playAttachment">播放本地音乐自动匹配词图并下载</t-checkbox>
    </t-paragraph>
    <t-form-item label="播放失败时">
      <t-radio-group v-model="globalSetting.playError" :default-value="GlobalSettingPlayErrorType.NEXT">
        <t-radio label="下一曲" :value="GlobalSettingPlayErrorType.NEXT"></t-radio>
        <t-radio label="暂停" :value="GlobalSettingPlayErrorType.PAUSE"></t-radio>
      </t-radio-group>
    </t-form-item>
    <t-form-item label="默认播放质量" help="优先获取默认播放质量的音乐，如果不存在，再获取其他质量的音乐">
      <t-radio-group v-model="globalSetting.playQuality" default-value="super">
        <t-radio value="low" label="低"/>
        <t-radio value="standard" label="标准"/>
        <t-radio value="high" label="高"/>
        <t-radio value="super" label="极高"/>
      </t-radio-group>
    </t-form-item>
  </div>
</template>
<script lang="ts" setup>
import {globalSetting} from "@/store";
import {GlobalSettingPlayErrorType} from "@/entity/GlobalSetting";
</script>
<style scoped lang="less">

</style>
