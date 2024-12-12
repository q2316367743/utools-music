import {MusicItemMeta, MusicItemView} from "@/entity/MusicItem";
import {MusicInstanceLocal} from "@/music/MusicInstanceLocal";
import {MusicInstanceWebDAV} from "@/music/MusicInstanceWebDAV";
import {MusicInstanceAList} from "@/music/MusicInstanceAList";
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";
import {IMusicItem} from "@/types/PluginInstance";
import {MusicInstanceWeb} from "@/music/MusicInstanceWeb";

/**
 * 音乐列表项
 */
export interface MusicListItemLocal {
  id: string;
  data: MusicItemView;
  source: MusicItemSourceEnum.LOCAL | MusicItemSourceEnum.WEBDAV | MusicItemSourceEnum.A_LIST;
}


/**
 * 音乐列表项
 */
export interface MusicListItemWeb {
  id: string;
  data: IMusicItem;
  source: MusicItemSourceEnum.WEB;
  pluginId: number;
}

export type MusicListItem = (MusicListItemLocal | MusicListItemWeb) & MusicItemMeta;

export function createMusicListItemByLocal(data: MusicItemView): MusicListItem {
  return {
    id: data.id + '',
    data,
    source: data.source,
    name: data.name,
    artist: data.artist,
    album: data.album,
    duration: data.duration,
  } as MusicListItemLocal & MusicItemMeta
}

export function createMusicListItemByWeb(data: IMusicItem, pluginId: number): MusicListItem {
  return {
    id: data.id + '',
    data,
    source: MusicItemSourceEnum.WEB,
    pluginId,
    name: data.title,
    artist: data.artist,
    album: data.album,
    duration: data.duration,
  } as MusicListItemWeb& MusicItemMeta;
}


export function buildMusicInstance(item: MusicListItem) {
  if (item.source === MusicItemSourceEnum.LOCAL) {
    return new MusicInstanceLocal(item.data);
  } else if (item.source === MusicItemSourceEnum.WEBDAV) {
    return new MusicInstanceWebDAV(item.data);
  } else if (item.source === MusicItemSourceEnum.A_LIST) {
    return new MusicInstanceAList(item.data);
  } else if (item.source === MusicItemSourceEnum.WEB) {
    return new MusicInstanceWeb(item.data, item.pluginId);
  }
  throw new Error("音乐来源不支持");
}