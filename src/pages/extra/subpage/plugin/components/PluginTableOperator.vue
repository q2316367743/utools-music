<template>
  <t-space size="small">
    <t-dropdown v-if="hasImportMusic || hasImportSheet" :options="importOptions" trigger="click">
      <t-button theme='success' variant='text' shape='circle'
                :disabled="loading">导
      </t-button>
    </t-dropdown>
    <t-popup v-if="hasUserVar" content="设置变量">
      <t-button theme='primary' variant='text' shape='circle'
                :disabled="loading" @click="onSetUserVar"
      >设
      </t-button>
    </t-popup>
    <t-dropdown :options="options" trigger='click'>
      <t-button theme='primary' variant='text' shape='circle'
                :disabled="loading">
        <template #icon>
          <more-icon/>
        </template>
      </t-button>
    </t-dropdown>
  </t-space>
</template>
<script lang="ts" setup>
import {PluginEntity} from "@/entity/PluginEntity";
import {usePluginStore} from "@/store";
import {DropdownOption} from "tdesign-vue-next";
import {importMusicFromPlugin, importSheetFromPlugin} from "@/pages/extra/subpage/plugin/PluginMusicImport";
import MessageUtil from "@/utils/modal/MessageUtil";
import {setUserVar} from "@/pages/extra/subpage/plugin/table";
import {MoreIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";

const props = defineProps({
  row: {
    type: Object as PropType<PluginEntity>,
    required: true
  }
});

const instance = usePluginStore().getInstance(props.row!.id);
const hasUserVar = !!instance?.userVariables;
const hasImportMusic = !!instance?.importMusicItem
const hasImportSheet = !!instance?.importMusicSheet;

const loading = ref(false);


const importOptions = computed<Array<DropdownOption>>(() => {
  let list: Array<DropdownOption> = [];
  if (hasImportMusic) {
    list.push({
      content: '导入歌曲',
      onClick: onImportMusic
    });
  }
  if (hasImportSheet) {
    list.push({
      content: '导入歌单',
      onClick: onImportSheet
    });
  }
  return list;
});

const options = computed<Array<DropdownOption>>(() => ([{
  content: '下载',
  onClick: onDownload
}, {
  content: '更新',
  onClick: onUpdate
}, {
  content: '卸载',
  theme: 'error',
  onClick: onUninstall,
}]))

function onImportMusic() {
  importMusicFromPlugin(props.row.id, props.row, instance)
    .catch(e => MessageUtil.error("导入歌曲失败", e));
}

function onImportSheet() {
  importSheetFromPlugin(props.row.id, props.row, instance)
    .catch(e => MessageUtil.error("导入歌单失败", e));
}


function onSetUserVar() {
  setUserVar(props.row.id)
    .catch(e => MessageUtil.error("设置变量失败", e));
}


function onDownload() {
  loading.value = true
  usePluginStore().downloadPlugin(props.row.id)
    .then(() => MessageUtil.success("下载成功"))
    .catch(e => MessageUtil.error("下载失败", e))
    .finally(() => loading.value = false)
}

function onUpdate() {
  loading.value = true
  usePluginStore().updatePlugin(props.row.id)
    .then(() => MessageUtil.success("更新成功"))
    .catch(e => MessageUtil.error("更新失败", e))
    .finally(() => loading.value = false)
}

function onUninstall() {
  MessageBoxUtil.alert(
    "是否卸载插件，卸载后，基于此插件新增的歌曲将无法收听，并且卸载后造成的数据问题也将无法恢复",
    "卸载插件",
    {
      confirmButtonText: '卸载'
    }).then(() => {
    loading.value = true
    usePluginStore().removePlugin(props.row.id)
      .then(() => MessageUtil.success("卸载成功"))
      .catch(e => MessageUtil.error("卸载失败", e))
      .finally(() => loading.value = false)
  })
}
</script>
<style scoped lang="less">

</style>
