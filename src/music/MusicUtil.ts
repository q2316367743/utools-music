import {MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {MusicInstanceLocal} from "@/music/MusicInstanceLocal";
import {MusicInstanceWebDAV} from "@/music/MusicInstanceWebDAV";

export function createMusicInstance(item: MusicItemView) {
  if (item.source === MusicItemSource.LOCAL) {
    return new MusicInstanceLocal(item);
  }else if (item.source === MusicItemSource.WEBDAV) {
    return new MusicInstanceWebDAV(item);
  }
  throw new Error("音乐来源不支持");
}