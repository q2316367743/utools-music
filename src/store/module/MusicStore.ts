import {defineStore} from "pinia";
import {MusicItem, MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {listRecordByAsync, removeOneByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {listRepositories, scanRepository} from "@/store/module/RepositoryStore";
import {map} from "@/utils/lang/ArrayUtil";
import {isNotNull} from "@/utils/lang/FieldUtil";
import MessageUtil from "@/utils/modal/MessageUtil";

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
    const all = await listRecordByAsync<Array<MusicItem>>(LocalNameEnum.LIST_MUSIC);
    const musicMap = map(all, 'id');
    for (let repo of list) {
      const musicItems = musicMap.get(`${LocalNameEnum.LIST_MUSIC}/${repo.id}`);
      if (musicItems) {
        musicItems.record.forEach(item => {
          // 只显示本地的和WebDAV的
          if (item.source !== MusicItemSource.LOCAL ||
            item.nativeId === nativeId
          ) {
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
    const all = await listRecordByAsync<Array<MusicItem>>(LocalNameEnum.LIST_MUSIC);
    const musicMap = map(all, 'id');
    // 刷新列表
    for (const item of items) {
      const {key, value} = item;
      if (isNotNull(value)) {
        const docId = `${LocalNameEnum.LIST_MUSIC}/${key}`;
        // 已获取到，删除旧的
        const old = musicMap.get(docId);
        // 此处需要判断是需要更新还是需要新增还是需要删除
        // 保存新的
        await saveListByAsync(docId, value!, old?.rev);
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

  return {
    musics,
    init, scan, removeMusic
  }

})
