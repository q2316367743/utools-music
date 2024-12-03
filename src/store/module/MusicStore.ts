import {defineStore} from "pinia";
import {MusicItem, MusicItemView} from "@/entity/MusicItem";
import {listByAsync, listRecordByAsync, removeOneByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {listRepositories, scanRepository} from "@/store";
import {map} from "@/utils/lang/ArrayUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {copyProperties} from "@/utils/lang/FieldUtil";

const LIST_KEY = `${LocalNameEnum.LIST_MUSIC}/`;

export const useMusicStore = defineStore('music', () => {
  const musics = ref(new Array<MusicItemView>());
  const nativeId = utools.getNativeId();

  /**
   * 初始化全部的音乐
   */
  async function init() {
    musics.value = [];
    const musicList = new Array<MusicItemView>();
    // 获取全部存储
    const {list} = await listRepositories();
    // 获取全部的音乐
    const all = await listRecordByAsync<Array<MusicItem>>(LIST_KEY);
    const musicMap = map(all, 'id');
    for (let repo of list) {
      const musicItems = musicMap.get(`${LocalNameEnum.LIST_MUSIC}/${repo.id}`);
      if (musicItems) {
        musicItems.record.forEach(item => {
          if (item.nativeId === nativeId) {
            musicList.push({
              ...item,
              repositoryId: repo.id,
              repositoryName: repo.name,
            })
          }
        })
      }
    }
    musics.value = musicList;
  }


  init()
    .then(() => console.log("音乐初始化成功"))
    .catch(err => MessageUtil.error('音乐初始化失败', err));

  /**
   * 重新扫描全部的音乐
   */
  async function scan() {
    // 扫描音乐
    const items = await scanRepository();
    // 获取全部的音乐
    const all = await listRecordByAsync<Array<MusicItem>>(LIST_KEY);
    const musicMap = map(all, 'id');
    // 刷新列表
    for (const item of items) {
      const {key, value} = item;
      if (!!value) {
        const docId = `${LocalNameEnum.LIST_MUSIC}/${key}`;
        // 获取到旧的
        const old = musicMap.get(docId);
        const oldRecords = old?.record || [];
        const oldMap = map(oldRecords, 'url', (e1, e2) => e2);
        // 此处需要判断是需要更新还是需要新增还是需要删除
        for (let i = 0; i < value.length; i++) {
          const newItem = value[i];
          let oldItem = oldMap.get(newItem.url);
          if (oldItem) {
            value[i] = {
              ...newItem,
              // 保持旧的ID
              id: oldItem.id,
            }
          }
        }
        // 保存新的
        await saveListByAsync(docId, value, old?.rev);
      }
    }
    // 重新初始化
    await init();
  }

  async function removeMusic(repoId: number) {
    // 删除列表
    await removeOneByAsync(`${LocalNameEnum.LIST_MUSIC}/${repoId}`, true);
    // 重新初始化
    await init();
  }

  async function updateById(res: Partial<MusicItemView> & {id: number}) {
    for (const music of musics.value) {
      if (music.id === res.id) {
        const old = await listByAsync<MusicItemView>(`${LocalNameEnum.LIST_MUSIC}/${music.repositoryId}`);
        if (old.list && old.list.length > 0) {
          const index = old.list.findIndex(e => e.id === res.id);
          if (index >= 0) {
            old.list[index] = Object.assign(old.list[index], res);
            await saveListByAsync(`${LocalNameEnum.LIST_MUSIC}/${music.repositoryId}`, old.list, old.rev);
            copyProperties(res, music, true);
            return;
          }
        }
      }
    }
  }

  return {
    musics,
    init, scan, removeMusic, updateById
  }

})
