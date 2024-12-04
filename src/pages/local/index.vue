<template>
  <div class="local-music">
    <div class="container">
      <div class="local-music__header">
        <t-auto-complete :options style="width: 200px" placeholder="搜索本地音乐" v-model="keyword" :clearable="true"
                         :highlight-keyword="true" :filterable="true">
          <template #suffix-icon>
            <search-icon/>
          </template>
        </t-auto-complete>
        <t-space>
          <t-button size="small" v-if="checks.length > 0" @click="addMusicGroup">添加到歌单</t-button>
          <t-button size="small" shape="square" v-if="music" @click="setLocation(music)">
            <template #icon>
              <location-icon />
            </template>
          </t-button>
          <music-scanner/>
        </t-space>
      </div>
      <vxe-table :data="data" row-key :border="false" :height="maxHeight" empty-text="空空如也"
                 :scroll-y="{enabled: true, gt: 0}" :menu-config="menuConfig" :sort-config="sortConfig"
                 :row-config="{isCurrent: true, isHover: true, keyField: 'id'}" ref="table"
                 @cell-dblclick="handleRowDblclick" @menu-click="menuClickEvent" @checkbox-change="onCheckboxChange"
                 @checkbox-all="onCheckboxAll">
        <vxe-column type="checkbox" width="40"></vxe-column>
        <vxe-column sortable field="name" title="歌曲名" show-overflow="tooltip"/>
        <vxe-column sortable field="artist" title="演唱者" show-overflow="tooltip"/>
        <vxe-column sortable field="album" title="专辑" show-overflow="tooltip">
          <template #default="{ row }">
            {{ row.album || '-' }}
          </template>
        </vxe-column>
        <vxe-column field="duration" title="时长" :width="70">
          <template #default="{ row }">
            {{ prettyDateTime(row.duration) }}
          </template>
        </vxe-column>
        <vxe-column field="source" title="来源" :width="90" align="right">
          <template #default="{ row }">
            <t-tag size="small" theme="primary" v-if="row.source === MusicItemSource.LOCAL">本地</t-tag>
            <t-tag size="small" theme="primary" v-else-if="row.source === MusicItemSource.WEBDAV">WebDAV</t-tag>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <t-back-top container=".local-music .container .vxe-table--body-wrapper" style="bottom: 24px;right: 24px"/>
  </div>
</template>
<script lang="tsx" setup>
import {VxeTableEvents, VxeTableInstance, VxeTablePropTypes, VxeTableDefines} from "vxe-table";
import {LocationIcon, SearchIcon} from 'tdesign-icons-vue-next';
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

const size = useWindowSize();

const keyword = ref('');

const activeRowKeys = ref<Array<number>>([])
const checks = ref<Array<MusicItemView>>([]);


const musics = computed(() => useMusicStore().musics);
const maxHeight = computed(() => size.height.value - 106);
const options = computed(() => {
  const items = new Set<string>();
  musics.value.forEach(value => {
    items.add(value.name);
    items.add(value.artist);
    items.add(value.album);
  });
  return Array.from(items);
});

const {results} = useFuse<MusicItemView>(keyword, musics, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: ["name", "artist", "album"]
  }
});
const data = computed(() => results.value.map(e => e.item));


const tableInstance = useTemplateRef<VxeTableInstance<MusicItemView>>('table')
const sortConfig = ref<VxeTablePropTypes.SortConfig<MusicItemView>>({
  multiple: true
});
const menuConfig = reactive<VxeTablePropTypes.MenuConfig<MusicItemView>>({
  className: 'local-music-menu',
  body: {
    options: [
      [
        {code: 'edit', name: '编辑'},
        {code: 'next', name: '下一首播放'},
        {code: 'music-group', name: '添加到歌单'},
        {code: 'folder', name: '打开歌曲所在文件夹'}
      ],
    ]
  },
})

watch(music, val => {
  if (val) {
    activeRowKeys.value = [Number(val.id)];
  }
}, {immediate: true});

function handleRowDblclick(context: { row: MusicItemView }) {
  const {row} = context;
  const list = data.value;
  const index = data.value.findIndex(e => e.url === row.url);
  useMusicPlay.emit({
    views: list.map(e => e.source === MusicItemSource.LOCAL ? new MusicInstanceLocal(e) : new MusicInstanceWebDAV(e)),
    index: Math.max(index, 0)
  });
  tableInstance.value?.clearCurrentColumn();
}

const menuClickEvent: VxeTableEvents.MenuClick<MusicItemView> = ({menu, row}) => {
  switch (menu.code) {
    case 'edit':
      openLocalMusicEditDialog(row);
      break;
    case 'next':
      useMusicAppend.emit(new MusicInstanceLocal(row));
      break
    case 'music-group':
      musicGroupChoose([MusicGroupType.LOCAL])
        .then(id => {
          if (id > 0) {
            useMusicGroupStore().appendMusicGroup(id, row)
              .then(() => MessageUtil.success("添加成功"))
              .catch(e => MessageUtil.error("添加失败", e));
          }
        })
      break
    case 'folder':
      utools.shellShowItemInFolder(row.url)
      break
  }
}

function onCheckboxChange(e: VxeTableDefines.CheckboxChangeEventParams<MusicItemView>) {
  checks.value = e.$table.getCheckboxRecords();
}

function onCheckboxAll(e: VxeTableDefines.CheckboxAllEventParams<MusicItemView>) {
  checks.value = e.$table.getCheckboxRecords(true);
}

function addMusicGroup() {
  musicGroupChoose([MusicGroupType.LOCAL])
    .then(id => {
      if (id > 0) {
        useMusicGroupStore().appendMusicGroup(id, ...checks.value)
          .then(() => MessageUtil.success("添加成功"))
          .catch(e => MessageUtil.error("添加失败", e))
          .finally(() => {
            tableInstance.value?.clearCheckboxRow();
            checks.value = [];
          });
      }
    })
}

function setLocation(item: MusicInstance) {
  tableInstance.value?.scrollToRow(item.self);
  tableInstance.value?.setCurrentRow(item.self);
}
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

  }
}
</style>
