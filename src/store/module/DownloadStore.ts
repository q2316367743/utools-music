import {defineStore} from "pinia";
import {MusicItemView} from "@/entity/MusicItem";
import {isNotEmptyString} from "@/utils/lang/StringUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {DownloadItem} from "@/entity/DownloadItem";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {downloadFolder} from "@/store";

export const useDownloadStore = defineStore('download', () => {
  const items = ref(new Array<DownloadItem>());
  let rev: string | undefined = undefined;

  async function init() {
    const res = await listByAsync<DownloadItem>(LocalNameEnum.LIST_DOWNLOAD);
    // 刚创建，如果下载中，则变成失败
    items.value = res.list.map(e => ({
      ...e,
      status: e.status === 1 ? 3 : e.status,
      msg: e.status === 1 ? '下载中断' : ''
    }));
    rev = res.rev
  }

  init()
    .then(() => console.log("下载列表初始化成功"))
    .catch(err => MessageUtil.error('下载列表初始化失败', err));

  async function updateList() {
    rev = await saveListByAsync(LocalNameEnum.LIST_DOWNLOAD, items.value, rev);
  }

  async function emitWrap(item: MusicItemView) {
    const {url, cover, lyric, name, artist} = item;
    const downloadItem: DownloadItem = {
      id: Date.now(),
      name,
      artist,
      music: '',
      status: 1,
      msg: '',
      url,
      cover,
      lyric
    }
    items.value.push(downloadItem);
    await updateList();
    // 执行下载
    await download(downloadItem);

  }

  async function download(item: DownloadItem) {
    MessageUtil.success("开始下载");

    const {name, artist, url, cover, lyric} = item;
    const u = new URL(url);
    const extname = u.pathname.match(/\.[a-zA-Z]*$/);
    const basename = `${artist} - ${name}`;

    // 修改转改为下载中
    for (let i = 0; i < items.value.length; i++) {
      const r = items.value[i];
      if (r.id === item.id) {
        items.value[i] = {
          ...items.value[i],
          status: 1,
        }
        break;
      }
    }

    try {
      const mainPath = await window.preload.downloadFile(url, `${basename}${extname ? extname[0] : '.mp3'}`, downloadFolder.value);
      for (let i = 0; i < items.value.length; i++) {
        const r = items.value[i];
        if (r.id === item.id) {
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
        const r = items.value[i];
        if (r.id === item.id) {
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
      if (isNotEmptyString(cover) && cover) {
        const c = new URL(cover);
        const coverExtname = c.pathname.match(/\.[a-zA-Z]*$/);
        await window.preload.downloadFile(cover, `${basename}${coverExtname ? coverExtname[0] : '.png'}`, downloadFolder.value)
      }
    } catch (e) {
      MessageUtil.error("封面下载失败");
    }
    try {
      if (isNotEmptyString(lyric) && lyric) {
        const l = new URL(lyric);
        const lyricExtname = l.pathname.match(/\.[a-zA-Z]*$/);
        await window.preload.downloadFile(lyric, `${basename}${lyricExtname ? lyricExtname[0] : '.lrc'}`, downloadFolder.value)
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
    emit, remove, download
  }
})
