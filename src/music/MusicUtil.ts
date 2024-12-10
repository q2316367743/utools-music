import {MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {MusicInstanceLocal} from "@/music/MusicInstanceLocal";
import {MusicInstanceWebDAV} from "@/music/MusicInstanceWebDAV";
import {MusicInstanceAList} from "@/music/MusicInstanceAList";

export function createMusicInstance(item: MusicItemView) {
  if (item.source === MusicItemSource.LOCAL) {
    return new MusicInstanceLocal(item);
  }else if (item.source === MusicItemSource.WEBDAV) {
    return new MusicInstanceWebDAV(item);
  }else if (item.source === MusicItemSource.A_LIST) {
    return new MusicInstanceAList(item);
  }
  throw new Error("音乐来源不支持");
}