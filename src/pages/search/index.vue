<template>
  <div class="music-search">
    <div class="music-search__header">
      <t-input :clearable="true" v-model="keyword" @enter="search" placeholder="请输入关键字，回车搜索" :disabled="loading">
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
                  :hover="true" size="small" :scroll="{ type: 'virtual', rowHeight: 39 }">
      <template #empty>
        <t-empty title="空空如也" style="margin-top: 25vh"></t-empty>
      </template>
    </t-base-table>
  </div>
</template>
<script lang="ts" setup>
import {IMusicItem} from "@/types/PluginInstance";
import {usePluginStore} from "@/store/module/PluginStore";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isEmptyArray} from "@/utils/lang/FieldUtil";
import {BaseTableCol} from "tdesign-vue-next";

interface PluginTab {
  id: number;
  name: string;
}

const size = useWindowSize();

const keyword = ref('');
const page = ref(1);
const active = ref(0);
const data = ref(new Array<IMusicItem>());
const loading = ref(false);

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
}]

const plugins = computed<Array<PluginTab>>(() => {
  const {plugins} = usePluginStore();
  if (isEmptyArray(plugins)) {
    return [];
  }
  active.value = plugins[0].id;
  return plugins.map(e => ({
    id: e.id,
    name: e.name,
  }))
});
const maxHeight = computed(() => size.height.value - 100);

async function searchWrap() {
  const {getInstance} = usePluginStore();
  const instance = await getInstance(active.value);
  const {search} = instance;
  if (search) {
    const rsp = await search(keyword.value, page.value, 'music');
    data.value = rsp.data;
    return;
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
