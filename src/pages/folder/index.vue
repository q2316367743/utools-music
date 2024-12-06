<template>
  <div class="folder-music">
    <t-tooltip v-for="item in folders" :key="item.dir" :content="item.dir">
      <div class="folder-music-item">
        <div class="folder-music-item-content">
          <div class="cover">
            <folder-icon size="86px"/>
          </div>
          <div class="title">{{ item.folder }}</div>
        </div>
      </div>
    </t-tooltip>
  </div>
</template>

<script lang="ts" setup>
import {useMusicStore} from "@/store";
import {getFolder} from "@/utils/lang/FieldUtil";
import {FolderIcon} from "tdesign-icons-vue-next";

const musics = computed(() => useMusicStore().musics);
const folders = computed(() => {
  const map = new Map<string, string>();
  musics.value.forEach(music => {
    // 本地音乐
    const dir = music.dir || window.preload.path.dirname(music.url);
    // 从目录中获取文件夹名
    const folder = music.folder || getFolder(dir);
    map.set(dir, folder);
  });
  return Array.from(map.entries()).map(([dir, folder]) => ({dir, folder}));
});

</script>

<style scoped lang="less">
.folder-music {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  justify-items: center;

  .folder-music-item {
    width: 120px;
    height: 120px;
    border-radius: var(--td-radius-default);
    border: 1px dashed var(--td-component-stroke);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;

    &:hover {
      background: rgba(var(--td-brand-color-rgb), 0.1);
      border-color: var(--td-brand-color);
      transform: scale(0.98);
    }

    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--td-text-color-secondary);

      :deep(.t-icon) {
        font-size: 24px;
      }

      span {
        font-size: 13px;
      }
    }
  }
}
</style>
