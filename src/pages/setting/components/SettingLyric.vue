<template>
  <div>
    <t-form-item label="字体大小">
      <t-input-number :clearable="true" v-model="globalSetting.lyricFontSize"></t-input-number>
    </t-form-item>
    <t-form-item label=字体>
      <t-select v-model="nativeSetting.lyricFontFamily" :options :loading="ffLoading" loading-text="字体获取中"
                style="width: 300px"/>
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
  </div>
</template>
<script lang="ts" setup>
import {globalSetting, nativeSetting} from "@/store";
import {SelectOption} from "tdesign-vue-next/es/select/type";
import MessageUtil from "@/utils/modal/MessageUtil";

const options = ref(new Array<SelectOption>());
const ffLoading = ref(true);


onMounted(() => {
  window.preload.lib.getFonts()
    .then(res => options.value = res.map(s => ({
      label: s,
      value: s
    })))
    .catch(e => MessageUtil.error("获取字体失败", e))
    .finally(() => ffLoading.value = false);
})
</script>
<style scoped lang="less">

</style>
