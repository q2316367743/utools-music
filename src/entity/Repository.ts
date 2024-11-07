export enum RepositoryType {
  /**
   * 本地
   */
  LOCAL = 1,
  /**
   * WebDAV
   */
  WEBDAV = 2
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
  type: RepositoryType;
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
    type: RepositoryType.LOCAL,
    path: '',
    nativeId: utools.getNativeId(),
    url: '',
    username: '',
    password: '',
  }
}
