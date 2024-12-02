<template>
  <div class="music-lyric-search">
    <t-button theme="primary" variant="text" size="large" shape="circle" @click="openDialog" v-if="icon">
      <template #icon>
        <search-icon/>
      </template>
    </t-button>
    <t-link theme="primary" @click="openDialog" v-else>立即搜索</t-link>
    <t-dialog v-model:visible="visible" :close-btn="true" width="700px" attach="body" :footer="false" top="10vh">
      <template #header>
        <div class="w-full">
          <t-input-adornment class="w-full">
            <template #prepend>
              <t-select v-model="active" :disabled="loading">
                <t-option v-for="plugin in plugins" :key="plugin.id" :label="plugin.name" :value="plugin.id">
                </t-option>
              </t-select>
            </template>
            <t-input v-model="keyword" :clearable="true" placeholder="请输入关键字，回车搜索" class="w-full"
                     :disabled="isEmptyArray(plugins) || !music || loading" @enter="search">
              <template #suffix-icon>
                <search-icon/>
              </template>
            </t-input>
            <template #append>
              <t-button theme="primary" :disabled="isEmptyArray(plugins) || !music || loading" @click="search">
                搜索
              </t-button>
            </template>
          </t-input-adornment>
        </div>
      </template>
      <t-loading :loading text="歌词搜索中">
        <div class="music-lyric-container" :style="{height: height + 'px'}">
          <t-list v-if="items.length > 0" :split="true">
            <t-list-item v-for="i in items" :key="i.item.id" :value="i.item.id">
              <t-space>
                <span>{{i.item.title}}</span>
                <span>-</span>
                <span style="color: var(--td-text-color-secondary)">{{i.item.artist}}</span>
              </t-space>
              <template #action>
                <t-button theme="primary" variant="text" @click="handleLyric(i)">查看歌词</t-button>
              </template>
            </t-list-item>
          </t-list>
          <t-empty v-else title="空空如也(；′⌒`)" style="padding-top: 20vh"></t-empty>
        </div>
      </t-loading>
    </t-dialog>
  </div>
</template>
<script lang="ts" setup>
import {usePluginStore} from "@/store";
import {isEmptyArray, isNotEmptyArray} from "@/utils/lang/FieldUtil";
import {SearchIcon} from "tdesign-icons-vue-next";
import {currentTime, music} from "@/components/MusicPlayer/MusicPlayer";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isEmptyString} from "@/utils/lang/StringUtil";
import {IMusicItemLyric, showLyric} from "@/components/MusicPlayer/MusicLyricSearch";

defineProps({
  icon: Boolean
});

const size = useWindowSize();

const visible = ref(false);
const active = ref(0);
const keyword = ref('');
const items = ref<Array<IMusicItemLyric>>([]);
const loading = ref(false);
const index = ref(0);

const height = computed(() => size.height.value - size.height.value / 5 - 130);

const plugins = computed(() => {
  const res = usePluginStore().pluginInstances
    .filter(plugin => {
      const {supportedSearchType, search} = plugin.instance;
      if (!search) {
        return false;
      }
      if (!supportedSearchType) {
        return true;
      }
      return supportedSearchType.includes('lyric');
    });
  if (isNotEmptyArray(res)) {
    active.value = res[0].id;
  }
  return res;
});

watch(active, val => {
  if (val === 0) {
    return;
  }
  if (!visible.value) {
    return;
  }
  if (isEmptyString(keyword.value)) {
    return;
  }
  search();
});

watch(currentTime, val => {
  if (val === 0) {
    index.value = 0;
    return;
  }
  if (!music) {
    return;
  }
  if (isEmptyArray(items.value)) {
    return;
  }
})

function openDialog() {
  index.value = 0;
  loading.value = false;
  if (music.value) {
    keyword.value = music.value.name;
    // 搜索
    search();
  } else {
    keyword.value = "";
    items.value = [];
  }
  visible.value = true;
}

async function searchWrap() {
  items.value = [];
  if (plugins.value.length === 0) {
    return false;
  }
  if (!music.value) {
    return;
  }
  const source = music.value;
  const {name} = source
  for (let plugin of plugins.value) {
    if (active.value === plugin.id) {
      const {search} = plugin.instance;
      if (search) {
        const res = await search(name, 1, 'lyric');
        const {data} = res;
        if (isEmptyArray(data)) {
          continue;
        }
        items.value = data.map(item => ({
          item,
          source
        }))
      }
      return true;
    }
  }

}

function search() {
  loading.value = true;
  searchWrap()
    .then(res => res && MessageUtil.success("搜索成功"))
    .catch(e => MessageUtil.error("搜索失败", e))
    .finally(() => loading.value = false);
}

function handleLyric(i: IMusicItemLyric) {
  loading.value = true;
  showLyric(active.value, i, () => {
    visible.value = false;
    loading.value = false
  });
}

</script>
<style scoped lang="less">
</style>
