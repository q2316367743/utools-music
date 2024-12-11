import {MusicItem} from "@/entity/MusicItem";
import {LyricContent} from "@/types/LyricLine";
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";

export interface MusicInstance {
  id: string;

  /**
   * 音乐名称
   */
  name: string;

  /**
   * 演唱者
   */
  artist: string;

  /**
   * 专辑
   */
  album: string;

  /**
   * 封面
   */
  cover: string;

  /**
   * 来源
   */
  source: MusicItemSourceEnum;

  /**
   * 插件ID
   */
  pluginId: number;

  /**
   * 自身数据
   */
  self: any;

  /**
   * 实际的详情
   */
  getInfo: () => Promise<MusicItem>;

  /**
   * 获取歌词
   */
  getLyric: () => Promise<Array<LyricContent>>;

  /**
   * 销毁
   */
  destroy: () => Promise<void>;

}