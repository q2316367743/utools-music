<template>
  <div class="menu-side">
    <t-menu width="200px" :value="active" @change="handleChange">
      <t-menu-item value="/local">
        本地音乐
      </t-menu-item>
      <t-menu-item value="/music-group">
        我的歌单
      </t-menu-item>
      <t-submenu value="/extra" title="拓展工具">
        <t-menu-item value="/extra/plugin">插件管理</t-menu-item>
        <t-menu-item value="/extra/song-list">热门歌单</t-menu-item>
        <t-menu-item value="/extra/search">音乐搜索</t-menu-item>
        <t-menu-item value="/extra/download">下载管理</t-menu-item>
      </t-submenu>
      <t-menu-item value="/setting">
        设置
      </t-menu-item>
    </t-menu>
  </div>
</template>
<script lang="ts" setup>
import {MenuValue} from "tdesign-vue-next";

const route = useRoute();
const router = useRouter();

const active = computed(() => route.path);

function handleChange(e: MenuValue) {
  router.push(e + '');
}

</script>
<style scoped lang="less">
.menu-side {
  position: relative;
  width: 100%;
  height: 100%;
  border-right: 1px solid var(--td-component-border);
  overflow: auto;
  z-index: 1;
}
</style>
