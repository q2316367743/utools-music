<template>
  <t-drawer v-model:visible="visible" :header="`播放列表(${musics.length}首)`" attach=".main-container"
            :footer="false" size="400px" class="music-list-drawer">
    <RecycleScroller
      ref="scroller"
      class="music-player-list"
      :items="musics"
      :item-size="41"
      key-field="id"
      v-slot="{ item, index }"
    >
      <div class="item" :class="{active: music?.id === item.id}" @dblclick="switchIndex(index)">
        <t-row :gutter="8">
          <t-col :span="5">
            <div class="name ellipsis" :title="item.name">{{ item.name }}</div>
          </t-col>
          <t-col :span="5">
            <div class="artist ellipsis" :title="item.artist">{{ item.artist }}</div>
          </t-col>
          <t-col :span="2">
            <t-button variant="text" theme="danger" @click="removeIndex(index, item)">
              <template #icon>
                <delete-icon/>
              </template>
            </t-button>
          </t-col>
        </t-row>
      </div>
    </RecycleScroller>
    <div class="location">
      <t-button variant="text" theme="primary" shape="circle" @click="scrollToCurrentMusic">
        <template #icon>
          <location-icon/>
        </template>
      </t-button>
    </div>
  </t-drawer>
</template>
<script lang="ts" setup>
import {
  displayVisible,
  listVisible,
  music,
  musics,
  removeIndex,
  switchIndex
} from "@/components/MusicPlayer/MusicPlayer";
import {DeleteIcon, LocationIcon} from "tdesign-icons-vue-next";
import {RecycleScroller} from "vue-virtual-scroller";

const scroller = ref<InstanceType<typeof RecycleScroller>>();

const visible = computed(() => {
  if (!displayVisible.value) {
    return listVisible.value
  }
  return false;
});

function scrollToCurrentMusic() {
  const index = musics.value.findIndex(e => e.id === music.value?.id);
  console.log(index, scroller.value?.$el)
  if (index >= 0) {
    scroller.value?.$el.scrollTo({
      top: Math.max(index - 3, 0) * 41,
      left: 0,
      behavior: 'smooth'
    });
  }
}

watch(visible, val => {
  if (val) {
    setTimeout(() => scrollToCurrentMusic(), 200);
  }
});
</script>
<style scoped lang="less">
.music-list-drawer {
  position: relative;

  .location {
    position: absolute;
    right: 56px;
    bottom: 48px;
  }
}

.music-player-list {
  height: calc(100vh - 150px);

  .item {
    padding: 4px 0;
    border-bottom: 1px solid var(--td-component-border);
    cursor: pointer;
    user-select: none;
    color: var(--td-text-color-primary);
    line-height: 32px;

    .name, .artist {
      height: 32px;
      line-height: 32px;
    }

    &.active {
      background-color: var(--td-bg-color-container-hover);
      color: var(--td-text-color-link);

      .name, .artist {
        color: var(--td-text-color-link);
      }
    }

    &:hover {
      background-color: var(--td-bg-color-container-hover);
      color: var(--td-text-color-link);

      .name, .artist {
        color: var(--td-text-color-link);
      }
    }

    .artist {
      color: var(--td-text-color-secondary);
    }
  }
}
</style>
