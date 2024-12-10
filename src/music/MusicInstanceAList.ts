import {LyricContent} from "@/types/LyricLine";
import {MusicItem, MusicItemView} from "@/entity/MusicItem";
import {AbsMusicInstanceWeb} from "@/music/AbsMusicInstanceWeb";

// TODO: AList 音乐源，需要支持没有登录的
export class MusicInstanceAList extends AbsMusicInstanceWeb {
  constructor(item: MusicItemView) {
    super(item);
  }

  async getInfo(): Promise<MusicItem> {
    // 判断是否是本地
    const repo = await this.getRepository();
    this.item.url = this.item.url
    this.item.cover = this.item.cover
    // TODO: 封面，
    // TODO: 缓存
    return this.item;
  }

  async getLyric(): Promise<Array<LyricContent>> {
    return Promise.resolve([]);
  }


}