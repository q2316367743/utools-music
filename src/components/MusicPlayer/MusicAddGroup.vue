<template>
  <t-dialog v-model:visible="visible" header="添加到歌单" width="60vw" @confirm="onConfirm">
    <t-checkbox-group v-model="groupIds">
      <t-paragraph v-for="tag in musicGroups" :key="tag.id">
        <t-checkbox :value="tag.id" :label="tag.name"/>
      </t-paragraph>
    </t-checkbox-group>
  </t-dialog>
</template>
<script lang="ts" setup>
import {useMusicGroupStore} from "@/store";
import {useAddMusicGroup} from "@/global/Event";
import {music} from "@/components/MusicPlayer/MusicPlayer";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isEmptyArray} from "@/utils/lang/FieldUtil";
import {isNotEmptyString} from "@/utils/lang/StringUtil";

const visible = ref(false);
const groupIds = ref(new Array<number>());

const musicGroups = computed(() => useMusicGroupStore().musicGroupItems
  .filter(e => isNotEmptyString(e.nativeId)));

function onAddMusicGroup() {
  groupIds.value = [];
  visible.value = true;
}

function onConfirm() {
  visible.value = false;
  if (!music.value) {
    MessageUtil.warning("没有正在播放的音乐，无法加入到歌单")
    return;
  }
  if (isEmptyArray(groupIds.value)) {
    return;
  }
  music.value.getInfo().then(item => {
    useMusicGroupStore().appendMusicGroup(groupIds.value, item)
      .then(() => MessageUtil.success("新增成功"))
      .catch(e => MessageUtil.error("新增失败", e));
  })
    .catch(e => MessageUtil.error("获取音乐信息失败", e));
}

onMounted(() => useAddMusicGroup.on(onAddMusicGroup));
onUnmounted(() => useAddMusicGroup.off(onAddMusicGroup));
</script>
<style scoped lang="less">

</style>
