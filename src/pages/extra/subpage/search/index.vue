<template>
  <div class="music-search">
    <t-loading text="正在加载中" :loading="playLoading">
      <div class="music-search__header">
        <t-input-group style="width: 100%">
          <t-input :clearable="true" v-model="keyword" @enter="search" placeholder="请输入关键字，回车搜索"
                   :disabled="loading || !active">
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
import {BaseTableCellParams, BaseTableCol, Button, RowEventContext, TableRowData} from "tdesign-vue-next";
import {SearchIcon} from "tdesign-icons-vue-next";
import {IMusicItem} from "@/types/PluginInstance";
import {usePluginStore, useDownloadStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useMusicAppend, useMusicPlay} from "@/global/Event";
import {buildFromIMusicItem} from "@/entity/MusicItem";
import {PluginInstanceView} from "@/entity/PluginEntity";
import {getMusicItemFromPlugin} from "@/plugin/music";

interface IMusicItemWrap extends IMusicItem {
  keyword: string;
  pluginId: number
}

const size = useWindowSize();

const keyword = ref('');
const page = ref(1);
const active = ref(0);
const data = ref(new Array<IMusicItemWrap>());
const loading = ref(false);

const playLoading = ref(false);
const operatorLoading = ref(false);


const plugins = computed<Array<PluginInstanceView>>(() => {
  return usePluginStore().pluginInstances.filter(e => !!e.instance.search);
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

async function handleRowDblclickWrap(context: RowEventContext<TableRowData>) {
  let musicItem = context.row as IMusicItemWrap;
  const {item, url} = await getMusicItemFromPlugin(context, musicItem.pluginId);
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
  let musicItem = context.row as IMusicItemWrap;
  const {item, url} = await getMusicItemFromPlugin(context, musicItem.pluginId);
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

watch(plugins, value => {
  active.value = value[0] ? value[0].id : 0;
}, {
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
    overflow-x: auto;
    overflow-y: hidden;
  }
}
</style>
