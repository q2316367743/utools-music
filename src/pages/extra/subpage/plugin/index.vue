<template>
  <div class="plugin-manage">
    <div class="header">
      <t-space>
        <t-button theme="primary" size="small" @click="installFromLocalWrap" :loading="installLoading">
          从本地安装
        </t-button>
        <t-button theme="primary" size="small" @click="installFromUrlWrap" :loading="installLoading">
          从网络安装
        </t-button>
        <t-tooltip content="支持MusicFree协议的插件，目前只实现了歌曲搜索和歌曲详情" theme="primary" placement="bottom">
          <t-button theme="primary" size="small" variant="text">
            <template #icon>
              <questionnaire-icon/>
            </template>
          </t-button>
        </t-tooltip>
      </t-space>
      <t-space>
        <t-button theme="primary" size="small" @click="openPluginSubscribeDialog">订阅管理</t-button>
        <t-button theme="primary" size="small" @click="updatePluginSubscribe"
                  :loading="updatePluginSubscribeLoading">更新订阅
        </t-button>
      </t-space>
    </div>
    <div class="container">
      <t-base-table :data :columns :bordered="false" :height="maxHeight" row-key="id"
                    :hover="true" size="small" :scroll="{ type: 'virtual', rowHeight: 39 }"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {usePluginStore} from "@/store";
import {BaseTableCol} from "tdesign-vue-next";
import {installFromLocal, installFromUrl} from "@/pages/extra/subpage/plugin/func";
import MessageUtil from "@/utils/modal/MessageUtil";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import {QuestionnaireIcon} from 'tdesign-icons-vue-next';
import {
  openPluginSubscribeDialog,
  updatePluginSubscribe,
  updatePluginSubscribeLoading
} from "@/pages/extra/subpage/plugin/subscribe";
import {buildPluginTableColumns} from "@/pages/extra/subpage/plugin/table";

const size = useWindowSize();

const installLoading = ref(false);
const operatorLoading = ref(false);

const data = computed(() => usePluginStore().plugins);
const maxHeight = computed(() => size.height.value - 100);
const columns: Array<BaseTableCol> = buildPluginTableColumns(operatorLoading);

function installFromLocalWrap() {
  installLoading.value = true;
  installFromLocal()
    .then(res => {
      if (res) {
        MessageUtil.success("安装成功");
      }
    })
    .catch(e => {
      MessageUtil.error("安装失败", e);
    })
    .finally(() => {
      installLoading.value = false;
    })
}

async function installFromUrlWrap() {
  const value = await MessageBoxUtil.prompt("请输入源码地址", "从网络导入", {
    confirmButtonText: "导入"
  });
  installLoading.value = true;
  installFromUrl(value)
    .then(() => {
      MessageUtil.success("安装成功");
    })
    .catch(e => {
      MessageUtil.error("安装失败", e);
    })
    .finally(() => {
      installLoading.value = false;
    })
}

</script>
<style scoped lang="less">
.plugin-manage {
  position: relative;
  height: 100%;
  width: 100%;

  .header {
    padding: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

}
</style>
