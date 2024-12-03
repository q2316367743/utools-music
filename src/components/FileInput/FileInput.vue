<template>
  <t-input-group class="w-full">
    <t-input v-model="modelValue" :clearable="true" :disabled="true"></t-input>
    <t-button @click="handleClick">选择文件</t-button>
  </t-input-group>
</template>
<script lang="ts" setup>
const modelValue = defineModel({
  type: String
});
const props = defineProps({
  title: {
    type: String,
    default: () => ("请选择文件")
  }
});

function handleClick() {
  const paths = utools.showOpenDialog({
    title: props.title,
    properties: ['openFile'],
    buttonLabel: '选择',
    defaultPath: utools.getPath('music')
  });
  if (paths && paths[0]) {
    modelValue.value = paths[0];
  }
}
</script>
<style scoped lang="less">

</style>
