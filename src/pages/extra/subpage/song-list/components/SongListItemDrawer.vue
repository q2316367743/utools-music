<template>
  <t-drawer v-model:visible="visible" attach=".ranking" :header="false" :footer="false" :close-btn="true"
            size="100%" class="slid">
    <div class="song-list-item-drawer" v-if="item">
      <header class="song-list-item-drawer__header">
        <t-row :gutter="16">
          <t-col flex="200px">
            <div class="artwork">
              <t-image :src="item.artwork"/>
            </div>
          </t-col>
          <t-col flex="auto">
            <div class="info">
              <div>
                <div class="title">{{ item.title }}</div>
                <t-paragraph class="artist">
                  <t-space>
                    <t-tag theme="primary" v-if="item.artist">{{ item.artist }}</t-tag>
                    <t-tag theme="primary" v-if="item.playCount">播放量：{{ item.playCount }}</t-tag>
                  </t-space>
                </t-paragraph>
              </div>
            </div>
          </t-col>
        </t-row>
        <div class="operator">
          <t-space>
            <t-button>下载全部</t-button>
          </t-space>
        </div>
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
import {usePluginStore} from "@/store";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import {buildFromIMusicItem} from "@/entity/MusicItem";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useMusicPlay} from "@/global/Event";
import {getMusicItemFromPlugin} from "@/plugin/music";

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
const data = ref(new Array<IMusicItem>());
const loading = ref(false);

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
  data.value = [];
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
            data.value = musicList;
            isBottom.value = isEnd || true;
          })
          .catch(e => MessageUtil.error("获取歌单数据失败", e))
          .finally(() => loading.value = false);
      }
    }
  }
});


async function handleRowDblclickWrap(context: RowEventContext<TableRowData>) {
  const {item, url} = await getMusicItemFromPlugin(context, props.pluginId!);
  // 此处获取音频详情
  useMusicPlay.emit({
    index: 0,
    views: [buildFromIMusicItem(item, url)]
  })
}


function handleRowDblclick(context: RowEventContext<TableRowData>) {
  handleRowDblclickWrap(context)
    .then(() => MessageUtil.success("开始试听"))
    .catch(e => MessageUtil.error("播放失败", e))
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
    height: 170px;
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
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
