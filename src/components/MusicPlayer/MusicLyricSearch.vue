<template>
  <div class="music-lyric-search">
    <t-link theme="primary" @click="openDialog">立即搜素</t-link>
    <t-dialog v-model:visible="visible" :close-btn="true" width="700px" attach="body" :footer="false">
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
          </t-input-adornment>
        </div>
      </template>
      <t-loading :loading content="歌词搜索中">
        <div class="music-lyric-container">
          <t-empty title="暂无歌词" v-if="lyrics.length === 0" style="margin-top: 16px"></t-empty>
          <div class="lyric-line" v-for="(lyric, i) in items" :key="lyric.start"
               :class="{active: index === i}">
            <span>{{ lyric.text }}</span>
          </div>
        </div>
      </t-loading>
    </t-dialog>
  </div>
</template>
<script lang="ts" setup>
import {usePluginStore} from "@/store";
import {isEmptyArray, isNotEmptyArray} from "@/utils/lang/FieldUtil";
import {SearchIcon} from "tdesign-icons-vue-next";
import {currentTime, lyrics, music} from "@/components/MusicPlayer/MusicPlayer";
import MessageUtil from "@/utils/modal/MessageUtil";
import {LyricLine} from "@/types/LyricLine";
import {isEmptyString} from "@/utils/lang/StringUtil";
import {transferTextToLyric} from "@/plugin/music";

const visible = ref(false);
const active = ref(0);
const keyword = ref('');
const items = ref<Array<LyricLine>>([]);
const loading = ref(false);
const index = ref(0)

const plugins = computed(() => {
  const res = usePluginStore().pluginInstances
    .filter(plugin => !!plugin.instance.getLyric);
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
  for (let i = 0; i < items.value.length; i++) {
    const ly = items.value[i];
    if (ly.start <= val && val <= ly.end) {
      index.value = i;
      return;
    }
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
  const {name, artist} = music.value;
  for (let plugin of plugins.value) {
    if (active.value === plugin.id) {
      const {getLyric} = plugin.instance;
      if (getLyric) {
        const lyric = await getLyric({
          title: name,
          artist,
          id: '',
          platform: plugin.instance.platform,
        });
        if (!lyric) {
          continue;
        }
        const {rawLrc} = lyric;
        if (!rawLrc) {
          continue;
        }
        items.value = transferTextToLyric(rawLrc)
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

</script>
<style scoped lang="less">
.music-lyric-container {
  max-height: 500px;
  width: 100%;
  text-align: center;
  overflow: auto;

  .lyric-line {
    padding: 8px 0;
    font-size: 1.5rem;
    cursor: pointer;
    position: relative;
  }
}
</style>
