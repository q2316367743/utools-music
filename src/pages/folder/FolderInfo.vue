<template>
  <div class="folder-info">
    <header class="page-header">
      <div class="left">
        <t-button theme="primary" variant="text" shape="circle" @click="goBack">
          <template #icon>
            <arrow-left-icon/>
          </template>
        </t-button>
        <div class="title">{{ dir }}</div>
      </div>
      <t-button size="small" v-if="checks.length > 0" @click="addMusicGroup">添加到歌单</t-button>
    </header>
    <div class="content">
      <div class="table-container" ref="tableContainer">
        <table class="custom-table">
          <thead>
          <tr>
            <th style="width: 40px;">
              <input type="checkbox" :checked="checkAll" :indeterminate="indeterminate" @change="handleSelectAll"/>
            </th>
            <th>歌曲名</th>
            <th>演唱者</th>
            <th>专辑</th>
            <th style="width: 80px;">时长</th>
            <th style="width: 48px;">来源</th>
          </tr>
          </thead>
        </table>

        <RecycleScroller
          class="scroller"
          :items="musicList"
          :item-size="41"
          key-field="id"
          v-slot="{ item: row, index }"
        >
          <tr
            :key="row.id"
            @dblclick="handlePlay(row)"
            @contextmenu.prevent="handleContextMenu($event, row)"
            :class="{ 'hover': hoveredIndex === index }"
            @mouseover="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          >
            <td style="width: 40px;">
              <input type="checkbox" :value="row.id" v-model="checks"/>
            </td>
            <td>
              <div class="ellipsis" :title="row.name">{{ row.name }}</div>
            </td>
            <td>
              <div class="ellipsis" :title="row.artist">{{ row.artist }}</div>
            </td>
            <td>
              <div class="ellipsis" :title="row.album || '-'">{{ row.album || '-' }}</div>
            </td>
            <td style="width: 80px;">{{ prettyDateTime(row.duration) }}</td>
            <td style="width: 48px;text-align: right;">
              <t-tag size="small" theme="primary" v-if="row.source === MusicItemSourceEnum.LOCAL">本地</t-tag>
              <t-tag size="small" theme="primary" v-else-if="row.source === MusicItemSourceEnum.WEBDAV">WebDAV</t-tag>
            </td>
          </tr>
        </RecycleScroller>
      </div>
    </div>
    <t-back-top container=".folder-info .content .table-container .scroller" style="bottom: 24px;right: 24px"/>
  </div>
</template>

<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router';
import {ArrowLeftIcon} from "tdesign-icons-vue-next";
import {useMusicStore} from "@/store";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {MusicItemView} from "@/entity/MusicItem";
import {useMusicPlay} from "@/global/Event";
import {musicGroupChoose} from "@/components/PluginManage/MusicGroupChoose";
import {MusicGroupType} from "@/entity/MusicGroup";
import {useMusicGroupStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import ContextMenu from '@imengyu/vue3-context-menu'
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";
import {RecycleScroller} from 'vue-virtual-scroller'
import {createMusicListItemByLocal} from "@/music/MusicUtil";

const route = useRoute();
const router = useRouter();
const dir = route.query.dir as string;

const hoveredIndex = ref<number | null>(null);
const tableContainer = ref<HTMLDivElement>();

const musics = computed(() => useMusicStore().musics);
const musicList = computed(() => {
  return musics.value.filter(music => {
    const musicDir = music.dir || window.preload.path.dirname(music.url);
    return musicDir === dir;
  });
});

const checks = ref<Array<number>>([]);

const checkAll = computed(() => musicList.value.length === checks.value.length);
const indeterminate = computed(() => !!(musicList.value.length > checks.value.length && checks.value.length));

function handleSelectAll(e: Event) {
  if ((e.target as HTMLInputElement).checked) {
    checks.value = musicList.value.map(e => e.id);
  } else {
    checks.value = [];
  }
}

function addMusicGroup() {
  musicGroupChoose([MusicGroupType.LOCAL])
    .then(id => {
      if (id > 0) {
        useMusicGroupStore().appendMusicGroup(id,
          ...musicList.value.filter(e => checks.value.includes(e.id)))
          .then(() => MessageUtil.success("添加成功"))
          .catch(e => MessageUtil.error("添加失败", e))
          .finally(() => {
            checks.value = [];
          });
      }
    })
}

const goBack = () => {
  router.go(-1);
};

const handlePlay = (row: MusicItemView) => {
  const index = musicList.value.findIndex(e => e.url === row.url);
  useMusicPlay.emit({
    views: musicList.value.map(e => createMusicListItemByLocal(e)),
    index: Math.max(index, 0)
  });
};

const handleContextMenu = (e: MouseEvent, row: MusicItemView) => {
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: utools.isDarkColors() ? 'mac dark' : 'mac',
    items: [
      {
        label: "播放",
        onClick: () => handlePlay(row)
      },
      {
        label: "添加到歌单",
        onClick: () => handleAddToPlaylist(row)
      },
      {
        label: "打开歌曲所在文件夹",
        onClick: () => utools.shellShowItemInFolder(row.url)
      },
    ]
  })
};

const handleAddToPlaylist = (row: MusicItemView) => {
  musicGroupChoose([MusicGroupType.LOCAL])
    .then(id => {
      if (id > 0) {
        useMusicGroupStore().appendMusicGroup(id, row)
          .then(() => MessageUtil.success("添加成功"))
          .catch(e => MessageUtil.error("添加失败", e));
      }
    });
};
</script>

<style scoped lang="less">
.folder-info {
  height: 100%;
  display: flex;
  flex-direction: column;

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
    padding: 8px;

    .table-container {
      height: 100%;
      overflow: hidden;
      border: 1px solid var(--music-bg-color-3);
      display: flex;
      flex-direction: column;

      .custom-table {
        width: 100%;
        border-collapse: collapse;

        thead {
          background-color: var(--music-bg-color-6);
          position: sticky;
          top: 0;
          z-index: 1;

          th {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid var(--td-border-level-2-color);
          }
        }
      }

      .scroller {
        flex: 1;
        overflow-x: hidden;

        :deep(tr) {
          display: flex;
          border-bottom: 1px solid var(--td-border-level-2-color);

          &.hover {
            background-color: var(--music-bg-color-6);
          }

          &:last-child {
            border-bottom: none;
          }

          td {
            padding: 8px;
            flex: 1;
            max-width: 150px;

            .ellipsis {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            &:first-child {
              flex: 0 0 40px;
              padding-left: 16px;
            }

            &:nth-child(5) {
              flex: 0 0 80px;
            }

            &:last-child {
              flex: 0 0 48px;
            }
          }
        }
      }
    }
  }
}
</style>
