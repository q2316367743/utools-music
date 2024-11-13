import {MusicItem} from "@/entity/MusicItem";

/**
 * 歌曲分组 - 歌单
 */
export interface MusicGroup {
  id: number;
  /**
   * 歌单名称
   */
  name: string;
  /**
   * 所属设备
   */
  nativeId: string;
  /**
   * 歌曲列表
   */
  items: Array<MusicItem>;
}