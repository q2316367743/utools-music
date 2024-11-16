<template>
  <div class="extra-tool">
    <div class="extra-tool-item" @click="to('plugin')">
      <div class="extra-tool-item__title">
        <list-icon size="40px"/>
      </div>
      <div class="extra-tool-item__content">
        插件管理
      </div>
    </div>
    <div class="extra-tool-item" @click="to('search')">
      <div class="extra-tool-item__title">
        <search-icon size="40px"/>
      </div>
      <div class="extra-tool-item__content">
        音乐搜索
      </div>
    </div>
    <div class="extra-tool-item" @click="to('download')">
      <div class="extra-tool-item__title">
        <cloud-download-icon size="40px"/>
      </div>
      <div class="extra-tool-item__content">
        下载管理
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ListIcon, CloudDownloadIcon, SearchIcon} from 'tdesign-icons-vue-next';

const router = useRouter();

function to(name: string) {
  router.push(`/extra/${name}`);
}
</script>
<style scoped lang="less">
.extra-tool {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;

  .extra-tool-item {
    width: 100px;
    height: 100px;
    margin: 8px;
    padding: 8px;
    cursor: pointer;
    border-radius: var(--td-radius-default);
    box-shadow: var(--td-shadow-1);
    transition: 0.5s;

    &:hover {
      background-color: var(--td-bg-color-component-hover);
      box-shadow: var(--td-shadow-3);
    }

    &__title {
      width: 80px;
      height: 60px;
      padding: 10px 20px 0 20px;
      margin: 0 10px;
    }

    &__content {
      width: 100%;
      height: 20px;
      text-align: center;
    }
  }
}
</style>
