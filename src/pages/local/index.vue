<template>
  <div class="local-music">
    <div class="container">
      <div class="local-music__header">
        <t-input style="width: 200px" placeholder="搜索本地音乐" v-model="keyword" :clearable="true">
          <template #suffix-icon>
            <search-icon/>
          </template>
        </t-input>
        <music-scanner/>
      </div>
      <vxe-table :data="data" row-key :border="false" :height="maxHeight" empty-text="空空如也"
                 :scroll-y="{enabled: true, gt: 0}"
                 :menu-config="menuConfig" @menu-click="menuClickEvent" :row-config="{isCurrent: false, isHover: true}"
                 @cell-dblclick="handleRowDblclick">
        <vxe-column field="name" title="歌曲名" show-overflow="tooltip"/>
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
        <vxe-column field="source" title="来源" :width="60">
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
import MusicScanner from "@/pages/local/components/MusicScanner/MusicScanner.vue";
import {useMusicGroupStore, useMusicStore} from "@/store";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {useFuse} from "@vueuse/integrations/useFuse";
import {useMusicAppend, useMusicPlay} from "@/global/Event";
import {music} from "@/components/MusicPlayer/MusicPlayer";
import {SearchIcon} from 'tdesign-icons-vue-next';
import {MusicInstanceLocal} from "@/types/MusicInstance";
import {VxeTableEvents, VxeTablePropTypes} from "vxe-table";
import {musicGroupChoose} from "@/components/PluginManage/MusicGroupChoose";
import {MusicGroupType} from "@/entity/MusicGroup";
import MessageUtil from "@/utils/modal/MessageUtil";

const size = useWindowSize();

const keyword = ref('');
const activeRowKeys = ref<Array<number>>([])

const musics = computed(() => useMusicStore().musics);
const maxHeight = computed(() => size.height.value - 106);

const {results} = useFuse<MusicItemView>(keyword, musics, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: ["name", "artist", "album"]
  }
});
const data = computed(() => results.value.map(e => e.item));


const menuConfig = reactive<VxeTablePropTypes.MenuConfig<MusicItemView>>({
  className: 'local-music-menu',
  body: {
    options: [
      [
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
    views: list.map(e => new MusicInstanceLocal(e)),
    index: Math.max(index, 0)
  });
}

const menuClickEvent: VxeTableEvents.MenuClick<MusicItemView> = ({menu, row}) => {
  switch (menu.code) {
    case 'next':
      useMusicAppend.emit(new MusicInstanceLocal(row));
      break
    case 'music-group':
      musicGroupChoose([MusicGroupType.LOCAL])
        .then(id => {
          if (id > 0) {
            useMusicGroupStore().appendMusicGroup([id], row)
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
</script>
<style scoped lang="less">
.local-music {
  position: relative;
  height: 100%;
  width: 100%;

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
