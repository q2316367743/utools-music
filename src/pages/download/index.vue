<template>
  <div class="download-manage">
    <t-base-table :data :columns row-key="id" :bordered="false" :hover="true" size="small" :max-height="maxHeight"
                  :scroll="{ type: 'virtual', rowHeight: 39 }"></t-base-table>
  </div>
</template>
<script lang="ts" setup>
import {useDownloadStore} from "@/store/module/DownloadStore";
import {BaseTableCol, Tag} from "tdesign-vue-next";

const size = useWindowSize();

const data = computed(() => useDownloadStore().items);
const maxHeight = computed(() => size.height.value - 60);
const columns: Array<BaseTableCol> = [{
  colKey: 'name',
  title: '名称',
  ellipsis: true
}, {
  colKey: 'artist',
  title: '演唱者',
  ellipsis: true
}, {
  colKey: 'status',
  title: '状态',
  ellipsis: true,
  cell: (h, {row}) => {
    let text = '下载中';
    let theme: 'primary' | 'success' | 'danger' = 'primary'
    if (row.status === 2) {
      text = '下载完成'
      theme = 'success'
    } else if (row.status === 3) {
      text = '下载失败，' + row.msg;
      theme = 'danger'
    }
    return h(Tag, {
      size: 'small',
      theme: theme
    }, () => text);
  }
}]
</script>
<style scoped lang="less">

</style>
