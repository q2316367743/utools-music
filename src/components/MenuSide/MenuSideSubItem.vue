<template>
  <div class="side-menu-sub-item">
    <div class="side-menu-item" @click="handleClick">{{ name }}</div>
    <div class="side-menu-item-icon">
      <caret-up-small-icon v-if="open"/>
      <caret-down-small-icon v-else/>
    </div>
    <slot v-if="open"/>
  </div>
</template>
<script lang="ts" setup>
import {CaretDownSmallIcon, CaretUpSmallIcon} from 'tdesign-icons-vue-next';

defineProps({
  name: {
    type: String,
    default: ''
  }
});

const open = ref(false);

function handleClick() {
  open.value = !open.value;
}
</script>
<style scoped lang="less">
.side-menu-sub-item {
  position: relative;

  .side-menu-item {
    padding: 16px;
    cursor: pointer;
    border-left: 6px solid transparent;
    user-select: none;

    &:hover {
      background-color: var(--td-bg-color-component);
    }

  }

  .side-menu-item-icon {
    position: absolute;
    top: 16px;
    right: 8px;
  }
}
</style>
