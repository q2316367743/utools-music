<template>
  <t-drawer v-model:visible="visible" header="艺术家" :footer="false" attach=".local-music" size="100%"
            :close-btn="true">
    <t-tabs placement="left">
      <t-tab-panel v-for="[key, values] in artists" :key="key" :value="key" :label="key">
        <t-list :split="true">
          <t-list-item v-for="val in values" :key="val.id">
            <t-list-item-meta :title="val.name" :description="val.artist" :avatar="val.cover" />
          </t-list-item>
        </t-list>
      </t-tab-panel>
    </t-tabs>
  </t-drawer>
</template>
<script lang="ts" setup>
import {useMusicStore} from "@/store";
import {group} from "@/utils/lang/ArrayUtil";

const visible = defineModel({
  type: Boolean,
  default: false
});

const musics = computed(() => useMusicStore().musics);

const artists = computed(() => Array.from(group(musics.value, 'artist').entries()))
</script>
<style scoped lang="less">

</style>
