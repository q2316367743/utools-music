<template>
  <div class="ranking-item">
    <!-- 标签 -->
    <header class="ranking-item__header">
      <t-space>
        <t-popup trigger="click" placement="bottom-left" v-model:visible="popupVisible">
          <template #triggerElement>
            <t-button size="small" :theme="allTheme">
              <span>{{ allTag }}</span>
              <template #suffix>
                <chevron-right-icon :class="{'ranking-item__icon': true, 'active': popupVisible}"/>
              </template>
            </t-button>
          </template>
          <template #content>
            <div class="ranking-item__popup">
              <t-divider align="left">全部</t-divider>
              <t-check-tag :checked="'' === tagId" @click="onTagChange('')">
                全部
              </t-check-tag>
              <t-paragraph v-for="g in groups" :key="g.title">
                <t-divider align="left">{{ g.title }}</t-divider>
                <t-space :break-line="true">
                  <t-check-tag v-for="t in g.data" :key="t.id" :checked="t.id === tagId" @click="onTagChange(t.id)">
                    {{ t.title }}
                  </t-check-tag>
                </t-space>
              </t-paragraph>
            </div>
          </template>
        </t-popup>
        <t-check-tag v-for="t in tags" :key="t.id" :checked="t.id === tagId" @click="onTagChange(t.id)">
          {{ t.title }}
        </t-check-tag>
      </t-space>
    </header>
    <!-- 内容 -->
    <div class="ranking-item__container">
      <div class="ri-item" v-for="item in items" :key="item.id" @click="handleItemClick(item)">
        <div class="ri-item__cover">
          <img :src="item.artwork" :alt="item.title"/>
        </div>
        <div class="ri-item__title ellipsis-2">
          {{ item.title }}
        </div>
        <div class="ri-item__artist">
          {{ item.artist }}
        </div>
      </div>
    </div>
    <song-list-item-drawer v-model="songListItemDrawer.visible" :item="songListItemDrawer.value" :plugin-id="pluginId" />
  </div>
</template>
<script lang="ts" setup>
import {usePluginStore} from "@/store";
import {IMusicSheetItem, ITag, ITagGroup} from "@/types/PluginInstance";
import {ChevronRightIcon} from "tdesign-icons-vue-next";
import {map} from "@/utils/lang/ArrayUtil";
import SongListItemDrawer from "@/pages/extra/subpage/song-list/components/SongListItemDrawer.vue";

const props = defineProps({
  pluginId: {
    type: Number,
    default: 0
  }
});

const tagId = ref('');
const tags = ref(new Array<ITag>());
const groups = ref(new Array<ITagGroup>());
const page = ref(1);
const items = ref(new Array<IMusicSheetItem>());
const isBottom = ref(false);
const popupVisible = ref(false);

const songListItemDrawer = ref({
  visible: false,
  value: undefined as IMusicSheetItem | undefined,
})

const tagMap = new Map<string, ITag>();


const allTag = computed(() => {
  for (let tag of tags.value) {
    if (tag.id === tagId.value) {
      return '全部';
    }
  }
  for (let group of groups.value) {
    for (let datum of group.data) {
      if (datum.id === tagId.value) {
        return datum.title;
      }
    }
  }
  return '全部';
});

const allTheme = computed(() => {
  for (let tag of tags.value) {
    if (tag.id === tagId.value) {
      return 'default';
    }
  }
  return 'primary'
})

onMounted(() => {
  for (let pluginInstance of usePluginStore().pluginInstances) {
    if (pluginInstance.id === props.pluginId) {
      // 获取标签
      const {getRecommendSheetTags} = pluginInstance.instance;
      if (getRecommendSheetTags) {
        getRecommendSheetTags()
          .then(res => {
            tags.value = res.pinned || [];
            groups.value = res.data || [];
            onTagIdChange('');
            map(tags.value, 'id')
              .forEach((v, k) => tagMap.set(k, v));
            groups.value.forEach(g => map(g.data, 'id')
              .forEach((v, k) => tagMap.set(k, v)));
            onTagChange('');
          })
      }
      return;
    }
  }
});

function onTagChange(res: string) {
  tagId.value = res;
  popupVisible.value = false
}

function onTagIdChange(res: string) {
  for (let pluginInstance of usePluginStore().pluginInstances) {
    if (pluginInstance.id === props.pluginId) {
      // 获取标签
      const {getRecommendSheetsByTag} = pluginInstance.instance;
      if (getRecommendSheetsByTag) {
        let tag = tagMap.get(res);
        if (!tag) {
          tag = {
            id: '',
            title: ''
          }
        }
        getRecommendSheetsByTag(tag, page.value)
          .then(res => {
            const {isEnd, data} = res;
            items.value = data;
            isBottom.value = isEnd;
          })
      }
      return;
    }
  }
}

watch(tagId, onTagIdChange);

function handleItemClick(res: IMusicSheetItem) {
  songListItemDrawer.value = {
    visible: true,
    value: res
  }
}
</script>
<style scoped lang="less">
.ranking-item {
  position: relative;
  height: 100%;
  width: 100%;

  &__header {
    padding: 8px;
    height: 24px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  &__container {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;

    .ri-item {
      width: 120px;
      height: 180px;
      margin: 8px;
      user-select: none;
      cursor: pointer;

      &__cover {
        width: 120px;
        height: 120px;
        overflow: hidden;
        border-radius: var(--td-radius-default);

        img {
          width: 120px;
          height: 120px;
          object-fit: contain;
          transition: 0.5s;

          &:hover {
            transform: scale(1.3);
          }
        }
      }

      &__title {
        font-size: var(--td-font-size-body-medium);
        color: var(--td-text-color-primary);
        height: 42px;
        width: 100%;
      }

      &__artist {
        font-size: var(--td-font-size-body-small);
        color: var(--td-text-color-secondary);
      }
    }
  }
}

.ranking-item__popup {
  max-width: 400px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

@keyframes ranking-item-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(90deg);
  }
}

.ranking-item__icon {
  transform: rotate(0deg);
  transition: 0.5s;

  &.active {
    transform: rotate(90deg);
  }
}

</style>
