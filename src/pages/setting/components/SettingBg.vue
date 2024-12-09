<template>
  <div>
    <t-form-item label="背景类型">
      <t-radio-group v-model="nativeSetting.bgType">
        <t-radio value="none">默认</t-radio>
        <t-radio value="color">纯色</t-radio>
        <t-radio value="linearGradient">渐变</t-radio>
        <t-radio value="image">图片</t-radio>
      </t-radio-group>
    </t-form-item>
    <t-form-item v-if="nativeSetting.bgType === 'color'" label="背景颜色">
      <t-color-picker-panel :clearable="true" v-model="nativeSetting.bgColor"
                            :color-modes="['monochrome']" :swatch-colors="[]" :recent-colors="false"
                            :enable-alpha="true"></t-color-picker-panel>
    </t-form-item>
    <t-form-item v-else-if="nativeSetting.bgType === 'linearGradient'" label="渐变颜色">
      <t-color-picker-panel :clearable="true" v-model="nativeSetting.bgGradient"
                            :color-modes="['linear-gradient']" :swatch-colors="[]" :recent-colors="false"
                            :enable-alpha="true"></t-color-picker-panel>
    </t-form-item>
    <t-form-item v-else-if="nativeSetting.bgType === 'image'" label="背景图片">
      <file-input v-model="nativeSetting.bgImage" title="请选择背景图片" type="image"
                  placeholder="支持网络url和本地文件"/>
    </t-form-item>
    <t-form-item v-if="nativeSetting.bgType === 'image'" label="模糊范围">
      <t-slider v-model="nativeSetting.bgBlur" :min="0" :max="75" style="width: 300px;margin-left: 8px"/>
    </t-form-item>
  </div>
</template>
<script lang="ts" setup>
import {nativeSetting} from "@/store";
</script>
<style scoped lang="less">

</style>
