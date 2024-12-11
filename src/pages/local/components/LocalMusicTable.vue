<template>
  <div class="local-music-table">
    <table class="custom-table">
      <thead>
        <tr>
          <th style="width: 40px;">
            <input type="checkbox" :checked="checkAll" :indeterminate="indeterminate" @change="handleSelectAll" />
          </th>
          <th>歌曲名</th>
          <th>演唱者</th>
          <th>专辑</th>
          <th>时长</th>
          <th style="width: 48px;">来源</th>
        </tr>
      </thead>
    </table>

    <RecycleScroller
      ref="scroller"
      class="scroller"
      :items="data"
      :item-size="41"
      key-field="id"
      v-slot="{ item: row, index }"
    >
      <tr :key="row.id" @dblclick="handleRowDblclick(row)" @contextmenu.prevent="handleContextMenu($event, row)"
        :class="{ 'hover': hoveredIndex === index, active: index === currentIndex }" @mouseover="hoveredIndex = index"
        @mouseleave="hoveredIndex = null">
        <td style="width: 40px;">
          <input type="checkbox" :value="row.id" v-model="checks" />
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
        <td style="width: 48px;text-align: right;">
          <t-tag size="small" theme="primary" v-if="row.source === MusicItemSourceEnum.LOCAL">本地</t-tag>
          <t-tag size="small" theme="primary" v-else-if="row.source === MusicItemSourceEnum.WEBDAV">WebDAV</t-tag>
          <t-tag size="small" theme="primary" v-else-if="row.source === MusicItemSourceEnum.A_LIST">AList</t-tag>
        </td>
      </tr>
    </RecycleScroller>
    <t-back-top container=".local-music-table .scroller" style="bottom: 24px;right: 24px"/>
  </div>
</template>

<script lang="ts" setup>
import { MusicItemView } from "@/entity/MusicItem";
import { prettyDateTime } from "@/utils/lang/FormatUtil";
import { useMusicAppend, useMusicPlay } from "@/global/Event";
import { MusicInstanceLocal } from "@/music/MusicInstanceLocal";
import { openLocalMusicEditDialog } from "@/pages/local/components/LocalMusicEdit";
import { musicGroupChoose } from "@/components/PluginManage/MusicGroupChoose";
import { MusicGroupType } from "@/entity/MusicGroup";
import { useMusicGroupStore } from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import ContextMenu from "@imengyu/vue3-context-menu";
import { createMusicInstance } from "@/music/MusicUtil";
import { MusicItemSourceEnum } from "@/entity/MusicItemSourceEnum";
import { RecycleScroller } from 'vue-virtual-scroller'
import { BackTop as TBackTop } from 'tdesign-vue-next';

const checks = defineModel({
  type: Object as PropType<Array<number>>,
  default: []
})

const props = defineProps({
  musics: {
    type: Object as PropType<Array<MusicItemView>>,
    default: []
  },
  data: {
    type: Object as PropType<Array<MusicItemView>>,
    default: []
  },
  currentIndex: {
    type: Number,
    default: -1
  }
});

const hoveredIndex = ref<number | null>(null);

const checkAll = computed(() => props.musics.length === checks.value.length);

const indeterminate = computed<boolean>(() => (props.musics.length > checks.value.length && checks.value.length > 0));

const scroller = ref<InstanceType<typeof RecycleScroller>>();

// 对外暴露滚动方法
defineExpose({
  scrollTo: (options: ScrollToOptions) => {
    scroller.value?.$el.scrollTo(options);
  }
});

function handleRowDblclick(row: MusicItemView) {
  const list = props.data;
  const index = props.data.findIndex(e => e.url === row.url);
  useMusicPlay.emit({
    views: list.map(e => createMusicInstance(e)),
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
    checks.value = props.musics.map(e => e.id);
  } else {
    checks.value = [];
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
</script>

<style scoped lang="less">
.local-music-table {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

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
      border-bottom: 1px solid var(--td-border-level-1-color);
    }
  }
}

.scroller {
  flex: 1;
  overflow-x: hidden;

  :deep(tr) {
    display: flex;
    border-bottom: 1px solid var(--td-border-level-1-color);

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
      flex: 1;
      max-width: 150px;

      &:first-child {
        flex: 0 0 40px;
      }

      &:nth-child(5) {
        flex: 0 0 80px;
      }

      &:last-child {
        flex: 0 0 80px;
      }
    }
  }
}

@keyframes flashBackground {

  0%,
  100% {
    background-color: transparent;
  }

  50% {
    background-color: var(--td-text-color-brand);
  }
}
</style>
