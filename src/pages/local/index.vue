<template>
  <div class="local-music">
    <div class="container">
      <div class="local-music__header">
        <t-auto-complete :options="options" style="width: 200px" placeholder="搜索本地音乐" v-model="keyword"
                         :clearable="true"
                         :highlight-keyword="true" :filterable="true">
          <template #suffix-icon>
            <search-icon/>
          </template>
        </t-auto-complete>
        <t-space size="small">
          <t-button size="small" v-if="checks.length > 0" @click="addMusicGroup">添加到歌单</t-button>
          <t-button size="small" shape="square" v-if="music" @click="setLocation(music)">
            <template #icon>
              <location-icon/>
            </template>
          </t-button>
          <t-button size="small" @click="toFolder" >
            <template #icon>
              <folder-icon/>
            </template>
          </t-button>
          <music-scanner/>
        </t-space>
      </div>
      <div class="table-container" ref="table-container">
        <table class="custom-table">
          <thead>
          <tr>
            <th>
              <input type="checkbox" :checked="checkAll" :indeterminate="indeterminate" @change="handleSelectAll"/>
            </th>
            <th>歌曲名</th>
            <th>演唱者</th>
            <th>专辑</th>
            <th>时长</th>
            <th>来源</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, index) in data" :key="row.id"
              @dblclick="handleRowDblclick(row)"
              @contextmenu.prevent="handleContextMenu($event, row)"
              :class="{ 'hover': hoveredIndex === index, active: index === currentIndex }"
              @mouseover="hoveredIndex = index"
              @mouseleave="hoveredIndex = null">
            <td>
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
            <td>{{ prettyDateTime(row.duration) }}</td>
            <td>
              <t-tag size="small" theme="primary" v-if="row.source === MusicItemSource.LOCAL">本地</t-tag>
              <t-tag size="small" theme="primary" v-else-if="row.source === MusicItemSource.WEBDAV">WebDAV</t-tag>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <t-back-top container=".local-music .container .table-container" style="bottom: 24px;right: 24px"/>
    </div>
  </div>
</template>
<script lang="tsx" setup>
import {FolderIcon, LocationIcon, SearchIcon} from 'tdesign-icons-vue-next';
import {useFuse} from "@vueuse/integrations/useFuse";
import {useMusicGroupStore, useMusicStore} from "@/store";
import {openLocalMusicEditDialog} from "@/pages/local/components/LocalMusicEdit";
import MusicScanner from "@/pages/local/components/MusicScanner/MusicScanner.vue";
import {musicGroupChoose} from "@/components/PluginManage/MusicGroupChoose";
import {music} from "@/components/MusicPlayer/MusicPlayer";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useMusicAppend, useMusicPlay} from "@/global/Event";
import {MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {MusicGroupType} from "@/entity/MusicGroup";
import {MusicInstanceLocal} from "@/music/MusicInstanceLocal";
import {MusicInstanceWebDAV} from "@/music/MusicInstanceWebDAV";
import {MusicInstance} from "@/types/MusicInstance";
import ContextMenu from '@imengyu/vue3-context-menu'

const router = useRouter();
const tableContainer = useTemplateRef<HTMLDivElement>('table-container');

const keyword = ref('');

const activeRowKeys = ref<Array<number>>([])
const checks = ref<Array<number>>([]);

const hoveredIndex = ref<number | null>(null);

const musics = computed(() => useMusicStore().musics);
const options = computed(() => {
  const items = new Set<string>();
  musics.value.forEach(value => {
    items.add(value.name);
    items.add(value.artist);
    items.add(value.album);
  });
  items.delete('');
  return Array.from(items);
});

const {results} = useFuse<MusicItemView>(keyword, musics, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: ["name", "artist", "album"]
  }
});


const data = computed(() => results.value.map(e => e.item));

const checkAll = computed(() => musics.value.length === checks.value.length);

const indeterminate = computed(() => !!(musics.value.length > checks.value.length && checks.value.length));


