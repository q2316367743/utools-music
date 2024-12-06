<template>
  <div class="mg-item" v-if="item">
    <div class="mg-item__cover">
      <img :src="item.cover || MusicGroupImage" :alt="item.name"/>
    </div>
    <div class="mg-item__content">
      <div class="mg-item__title ellipsis-2">
        {{ item.name }}
      </div>
      <div class="mg-item__artist ellipsis">
        {{ item.author }}
      </div>
    </div>
    <div class="mg-item__tag">
      <t-tag v-if="item.type === MusicGroupType.WEB" theme="primary" variant="light-outline">Web</t-tag>
      <t-tag v-else-if="item.type === MusicGroupType.MIX" theme="success" variant="light-outline">混合</t-tag>
      <t-tag v-else theme="warning" variant="light-outline">本地</t-tag>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {MusicGroupIndex, MusicGroupType} from "@/entity/MusicGroup";
import MusicGroupImage from "@/assets/image/music-group.png";

defineProps({
  item: Object as PropType<MusicGroupIndex>
});

</script>
<style scoped lang="less">
.mg-item {
  width: 120px;
  height: 120px;
  user-select: none;
  cursor: pointer;
  position: relative;
  background: transparent;
  border-radius: var(--td-radius-default);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px dashed var(--td-component-stroke);

  &:hover {
    background: rgba(var(--td-brand-color-rgb), 0.1);
    border-color: var(--td-brand-color);
    transform: scale(0.98);
  }


  &__cover {
    width: 80px;
    height: 80px;
    margin: 4px auto;
    overflow: hidden;
    border-radius: 8px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    }
  }

  &__content {
    padding: 4px 8px;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--td-text-color-primary);
    margin-bottom: 2px;
    text-align: center;
  }

  &__artist {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    text-align: center;
  }

  &__tag {
    position: absolute;
    top: 4px;
    right: 4px;

    :deep(.t-tag) {
      font-size: 11px;
      padding: 0 4px;
      height: 18px;
      line-height: 18px;
    }
  }
}
</style>
