<template>
  <div class="menu-side">
    <t-menu width="200px" :value="active" @change="handleChange">
      <t-menu-item value="/local">
        <template #icon>
          <folder-icon/>
        </template>
        本地音乐
      </t-menu-item>
      <t-menu-item value="/music-group/list">
        <template #icon>
          <music-icon/>
        </template>
        我的歌单
      </t-menu-item>
      <t-submenu value="/extra" title="在线音乐">
        <template #icon>
          <internet-icon/>
        </template>
        <t-menu-item value="/extra/plugin">
          <template #icon>
            <app-icon/>
          </template>
          插件管理
        </t-menu-item>
        <t-menu-item value="/extra/ranking">
          <template #icon>
            <chart-combo-icon/>
          </template>
          排行榜
        </t-menu-item>
        <t-menu-item value="/extra/song-list">
          <template #icon>
            <root-list-icon/>
          </template>
          热门歌单
        </t-menu-item>
        <t-menu-item value="/extra/search">
          <template #icon>
            <search-icon/>
          </template>
          音乐搜索
        </t-menu-item>
        <t-menu-item value="/extra/download">
          <template #icon>
            <download-icon/>
          </template>
          下载管理
        </t-menu-item>
      </t-submenu>
      <t-menu-item value="/setting">
        <template #icon>
          <setting-icon/>
        </template>
        设置
      </t-menu-item>
      <t-menu-item value="/about">
        <template #icon>
          <info-circle-icon/>
        </template>
        关于
      </t-menu-item>
    </t-menu>
  </div>
</template>
<script lang="ts" setup>
import {MenuValue} from "tdesign-vue-next";
import {
  AppIcon, ChartComboIcon,
  DownloadIcon,
  FolderIcon, InfoCircleIcon, InternetIcon,
  MusicIcon,
  RootListIcon,
  SearchIcon,
  SettingIcon
} from "tdesign-icons-vue-next";

const route = useRoute();
const router = useRouter();

const active = computed(() => {
  const {path} = route
  if (`${path}`.startsWith("/music-group")) {
    return '/music-group/list'
  }
  return path;
});

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
