<template>
  <t-drawer v-model:visible="visible" attach=".ranking" :header="false" :footer="false" :close-btn="true"
            size="100%" class="slid">
    <t-loading :loading text="加载中..." style="height: 100%">
      <div class="ranking-drawer" v-if="sheet" @scroll="onScroll">
        <header class="ranking-drawer__header">
          <div class="artwork">
            <t-image :src="sheet.coverImg" v-if="sheet.coverImg" :alt="sheet.title"/>
            <music-icon v-else/>
          </div>
          <div class="info">
            <div class="title">{{ sheet.title }}</div>
            <t-paragraph class="desc">歌曲数：{{ data.length }}</t-paragraph>
            <t-paragraph class="desc ellipsis-3">{{ sheet.description }}</t-paragraph>
          </div>
        </header>
        <div class="ranking-drawer__operator">
          <t-space>
            <t-button theme="primary" size="small" :disabled="empty" @click="playAll">播放全部</t-button>
            <t-button theme="success" size="small" :disabled="true">下载全部</t-button>
            <t-button theme="warning" size="small" :disabled="empty" @click="collectionAll">收藏榜单</t-button>
          </t-space>
          <t-input :clearable="true" style="width: 200px" placeholder="请输入关键字" v-model="keyword">
            <template #suffix-icon>
              <search-icon/>
            </template>
          </t-input>
        </div>
        <main>
          <t-base-table row-key="id" :data="data" :columns="columns" :bordered="false" :loading
                        :hover="true" size="small" active-row-type="single"
                        @row-dblclick="handleRowDblclick"/>
        </main>
        <t-back-top container=".ranking-drawer"/>
      </div>
    </t-loading>
  </t-drawer>
</template>
<script lang="ts" setup>
import {IMusicItem, IMusicSheetItem} from "@/types/PluginInstance";
import {BaseTableCol, RowEventContext, TableRowData} from "tdesign-vue-next";
import {useMusicGroupStore, usePluginStore} from "@/store";
import {prettyDateTime} from "@/utils/lang/FormatUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useMusicPlay} from "@/global/Event";
import {MusicIcon, SearchIcon} from "tdesign-icons-vue-next";
import {useFuse} from "@vueuse/integrations/useFuse";
import {MusicGroupType} from "@/entity/MusicGroup";
import {isEmptyString} from "@/utils/lang/StringUtil";
import {createMusicListItemByWeb} from "@/music/MusicUtil";

const visible = defineModel({
  type: Boolean
});
const props = defineProps({
  item: {
    type: Object as PropType<IMusicSheetItem>
  },
  pluginId: {
    type: Number,
    default: 0
  }
});

useEventListener(document, "keydown", e => {
  if (e.code === 'Escape') {
    if (visible.value) {
      e.preventDefault();
      e.stopPropagation();
      visible.value = false;
    }
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
        const {getTopListDetail} = pluginInstance.instance;
        loading.value = true
        getTopListDetail && getTopListDetail(item, page.value)
          .then(res => {
            const {isEnd, musicList, topListItem} = res;
            sheet.value = Object.assign(item, topListItem);
            items.value = musicList || [];
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
    views: [createMusicListItemByWeb(musicItem, props.pluginId!)]
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
    views: data.value.map(e => createMusicListItemByWeb(e, props.pluginId!))
  })
}

function collectionAll() {
  const plugin = usePluginStore().plugins.find(e => e.id === props.pluginId);
  useMusicGroupStore().postMusicGroup({
    pluginId: props.pluginId!,
    type: MusicGroupType.WEB,
    id: Date.now(),
    name: `${plugin?.name}-${sheet.value?.title}`,
    cover: props.item?.coverImg,
    author: props.item?.artist,
    nativeId: '',
    items: data.value
  }).then(() => MessageUtil.success("收藏成功"))
    .catch(e => MessageUtil.error("收藏失败", e))
}


async function onBottomWrap() {
  const {pluginId, item} = props;
  if (!item) {
    return;
  }
  const {pluginInstances} = usePluginStore();
  for (let pluginInstance of pluginInstances) {
    if (pluginInstance.id === pluginId) {
      const {getTopListDetail} = pluginInstance.instance;
      loading.value = true
      getTopListDetail && getTopListDetail(item, page.value)
        .then(res => {
          const {isEnd, musicList, topListItem} = res;
          sheet.value = Object.assign(item, topListItem);
          items.value = musicList || [];
          isBottom.value = isEnd || true;
        })
        .catch(e => MessageUtil.error("获取榜单数据失败", e))
        .finally(() => loading.value = false);
      return;
    }
  }
  return Promise.reject(new Error("该插件不支持榜单"))
}

function onBottom() {
  if (loading.value) return;
  if (isBottom.value) return;
  if (isEmptyString(keyword.value)) return;
  loading.value = true;
  page.value += 1;
  onBottomWrap()
    .then(() => MessageUtil.success("加载完成"))
    .catch(e => {
      MessageUtil.error("加载失败", e);
      items.value = [];
    })
    .finally(() => loading.value = false)
}

function onScroll(e: Event) {
  const target = e.target as HTMLDivElement;
  if (target.scrollHeight - target.scrollTop - target.offsetHeight < 20) {
    onBottom();
  }
}

</script>
<style scoped lang="less">
.ranking-drawer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;


  &__header {
    position: relative;

    .artwork {
      width: 170px;
      height: 170px;
      border-radius: var(--td-radius-default);
      overflow: hidden;
      position: relative;
    }

    .info {
      position: absolute;
      top: 0;
      left: 180px;
    }


    .title {
      font-size: var(--td-font-size-title-large);
    }

    .desc {
      color: var(--td-text-color-secondary);
      font-size: var(--td-font-size-body-small);
    }

  }

  &__operator {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  main {
    margin-top: 8px;
  }
}
</style>
