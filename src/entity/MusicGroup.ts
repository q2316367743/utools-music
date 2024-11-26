export enum MusicGroupType {
  /**
   * 默认
   */
  LOCAL = 1,
  WEB = 2
}

export interface MusicGroupBase {
  name: string;
  cover?: string;
  author?: string;
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
  /**
   * 歌单类型
   */
  type: MusicGroupType;
  /**
   * 插件ID
   */
  pluginId: number;
}

export interface MusicGroupContent {
  id: number;
  /**
   * 歌曲列表: MusicItem|IMusicItem
   */
  items: Array<any>;
}

export interface MusicGroup extends MusicGroupIndex, MusicGroupContent {
}