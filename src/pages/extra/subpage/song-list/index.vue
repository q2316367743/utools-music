<template>
  <div class="song-list">
    <t-tabs v-model="active">
      <t-tab-panel v-for="p in plugins" :key="p.id" :label="p.name" :value="p.id" :lazy="false">
        <song-list-item :plugin-id="p.id"/>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>
<script lang="ts" setup>
import {usePluginStore} from "@/store";
import {isNotEmptyArray} from "@/utils/lang/FieldUtil";
import SongListItem from "@/pages/extra/subpage/song-list/components/SongListItem.vue";

const active = ref(0);

const plugins = computed(() => {
  const res = usePluginStore().pluginInstances
    .filter(plugin => !!plugin.instance.getRecommendSheetTags && !!plugin.instance.getRecommendSheetsByTag);
  if (isNotEmptyArray(res)) {
    active.value = res[0].id;
  }
  return res;
});
</script>
<style scoped lang="less">
.song-list {
  position: relative;
  width: 100%;
  height: 100%;
  contain: strict;

  .t-tabs {
    position: relative;
    width: 100%;
    height: 100%;

    :deep(.t-tabs__content) {
      position: absolute;
      top: 48px;
      left: 0;
      right: 0;
      bottom: 0;

      .t-tab-panel {
        position: relative;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
