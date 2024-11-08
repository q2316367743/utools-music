<template>
  <t-card class="local-music" title="本地音乐">
    <template #actions>
      <music-scanner/>
    </template>
    <div class="container">
      <div class="local-music__header">
        <t-input style="width: 200px" placeholder="搜索本地音乐" v-model="keyword" :clearable="true">
          <template #suffix-icon>
            <t-icon name="search"/>
          </template>
        </t-input>
      </div>
      <t-base-table row-key="id" :data="data" :columns="columns" :bordered="false" :height="maxHeight"
                    :hover="true" size="small" :scroll="{ type: 'virtual', rowHeight: 39 }"
                    @row-dblclick="handleRowDblclick">
      </t-base-table>
    </div>
    <t-back-top container=".local-music .container .t-table__content"/>
  </t-card>
</template>
<script lang="tsx" setup>
import MusicScanner from "@/pages/local/components/MusicScanner/MusicScanner.vue";
import {useMusicStore} from "@/store/module/MusicStore";
import {BaseTableCol, RowEventContext, TableRowData} from "tdesign-vue-next";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {useFuse} from "@vueuse/integrations/useFuse";
import {useMusicPlay} from "@/global/Event";

const size = useWindowSize();

useMusicStore().init();

const keyword = ref('');

const musics = computed(() => useMusicStore().musics);
const maxHeight = computed(() => size.height.value - 162);

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
  ellipsis: true
}, {
  colKey: 'artist',
  title: '演唱者',
  ellipsis: true
}, {
  colKey: 'album',
  title: '专辑',
  ellipsis: true
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

function handleRowDblclick(context: RowEventContext<TableRowData>) {
  const {row} = context;
  const list = data.value;
  const index = data.value.findIndex(e => e.url === row.url);
  useMusicPlay.emit({
    views: list,
    index: Math.max(index, 1)
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
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;

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
