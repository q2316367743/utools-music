import {LyricLine} from "@/types/LyricLine";
import {BaseTableCellParams, RowEventContext, TableRowData} from "tdesign-vue-next";
import {IMusicItem} from "@/types/PluginInstance";
import {usePluginStore} from "@/store";

export function transferTextToLyric(text: string): Array<LyricLine> {
  const lyricLines = new Array<LyricLine>();
  const lines = text.split("\n");
  for (let line of lines) {
    const time = line.match(/\[\d{2}:\d{2}\.\d{2}]/g);
    const text = line.replace(/\[\d{2}:\d{2}\.\d{2}]/g, '');
    if (time) {
      time.forEach(t => {
        const minutes = parseInt(t.slice(1, 3));
        const seconds = parseFloat(t.slice(4, 9));
        const timeInSeconds = minutes * 60 + seconds;
        lyricLines.push({
          text: text.trim(),
          start: timeInSeconds,
          end: 0
        })
      });
    }
  }
  return lyricLines;
}


interface MusicInfo {
  item: IMusicItem,
  url: string
}

/**
 * 从插件获取播放详情
 * @param context 音乐上下文
 * @param pluginId 插件ID
 */
export async function getMusicItemFromPlugin(context: RowEventContext<TableRowData> | BaseTableCellParams<TableRowData>, pluginId: number): Promise<MusicInfo> {
  let musicItem = context.row as IMusicItem;
  const {pluginInstances} = usePluginStore();
  for (let plugin of pluginInstances) {
    if (plugin.id === pluginId) {
      try {
        if (plugin.instance.getMediaSource) {
          const mediaSource = await plugin.instance.getMediaSource(musicItem, 'standard');
          if (mediaSource) {
            musicItem = Object.assign(musicItem, mediaSource);
          }
        }
      } catch (e) {
        console.error("获取音源失败", e);
      }
      try {
        if (plugin.instance.getMusicInfo) {
          const info = await plugin.instance.getMusicInfo(musicItem);
          if (info) {
            musicItem = Object.assign(musicItem, info);
          }
        }
      } catch (e) {
        console.error("获取音乐详情失败", e);
      }
      try {
        if (plugin.instance.getLyric) {
          const lyric = await plugin.instance.getLyric(musicItem);
          if (lyric && lyric.rawLrc) {
            musicItem.rawLrc = lyric.rawLrc;
          }
        }
      } catch (e) {
        console.error("获取歌词失败", e);
      }
      break;
    }
  }
  let url: string
  if (!musicItem.url) {
    return Promise.reject(new Error("音乐链接不存在"));
  }
  url = musicItem.url;
  return {item: musicItem, url}
}