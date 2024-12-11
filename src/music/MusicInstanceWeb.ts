import {IMusicItem} from "@/types/PluginInstance";
import {buildFromIMusicItem, MusicItem} from "@/entity/MusicItem";
import {globalSetting, usePluginStore} from "@/store";
import {copyProperties} from "@/utils/lang/FieldUtil";
import {LyricContent} from "@/types/LyricLine";
import {transferTextToLyric} from "@/plugin/music";
import {MusicInstance} from "@/types/MusicInstance";
import {clone} from "radash";
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";
import {headForExist} from "@/plugin/http";
import {toRaw} from "vue";

export class MusicInstanceWeb implements MusicInstance {

  private readonly item: IMusicItem;
  private readonly pId: number;

  constructor(item: IMusicItem, pluginId: number) {
    this.item = clone(item);
    this.pId = pluginId;
  }


  get album(): string {
    return this.item.album || '';
  }

  get artist(): string {
    return this.item.artist;
  }

  get id(): string {
    return String(this.item.id);
  }

  get name(): string {
    return this.item.title;
  }

  get cover(): string {
    return this.item.artwork || '';
  }

  get source(): MusicItemSourceEnum {
    return MusicItemSourceEnum.WEB;
  }

  destroy(): Promise<void> {
    return Promise.resolve(undefined);
  }

  get pluginId(): number {
    return this.pId;
  }

  get self(): any {
    return this.item;
  }

  async getInfo(): Promise<MusicItem> {
    const {pluginInstances} = usePluginStore();
    for (let plugin of pluginInstances) {
      if (plugin.id === this.pluginId) {
        // 先获取音乐详情
        try {
          if (plugin.instance.getMusicInfo) {
            const info = await plugin.instance.getMusicInfo(this.item);
            if (info) {
              copyProperties(info, this.item);
            }
          }
        } catch (e) {
          console.error("获取音乐详情失败", e);
        }
        // 不存在音乐，再获取音源
        const qualities: Array<"low" | "standard" | "high" | "super"> = ["super", "high", "standard", "low"];
        const {playQuality = "super"} = toRaw(globalSetting.value);
        qualities.splice(qualities.findIndex(e => e === playQuality), 1);
        qualities.unshift(playQuality);
        for (let quality of qualities) {
          try {
            if (plugin.instance.getMediaSource) {
              const mediaSource = await plugin.instance.getMediaSource(this.item, quality);
              console.log(quality, mediaSource)
              if (mediaSource) {
                copyProperties(mediaSource, this.item);
              }
            }
          } catch (e) {
            console.error("获取音源失败", e);
          }
          if (this.item.url) {
            break;
          }
        }
        break;
      }
    }

    if (!this.item.url) {
      return Promise.reject(new Error("音乐链接不存在"));
    }
    return buildFromIMusicItem(this.item, this.item.url)

  }

  async getLyric(): Promise<Array<LyricContent>> {
    let items = new Array<LyricContent>();
    let index = 0;

    const {pluginInstances} = usePluginStore();
    for (let plugin of pluginInstances) {
      if (plugin.id === this.pluginId) {
        try {
          if (plugin.instance.getLyric) {
            const lyric = await plugin.instance.getLyric(this.item);
            if (lyric && lyric.rawLrc) {
              this.item.rawLrc = lyric.rawLrc;
              items.push({
                id: index++,
                lines: transferTextToLyric(this.item.rawLrc)
              })
            }
          }
        } catch (e) {
          console.error("获取歌词失败", e);
        }
        break;
      }
    }

    return items;
  }

  usable(): Promise<boolean> {
    if (!this.item.url) {
      return Promise.resolve(false);
    }
    return headForExist(this.item.url);
  }

}