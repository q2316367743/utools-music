<template>
  <t-drawer v-model:visible="visible" attach=".song-list" :header="false" :footer="false" :close-btn="true"
            size="100%" class="slid">
    <div class="song-list-item-drawer" v-if="sheet">
      <header class="song-list-item-drawer__header">
        <t-row>
          <t-col flex="180px">
            <div class="artwork">
              <t-image :src="sheet.artwork || MusicGroupImage" :alt="sheet.title"/>
            </div>
          </t-col>
          <t-col flex="auto">
            <div class="info">
              <div>
                <div class="title">{{ sheet.title }}</div>
                <t-paragraph class="artist">
                  <t-space>
                    <t-tag theme="primary" v-if="sheet.artist">{{ sheet.artist }}</t-tag>
                    <t-tag theme="primary" v-if="sheet.playCount">播放量：{{ sheet.playCount }}</t-tag>
                  </t-space>
                </t-paragraph>
              </div>
            </div>
          </t-col>
          <t-col :span="12">
            <div class="operator">
              <t-space>
                <t-button theme="primary" size="small" :disabled="empty" @click="playAll">播放全部</t-button>
                <t-button theme="success" size="small" :disabled="true">下载全部</t-button>
                <t-button theme="warning" size="small" :disabled="empty" @click="collectionAll">收藏歌单</t-button>
              </t-space>
              <t-input :clearable="true" style="width: 200px" placeholder="请输入关键字" v-model="keyword">
                <template #suffix-icon>
                  <search-icon/>
                </template>
              </t-input>
            </div>
          </t-col>
        </t-row>
      </header>
      <main>
        <t-base-table row-key="id" :data="data" :columns="columns" :bordered="false" :loading
                      :hover="true" size="small" active-row-type="single"
                      @row-dblclick="handleRowDblclick"></t-base-table>
      </main>
      <t-back-top container=".song-list-item-drawer"/>
    </div>
  </t-drawer>
</template>
<script lang="ts" setup>
import {IMusicItem, IMusicSheetItem} from "@/types/PluginInstance";
import {BaseTableCol, RowEventContext, TableRowData} from "tdesign-vue-next";
import {useMusicGroupStore, usePluginStore} from "@/store";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useMusicPlay} from "@/global/Event";
import {SearchIcon} from "tdesign-icons-vue-next";
import {useFuse} from "@vueuse/integrations/useFuse";
import {MusicInstanceWeb} from "@/types/MusicInstance";
import {MusicGroupType} from "@/entity/MusicGroup";
import MusicGroupImage from '@/assets/image/music-group.png';

const visible = defineModel({
  type: Boolean
});
const props = defineProps({
  item: {
    type: Object as PropType<IMusicSheetItem>
  },
  pluginId: {
    type: Number
  }
});

const page = ref(1);
const isBottom = ref(false);
const sheet = ref<IMusicSheetItem>();
const items = ref(new Array<IMusicItem>());
const loading = ref(false);
const keyword = ref('');

const {results} = useFuse(keyword, items, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: ['title', 'artist', 'album'],
  }
});

const data = computed(() => results.value.map(e => e.item));
const empty = computed(() => data.value.length === 0);

const columns: Array<BaseTableCol> = [{
  colKey: 'title',
  title: '标题',
  ellipsis: true
}, {
  colKey: 'artist',
  title: '作者',
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
    return row.duration ? prettyDateTime(row.duration) : '-';
  }
}]

watch(visible, val => {
  sheet.value = undefined;
  items.value = [];
  isBottom.value = true;
  const {pluginId, item} = props;
  if (val && item) {
    const {pluginInstances} = usePluginStore();
    for (let pluginInstance of pluginInstances) {
      if (pluginInstance.id === pluginId) {
        const {getMusicSheetInfo} = pluginInstance.instance;
        loading.value = true
        getMusicSheetInfo && getMusicSheetInfo(item, page.value)
          .then(res => {
            const {isEnd, musicList, sheetItem} = res;
            sheet.value = Object.assign(item, sheetItem);
            items.value = musicList;
            isBottom.value = isEnd || true;
          })
          .catch(e => MessageUtil.error("获取歌单数据失败", e))
          .finally(() => loading.value = false);
      }
    }
  }
});


async function handleRowDblclickWrap(context: RowEventContext<TableRowData>) {
  let musicItem = context.row as IMusicItem;
  // 此处获取音频详情
  useMusicPlay.emit({
    index: 0,
    views: [new MusicInstanceWeb(musicItem, props.pluginId!)]
  })
}


function handleRowDblclick(context: RowEventContext<TableRowData>) {
  handleRowDblclickWrap(context)
    .then(() => MessageUtil.success("开始试听"))
    .catch(e => MessageUtil.error("播放失败", e))
}

function playAll() {
  useMusicPlay.emit({
    index: 0,
    views: data.value.map(e => new MusicInstanceWeb(e, props.pluginId!))
  })
}

function collectionAll() {
  console.log(props.item)
  useMusicGroupStore().postMusicGroup({
    pluginId: props.pluginId!,
    type: MusicGroupType.WEB,
    id: Date.now(),
    name: props.item?.title || ('歌单-' + props.item?.id),
    cover: props.item?.artwork,
    author: props.item?.artist,
    nativeId: '',
    items: data.value
  }).then(() => MessageUtil.success("收藏成功"))
    .catch(e => MessageUtil.error("收藏失败", e))
}

</script>
<style scoped lang="less">
.song-list-item-drawer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;


  &__header {
    width: 100%;
    position: relative;

    .artwork {
      width: 170px;
      height: 170px;
      border-radius: var(--td-radius-default);
      overflow: hidden;
    }

    .title {
      font-size: var(--td-font-size-title-large);
    }

    .artist {
      margin-top: 16px;
    }

    .info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    .operator {
      margin-top: 8px;
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
  main {
    margin-top: 8px;
  }
}
</style>
