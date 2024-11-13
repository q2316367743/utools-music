import {defineStore} from "pinia";
import {MusicGroup, MusicGroupContent, MusicGroupIndex} from "@/entity/MusicGroup";
import {getFromOneByAsync, listByAsync, saveListByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {MusicItem} from "@/entity/MusicItem";

export const useMusicGroupStore = defineStore('music-group', () => {
  const musicGroups = ref(new Array<MusicGroupIndex>());
  let rev: string | undefined = undefined;

  async function init() {
    const res = await listByAsync(LocalNameEnum.LIST_MUSIC_GROUP);
    musicGroups.value = res.list;
    rev = res.rev;
  }

  init()
    .then(() => console.log("歌单初始化成功"))
    .catch(e => console.error("歌单初始化失败", e));

  async function loadMusicGroups(id: number): Promise<Array<MusicItem>> {
    const res = await getFromOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`);
    if (!res.record) {
      return [];
    }
    return res.record.items;
  }

  async function postMusicGroup(musicItem: MusicGroup): Promise<void> {
    // 新增列表
    const index = musicGroups.value.findIndex((e) => e.id === musicItem.id);
    if (index >= 0) {
      // 修改
      musicGroups.value[index] = {
        ...musicGroups.value[index],
        name: musicItem.name,
      }
    }else {
      // 新增
      musicGroups.value.push({
        id: musicItem.id,
        name: musicItem.name,
        nativeId: utools.getNativeId()
      });
    }
    // 保存列表
    await saveListByAsync(LocalNameEnum.LIST_MUSIC_GROUP, musicGroups.value);

    // 获取旧的歌单列表
    const res = await getFromOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${musicItem.id}`);

    // 保存新的歌单列表
    await saveOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${musicItem.id}`, {
      id: musicItem.id,
      items: musicItem.items,
    }, res.rev);

  }

  return {
    musicGroups,
    loadMusicGroups, postMusicGroup
  }

})