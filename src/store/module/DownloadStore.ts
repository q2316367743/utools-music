import {defineStore} from "pinia";
import {MusicItemView} from "@/entity/MusicItem";
import {isNotEmptyString} from "@/utils/lang/StringUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {DownloadItem} from "@/entity/DownloadItem";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";

export const useDownloadStore = defineStore('download', () => {
  const items = ref(new Array<DownloadItem>());
  let rev: string | undefined = undefined;

  async function init() {
    const res = await listByAsync<DownloadItem>(LocalNameEnum.LIST_DOWNLOAD);
    items.value = res.list;
    rev = res.rev
  }

  init()
    .then(() => console.log("插件初始化成功"))
    .catch(err => MessageUtil.error('插件初始化失败', err));

  async function updateList() {
    rev = await saveListByAsync(LocalNameEnum.LIST_DOWNLOAD, items.value, rev);
  }

  async function emitWrap(item: MusicItemView) {
    const {url, cover, lyric, name, artist} = item;
    const basename = `${artist} - ${name}`;
    const u = new URL(url);
    const extname = u.pathname.match(/\.[a-zA-Z]*$/);
    const paths = utools.showOpenDialog({
      title: '请选择音乐保存位置',
      defaultPath: utools.getPath("music"),
      properties: ['openDirectory'],
      buttonLabel: '下载'
    });
    if (!paths || !paths[0]) {
      return Promise.reject(new Error("请选择保存位置"));
    }
    const path = paths[0];
    const downloadItem: DownloadItem = {
      id: Date.now(),
      name,
      artist,
      music: '',
      status: 1,
      msg: ''
    }
    items.value.push(downloadItem);
    await updateList();

    try {
      const mainPath = await window.preload.downloadFile(url, `${basename}${extname ? extname[0] : '.mp3'}`, path);
      for (let i = 0; i < items.value.length; i++) {
        const item = items.value[i];
        if (item.id === downloadItem.id) {
          items.value[i] = {
            ...items.value[i],
            status: 2,
            music: mainPath
          }
          break;
        }
      }
      await updateList();
    } catch (e) {
      for (let i = 0; i < items.value.length; i++) {
        const item = items.value[i];
        if (item.id === downloadItem.id) {
          items.value[i] = {
            ...items.value[i],
            status: 3,
            msg: `${(e as any).message || e}`
          }
          break;
        }
      }
      await updateList();
      return Promise.reject(e);
    }

    // 下载完成

    try {
      if (isNotEmptyString(cover)) {
        const c = new URL(cover);
        const coverExtname = c.pathname.match(/\.[a-zA-Z]*$/);
        await window.preload.downloadFile(cover, `${basename}${coverExtname ? coverExtname[0] : '.png'}`, path)
      }
    } catch (e) {
      MessageUtil.error("封面下载失败");
    }
    try {
      if (isNotEmptyString(lyric)) {
        const l = new URL(lyric);
        const lyricExtname = l.pathname.match(/\.[a-zA-Z]*$/);
        await window.preload.downloadFile(cover, `${basename}${lyricExtname ? lyricExtname[0] : '.lrc'}`, path)
      }
    } catch (e) {
      MessageUtil.error("歌词下载失败");
    }

  }

  function emit(item: MusicItemView) {
    emitWrap(item)
      .then(() => MessageUtil.success("下载成功"))
      .catch(e => MessageUtil.error("下载失败", e));
  }

  async function remove(id: number) {
    const index = items.value.findIndex(e => e.id === id);
    if (index > -1) {
      items.value.splice(index, 1);
      await updateList();
    }
  }

  return {
    items,
    emit,remove
  }
})
