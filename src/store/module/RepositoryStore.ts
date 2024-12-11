import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {Repository} from "@/entity/Repository";
import {MusicItem} from "@/entity/MusicItem";
import {KeyValue} from "@/types/KeyValue";
import {scanAList, scanLocal, scanWebDAV} from "@/utils/file/MusicUtil";
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";

const nativeId = utools.getNativeId();

/**
 * 获取全部的仓库
 */
export function listRepositories() {
  return listByAsync<Repository>(LocalNameEnum.LIST_REPOSITORY);
}

export async function listUsableRepositories() {
  const {list} = await listRepositories();
  return  list.filter(l => {
    if (l.type === MusicItemSourceEnum.LOCAL || l.isNative) {
      return l.nativeId === nativeId;
    }
    return true;
  });
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
 * 扫描全部仓库，并返回扫描到的音乐
 */
export async function scanRepository(): Promise<Array<KeyValue<Array<MusicItem> | null, number>>> {
  const list = await listUsableRepositories();
  const items = new Array<KeyValue<Array<MusicItem> | null, number>>();

  for (let repository of list) {
    if (repository.type === MusicItemSourceEnum.LOCAL) {
      const temp = await scanLocal(repository);
      items.push({
        key: repository.id,
        value: temp
      });
    } else if (repository.type === MusicItemSourceEnum.WEBDAV) {
      // WebDAV
      const temp = await scanWebDAV(repository);
      items.push({
        key: repository.id,
        value: temp
      });
    }else if (repository.type === MusicItemSourceEnum.A_LIST) {
      // AList
      const temp = await scanAList(repository);
      items.push({
        key: repository.id,
        value: temp
      });
    }
  }
  return items
}
