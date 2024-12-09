<template>
  <div>
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
  </div>
</template>
<script lang="ts" setup>
import {globalSetting} from "@/store";
</script>
<style scoped lang="less">

</style>
