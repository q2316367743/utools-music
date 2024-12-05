<template>
  <div class="music-group">
    <div class="music-group__content">
      <t-dropdown v-for="group in musicGroups" :key="group.id" :options trigger="context-menu"
                  @click="onContextMenu(group, $event)">
        <music-group-item :item="group" @click="onClick(group)"/>
      </t-dropdown>
      
      <div class="music-group__add" @click="addMusicGroup">
        <div class="music-group__add-content">
          <plus-icon size="32px"/>
          <span>新建歌单</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useMusicGroupStore} from "@/store/module/MusicGroupStore";
import {addMusicGroup, editMusicGroup} from "@/pages/music-group/list/components/MusicGroupFunc";
import {MusicGroupIndex} from "@/entity/MusicGroup";
import {DropdownOption} from "tdesign-vue-next";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {PlusIcon} from 'tdesign-icons-vue-next'
import MusicGroupItem from "@/pages/music-group/list/components/MusicGroupItem.vue";

const router = useRouter();

const options: Array<DropdownOption> = [
  {content: '重命名', value: 1},
  {content: '删除', value: 2, theme: 'error'},
];

const musicGroups = computed(() => useMusicGroupStore().musicGroupItems);

function onClick(res: MusicGroupIndex) {
  router.push(`/music-group/info/${res.id}`);
}

function onContextMenu(group: MusicGroupIndex, value: DropdownOption) {
  if (value.value === 1) {
    editMusicGroup(group)
  } else if (value.value === 2) {
    // 删除
    MessageBoxUtil.alert(`是否删除歌单【${group.name}】？`, "删除跟单")
      .then(() => {
        useMusicGroupStore().deleteMusicGroup(group.id)
          .then(() => MessageUtil.success("删除成功"))
          .catch(e => MessageUtil.error("删除失败", e));
      })
  }
}

</script>
<style scoped lang="less">
.music-group {
  width: 100%;
  height: 100%;
  padding: 16px;
  background: transparent;
  overflow: auto;

  &__content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    justify-items: center;
  }

  &__add {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    border: 1px dashed var(--td-component-stroke);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;

    &:hover {
      background: rgba(var(--td-brand-color-rgb), 0.1);
      border-color: var(--td-brand-color);
      transform: scale(0.98);
    }

    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--td-text-color-secondary);

      :deep(.t-icon) {
        font-size: 24px;
      }

      span {
        font-size: 13px;
      }
    }
  }
}
</style>
