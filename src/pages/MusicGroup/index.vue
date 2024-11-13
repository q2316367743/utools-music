<template>
  <div class="music-group">
    <div class="music-group-item" v-for="group in musicGroups" :key="group.id">
      <div class="music-group-item__cover">
        <t-icon name="music" size="80px"></t-icon>
      </div>
      <div class="music-group-item__title ellipsis">
        {{ group.name }}
      </div>
    </div>
    <div class="music-group-item plus" @click="addMusicGroup">
      <div class="music-group-item__image">
        <t-icon name="plus" size="80px"></t-icon>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useMusicGroupStore} from "@/store/module/MusicGroupStore";
import {addMusicGroup} from "@/pages/MusicGroup/MusicGroupFunc";

const musicGroups = computed(() => useMusicGroupStore().musicGroups)
// TODO: 歌单列表
</script>
<style scoped lang="less">
.music-group {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 8px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;

  .music-group-item {
    padding: 8px;
    width: 80px;
    height: 100px;
    cursor: pointer;
    transition: 0.3s;
    border: 3px dashed var(--td-border-level-1-color);
    margin: 4px;

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
