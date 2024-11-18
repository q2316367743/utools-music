<template>
  <div>
    <t-tabs v-model="active">
      <t-tab-panel v-for="p in plugins" :key="p.id" :label="p.name" :value="p.id" :lazy="false">
        <ranking-item :plugin-id="p.id"/>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>
<script lang="ts" setup>
import {usePluginStore} from "@/store";
import {isNotEmptyArray} from "@/utils/lang/FieldUtil";
import RankingItem from "@/pages/extra/subpage/ranking/components/RankingItem.vue";

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

</style>
