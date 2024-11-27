import {IMusicItem} from "@/types/PluginInstance";
import {MusicItem} from "@/entity/MusicItem";

export enum MusicGroupType {
  /**
   * 本地，默认类型
   */
  LOCAL = 1,
  /**
   * 纯网络
   */
  WEB = 2,
  /**
   * 混合
   */
  MIX = 3
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

/**
 * 混合内容，其实是网络混合
 */
export interface MusicGroupMixContent {
  pluginId: number;
  item: IMusicItem
}

/**
 * 歌单内容类型
 */
export type MusicGroupContentItem = MusicItem | IMusicItem | MusicGroupMixContent;

export interface MusicGroupContent {
  id: number;
  /**
   * 歌曲列表: MusicItem|IMusicItem
   */
  items: Array<any>;
}

export interface MusicGroup extends MusicGroupIndex, MusicGroupContent {
}