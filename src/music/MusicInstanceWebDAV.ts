import {MusicItem, MusicItemView} from "@/entity/MusicItem";
import {isNotEmptyString} from "@/utils/lang/StringUtil";
import {LyricContent} from "@/types/LyricLine";
import {getForText} from "@/plugin/http";
import {transferTextToLyric} from "@/plugin/music";
import {Repository} from "@/entity/Repository";
import {renderPreviewUrl} from "@/plugin/server";
import {createClient} from "webdav";
import {AbsMusicInstanceWeb} from "@/music/AbsMusicInstanceWeb";

function renderUrl(url: string, repo: Repository): string {
  let client = createClient(repo.url, {
    username: repo.username,
    password: repo.password,
  });
  return renderPreviewUrl(client.getFileDownloadLink(url));
}

export class MusicInstanceWebDAV extends AbsMusicInstanceWeb {

  constructor(item: MusicItemView) {
    super(item);
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