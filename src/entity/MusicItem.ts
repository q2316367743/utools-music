export enum MusicItemSource {
  LOCAL = 1,
  WEBDAV = 2,
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

export interface MusicItemBase extends MusicItemMeta{
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
