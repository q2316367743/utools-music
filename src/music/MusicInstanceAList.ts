import {LyricContent} from "@/types/LyricLine";
import {MusicItem, MusicItemView} from "@/entity/MusicItem";
import {AbsMusicInstanceWeb} from "@/music/AbsMusicInstanceWeb";
import {getAxiosInstance} from "@/plugin/http";
import {AListFsGetData, AListResponse} from "@/types/AList";
import {Repository} from "@/entity/Repository";

// TODO: AList 音乐源，需要支持没有登录的
export class MusicInstanceAList extends AbsMusicInstanceWeb {
  constructor(item: MusicItemView) {
    super(item);
  }

  private async getUrl(repo: Repository, url: string): Promise<string> {
    const getUrl = `${repo.url}/api/fs/get`;
    const res = await getAxiosInstance().get<AListResponse<AListFsGetData>>(getUrl, {
      headers: {
        'Authorization': repo.password
      },
      params: {
        path: url,
        password: ''
      }
    });
    console.log(url, res)

    return res.data.data.raw_url;
  }

  async getInfo(): Promise<MusicItem> {
    // 判断是否是本地
    const repo = await this.getRepository();

    this.item.url = await this.getUrl(repo, this.item.url);
    if (this.item.cover) {
      this.item.cover = await this.getUrl(repo, this.item.cover);
    }
    // this.item.cover = this.item.cover
    // TODO: 封面，
    // TODO: 缓存
    return this.item;
  }

  async getLyric(): Promise<Array<LyricContent>> {
    return Promise.resolve([]);
  }


}