<template>
  <div class="download-manage">
    <t-tabs default-value="ongoing">
      <t-tab-panel value="ongoing" label="下载中">
        <div class="table-container">
          <table class="custom-table">
            <thead>
            <tr>
              <th>名称</th>
              <th>演唱者</th>
              <th>下载时间</th>
              <th>操作</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(row, index) in ongoingDownloads" :key="row.id"
                :class="{ 'hover': hoveredIndex === index, active: index === currentIndex }"
                @mouseover="hoveredIndex = index"
                @mouseleave="hoveredIndex = null">
              <td>{{ row.name }}</td>
              <td>{{ row.artist }}</td>
              <td>{{ prettyDate(row.id) }}</td>
              <td>
                <t-button theme="primary" variant="text" @click="retryDownload(row)">
                  重试
                </t-button>
                <t-popconfirm content="是否删除下载记录" @confirm="removeDownload(row.id)">
                  <t-button theme="danger" variant="text">删除</t-button>
                </t-popconfirm>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </t-tab-panel>
      <t-tab-panel value="completed" label="已完成">
        <div class="table-container">
          <table class="custom-table">
            <thead>
            <tr>
              <th>名称</th>
              <th>演唱者</th>
              <th>下载时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(row, index) in completedDownloads" :key="row.id"
                :class="{ 'hover': hoveredIndex === index, active: index === currentIndex }"
                @mouseover="hoveredIndex = index"
                @mouseleave="hoveredIndex = null">
              <td>{{ row.name }}</td>
              <td>{{ row.artist }}</td>
              <td>{{ prettyDate(row.id) }}</td>
              <td>
                <t-tag size="small" :theme="getStatusTheme(row.status)">
                  {{ getStatusText(row.status) }}
                </t-tag>
              </td>
              <td>
                <t-space>
                  <t-tooltip content="在文件夹中显示">
                    <t-button theme="primary" variant="text" shape="square" @click="showInFolder(row)">
                      <template #icon>
                        <folder-icon/>
                      </template>
                    </t-button>
                  </t-tooltip>
                </t-space>
                <t-popconfirm content="是否删除下载记录" @confirm="removeDownload(row.id)">
                  <t-button theme="danger" variant="text" shape="square">
                    <template #icon>
                      <delete-icon/>
                    </template>
                  </t-button>
                </t-popconfirm>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script lang="ts" setup>
import {useDownloadStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import {DownloadIngItem, DownloadItem} from "@/entity/DownloadItem";
import {prettyDate} from "@/utils/lang/FormatUtil";
import {DeleteIcon, FolderIcon} from "tdesign-icons-vue-next";

const downloadStore = useDownloadStore();

const ongoingDownloads = computed(() => downloadStore.ings);
const completedDownloads = computed(() => downloadStore.dones);

const hoveredIndex = ref<number | null>(null);
const currentIndex = ref(-1);


const getStatusText = (status: number) => {
  if (status === 2) {
    return '下载成功';
  } else if (status === 3) {
    return '下载失败';
  }
  return '下载中';
};

const getStatusTheme = (status: number) => {
  if (status === 2) {
    return 'success';
  } else if (status === 3) {
    return 'danger';
  }
  return 'primary';
};

const retryDownload = (item: DownloadIngItem) => {
  downloadStore.download(item);
};

const removeDownload = (id: number) => {
  downloadStore.remove(id)
    .then(() => MessageUtil.success("删除成功"))
    .catch(e => MessageUtil.error("删除失败", e));
};

const showInFolder = (item: DownloadItem) => {
  utools.shellShowItemInFolder(item.music);
}
</script>

<style scoped lang="less">
.download-manage {
  position: relative;
  height: 100%;
  width: 100%;
  contain: strict;

  .table-container {
    height: calc(100vh - 110px);
    overflow-y: auto;
    border: 1px solid var(--music-bg-color-3);

    .custom-table {
      width: 100%;
      border-collapse: collapse;

      thead {
        background-color: var(--music-bg-color-6);
        position: sticky;
        top: 0;
        z-index: 1;

        th {
          padding: 8px;
          text-align: left;
          cursor: pointer;
          border-bottom: 1px solid var(--td-border-level-2-color);
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid var(--td-border-level-2-color);

          &.active {
            animation: flashBackground 1s linear infinite;
          }

          &.hover {
            background-color: var(--music-bg-color-6);
          }

          &:last-child {
            border-bottom: none;
          }

          td {
            padding: 8px;
            max-width: 150px;
          }
        }
      }
    }
  }
}

@keyframes flashBackground {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: var(--td-text-color-brand);
  }
}
</style>
