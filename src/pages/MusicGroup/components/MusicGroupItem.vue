<template>
  <div class="mg-item" v-if="item">
    <div class="mg-item__cover">
      <!-- TODO: 封面可能不存在 -->
      <img :src="item.cover" :alt="item.name" v-if="item.cover"/>
      <music-icon v-else size="80px"/>
    </div>
    <div class="mg-item__title ellipsis-2">
      {{ item.name }}
    </div>
    <div class="mg-item__artist ellipsis">
      {{ item.author }}
    </div>
    <div class="mg-item__web" v-if="item.type === MusicGroupType.WEB">
      <t-tag theme="primary">Web</t-tag>
    </div>
    <div class="mg-item__web" v-else-if="item.type === MusicGroupType.MIX">
      <t-tag theme="success">混合</t-tag>
    </div>
    <div class="mg-item__web" v-else>
      <t-tag theme="warning">本地</t-tag>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {MusicGroupIndex, MusicGroupType} from "@/entity/MusicGroup";
import {MusicIcon} from "tdesign-icons-vue-next";

defineProps({
  item: Object as PropType<MusicGroupIndex>
});

</script>
<style scoped lang="less">
.mg-item {
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
    height: 42px;
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
