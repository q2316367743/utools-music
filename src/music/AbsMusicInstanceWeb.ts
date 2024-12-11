import {Repository} from "@/entity/Repository";
import {MusicItem, MusicItemView} from "@/entity/MusicItem";
import {clone} from "radash";
import {listRepositories} from "@/store";
import {MusicInstance} from "@/types/MusicInstance";
import {LyricContent} from "@/types/LyricLine";
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";

export abstract class AbsMusicInstanceWeb implements MusicInstance {

  protected readonly item: MusicItemView;
  protected repository: Repository | null = null;

  protected constructor(item: MusicItemView) {
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

  get source(): MusicItemSourceEnum {
    return this.item.source;
  }

  get pluginId(): number {
    return 0;
  }

  get self(): any {
    return this.item;
  }

  destroy(): Promise<void> {
    return Promise.resolve(undefined);
  }

  protected async getRepository(): Promise<Repository> {
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

  abstract getInfo(): Promise<MusicItem>;

  abstract getLyric(): Promise<Array<LyricContent>>;

  abstract usable(): Promise<boolean>;
}