<template>
  <div class="music-group-info-wrapper">
    <div class="music-group-info">
      <header class="music-group-info__header">
        <div class="artwork">
          <img :src="info?.cover || MusicGroupImage" :alt="info?.name"/>
        </div>
        <div class="info">
          <div class="title">{{ info?.name }}</div>
          <div class="artist">{{ info?.author }}</div>
        </div>
      </header>
      <div class="music-group-info__operator">
        <t-space>
          <t-button theme="primary" @click="playAll">播放全部</t-button>
        </t-space>
        <t-input :clearable="true" style="width: 200px" placeholder="请输入关键字" v-model="keyword">
          <template #suffix-icon>
            <search-icon/>
          </template>
        </t-input>
      </div>
      <main class="music-group-info__container">
        <table class="custom-table">
          <thead>
          <tr>
            <th>歌曲名</th>
            <th>演唱者</th>
            <th>专辑</th>
            <th>时长</th>
            <th>来源</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, index) in data" :key="row.id"
              @dblclick="handleRowDblclick({ row, rowIndex: index })"
              @contextmenu.prevent="menuClickEvent($event, row, index)"
              :class="{ 'hover': hoveredIndex === index, active: index === currentIndex }"
              @mouseover="hoveredIndex = index"
              @mouseleave="hoveredIndex = null">
            <td>
              <div class="ellipsis" :title="row.name || row.title">{{ row.name || row.title }}</div>
            </td>
            <td>
              <div class="ellipsis" :title="row.artist">{{ row.artist }}</div>
            </td>
            <td>
              <div class="ellipsis" :title="row.album || '-'">{{ row.album || '-' }}</div>
            </td>
            <td>{{ prettyDateTime(row.duration) }}</td>
            <td>
              <t-tag size="small" theme="primary" v-if="info?.type === MusicGroupType.WEB">
                {{ subStr(pluginMap.get(info?.pluginId)?.name || '未知', 4) }}
              </t-tag>
              <t-tag size="small" theme="primary" v-if="info?.type === MusicGroupType.MIX">
                {{ subStr(pluginMap.get(row.pluginId)?.name || '未知', 4) }}
              </t-tag>
              <t-tag size="small" theme="primary" v-if="row.source === MusicItemSource.LOCAL">本地</t-tag>
              <t-tag size="small" theme="primary" v-else-if="row.source === MusicItemSource.WEBDAV">WebDAV</t-tag>
            </td>
          </tr>
          </tbody>
        </table>
      </main>
      <t-back-top container=".music-group-info" style="right: 16px;bottom: 16px;"/>
    </div>
    <div class="close">
      <t-button variant="text" shape="square" size="large" @click="handleClose">
        <template #icon>
          <close-icon/>
        </template>
      </t-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {MusicGroupIndex, MusicGroupType} from "@/entity/MusicGroup";
import {useMusicGroupStore, usePluginStore} from "@/store";
import MusicGroupImage from "@/assets/image/music-group.png";
import {CloseIcon, SearchIcon} from "tdesign-icons-vue-next";
import {useFuse} from "@vueuse/integrations/useFuse";
import {MusicItemSource} from "@/entity/MusicItem";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {
  handleMenuClickEvent, handleMusicGroupAll,
  handleMusicGroupDblclick,
  buildMusicGroupMenuConfig
} from "@/pages/music-group/info/MusicGroupEvent";
import {map} from "@/utils/lang/ArrayUtil";
import {subStr} from "@/utils/lang/FieldUtil";

const route = useRoute();
const router = useRouter();

const id: number = Number(route.params.id as string);

const info = ref<MusicGroupIndex>();
const items = ref<Array<any>>([])

const keyword = ref('');

const {results} = useFuse(keyword, items, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: ['title', 'artist', 'album'],
  }
});

const data = computed(() => results.value.map(e => e.item));
const musicGroupMenuConfig = computed(() => buildMusicGroupMenuConfig(info.value));
const pluginMap = computed(() => map(usePluginStore().plugins, 'id', (a, b) => b));

function init() {
  const {musicGroups, loadMusicItems} = useMusicGroupStore()
  info.value = musicGroups.find(e => e.id === id);
  loadMusicItems(id).then(res => items.value = res);
}

onMounted(init);

const hoveredIndex = ref<number | null>(null);
const currentIndex = ref(-1);

function handleRowDblclick(context: { row: any, rowIndex: number }) {
  const {rowIndex} = context;
  handleMusicGroupDblclick(info.value!, rowIndex, data.value);
}

const menuClickEvent = (e: MouseEvent, row: any, rowIndex: number) => {
  handleMenuClickEvent({e, row, rowIndex}, info.value!, init);
}

function playAll() {
  handleMusicGroupAll(info.value!, data.value);
}

const handleClose = () => router.back();
</script>

<style scoped lang="less">
@import "@/pages/music-group/info/music-group-info.less";

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

@keyframes flashBackground {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: var(--td-text-color-brand);
  }
}
</style>
