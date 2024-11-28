<template>
  <div class="plugin-manage">
    <div class="header">
      <t-input style="width: 300px" placeholder="请输入插件名称、插件作者" v-model="keyword">
        <template #suffix-icon>
          <search-icon />
        </template>
      </t-input>
      <t-space>
        <t-dropdown>
          <t-button theme="primary" size="small">
            安装
          </t-button>
          <t-dropdown-menu>
            <t-dropdown-item value="1" @click="installFromLocalWrap" :disabled="installLoading">
              从本地安装
            </t-dropdown-item>
            <t-dropdown-item value="2" @click="installFromUrlWrap" :disabled="installLoading">
              从网络安装
            </t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
        <t-dropdown>
          <t-button theme="primary" size="small" >
            订阅
          </t-button>
          <t-dropdown-menu>
            <t-dropdown-item value="1" @click="openPluginSubscribeDialog">订阅管理</t-dropdown-item>
            <t-dropdown-item value="2" @click="updatePluginSubscribe" :disabled="updatePluginSubscribeLoading">
              更新订阅
            </t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
      </t-space>
    </div>
    <div class="container">
      <t-base-table :data :columns :bordered="false" :height="maxHeight" row-key="id"
                    :hover="true" size="small" :scroll="{ type: 'virtual', rowHeight: 39 }"/>
    </div>
    <t-back-top container=".plugin-manage .t-table__content" style="bottom: 24px;right: 24px"/>
  </div>
</template>
<script lang="ts" setup>
import {usePluginStore} from "@/store";
import {BaseTableCol} from "tdesign-vue-next";
import {installFromLocal, installFromUrl} from "@/pages/extra/subpage/plugin/func";
import MessageUtil from "@/utils/modal/MessageUtil";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import {SearchIcon} from 'tdesign-icons-vue-next';
import {
  openPluginSubscribeDialog,
  updatePluginSubscribe,
  updatePluginSubscribeLoading
} from "@/pages/extra/subpage/plugin/subscribe";
import {buildPluginTableColumns} from "@/pages/extra/subpage/plugin/table";
import {useFuse} from "@vueuse/integrations/useFuse";

const size = useWindowSize();

const installLoading = ref(false);
const operatorLoading = ref(false);

const keyword = ref('')
const plugins = computed(() => usePluginStore().plugins);
const maxHeight = computed(() => size.height.value - 100);
const columns: Array<BaseTableCol> = buildPluginTableColumns(operatorLoading);
const {results} = useFuse(keyword, plugins, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: [{
      name: 'name'
    }, {
      name: 'author'
    }]
  }
});
const data = computed(() =>  results.value.map(e => e.item));


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
