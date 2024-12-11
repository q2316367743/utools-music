import {MusicItem} from "@/entity/MusicItem";
import {isEmptyString} from "@/utils/lang/StringUtil";
import {globalSetting, usePluginStore} from "@/store";
import {type MusicInstance} from "@/types/MusicInstance";
import {music} from "@/components/MusicPlayer/MusicPlayer";
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";

/**
 * 获取一共词图
 * @param item 音乐项
 */
async function getOneCover(item: MusicItem): Promise<string | undefined> {
  const {pluginInstances, updateData} = usePluginStore();
  const list = pluginInstances.toSorted((a, b) => (b.cover || 0) - (a.cover || 0));
  for (let plugin of list) {
    const {search, supportedSearchType, getMusicInfo} = plugin.instance;
    if (!search) {
      continue;
    }
    if (supportedSearchType) {
      // 如果限制了搜索类型
      if (!supportedSearchType.includes('music')) {
        // 不支持的搜索类型
        continue;
      }
    }
    const {data} = await search(item.name, 1, 'music');
    for (let datum of data) {
      try {
        if (datum.artist.trim() === item.artist.trim()) {
          // 作者完全匹配，就是他了
          if (datum.artwork) {
            await updateData(plugin.id, {cover: (plugin.cover || 0) + 1});
            return datum.artwork;
          }
          if (!getMusicInfo) {
            continue;
          }
          const info = await getMusicInfo(datum);
          if (info && info.artwork) {
            await updateData(plugin.id, {cover: (plugin.cover || 0) + 1});
            return info.artwork;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}

/**
 * 匹配词图，只要本地音乐才进行处理，缺啥匹配啥
 */
export function matchMusicAttachment(item: MusicItem, musicInstance: MusicInstance) {
  if (item.source !== MusicItemSourceEnum.LOCAL) {
    return;
  }
  const {playAttachment} = globalSetting.value;
  console.log("准备匹配词图", playAttachment)
  if (!playAttachment) return;
  const {cover, lyric} = item;
  if (isEmptyString(cover)) {
    console.log("准备匹配图")
    // 封面
    getOneCover(item)
      .then((cover) => {
        // 设置封面
        if (cover) {

          if (musicInstance.id !== music.value?.id) {
            // 只要一致才赋值
            return;
          }

          musicInstance.cover = cover;

          // TODO: 下载
          // TODO: 修改列表
        }
      });
  }
  if (isEmptyString(lyric)) {
    // TODO: 歌词
  }
}