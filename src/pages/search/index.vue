<template>
  <div class="music-search">
    <t-loading text="正在加载中" :loading="playLoading">
      <div class="music-search__header">
        <t-input :clearable="true" v-model="keyword" @enter="search" placeholder="请输入关键字，回车搜索"
                 :disabled="loading || !active">
          <template #suffix-icon>
            <t-icon name="search"></t-icon>
          </template>
        </t-input>
      </div>
      <div class="music-search__tab">
        <!-- 每一个插件 -->
        <t-radio-group v-model="active">
          <t-space>
            <t-radio v-for="plugin in plugins" :key="plugin.id" :label="plugin.name" :value="plugin.id">
            </t-radio>
          </t-space>
        </t-radio-group>
      </div>
      <t-base-table :data :columns :bordered="false" :height="maxHeight" row-key="id" :loading
                    :loading-props="{ text: '正在搜索中' }"
                    :hover="true" size="small" :scroll="{ type: 'virtual', rowHeight: 39 }"
                    @row-dblclick="handleRowDblclick">
        <template #empty>
          <t-empty title="空空如也" style="margin-top: 25vh"></t-empty>
        </template>
      </t-base-table>
    </t-loading>
  </div>
</template>
<script lang="ts" setup>
import {IMusicItem, PluginInstanceInfo, PluginInstanceSearch} from "@/types/PluginInstance";
import {usePluginStore, useDownloadStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isNotEmptyArray} from "@/utils/lang/FieldUtil";
import {BaseTableCellParams, BaseTableCol, Button, RowEventContext, TableRowData} from "tdesign-vue-next";
import {useMusicAppend, useMusicPlay} from "@/global/Event";
import {buildFromIMusicItem} from "@/entity/MusicItem";

interface PluginTab {
  id: number;
  name: string;
  search: PluginInstanceSearch,
  info?: PluginInstanceInfo
}

interface IMusicItemWrap extends IMusicItem {
  keyword: string;
  pluginId: number
}

interface MusicInfo {
  item: IMusicItemWrap,
  url: string
}

const size = useWindowSize();

const keyword = ref('');
const page = ref(1);
const active = ref(0);
const data = ref(new Array<IMusicItemWrap>());
const loading = ref(false);

const playLoading = ref(false);
const operatorLoading = ref(false);

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
        disabled: operatorLoading.value,
        onClick() {
          handleNextPlay(context);
        }
      }, () => '下一曲'),
      h(Button, {
          theme: 'primary',
          variant: 'text',
          disabled: operatorLoading.value,
          onClick() {
            handleDownloadWrap(context)
          }
        },
        () => '下载')
    ])
  }
}]

const plugins = ref<Array<PluginTab>>([]);
const maxHeight = computed(() => size.height.value - 100);

async function initPlugin() {
  const {instanceMap} = usePluginStore();
  if (instanceMap.size === 0) {
    plugins.value = [];
    return;
  }
  const res = new Array<PluginTab>()
  instanceMap.forEach((instance, id) => {
    if (instance.search) {
      res.push({
        id: id,
        search: instance.search,
        name: instance.platform,
        info: instance.getMusicInfo
      })
    }
  });
  if (isNotEmptyArray(res)) {
    active.value = res[0].id;
  }

  plugins.value = res;
}

async function searchWrap() {
  for (let pluginTab of plugins.value) {
    if (pluginTab.id === active.value) {
      // 搜索
      const rsp = await pluginTab.search(keyword.value, page.value, 'music');
      data.value = rsp.data.map(e => ({
        ...e,
        keyword: keyword.value,
        pluginId: pluginTab.id
      }));
      return;
    }
  }
  return Promise.reject(new Error("该插件不支持搜索"))
}

function search() {
  loading.value = true;
  searchWrap()
    .then(() => MessageUtil.success("搜索完成"))
    .catch(e => {
      MessageUtil.error("搜索失败", e);
      data.value = [];
    })
    .finally(() => loading.value = false)
}

async function getMusicItem(context: RowEventContext<TableRowData> | BaseTableCellParams<TableRowData>): Promise<MusicInfo> {
  let musicItem = context.row as IMusicItemWrap;
  for (let plugin of plugins.value) {
    if (plugin.id === musicItem.pluginId) {
      if (plugin.info) {
        const info = await plugin.info(musicItem);
        if (info) {
          musicItem = Object.assign(musicItem, info);
        }
      }
      break;
    }
  }
  let url: string
  if (!musicItem.url) {
    return Promise.reject(new Error("音乐链接不存在"));
  }
  url = musicItem.url;
  return {item: musicItem, url}
}

async function handleRowDblclickWrap(context: RowEventContext<TableRowData>) {
  const {item, url} = await getMusicItem(context);
  // 此处获取音频详情
  useMusicPlay.emit({
    index: 0,
    views: [buildFromIMusicItem(item, url)]
  })
}


function handleRowDblclick(context: RowEventContext<TableRowData>) {
  playLoading.value = true;
  handleRowDblclickWrap(context)
    .catch(e => MessageUtil.error("播放失败", e))
    .finally(() => playLoading.value = false);
}

async function handleNextPlayWrap(context: BaseTableCellParams<TableRowData>) {
  const {item, url} = await getMusicItem(context);
  useMusicAppend.emit(buildFromIMusicItem(item, url))
}

function handleNextPlay(context: BaseTableCellParams<TableRowData>) {
  operatorLoading.value = true
  handleNextPlayWrap(context)
    .catch(e => MessageUtil.error("播放失败", e))
    .finally(() => operatorLoading.value = false);
}

async function handleDownload(context: BaseTableCellParams<TableRowData>) {
  const {item, url} = await getMusicItem(context);
  const view = buildFromIMusicItem(item, url);
  useDownloadStore().emit(view)
  // 跳转插件
  // utools.redirect(['下载器', '下载链接'], url.replace(/\s+/, ''));
  // if (view.cover) {
  //   utools.redirect(['下载器', '下载链接'], view.cover.replace(/\s+/, ''));
  // }
  // if (view.lyric) {
  //   utools.redirect(['下载器', '下载链接'], view.lyric.replace(/\s+/, ''));
  // }
}

function handleDownloadWrap(context: BaseTableCellParams<TableRowData>) {
  operatorLoading.value = true
  handleDownload(context)
    .catch(e => MessageUtil.error("下载失败", e))
    .finally(() => operatorLoading.value = false);

}

watch(() => usePluginStore().plugins, () => initPlugin(), {
  immediate: true,
  deep: true
})
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
  }
}
</style>
