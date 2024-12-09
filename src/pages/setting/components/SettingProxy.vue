<template>
  <div>
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
  </div>
</template>
<script lang="ts" setup>
import {globalSetting} from "@/store";
</script>
<style scoped lang="less">

</style>
