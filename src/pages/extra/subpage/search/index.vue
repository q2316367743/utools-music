<template>
  <div class="music-search">
    <t-loading text="正在加载中" :loading="playLoading">
      <div class="music-search__header">
        <t-input-group style="width: 100%">
          <t-input :clearable="true" v-model="keyword" @enter="search" placeholder="请输入关键字，回车搜索"
                   :disabled="loading || !active" @clear="onClear">
            <template #suffix-icon>
              <search-icon/>
            </template>
          </t-input>
          <t-select style="width: 150px" v-model="active">
            <t-option v-for="plugin in plugins" :key="plugin.id" :label="plugin.name" :value="plugin.id">
            </t-option>
          </t-select>
        </t-input-group>
      </div>
      <t-base-table v-if="data.length>0" :data :columns :bordered="false" :height="maxHeight" row-key="id" :loading
                    :loading-props="{ text: '正在搜索中' }"
                    :hover="true" size="small" :scroll="{ type: 'virtual', rowHeight: 39 }"
                    @row-dblclick="handleRowDblclick" @scroll="onScroll">
      </t-base-table>
      <t-empty v-else title="搜你所想(￣▽￣)／" style="margin-top: 27vh"></t-empty>
    </t-loading>
    <t-back-top v-if="data.length>0" container=".music-search .t-table__content" style="bottom: 24px;right: 24px"/>
  </div>
</template>
<script lang="ts" setup>
import {BaseTableCellParams, BaseTableCol, Button, RowEventContext, TableRowData} from "tdesign-vue-next";
import {SearchIcon} from "tdesign-icons-vue-next";
import {IMusicItem} from "@/types/PluginInstance";
import {usePluginStore, useDownloadStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useMusicAppend, useMusicPlay} from "@/global/Event";
import {buildFromIMusicItem} from "@/entity/MusicItem";
import {PluginInstanceView} from "@/entity/PluginEntity";
import {getMusicItemFromPlugin} from "@/plugin/music";
import {isEmptyString} from "@/utils/lang/StringUtil";
import {createMusicListItemByWeb} from "@/music/MusicUtil";

interface IMusicItemWrap extends IMusicItem {
  keyword: string;
  pluginId: number
}

const size = useWindowSize();

const keyword = ref('');
const page = ref(1);
const active = ref(0);
const data = ref(new Array<IMusicItemWrap>());
const isBottom = ref(false);
const loading = ref(false);

const playLoading = ref(false);


const plugins = computed<Array<PluginInstanceView>>(() => {
  return usePluginStore().pluginInstances.filter(e => {
    const {supportedSearchType, search} = e.instance;
    if (!search) {
      // 没有搜索方法是一定不行的
      return false;
    }
    if (supportedSearchType) {
      // 如果指定了支持的搜索类型，就要去判断
      return supportedSearchType.indexOf('music') !== -1;
    }
    return true
  });
});

const maxHeight = computed(() => size.height.value - 108);

const columns: Array<BaseTableCol> = [{
  colKey: 'title',
  title: '名称',
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
  colKey: 'operator',
  title: '操作',
  width: 160,
  cell: (h, context) => {
    return h('div', {}, [
      h(Button, {
        theme: 'success',
        variant: 'text',
        onClick() {
          handleNextPlay(context);
        }
      }, () => '下一曲'),
      h(Button, {
          theme: 'primary',
          variant: 'text',
          onClick() {
            handleDownloadWrap(context)
          }
        },
        () => '下载')
    ])
  }
}]

watch(active, val => {
  if (val && keyword.value) {
    search();
  }
})


async function searchWrap() {
  for (let pluginTab of plugins.value) {
    if (pluginTab.id === active.value) {
      // 搜索
      const rsp = await pluginTab.instance.search!(keyword.value, page.value, 'music');
      const items = rsp.data.map(e => ({
        ...e,
        keyword: keyword.value,
        pluginId: pluginTab.id
      }));
      data.value.push(...items);
      isBottom.value = !!rsp.isEnd;
      return;
    }
  }
  return Promise.reject(new Error("该插件不支持搜索"))
}

function onClear() {
  loading.value = false;
  isBottom.value = false;
  data.value = [];
  page.value = 1;
}

function search() {
  if (loading.value) return;
  if (isEmptyString(keyword.value)) return;
  loading.value = true;
  isBottom.value = false;
  data.value = [];
  page.value = 1;
  searchWrap()
    .then(() => MessageUtil.success("搜索完成"))
    .catch(e => {
      MessageUtil.error("搜索失败", e);
      data.value = [];
    })
    .finally(() => loading.value = false)
}

async function handleRowDblclickWrap(context: RowEventContext<TableRowData>) {
  let musicItem = context.row as IMusicItemWrap;
  // 此处获取音频详情
  useMusicPlay.emit({
    index: Math.max(data.value.findIndex(e => e.id === musicItem.id), 0),
    views: data.value.map(e => createMusicListItemByWeb(e, e.pluginId))
  })
}


function handleRowDblclick(context: RowEventContext<TableRowData>) {
  playLoading.value = true;
  handleRowDblclickWrap(context)
    .catch(e => MessageUtil.error("播放失败", e))
    .finally(() => playLoading.value = false);
}

async function handleNextPlayWrap(context: BaseTableCellParams<TableRowData>) {
  let musicItem = context.row as IMusicItemWrap;
  useMusicAppend.emit(createMusicListItemByWeb(musicItem, musicItem.pluginId))
}

function handleNextPlay(context: BaseTableCellParams<TableRowData>) {
  handleNextPlayWrap(context)
    .catch(e => MessageUtil.error("播放失败", e))
}

async function handleDownload(context: BaseTableCellParams<TableRowData>) {
  let musicItem = context.row as IMusicItemWrap;
  const {item, url} = await getMusicItemFromPlugin(context, musicItem.pluginId);
  useDownloadStore().emit(buildFromIMusicItem(item, url))
}

function handleDownloadWrap(context: BaseTableCellParams<TableRowData>) {
  handleDownload(context)
    .catch(e => MessageUtil.error("下载失败", e))
}

watch(plugins, value => {
  active.value = value[0] ? value[0].id : 0;
}, {
  immediate: true,
  deep: true
});

async function onBottomWrap() {
  for (let pluginTab of plugins.value) {
    if (pluginTab.id === active.value) {
      // 搜索
      const rsp = await pluginTab.instance.search!(keyword.value, page.value, 'music');
      const items = rsp.data.map(e => ({
        ...e,
        keyword: keyword.value,
        pluginId: pluginTab.id
      }));
      data.value.push(...items);
      isBottom.value = !!rsp.isEnd;
      return;
    }
  }
  return Promise.reject(new Error("该插件不支持搜索"))
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
      data.value = [];
    })
    .finally(() => loading.value = false)
}

function onScroll(params: { e: WheelEvent }) {
  const {e} = params;
  const target = e.target as HTMLDivElement;

  if (target.scrollHeight - target.scrollTop - target.offsetHeight < 20) {
    onBottom();
  }
}
</script>
<style scoped lang="less">
.music-search {
  position: relative;
  height: 100%;
  width: 100%;

  &__header {
    padding: 8px;
  }

  &__tab {
    padding: 0 8px 8px;
    border-bottom: 1px solid var(--td-component-border);
    overflow-x: auto;
    overflow-y: hidden;
  }
}
</style>
