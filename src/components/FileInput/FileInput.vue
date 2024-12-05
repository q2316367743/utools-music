<template>
  <t-input-group class="w-full">
    <t-input v-model="modelValue" :clearable="true" :placeholder></t-input>
    <t-button @click="handleClick">选择文件</t-button>
  </t-input-group>
</template>
<script lang="ts" setup>
import {IMAGE_EXTNAME, MUSIC_EXTNAME} from "@/global/Constant";

const modelValue = defineModel({
  type: String
});
const props = defineProps({
  title: {
    type: String,
    default: () => ("请选择文件")
  },
  type: {
    type: String as PropType<'' |'image'>,
    default: ''
  },
  placeholder: String
});

function handleClick() {
  let filters = [{
    name: '音乐文件',
    extensions: MUSIC_EXTNAME.map(e => e.substring(1))
  }];
  let defaultPath = utools.getPath('music');
  if (props.type === 'image') {
    defaultPath = utools.getPath('pictures')
    filters = [{
      name: '图片文件',
      extensions: IMAGE_EXTNAME.map(e => e.substring(1))
    }];
  }
  const paths = utools.showOpenDialog({
    title: props.title,
    properties: ['openFile'],
    buttonLabel: '选择',
    defaultPath,
    filters
  });
  if (paths && paths[0]) {
    modelValue.value = paths[0];
  }
}
</script>
<style scoped lang="less">

</style>
