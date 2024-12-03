import {MusicItem, MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {IAudioMetadata, parseBuffer} from "music-metadata";
import {readFile, readFileAsString} from "@/utils/file/FileUtil";
import {isNotEmptyString} from "@/utils/lang/StringUtil";
import {LyricContent, LyricLine} from "@/types/LyricLine";
import {getForText} from "@/plugin/http";
import {base64ToString} from "@/utils/file/CovertUtil";
import {transferTextToLyric} from "@/plugin/music";
import {MusicInstance} from "@/types/MusicInstance";
import {isNotEmptyArray} from "@/utils/lang/FieldUtil";
import {Repository} from "@/entity/Repository";
import {listRepositories} from "@/store";
import {renderPreviewUrl} from "@/plugin/server";
import {createClient} from "webdav";
import {clone} from "radash";

function renderCoverFromMeta(meta: IAudioMetadata, m: MusicItem) {
  if (isNotEmptyString(m.cover)) {
    return '';
  }
  const {common} = meta;
  const {picture} = common;
  if (isNotEmptyArray(picture)) {
    const first = picture![0];
    const blob = new Blob([first.data], {type: 'image/png'});
    return URL.createObjectURL(blob);
  }
  return ''
}

function renderLyricFromMeta(meta: IAudioMetadata): Array<Array<LyricLine>> {
  const {common} = meta;
  const res = new Array<Array<LyricLine>>();
  const {lyrics: lyricsTag} = common;
  if (lyricsTag) {
    if (lyricsTag.length > 0) {
      lyricsTag.forEach(t => {
        const {text} = t;
        if (text) {
          res.push(transferTextToLyric(text));
        }
      })
    }
  }
  return res;
}

function renderUrl(url: string, repo: Repository): string {
  let client = createClient(repo.url, {
    username: repo.username,
    password: repo.password,
  });
  return renderPreviewUrl(client.getFileDownloadLink(url));
}

export class MusicInstanceWebDAV implements MusicInstance {

  private readonly item: MusicItemView;
  private metadata: IAudioMetadata | null = null;
  private repository: Repository | null = null;

  constructor(item: MusicItemView) {
    this.item = clone(item);
  }

  get album(): string {
    return this.item.album;
  }

  get artist(): string {
    return this.item.artist;
  }

  get id(): string {
    return String(this.item.id);
  }

  get name(): string {
    return this.item.name;
  }

  get cover(): string {
    return this.item.cover;
  }

  set cover(res: string) {
    this.item.cover = res;
  }

  get source(): MusicItemSource {
    return this.item.source;
  }

  get pluginId(): number {
    return 0;
  }

  get self(): any {
    return this.item;
  }

  private async getMetadata(): Promise<IAudioMetadata> {
    if (this.metadata) {
      return this.metadata;
    }
    const ub = await readFile(this.item.url);
    this.metadata = await parseBuffer(ub);
    return this.metadata;
  }

  private async getRepository(): Promise<Repository> {
    if (!this.repository) {
      const {list} = await listRepositories();
      for (const res of list) {
        if (res.id === this.item.repositoryId) {
          this.repository = res;
          break;
        }
      }
    }
    if (!this.repository) {
      return Promise.reject(new Error(`Repository not found`));
    }
    return this.repository;

  }

  async getInfo(): Promise<MusicItem> {
    // 判断是否是本地
    const repo = await this.getRepository();
    if (!/https?:\/\//.test(this.item.url) && isNotEmptyString(this.item.url)) {
      this.item.url  = renderUrl(this.item.url, repo)
    }
    if (!/https?:\/\//.test(this.item.cover) && isNotEmptyString(this.item.cover)) {
      this.item.cover  = renderUrl(this.item.cover, repo)
    }
    // TODO: 封面，
    // TODO: 缓存
    // if (isEmptyString(this.item.cover)) {
    //   const metadata = await this.getMetadata();
    //   this.item.cover = renderCoverFromMeta(metadata, this.item);
    // }
    return this.item;
  }

  async getLyric(): Promise<Array<LyricContent>> {
    // TODO: 歌词，
    // TODO: 缓存
    let items = new Array<LyricContent>();
    let index = 0;
    const repo = await this.getRepository();
    if (!/https?:\/\//.test(this.item.lyric) && isNotEmptyString(this.item.lyric)) {
      this.item.lyric  = renderUrl(this.item.lyric, repo)
    }
    // 如果本身存在歌词
    if (this.item.lyric) {
      // 读取歌词
      let lineStr: string
      if (/^https?:\/\//.test(this.item.lyric)) {
        lineStr = await getForText(this.item.lyric);
      } else if (/^data:(.*?);base64,/.test(this.item.lyric)) {
        lineStr = this.item.lyric.substring(5)
        lineStr = base64ToString(this.item.lyric.replace(/^data:(.*?);base64,/, ""));
      } else {
        // 读取文件
        lineStr = await readFileAsString(this.item.lyric);
      }
      items.push({
        id: index++,
        lines: transferTextToLyric(lineStr)
      })
    }
    // const metadata = await this.getMetadata();
    // const res = renderLyricFromMeta(metadata);
    // res.forEach(t => {
    //   items.push({
    //     id: index++,
    //     lines: t
    //   })
    // })

    return items;
  }

  destroy(): Promise<void> {
    return Promise.resolve();
  }

}