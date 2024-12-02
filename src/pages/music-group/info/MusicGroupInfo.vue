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
        <vxe-table :data="data" row-key :border="false" empty-text="空空如也"
                   :row-config="{isCurrent: false, isHover: true, keyField: 'id'}" :menu-config="musicGroupMenuConfig"
                   @menu-click="menuClickEvent" @cell-dblclick="handleRowDblclick">
          <vxe-column field="name" title="歌曲名" show-overflow="tooltip">
            <template #default="{row}">
              {{ row.name || row.title }}
            </template>
          </vxe-column>
          <vxe-column field="artist" title="演唱者" show-overflow="tooltip"/>
          <vxe-column field="album" title="专辑" show-overflow="tooltip">
            <template #default="{ row }">
              {{ row.album || '-' }}
            </template>
          </vxe-column>
          <vxe-column field="duration" title="时长" :width="70">
            <template #default="{ row }">
              {{ prettyDateTime(row.duration) }}
            </template>
          </vxe-column>
          <vxe-column field="source" title="来源" :width="100">
            <template #default="{ row }">
              <t-tag size="small" theme="primary" v-if="info?.type === MusicGroupType.WEB">
                {{ subStr(pluginMap.get(info?.pluginId)?.name || '未知', 4) }}
              </t-tag>
              <t-tag size="small" theme="primary" v-if="info?.type === MusicGroupType.MIX">
                {{ subStr(pluginMap.get(row.pluginId)?.name || '未知', 4) }}
              </t-tag>
              <t-tag size="small" theme="primary" v-if="row.source === MusicItemSource.LOCAL">本地</t-tag>
              <t-tag size="small" theme="primary" v-else-if="row.source === MusicItemSource.WEBDAV">WebDAV</t-tag>
            </template>
          </vxe-column>
        </vxe-table>
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
import {VxeTableEvents} from "vxe-table";
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


function handleRowDblclick(context: { row: any, rowIndex: number }) {
  const {rowIndex} = context;
  handleMusicGroupDblclick(info.value!, rowIndex, data.value);
}

const menuClickEvent: VxeTableEvents.MenuClick = (params) => {
  handleMenuClickEvent(params, info.value!, init);
}

function playAll() {
  handleMusicGroupAll(info.value!, data.value);
}

const handleClose = () => router.back();
</script>
<style scoped lang="less">
@import "@/pages/music-group/info/music-group-info.less";
</style>
