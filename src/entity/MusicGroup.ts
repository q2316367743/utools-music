import {MusicItem} from "@/entity/MusicItem";

export interface MusicGroupBase {
  name: string;
}

/**
 * 歌曲分组 - 歌单
 */
export interface MusicGroupIndex extends MusicGroupBase {
  id: number;
  /**
   * 所属设备
   */
  nativeId: string;
}

export interface MusicGroupContent {
  id: number;
  /**
   * 歌曲列表
   */
  items: Array<MusicItem>;
}

export interface MusicGroup extends MusicGroupIndex, MusicGroupContent {
}