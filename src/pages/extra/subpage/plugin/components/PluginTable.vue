<template>
  <div class="plugin-table">
    <table>
      <thead>
      <tr>
        <th>插件名称</th>
        <th>作者</th>
        <th>版本</th>
        <th style="width: 100px;text-align: center">操作</th>
      </tr>
      </thead>
      <tbody class="t-body">
      <tr v-for="item in data" :key="item.id">
        <td class="title">{{ item.name }}</td>
        <td>{{ item.author }}</td>
        <td>{{ item.version }}</td>
        <td style="width: 100px;text-align: right">
          <plugin-table-operator :row="item" />
        </td>
      </tr>
      </tbody>
    </table>
    <t-back-top container=".plugin-table .t-body" style="right: 98px"/>
  </div>
</template>

<script lang="ts" setup>
import PluginTableOperator from "@/pages/extra/subpage/plugin/components/PluginTableOperator.vue";
import {PluginEntity} from "@/entity/PluginEntity";

defineProps({
  data: {
    type: Object as PropType<Array<PluginEntity>>
  }
});


// 设置容器高度
</script>

<style scoped lang="less">
.plugin-table {
  width: 100%;
  height: calc(100vh - 108px);
  overflow: hidden;
  position: relative;

  // 共享表格样式
  table {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    thead {
      width: 100%;
    }

    tbody {
      flex: 1;
      overflow-y: auto;
      display: block;
      width: 100%;

      tr {
        display: table;
        width: 100%;
        table-layout: fixed;
      }
    }

    thead tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

    th,
    td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid var(--td-component-stroke);
    }

    th {
      background: var(--music-bg-color-6);
      color: var(--td-text-color-primary);
      font-weight: 500;
      height: 41px;
      box-sizing: border-box;
    }

    tr {
      &:hover {
        background: var(--music-bg-color-3);
      }
    }

    td {
      color: var(--td-text-color-secondary);

      &.title {
        color: var(--td-text-color-primary);
      }
    }
  }
}
</style>