<template>
  <div class="ranking-item">
    <!-- 标签 -->
    <header class="ranking-item__header">
      <t-space>
        <t-dropdown
          :options="[{ content: '操作一', value: 1 }, { content: '操作二', value: 2 }]"
        >
        </t-dropdown>

        <t-popup trigger="click" placement="bottom-left">
          <template #triggerElement>
            <t-button size="small">{{ allTag }}</t-button>
          </template>
          <template #content>
            <div class="ranking-item__popup">
              <t-divider align="left">全部</t-divider>
              <t-check-tag :checked="'' === tagId" @click="onTagChange('')">
                全部
              </t-check-tag>
              <t-paragraph v-for="g in groups" :key="g.title">
                <t-divider align="left">{{ g.title }}</t-divider>
                <t-space :break-line="true">
                  <t-check-tag v-for="t in g.data" :key="t.id" :checked="t.id === tagId" @click="onTagChange(t.id)">
                    {{ t.title }}
                  </t-check-tag>
                </t-space>
              </t-paragraph>
            </div>
          </template>
        </t-popup>
        <t-check-tag v-for="t in tags" :key="t.id" :checked="t.id === tagId" @click="onTagChange(t.id)">
          {{ t.title }}
        </t-check-tag>
      </t-space>
    </header>

    <!-- 内容 -->
  </div>
</template>
<script lang="ts" setup>
import {usePluginStore} from "@/store";
import {ITag, ITagGroup} from "@/types/PluginInstance";

const props = defineProps({
  pluginId: {
    type: Number,
    default: 0
  }
});

const tagId = ref('');

const tags = ref(new Array<ITag>());
const groups = ref(new Array<ITagGroup>());

const allTag = computed(() => {
  for (let tag of tags.value) {
    if (tag.id === tagId.value) {
      return '全部';
    }
  }
  for (let group of groups.value) {
    for (let datum of group.data) {
      if (datum.id === tagId.value) {
        return datum.title;
      }
    }
  }
  return '全部';
})

onMounted(() => {
  for (let pluginInstance of usePluginStore().pluginInstances) {
    if (pluginInstance.id === props.pluginId) {
      // 获取标签
      const {getRecommendSheetTags} = pluginInstance.instance;
      if (getRecommendSheetTags) {
        getRecommendSheetTags()
          .then(res => {
            tags.value = res.pinned || [];
            groups.value = res.data || [];
          })
      }
      return;
    }
  }
});

function onTagChange(res: string) {
  tagId.value = res;
}
</script>
<style scoped lang="less">
.ranking-item {
  position: relative;
  height: 100%;
  width: 100%;

  &__header {
    padding: 8px 0;
    height: 24px;
    overflow-x: auto;
  }
}

.ranking-item__popup {
  max-width: 400px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
