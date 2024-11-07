import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {Repository, RepositoryType} from "@/entity/Repository";
import {MusicItem} from "@/entity/MusicItem";
import {readFiles} from "@/utils/file/FileUtil";

/**
 * 获取全部的仓库
 */
export function listRepositories() {
  return listByAsync<Repository>(LocalNameEnum.LIST_REPOSITORY);
}

/**
 * 保存仓库
 * @param val 仓库列表
 * @param rev 恢复值
 */
export function saveRepositories(val: Array<Repository>, rev?: string) {
  return saveListByAsync<Repository>(LocalNameEnum.LIST_REPOSITORY, val, rev);
}

/**
 * 扫描本地音乐
 * @param repo 本地仓库
 */
async function scanLocal(repo: Repository): Promise<Array<MusicItem>> {
  const files = await readFiles(repo.path);
  // TODO: 文件分组，用于处理封面和歌词
  // TODO: 寻找合适的音乐
  return  [];
}

/**
 * 扫描全部仓库，并返回扫描到的音乐
 */
export async function scanRepository(): Promise<Array<MusicItem>> {
  const {list} = await listRepositories();
  const nativeId = utools.getNativeId();
  const items = new Array<MusicItem>();

  for (let repository of list) {
    if (repository.type === RepositoryType.LOCAL) {
      if (repository.nativeId !== nativeId) {
        continue;
      }
      const temp = await scanLocal(repository);
      items.push(...temp);
    }else if (repository.type === RepositoryType.WEBDAV) {
      // WebDAV
    }
  }
  return items
}
