<template>
  <t-loading :loading text="正在加载中..." style="height: 100%">
    <t-card v-for="(item, i) in list" :key="i" :title="item.title" :item="item" :bordered="false">
      <t-row>
        <t-col :span="3" v-for="sheet in item.data" :key="sheet.id">
          <ranking-sub-item :item="sheet" @click="handleClick(sheet)"/>
        </t-col>
      </t-row>
    </t-card>
    <ranking-drawer v-model="dialog.visible" :item="dialog.target" :plugin-id="pluginId"/>
  </t-loading>
</template>
<script lang="ts" setup>
import {usePluginStore} from "@/store";
import {IMusicSheetGroupItem, IMusicSheetItem} from "@/types/PluginInstance";
import MessageUtil from "@/utils/modal/MessageUtil";
import RankingSubItem from "@/pages/extra/subpage/ranking/components/RankingSubItem.vue";
import RankingDrawer from "@/pages/extra/subpage/ranking/components/RankingDrawer.vue";

const props = defineProps({
  pluginId: {
    type: Number,
    default: 0
  }
});

const list = ref<Array<IMusicSheetGroupItem>>([]);
const loading = ref(false);

const dialog = ref({
  visible: false,
  target: undefined as IMusicSheetItem | undefined,
})

onMounted(() => {
  for (let pluginInstance of usePluginStore().pluginInstances) {
    if (pluginInstance.id === props.pluginId) {
      const {getTopLists} = pluginInstance.instance;
      if (getTopLists) {
        loading.value = true;
        getTopLists()
          .then(res => list.value = res || [])
          .catch(e => MessageUtil.error("获取排行榜失败", e))
          .finally(() => loading.value = false);
      }
      return;
    }
  }
});

function handleClick(res: IMusicSheetItem) {
  dialog.value = {
    visible: true,
    target: res
  }
}
</script>
<style scoped lang="less">

</style>
