<template>
  <div class="plugin-manage">
    <div class="header">
      <t-space>
        <t-button theme="primary" size="small" @click="installFromLocalWrap" :loading="installLoading">从本地安装
        </t-button>
        <t-button theme="primary" size="small" @click="installFromUrlWrap" :loading="installLoading">从网络安装
        </t-button>
      </t-space>
      <t-space>
        <t-button theme="primary" size="small" :disabled="true">订阅管理</t-button>
        <t-button theme="primary" size="small" :disabled="true">更新订阅</t-button>
      </t-space>
    </div>
    <div class="container">
      <t-base-table :data :columns :bordered="false" :height="maxHeight" row-key="id"
                    :hover="true" size="small" :scroll="{ type: 'virtual', rowHeight: 39 }"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {usePluginStore} from "@/store/module/PluginStore";
import {BaseTableCol, Button, Popconfirm} from "tdesign-vue-next";
import {installFromLocal, installFromUrl} from "@/pages/plugin/func";
import MessageUtil from "@/utils/modal/MessageUtil";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";

const size = useWindowSize();

const installLoading = ref(false);
const operatorLoading = ref(false);

const data = computed(() => usePluginStore().plugins);
const maxHeight = computed(() => size.height.value - 100);
const columns: Array<BaseTableCol> = [{
  colKey: 'name',
  title: '名称',
  ellipsis: true
}, {
  colKey: 'author',
  title: '作者',
  width: 140,
  ellipsis: true
}, {
  colKey: 'version',
  title: '版本',
  width: 80,
  ellipsis: true
}, {
  colKey: 'operator',
  title: '操作',
  width: 140,
  cell: (h, {row}) => {
    return h('div', {}, [
      h(Button, {theme: 'primary', variant: 'text', loading: operatorLoading.value}, () => '更新'),
      h(Popconfirm, {
        content: '是否卸载插件',
        onConfirm: () => {
          operatorLoading.value = true
          usePluginStore().removePlugin(row.id)
            .then(() => {
              MessageUtil.success("卸载成功");
            })
            .catch(e => {
              MessageUtil.error("卸载失败", e);
            })
            .finally(() => {
              operatorLoading.value = false;
            })
        }
      }, () => h(Button, {theme: 'danger', variant: 'text', loading: operatorLoading.value}, () => '卸载'))
    ])
  }
}];

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
