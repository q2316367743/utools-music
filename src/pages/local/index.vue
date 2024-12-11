<template>
  <div class="local-music">
    <div class="container">
      <div class="local-music__header">
        <t-auto-complete :options="options" style="width: 200px" placeholder="搜索本地音乐" v-model="keyword"
                         :clearable="true"
                         :highlight-keyword="true" :filterable="true">
          <template #suffix-icon>
            <search-icon/>
          </template>
        </t-auto-complete>
        <t-space size="small">
          <t-button size="small" v-if="checks.length > 0" @click="addMusicGroup">添加到歌单</t-button>
          <t-button size="small" shape="square" v-if="music" @click="setLocation(music)">
            <template #icon>
              <location-icon/>
            </template>
          </t-button>
          <t-button size="small" @click="toFolder">
            <template #icon>
              <folder-icon/>
            </template>
          </t-button>
          <music-scanner/>
        </t-space>
      </div>
      <div class="table-container" ref="table-container">
        <local-music-table ref="musicTable" v-model="checks" :current-index="currentIndex" :musics :data/>
      </div>
      <t-back-top container=".local-music .container .table-container .scroller" style="bottom: 24px;right: 24px"/>
    </div>
  </div>
</template>
<script lang="tsx" setup>
import {FolderIcon, LocationIcon, SearchIcon} from 'tdesign-icons-vue-next';
import {useFuse} from "@vueuse/integrations/useFuse";
import {useMusicGroupStore, useMusicStore} from "@/store";
import MusicScanner from "@/pages/local/components/MusicScanner/MusicScanner.vue";
import {musicGroupChoose} from "@/components/PluginManage/MusicGroupChoose";
import {music} from "@/components/MusicPlayer/MusicPlayer";
import MessageUtil from "@/utils/modal/MessageUtil";
import {MusicItemView} from "@/entity/MusicItem";
import {MusicGroupType} from "@/entity/MusicGroup";
import {MusicInstance} from "@/types/MusicInstance";
import LocalMusicTable from "@/pages/local/components/LocalMusicTable.vue";

const router = useRouter();

const keyword = ref('');

const activeRowKeys = ref<Array<number>>([])
const checks = ref<Array<number>>([]);

const musics = computed(() => useMusicStore().musics);
const options = computed(() => {
  const items = new Set<string>();
  musics.value.forEach(value => {
    items.add(value.name);
    items.add(value.artist);
    items.add(value.album);
  });
  items.delete('');
  return Array.from(items);
});

const {results} = useFuse<MusicItemView>(keyword, musics, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: ["name", "artist", "album"]
  }
});


const data = computed(() => results.value.map(e => e.item));



watch(music, val => {
  if (val) {
    activeRowKeys.value = [Number(val.id)];
  }
}, {immediate: true});

function addMusicGroup() {
  musicGroupChoose([MusicGroupType.LOCAL])
    .then(id => {
      if (id > 0) {
        useMusicGroupStore().appendMusicGroup(id,
          ...musics.value.filter(e => checks.value.includes(e.id)))
          .then(() => MessageUtil.success("添加成功"))
          .catch(e => MessageUtil.error("添加失败", e))
          .finally(() => {
            checks.value = [];
          });
      }
    })
}

let timeout: ReturnType<typeof setTimeout> | null = null;
const currentIndex = ref(-1);

const musicTable = ref<InstanceType<typeof LocalMusicTable>>();

function setLocation(item: MusicInstance) {
  const index = data.value.findIndex(e => e.id === Number(item.id));
  if (index >= 0) {
    musicTable.value?.scrollTo({
      top: Math.max(index - 3, 0) * 41,
      left: 0,
      behavior: 'smooth'
    });
    currentIndex.value = index;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      currentIndex.value = -1
      timeout = null;
    }, 3000);
  }
}

const toFolder = () => router.push('/local/folder/list')
</script>
<style scoped lang="less">
.local-music {
  position: relative;
  height: 100%;
  width: 100%;
  contain: strict;

  .container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    padding-top: 6px;

    .local-music__header {
      margin-bottom: 8px;
      padding-left: 8px;
      padding-right: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-container {
      height: calc(100% - 42px);
      overflow-y: auto;
      border: 1px solid var(--music-bg-color-3);

    }
  }
}
</style>
