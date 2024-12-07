import {defineStore} from "pinia";
import {
  MusicGroup,
  MusicGroupContent,
  MusicGroupIndex,
  MusicGroupType
} from "@/entity/MusicGroup";
import {
  getFromOneByAsync,
  listByAsync,
  removeOneByAsync,
  saveListByAsync,
  saveOneByAsync
} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {MusicItem} from "@/entity/MusicItem";
import {isEmptyString} from "@/utils/lang/StringUtil";
import {IMusicItem} from "@/types/PluginInstance";
import {isEmptyArray} from "@/utils/lang/FieldUtil";

export const useMusicGroupStore = defineStore('music-group', () => {
  const musicGroups = ref(new Array<MusicGroupIndex>());
  let rev: string | undefined = undefined;
  const nativeId = utools.getNativeId();

  const musicGroupItems = computed(() =>
    musicGroups.value.filter(e => {
      if (e.type === MusicGroupType.WEB || e.type === MusicGroupType.MIX) {
        return true;
      }
      return e.nativeId === nativeId
    }));

  async function init() {
    const res = await listByAsync(LocalNameEnum.LIST_MUSIC_GROUP);
    musicGroups.value = res.list;
    rev = res.rev;
  }

  init()
    .then(() => console.log("歌单初始化成功"))
    .catch(e => console.error("歌单初始化失败", e));

  async function loadMusicItems(id: number): Promise<Array<any>> {
    const res = await getFromOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`);
    if (!res.record) {
      return [];
    }
    return res.record.items;
  }

  async function postMusicGroupIndex(musicGroup: MusicGroupIndex): Promise<void> {
    if (isEmptyString(musicGroup.name)) return Promise.reject(new Error("歌单必须有名称"));
    // 新增列表
    const index = musicGroups.value.findIndex((e) => e.id === musicGroup.id);
    if (index >= 0) {
      // 修改
      musicGroups.value[index] = {
        ...musicGroups.value[index],
        name: musicGroup.name,
      }
    } else {
      // 新增
      musicGroups.value.push({
        id: musicGroup.id,
        name: musicGroup.name,
        nativeId: musicGroup.nativeId,
        type: musicGroup.type,
        pluginId: musicGroup.pluginId,
        cover: musicGroup.cover,
        author: musicGroup.author,
      });
    }
    // 保存列表
    rev = await saveListByAsync(LocalNameEnum.LIST_MUSIC_GROUP, musicGroups.value);
  }

  async function postMusicGroup(musicGroup: MusicGroup): Promise<void> {
    await postMusicGroupIndex(musicGroup);

    // 获取旧的歌单列表
    const res = await getFromOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${musicGroup.id}`);

    // 保存新的歌单列表
    await saveOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${musicGroup.id}`, {
      id: musicGroup.id,
      items: musicGroup.items,
    }, res.rev);
  }

  async function deleteMusicGroup(id: number): Promise<void> {
    const index = musicGroups.value.findIndex((e) => e.id === id);
    if (index >= 0) {
      // 删除列表
      musicGroups.value.splice(index, 1);
      rev = await saveListByAsync(LocalNameEnum.LIST_MUSIC_GROUP, musicGroups.value);
      // 删除歌曲
      await removeOneByAsync(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`)
    }
  }

  async function appendMusicGroup(id: number, ...musicItems: Array<MusicItem>): Promise<void> {
    const res = await getFromOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`);
    const {record, rev} = res;
    if (record) {
      for (const musicItem of musicItems) {
        // 更新
        const index = record.items.findIndex((e) => e.id === id);
        if (index === -1) {
          // 不存在，新增
          record.items.push(musicItem);
        }
      }
      await saveOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`, record, rev);
    } else {
      // 新增
      await saveOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`, {
        id,
        items: musicItems,
      });
    }
  }

  /**
   * 追加音乐到混合组
   * @param id 歌单ID
   * @param musicItems 歌曲列表
   * @param pluginId 插件ID
   */
  async function appendMixGroup(id: number, musicItems: Array<IMusicItem>, pluginId: number): Promise<void> {

    const res = await getFromOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`);
    const {record, rev} = res;
    let now = Date.now();

    const musicGroupMixContents = musicItems.map(e => ({
      ...e,
      pluginId,
      // 确保一定有ID
      id: e.id || (now++)
    }));

    if (record) {
      // 更新
      const index = record.items.findIndex((e) => e.id === id);
      if (index === -1) {
        // 不存在，新增
        record.items.push(...musicGroupMixContents);
        await saveOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`, record, rev);
      }
    } else {
      // 新增
      await saveOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`, {
        id,
        items: musicGroupMixContents,
      });
    }

  }

  async function removeContentItem(id: number, index: number): Promise<void> {

    const res = await getFromOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`);
    const {record, rev} = res;
    if (!record || isEmptyArray(record.items)) {
      return;
    }
    record.items.splice(index, 1);
    await saveOneByAsync<MusicGroupContent>(`${LocalNameEnum.ITEM_MUSIC_GROUP}/${id}`, record, rev);
  }

  return {
    musicGroups, musicGroupItems,
    loadMusicItems, postMusicGroup, postMusicGroupIndex, deleteMusicGroup,
    appendMusicGroup, appendMixGroup, removeContentItem
  }

})