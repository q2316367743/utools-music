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
  sub: Boolean
});

const paddingLeft = computed(() => {
  return props.sub ? '32px' : '16px';
})

function onClick() {
  router.push(props.value!);
}
</script>
<style scoped lang="less">
.side-menu-item {
  cursor: pointer;
  border-left: 6px solid transparent;
  padding: 16px 16px 16px v-bind(paddingLeft);

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
