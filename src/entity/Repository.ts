import {MusicItemSource} from "@/entity/MusicItem";


export interface RepositoryBase {

  id: number;

  /**
   * 仓库名称
   */
  name: string;

  /**
   * 仓库类型
   */
  type: MusicItemSource;
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

  url: string;
  username: string;
  password: string;
}

export function buildRepository(): Repository {
  return {
    id: Date.now(),
    name: '',
    type: MusicItemSource.LOCAL,
    path: '',
    nativeId: utools.getNativeId(),
    url: '',
    username: '',
    password: '',
  }
}
