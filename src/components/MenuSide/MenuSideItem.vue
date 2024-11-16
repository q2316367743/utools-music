<template>
  <div class="side-menu-item" :class="{active: active.startsWith(value || '')}" @click="onClick">
    <slot/>
  </div>
</template>
<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

const active = computed(() => route.path);
const props = defineProps({
  value: String,
});

function onClick() {
  router.push(props.value!);
}
</script>
<style scoped lang="less">
.side-menu-item {
  padding: 16px;
  cursor: pointer;
  border-left: 6px solid transparent;

  &.active {
    color: var(--td-brand-color);
    border-left: 6px solid var(--td-brand-color);
    background-color: var(--td-bg-color-component-hover);

    &:hover {
      background-color: var(--td-bg-color-component-hover);
    }
  }

  &:hover {
    background-color: var(--td-bg-color-component);
  }
}
</style>
