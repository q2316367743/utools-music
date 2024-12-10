import {IMusicItem} from "@/types/PluginInstance";
import {stringToBase64} from "@/utils/file/CovertUtil";

export enum MusicItemSource {
  LOCAL = 1,
  WEBDAV = 2,
  WEB = 3,
  A_LIST = 4
}

export interface MusicItemMeta {

  /**
   * 音乐名称
   */
  name: string;
  /**
   * 作者
   */
  artist: string;
  /**
   * 专辑
   */
  album: string;
  /**
   * 时长，单位s
   */
  duration: number;
}

export interface MusicItemBase extends MusicItemMeta {
  id: number;
}

export interface MusicItemLink {

  /**
   * 歌曲url
   */
  url: string;
  /**
   * 歌词链接
   */
  lyric: string;
  /**
   * 封面
   */
  cover: string;

  /**
   * 文件夹
   */
  folder?: string;
  /**
   * 目录
   */
  dir?: string;

}

export interface MusicItemExtra {

  /**
   * 所属设备
   */
  nativeId: string;
  /**
   * 来源
   */
  source: MusicItemSource;

}

/**
 * 音乐实体
 * `${nativeId}:${url}`是唯一值
 */
export interface MusicItem extends MusicItemBase, MusicItemLink, MusicItemExtra {
}


export interface MusicItemView extends MusicItem {
  repositoryId: number;
  repositoryName: string;
}

export function transferMusicItem(view: MusicItemView): MusicItem {
  return {
    id: view.id,
    name: view.name,
    artist: view.artist,
    album: view.album,
    duration: view.duration,
    cover: view.cover,
    lyric: view.lyric,
    url: view.url,
    nativeId: view.nativeId,
    source: view.source,
  }
}

export function buildFromIMusicItem(item: IMusicItem, url: string): MusicItemView {
  let lyric = '';
  if (item.lrc) {
    lyric = item.lrc;
  } else if (item.rawLrc) {
    lyric = `data:text/plain;base64,${stringToBase64(item.rawLrc)}`;
  }
  return {
    id: Date.now(),
    name: item.title || '',
    artist: item.artist || '',
    cover: item.artwork || '',
    url,
    duration: item.duration || 0,
    album: item.album || '',
    lyric,
    source: MusicItemSource.WEB,
    nativeId: utools.getNativeId(),
    repositoryName: '',
    repositoryId: 0
  }
}
