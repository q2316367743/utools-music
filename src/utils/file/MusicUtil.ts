import {Repository, RepositoryFileNameRuleEnum} from "@/entity/Repository";
import {MusicItem} from "@/entity/MusicItem";
import {FileItem, parseFileToMusic, readFileList} from "@/utils/file/FileUtil";
import {group} from "@/utils/lang/ArrayUtil";
import {basenameWeb, copyProperties, dirnameWeb, extnameWeb, getFolder, getFolderWeb} from "@/utils/lang/FieldUtil";
import {IMAGE_EXTNAME, LYRIC_EXTNAME, MUSIC_EXTNAME} from "@/global/Constant";
import {AuthType, createClient} from "webdav";
import {FileStat} from "webdav/dist/node/types";
import {getAxiosInstance} from "@/plugin/http";
import {AListFsListContent, AListFsListData, AListResponse} from "@/types/AList";
import {isEmptyString, isNotEmptyString} from "@/utils/lang/StringUtil";
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";

const nativeId = utools.getNativeId();

interface MusicInfo {
  name: string,
  artist: string
}

export function parseMusicName(basename: string, repo: Repository): MusicInfo {
  if (isEmptyString(basename)) {
    return {artist: '', name: ''}
  }
  const {fileNameRule = RepositoryFileNameRuleEnum.ARTIST_NAME} = repo;
  if (fileNameRule === RepositoryFileNameRuleEnum.NAME_ARTIST) {
    let strings = basename.split("-");
    if (strings.length > 1) {
      return {
        name: strings[0].trim(),
        artist: strings.slice(1).join("-").trim(),
      }
    }
  } else if (fileNameRule === RepositoryFileNameRuleEnum.NAME) {
    return {
      name: basename,
      artist: ''
    }
  } else {
    let strings = basename.split("-");
    if (strings.length > 1) {
      return {
        artist: strings[0].trim(),
        name: strings.slice(1).join("-").trim(),
      }
    }
  }
  return {
    artist: '',
    name: basename,
  }
}

/**
 * 解析文件为音乐
 * @param files 文件列表
 * @param source 音乐来源
 * @param repo 仓库
 */
async function parseMusicItemFromFileItem(
  files: Array<FileItem>,
  source: MusicItemSourceEnum,
  repo: Repository
): Promise<Array<MusicItem>> {
  const musicItems = new Array<MusicItem>();
  // 文件分组，用于处理封面和歌词
  const fileMap = group(files, 'basename');
  // 寻找合适的音乐
  let start = Date.now();
  for (const e of fileMap) {
    const [k, v] = e;
    const {name, artist} = parseMusicName(k, repo);
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
      if (MUSIC_EXTNAME.includes(e.extname.toLowerCase())) {
        musicItem.url = e.path;
      } else if (IMAGE_EXTNAME.includes(e.extname.toLowerCase())) {
        musicItem.cover = e.path;
      } else if (LYRIC_EXTNAME.includes(e.extname.toLowerCase())) {
        musicItem.lyric = e.path;
      }
    });
    // 存在链接
    if (isNotEmptyString(musicItem.url)) {
      // 只有本地做元数据解析
      if (source === MusicItemSourceEnum.LOCAL) {
        try {
          const meta = await parseFileToMusic(musicItem.url);
          copyProperties(meta, musicItem);
        } catch (e) {
          console.error("元数据解析失败", e)
        }
        // 本地音乐
        musicItem.dir = window.preload.path.dirname(musicItem.url);
        // 从目录中获取文件夹名
        musicItem.folder = getFolder(musicItem.dir);
      } else {
        // 处理文件夹问题
        musicItem.dir = dirnameWeb(musicItem.url);
        musicItem.folder = getFolderWeb(musicItem.dir);
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
export async function scanLocal(repo: Repository): Promise<Array<MusicItem>> {
  const files = await readFileList(repo.path);
  return parseMusicItemFromFileItem(files, MusicItemSourceEnum.LOCAL, repo);
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
export async function scanWebDAV(repo: Repository): Promise<Array<MusicItem>> {
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
  return parseMusicItemFromFileItem(files, MusicItemSourceEnum.WEBDAV, repo);
}

function renderFileFromAList(e: AListFsListContent, repo: Repository): FileItem {
  const basename = basenameWeb(e.name);
  const extname = extnameWeb(e.name);
  return {
    name: e.name,
    basename,
    extname,
    path: repo.path + '/' + e.name
  }
}

/**
 * 扫描AList
 * @param repo 仓库配置
 */
export async function scanAList(repo: Repository): Promise<Array<MusicItem>> {
  let page = 1;
  const list = new Array<AListFsListContent>();
  while (true) {
    const res = await getAxiosInstance().get<AListResponse<AListFsListData>>(
      '/api/fs/list', {
        baseURL: repo.url,
        headers: {
          'Authorization': repo.username
        },
        params: {
          path: repo.path,
          password: repo.password,
          refresh: true,
          page,
          per_page: 50
        }
      });
    const {data} = res;
    const {content} = data.data;
    content.forEach(e => {
      if (e.is_dir) {
        // 目录跳过
        // TODO: 目前只处理一层
        return;
      }
      list.push(e);
    });
    if (content.length < 50) {
      break;
    } else {
      page++;
    }
  }

  return parseMusicItemFromFileItem(
    list.map(e => renderFileFromAList(e, repo)),
    MusicItemSourceEnum.A_LIST, repo);
}