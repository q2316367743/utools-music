import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {Repository, RepositoryType} from "@/entity/Repository";
import {MusicItem, MusicItemSource} from "@/entity/MusicItem";
import {FileItem, parseFileToMusic, readFileList} from "@/utils/file/FileUtil";
import {group} from "@/utils/lang/ArrayUtil";
import {IMAGE_EXTNAME, LYRIC_EXTNAME, MUSIC_EXTNAME} from "@/global/Constant";
import {isNotEmptyString} from "@/utils/lang/StringUtil";
import {basenameWeb, copyProperties, extnameWeb, parseMusicName} from "@/utils/lang/FieldUtil";
import {KeyValue} from "@/types/KeyValue";
import {AuthType, createClient} from "webdav";
import {FileStat} from "webdav/dist/node/types";

const nativeId = utools.getNativeId();

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

async function parseMusicItemFromFileItem(files: Array<FileItem>, source: MusicItemSource): Promise<Array<MusicItem>> {
  const musicItems = new Array<MusicItem>();
  // 文件分组，用于处理封面和歌词
  const fileMap = group(files, 'basename');
  // 寻找合适的音乐
  let start = Date.now();
  for (const e of fileMap) {
    const [k, v] = e;
    const {name, artist} = parseMusicName(k);
    const musicItem: MusicItem = {
      id: start++,
      name,
      nativeId,
      source,

      url: '',
      cover: '',
      lyric: '',

      album: '',
      artist,
      duration: 0
    }
    v.forEach(e => {
      if (MUSIC_EXTNAME.includes(e.extname)) {
        musicItem.url = e.path;
      } else if (IMAGE_EXTNAME.includes(e.extname)) {
        musicItem.cover = e.path;
      } else if (LYRIC_EXTNAME.includes(e.extname)) {
        musicItem.lyric = e.path;
      }
    });
    if (isNotEmptyString(musicItem.url)) {
      // 获取歌曲元信息
      if (!/https?:\/\//.test(musicItem.url)) {
        // 链接，跳过
        try {
          const meta = await parseFileToMusic(musicItem.url);
          copyProperties(meta, musicItem);
        } catch (e) {
          console.error("元数据解析失败", e)
        }
      }
      musicItems.push(musicItem);
    }
  }
  return musicItems;
}

/**
 * 扫描本地音乐
 * @param repo 本地仓库
 */
async function scanLocal(repo: Repository): Promise<Array<MusicItem>> {
  const files = await readFileList(repo.path);
  return parseMusicItemFromFileItem(files, MusicItemSource.LOCAL);
}

function renderFileFromWebDAV(stat: FileStat): FileItem {
  const basename = basenameWeb(stat.basename);
  const extname = extnameWeb(stat.basename);

  return {
    name: stat.basename,
    basename,
    extname,
    path: stat.filename
  }
}

/**
 * 扫描本地音乐
 * @param repo 本地仓库
 */
async function scanWebDAV(repo: Repository): Promise<Array<MusicItem>> {
  const client = createClient(repo.url, {
    username: repo.username,
    password: repo.password,
    authType: AuthType.Auto
  });
  let directoryContents = await client.getDirectoryContents(repo.path || '/');
  let list: Array<FileStat>;
  if (Array.isArray(directoryContents)) {
    list = directoryContents
  } else {
    list = directoryContents.data;
  }
  const files = new Array<FileItem>();
  for (const file of list) {
    if (file.type === 'directory') {
      continue;
    }
    files.push(renderFileFromWebDAV(file));
  }
  return parseMusicItemFromFileItem(files, MusicItemSource.WEBDAV);
}

/**
 * 扫描全部仓库，并返回扫描到的音乐
 */
export async function scanRepository(): Promise<Array<KeyValue<Array<MusicItem> | null, number>>> {
  const {list} = await listRepositories();
  const items = new Array<KeyValue<Array<MusicItem> | null, number>>();

  for (let repository of list) {
    if (repository.nativeId !== nativeId) {
      items.push({
        key: repository.id,
        value: null
      })
      continue;
    }
    if (repository.type === RepositoryType.LOCAL) {
      const temp = await scanLocal(repository);
      items.push({
        key: repository.id,
        value: temp
      });
    } else if (repository.type === RepositoryType.WEBDAV) {
      // WebDAV
      const temp = await scanWebDAV(repository);
      items.push({
        key: repository.id,
        value: temp
      });
    }
  }
  return items
}
