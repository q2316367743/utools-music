<template>
  <div class="menu-side">
    <div class="side-menu">
      <menu-side-item value="/local">本地音乐</menu-side-item>
      <menu-side-item value="/music-group">我的歌单</menu-side-item>
      <t-divider style="margin: 16px 0"/>
      <menu-side-item value="/plugin">插件管理</menu-side-item>
      <menu-side-item value="/search">音乐搜索</menu-side-item>
      <menu-side-item value="/download">下载管理</menu-side-item>
      <t-divider style="margin: 16px 0" />
      <menu-side-item value="/setting">设置</menu-side-item>
    </div>
    <t-divider style="margin: 16px 0"/>
  </div>
</template>
<script lang="ts" setup>
import MenuSideItem from "@/components/MenuSide/MenuSideItem.vue";


</script>
<style scoped lang="less">
.menu-side {
  position: relative;
  width: 100%;
  height: 100%;
  border-right: 1px solid var(--td-component-border);
  overflow: auto;
}
</style>
