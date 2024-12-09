<template>
  <div class="folder-music-container">
    <header class="page-header">
      <div class="left">
        <t-button theme="primary" variant="text" shape="circle" @click="goBack">
          <template #icon>
            <arrow-left-icon/>
          </template>
        </t-button>
        <div class="title">文件夹</div>
      </div>
    </header>

    <div class="content">
      <div class="folder-music">
        <t-tooltip v-for="item in folders" :key="item.dir" :content="item.dir">
          <div class="folder-music-item" @click="jumpTo(item.dir)">
            <div class="folder-music-item-content">
              <div class="cover">
                <folder-icon size="86px"/>
              </div>
              <div class="title ellipsis">{{ item.folder }}</div>
            </div>
          </div>
        </t-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useMusicStore} from "@/store";
import {getFolder} from "@/utils/lang/FieldUtil";
import {FolderIcon, ArrowLeftIcon} from "tdesign-icons-vue-next";

const router = useRouter();

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

const jumpTo = (dir: string) => router.push({
  path: '/local/folder/info',
  query: {
    dir
  }
})

const goBack = () => {
  router.push('/local');
};

</script>

<style scoped lang="less">
.folder-music-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    height: 56px;
    box-sizing: border-box;

    .left {
      display: flex;
      align-items: center;
    }
  }

  .title {
    font-size: var(--td-font-title-medium);
    font-weight: bold;
    color: var(--td-text-color-primary);
    margin-left: 8px;
  }

  .content {
    flex: 1;
    overflow: hidden;
  }

  .folder-music {
    position: relative;
    height: 100%;
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
        .title {
          overflow-x: hidden;
          width: 100px;
          text-align: center;
        }
      }
    }
  }
}
</style>
