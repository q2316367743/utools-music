import {MusicItemView} from "@/entity/MusicItem";
import {MusicInstanceLocal} from "@/music/MusicInstanceLocal";
import {MusicInstanceWebDAV} from "@/music/MusicInstanceWebDAV";
import {MusicInstanceAList} from "@/music/MusicInstanceAList";
import {MusicItemSourceEnum} from "@/entity/MusicItemSourceEnum";

export function createMusicInstance(item: MusicItemView) {
  if (item.source === MusicItemSourceEnum.LOCAL) {
    return new MusicInstanceLocal(item);
  }else if (item.source === MusicItemSourceEnum.WEBDAV) {
    return new MusicInstanceWebDAV(item);
  }else if (item.source === MusicItemSourceEnum.A_LIST) {
    return new MusicInstanceAList(item);
  }
  throw new Error("音乐来源不支持");
}