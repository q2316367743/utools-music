<template>
  <div class="music-group">
    <t-dropdown v-for="group in musicGroups" :key="group.id" :options trigger="context-menu"
                @click="onContextMenu(group, $event)">
      <div class="music-group-item" @click="onClick(group)">
        <div class="music-group-item__cover">
          <music-icon size="80px"></music-icon>
        </div>
        <div class="music-group-item__title ellipsis">
          {{ group.name }}
        </div>
      </div>
    </t-dropdown>
    <div class="music-group-item plus" @click="addMusicGroup">
      <div class="music-group-item__image">
        <plus-icon size="80px"></plus-icon>
      </div>
    </div>
  </div>
  <music-group-content :music-group="musicGroup" @close="onClose"/>
</template>
<script lang="ts" setup>
import {useMusicGroupStore} from "@/store/module/MusicGroupStore";
import {addMusicGroup, editMusicGroup} from "@/pages/MusicGroup/MusicGroupFunc";
import {MusicGroupIndex} from "@/entity/MusicGroup";
import MusicGroupContent from "@/pages/MusicGroup/MusicGroupContent.vue";
import {DropdownOption} from "tdesign-vue-next";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {MusicIcon, PlusIcon} from 'tdesign-icons-vue-next'

const options: Array<DropdownOption> = [
  {content: '重命名', value: 1},
  {content: '删除', value: 2, theme: 'error'},
];

const musicGroup = shallowRef<MusicGroupIndex>();

const musicGroups = computed(() => useMusicGroupStore().musicGroupItems);

function onClick(res: MusicGroupIndex) {
  musicGroup.value = res;
}

function onContextMenu(group: MusicGroupIndex, value: DropdownOption) {
  if (value.value === 1) {
    editMusicGroup(group)
  } else if (value.value === 2) {
    // 删除
    MessageBoxUtil.alert(`是否删除歌单【${group.name}】？`, "删除跟单")
      .then(() => {
        useMusicGroupStore().deleteMusicGroup(group.id)
          .then(() => MessageUtil.success("删除成功"))
          .catch(e => MessageUtil.error("删除失败", e));
      })
  }
}

function onClose() {
  musicGroup.value = undefined;
}

</script>
<style scoped lang="less">
.music-group {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: auto;
  contain: strict;

  .music-group-item {
    padding: 8px;
    width: 80px;
    height: 100px;
    cursor: pointer;
    transition: 0.3s;
    border: 3px dashed var(--td-border-level-1-color);
    margin: 8px;

    &:hover {
      background-color: var(--td-bg-color-component-hover);
    }

    &__cover {
      width: 80px;
      height: 80px;
    }

    &__title {
      width: 80px;
      height: 20px;
      text-align: center;
    }

    &__image {
      width: 80px;
      height: 100px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
    }

  }
}
</style>
