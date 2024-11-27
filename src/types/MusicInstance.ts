import {buildFromIMusicItem, MusicItem, MusicItemSource} from "@/entity/MusicItem";
import {getForText} from "@/plugin/http";
import {base64ToString} from "@/utils/file/CovertUtil";
import {readFile, readFileAsString} from "@/utils/file/FileUtil";
import {transferTextToLyric} from "@/plugin/music";
import {LyricContent, LyricLine} from "@/types/LyricLine";
import {IAudioMetadata, parseBuffer} from "music-metadata";
import {isEmptyString, isNotEmptyString} from "@/utils/lang/StringUtil";
import {copyProperties, isNotEmptyArray} from "@/utils/lang/FieldUtil";
import {IMusicItem} from "@/types/PluginInstance";
import {globalSetting, usePluginStore} from "@/store";

export interface MusicInstance {
  id: string;

  /**
   * 音乐名称
   */
  name: string;

  /**
   * 演唱者
   */
  artist: string;

  /**
   * 专辑
   */
  album: string;

  /**
   * 封面
   */
  cover: string;

  /**
   * 来源
   */
  source: MusicItemSource;

  /**
   * 实际的详情
   */
  getInfo: () => Promise<MusicItem>;

  /**
   * 获取歌词
   */
  getLyric: () => Promise<Array<LyricContent>>;

  /**
   * 销毁
   */
  destroy: () => Promise<void>;

}


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

export class MusicInstanceLocal implements MusicInstance {

  private readonly item: MusicItem;
  private metadata: IAudioMetadata | null = null;

  constructor(item: MusicItem) {
    this.item = item;
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

  get source(): MusicItemSource {
    return this.item.source;
  }

  private async getMetadata(): Promise<IAudioMetadata> {
    if (this.metadata) {
      return this.metadata;
    }
    const ub = await readFile(this.item.url);
    this.metadata = await parseBuffer(ub);
    return this.metadata;
  }

  async getInfo(): Promise<MusicItem> {
    // 判断是否是本地
    if (isEmptyString(this.item.cover)) {
      const metadata = await this.getMetadata();
      this.item.cover = renderCoverFromMeta(metadata, this.item);
    }
    return this.item;
  }

  async getLyric(): Promise<Array<LyricContent>> {
    let items = new Array<LyricContent>();
    let index = 0;
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
    const metadata = await this.getMetadata();
    const res = renderLyricFromMeta(metadata);
    res.forEach(t => {
      items.push({
        id: index++,
        lines: t
      })
    })


    for (let lyricContent of items) {
      const {lines} = lyricContent;
      for (let i = 0; i < lines.length; i++) {
        lines[i].end = lines[i + 1]?.start || 9999999999;
      }
    }

    return items;
  }

  destroy(): Promise<void> {
    if (this.item.cover.startsWith('blob')) {
      URL.revokeObjectURL(this.item.cover);
    }
    return Promise.resolve();
  }

}

export class MusicInstanceWeb implements MusicInstance {

  private readonly item: IMusicItem;
  private readonly pluginId: number;

  constructor(item: IMusicItem, pluginId: number) {
    this.item = item;
    this.pluginId = pluginId;
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

  get source(): MusicItemSource {
    return MusicItemSource.WEB;
  }

  destroy(): Promise<void> {
    return Promise.resolve(undefined);
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

    for (let lyricContent of items) {
      const {lines} = lyricContent;
      for (let i = 0; i < lines.length; i++) {
        lines[i].end = lines[i + 1]?.start || 9999999999;
      }
    }

    return items;
  }

}