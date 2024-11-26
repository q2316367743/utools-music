<template>
  <div class="rsi-item" v-if="item">
    <div class="rsi-item__cover">
      <!-- TODO: 封面可能不存在 -->
      <img :src="item.coverImg" :alt="item.title" v-if="item.coverImg"/>
      <music-icon v-else size="80px"/>
    </div>
    <div class="rsi-item__title ellipsis">
      {{ item.title }}
    </div>
    <div class="rsi-item__artist ellipsis">
      {{ item.description }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import {MusicIcon} from "tdesign-icons-vue-next";
import {IMusicSheetItem} from "@/types/PluginInstance";

defineProps({
  item: Object as PropType<IMusicSheetItem>
});

</script>
<style scoped lang="less">
.rsi-item {
  width: 120px;
  height: 180px;
  margin: 8px;
  user-select: none;
  cursor: pointer;
  position: relative;

  &__cover {
    width: 120px;
    height: 120px;
    overflow: hidden;
    border-radius: var(--td-radius-default);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

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
    width: 100%;
    text-align: center;
  }

  &__artist {
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-secondary);
    text-align: center;
  }

  &__web {
    position: absolute;
    top: 0;
    right: 0;
  }
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
