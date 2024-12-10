import {MusicItem, MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {isNotEmptyString} from "@/utils/lang/StringUtil";
import {LyricContent} from "@/types/LyricLine";
import {getForText} from "@/plugin/http";
import {transferTextToLyric} from "@/plugin/music";
import {MusicInstance} from "@/types/MusicInstance";
import {Repository} from "@/entity/Repository";
import {listRepositories} from "@/store";
import {renderPreviewUrl} from "@/plugin/server";
import {createClient} from "webdav";
import {clone} from "radash";

function renderUrl(url: string, repo: Repository): string {
  let client = createClient(repo.url, {
    username: repo.username,
    password: repo.password,
  });
  return renderPreviewUrl(client.getFileDownloadLink(url));
}

export class MusicInstanceWebDAV implements MusicInstance {

  private readonly item: MusicItemView;
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
      this.item.url = renderUrl(this.item.url, repo)
    }
    if (!/https?:\/\//.test(this.item.cover) && isNotEmptyString(this.item.cover)) {
      this.item.cover = renderUrl(this.item.cover, repo)
    }
    // TODO: 封面，
    // TODO: 缓存
    return this.item;
  }

  async getLyric(): Promise<Array<LyricContent>> {
    // TODO: 歌词，
    // TODO: 缓存
    let items = new Array<LyricContent>();
    let index = 0;
    const repo = await this.getRepository();
    if (!/https?:\/\//.test(this.item.lyric) && isNotEmptyString(this.item.lyric)) {
      this.item.lyric = renderUrl(this.item.lyric, repo)
    }
    // 如果本身存在歌词
    if (this.item.lyric) {
      // 读取歌词
      let lineStr = await getForText(this.item.lyric);
      items.push({
        id: index++,
        lines: transferTextToLyric(lineStr)
      })
    }

    return items;
  }

  destroy(): Promise<void> {
    return Promise.resolve();
  }

}