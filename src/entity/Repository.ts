import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";

// 仓库文件名规则
export enum RepositoryFileNameRuleEnum {
  // 歌手-歌名（默认）
  ARTIST_NAME = 1,
  // 歌名-歌手
  NAME_ARTIST = 2,
  // 歌名
  NAME = 3
}

export interface RepositoryBase {

  id: number;

  /**
   * 仓库名称
   */
  name: string;

  /**
   * 仓库类型
   */
  type: MusicItemSourceEnum;
}

export interface Repository extends RepositoryBase {

  /**
   * 仓库路径
   */
  path: string;

  /**
   * 所属设备
   */
  nativeId: string;

  /**
   * 是否绑定本地
   */
  isNative: boolean;

  /**
   * 仓库文件名规则
   */
  fileNameRule: RepositoryFileNameRuleEnum;

  url: string;
  username: string;
  password: string;
}

export function buildRepository(): Repository {
  return {
    id: Date.now(),
    name: '',
    type: MusicItemSourceEnum.LOCAL,
    path: '',
    nativeId: utools.getNativeId(),
    isNative: true,
    fileNameRule: RepositoryFileNameRuleEnum.ARTIST_NAME,
    url: '',
    username: '',
    password: '',
  }
}