watch(music, val => {
  if (val) {
    activeRowKeys.value = [Number(val.id)];
  }
}, {immediate: true});

function handleRowDblclick(row: MusicItemView) {
  const list = data.value;
  const index = data.value.findIndex(e => e.url === row.url);
  useMusicPlay.emit({
    views: list.map(e => e.source === MusicItemSource.LOCAL ? new MusicInstanceLocal(e) : new MusicInstanceWebDAV(e)),
    index: Math.max(index, 0)
  });
}

function menuClickEvent(code: string, row: MusicItemView) {
  switch (code) {
    case 'edit':
      openLocalMusicEditDialog(row);
      break;
    case 'next':
      useMusicAppend.emit(new MusicInstanceLocal(row));
      break;
    case 'music-group':
      musicGroupChoose([MusicGroupType.LOCAL])
        .then(id => {
          if (id > 0) {
            useMusicGroupStore().appendMusicGroup(id, row)
              .then(() => MessageUtil.success("添加成功"))
              .catch(e => MessageUtil.error("添加失败", e));
          }
        });
      break;
    case 'folder':
      utools.shellShowItemInFolder(row.url);
      break;
  }
}

function handleSelectAll(e: Event) {
  console.log(e.target)
  if ((e.target as HTMLInputElement).checked) {
    checks.value = musics.value.map(e => e.id);
  } else {
    checks.value = [];
  }
}


function addMusicGroup() {
  musicGroupChoose([MusicGroupType.LOCAL])
    .then(id => {
      if (id > 0) {
        useMusicGroupStore().appendMusicGroup(id,
          ...musics.value.filter(e => checks.value.includes(e.id)))
          .then(() => MessageUtil.success("添加成功"))
          .catch(e => MessageUtil.error("添加失败", e))
          .finally(() => {
            checks.value = [];
          });
      }
    })
}

let timeout: ReturnType<typeof setTimeout> | null = null;
const currentIndex = ref(-1);

function setLocation(item: MusicInstance) {
  // 一个元素40
  const index = data.value.findIndex(e => e.id === Number(item.id));
  if (index >= 0) {
    tableContainer.value?.scrollTo({
      top: Math.max(index - 3, 0) * 40,
      left: 0,
      behavior: 'smooth'
    });
    currentIndex.value = index;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      currentIndex.value = -1
      timeout = null;
    }, 3000);
  }
}

function handleContextMenu(e: MouseEvent, row: MusicItemView) {
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: utools.isDarkColors() ? 'mac dark' : 'mac',
    items: [
      {
        label: "编辑",
        onClick: () => menuClickEvent('edit', row)
      },
      {
        label: "下一首播放",
        onClick: () => menuClickEvent('next', row)
      },
      {
        label: "添加到歌单",
        onClick: () => menuClickEvent('music-group', row)
      },
      {
        label: "打开歌曲所在文件夹",
        onClick: () => menuClickEvent('folder', row)
      },
    ]
  })
}

const toFolder = () => router.push('/local/folder')
</script>
<style scoped lang="less">
.local-music {
  position: relative;
  height: 100%;
  width: 100%;
  contain: strict;

  .container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    padding-top: 6px;

    .local-music__header {
      margin-bottom: 8px;
      padding-left: 8px;
      padding-right: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-container {
      height: calc(100% - 42px);
      overflow-y: auto;
      border: 1px solid var(--music-bg-color-3);

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
            cursor: pointer;
            border-bottom: 1px solid var(--td-border-level-2-color);
          }
        }

        tbody {
          tr {
            border-bottom: 1px solid var(--td-border-level-2-color);

            &.active {
              animation: flashBackground 1s linear infinite;
            }

            &.hover {
              background-color: var(--music-bg-color-6);
            }

            &:last-child {
              border-bottom: none;
            }

            td {
              padding: 8px;
              max-width: 150px;
            }
          }
        }
      }

    }
  }
}

@keyframes flashBackground {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: var(--td-text-color-brand);
  }
}
</style>
