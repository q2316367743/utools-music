<template>
  <div class="menu-side">
    <div class="side-menu">
      <menu-side-item v-model="active" value="local">本地音乐</menu-side-item>
      <menu-side-item v-model="active" value="download">下载管理</menu-side-item>
      <menu-side-item v-model="active" value="plugin">插件管理</menu-side-item>
      <menu-side-item v-model="active" value="lately">最近播放</menu-side-item>
    </div>
  </div>
</template>
<script lang="ts" setup>
import MenuSideItem from "@/components/MenuSide/MenuSideItem.vue";

const router = useRouter();

const active = ref('local');

watch(active, val => {
  router.push('/' + val);
})

</script>
<style scoped lang="less">
.menu-side {
  border-right: 1px solid var(--td-component-border);
}
</style>
