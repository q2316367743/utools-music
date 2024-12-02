<template>
  <t-aside class="menu-side" :width="collapsed ? '70px' : '270px'">
    <t-menu width="200px" :value="active" @change="handleChange" :collapsed>
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
      <template #operations>
        <t-button class="t-demo-collapse-btn" variant="text" shape="square" @click="changeCollapsed">
          <template #icon>
            <view-list-icon />
          </template>
        </t-button>
      </template>
    </t-menu>
  </t-aside>
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
  SettingIcon, ViewListIcon
} from "tdesign-icons-vue-next";
import {collapsed} from "@/store/AppStore";

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

function changeCollapsed() {
  collapsed.value = !collapsed.value;
}

</script>
<style scoped lang="less">
</style>
