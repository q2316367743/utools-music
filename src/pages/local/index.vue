<template>
  <div class="local-music">
    <div class="container">
      <div class="local-music__header">
        <t-input style="width: 200px" placeholder="搜索本地音乐" v-model="keyword" :clearable="true">
          <template #suffix-icon>
            <t-icon name="search"/>
          </template>
        </t-input>
        <music-scanner/>
      </div>
      <t-table row-key="id" :data="data" :columns="columns" :bordered="false" :height="maxHeight"
               :hover="true" size="small" :scroll="{ type: 'virtual', rowHeight: 39 }" active-row-type="single"
               :active-row-keys="activeRowKeys" @row-dblclick="handleRowDblclick">
      </t-table>
    </div>
    <t-back-top container=".local-music .container .t-table__content" style="bottom: 24px;right: 24px"/>
  </div>
</template>
<script lang="tsx" setup>
import MusicScanner from "@/pages/local/components/MusicScanner/MusicScanner.vue";
import {useMusicStore} from "@/store";
import {BaseTableCol, RowEventContext, TableRowData} from "tdesign-vue-next";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {useFuse} from "@vueuse/integrations/useFuse";
import {useMusicPlay} from "@/global/Event";
import {music} from "@/components/MusicPlayer/MusicPlayer";

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
const data = computed(() => results.value.map(e => e.item))

const columns: Array<BaseTableCol> = [{
  colKey: 'name',
  title: '歌曲名',
  ellipsis: true,
}, {
  colKey: 'artist',
  title: '演唱者',
  ellipsis: true,
}, {
  colKey: 'album',
  title: '专辑',
  ellipsis: true,
}, {
  colKey: 'duration',
  title: '时长',
  width: 70,
  cell: (h, {row}) => {
    return prettyDateTime(row.duration);
  }
}, {
  colKey: 'source',
  title: '来源',
  width: 60,
  cell: (h, {row}) => {
    const {source} = row;
    let text = '';
    if (source === MusicItemSource.LOCAL) {
      text = '本地';
    } else if (source === MusicItemSource.WEBDAV) {
      text = 'WebDAV';
    }
    return <t-tag size="small" theme="primary">
      <span>{text}</span>
    </t-tag>

  }
}];

watch(music, val => {
  if (val) {
    activeRowKeys.value = [val.id];
  }
}, {immediate: true});

function handleRowDblclick(context: RowEventContext<TableRowData>) {
  const {row} = context;
  const list = data.value;
  const index = data.value.findIndex(e => e.url === row.url);
  useMusicPlay.emit({
    views: list,
    index: Math.max(index, 0)
  });
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
