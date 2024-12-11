<template>
  <t-button size="small" @click="handleOpen">扫描音乐</t-button>
  <t-dialog v-model:visible="visible" header="扫描音乐" top="10vh" dialog-class-name="music-scanner-dialog"
            attach="body" width="650px">
    <template #footer>
      <t-button theme="default" @click="handleClose" :loading>关闭</t-button>
      <t-button @click="handleScan" :loading>扫描</t-button>
    </template>
    <t-paragraph>
      <div style="display: flex;justify-content: space-between;">
        <div>将扫描以下文件夹的音乐</div>
        <t-button size="small" @click="handleEdit()" :loading>添加文件夹</t-button>
      </div>
    </t-paragraph>
    <t-card style="height: 200px;overflow: auto">
      <t-loading :loading="loading" text="正在扫描音乐中...">
        <div class="repo-item" v-for="repo in repositories" :key="repo.id"
             :class="{disabled: repo.nativeId !== nativeId}">
          <t-space>
            <t-tag size="small" theme="primary">
              <span v-if="repo.type === MusicItemSourceEnum.LOCAL">本地</span>
              <span v-else-if="repo.type === MusicItemSourceEnum.WEBDAV">WebDAV</span>
              <span v-else-if="repo.type === MusicItemSourceEnum.A_LIST">AList</span>
            </t-tag>
            <t-tooltip v-if="repo.nativeId !== nativeId" content="此文件夹不是当前设备">
              <span class="ellipsis">{{ repo.name }}</span>
            </t-tooltip>
            <span v-else class="ellipsis">{{ repo.name }}</span>
          </t-space>
          <div>
            <t-tooltip content="扫描">
              <t-button size="small" theme="primary" variant="text" :loading @click="handleScanOne(repo)">
                <template #icon>
                  <scan-icon/>
                </template>
              </t-button>
            </t-tooltip>
            <t-tooltip content="编辑">
              <t-button size="small" theme="primary" variant="text" :loading @click="handleEdit(repo)">
                <template #icon>
                  <edit-icon/>
                </template>
              </t-button>
            </t-tooltip>
            <t-popconfirm content="确认删除吗？" @confirm="handleDelete(repo)">
              <t-button size="small" theme="danger" variant="text" :loading>
                <template #icon>
                  <delete-icon/>
                </template>
              </t-button>
            </t-popconfirm>
          </div>
        </div>
      </t-loading>
    </t-card>
  </t-dialog>
</template>
<script lang="ts" setup>
import {Repository} from "@/entity/Repository";
import {listRepositories, saveRepositories, useMusicStore} from "@/store";
import {editRepository} from "@/pages/local/components/MusicScanner/MusicScannerEdit";
import MessageUtil from "@/utils/modal/MessageUtil";
import {DeleteIcon, EditIcon, ScanIcon} from 'tdesign-icons-vue-next';
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";

const nativeId = utools.getNativeId();
const visible = ref(false);
const loading = ref(false);
const repositories = ref(new Array<Repository>());
let rev: string | undefined = undefined

function handleOpen() {
  visible.value = true;
  listRepositories().then(res => {
    repositories.value = res.list;
    rev = res.rev;
  });
}

function handleClose() {
  visible.value = false;
  repositories.value = [];
  rev = undefined;
}


async function handleEdit(res?: Repository) {
  // 获取新的仓库
  const form = await editRepository(res);
  const index = repositories.value.findIndex(e => e.id === form.id);
  if (index > -1) {
    // 修改
    repositories.value[index] = form;
  } else {
    // 新增到仓库列表
    repositories.value.push(form);
  }
  // 保存新的仓库
  rev = await saveRepositories(repositories.value, rev);
}

async function handleDelete(repo: Repository) {
  const index = repositories.value.findIndex(r => r.id === repo.id);
  if (index >= 0) {
    repositories.value.splice(index, 1);
    rev = await saveRepositories(repositories.value, rev);
    // 删除歌曲
    await useMusicStore().removeMusic(repo.id);
  }
}

async function handleScan() {
  loading.value = true;
  useMusicStore().scan()
    .then(() => {
      MessageUtil.success("扫描完成");
      visible.value = false;
    })
    .catch((err) => {
      MessageUtil.error("扫描失败", err);
    })
    .finally(() => {
      loading.value = false;
    })
}

async function handleScanOne(res: Repository) {
  loading.value = true;
  useMusicStore().scanOne(res)
    .then(() => {
      MessageUtil.success("扫描完成");
      visible.value = false;
    })
    .catch((err) => {
      MessageUtil.error("扫描失败", err);
    })
    .finally(() => {
      loading.value = false;
    })
}
</script>
<style scoped lang="less">
.music-scanner-dialog {
  .repo-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--td-component-border);

    &.disabled {
      text-decoration: line-through;
      color: var(--td-text-color-disabled);
    }
  }
}
</style>
