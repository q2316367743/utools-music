import {IMusicItem} from "@/types/PluginInstance";
import {usePluginStore} from "@/store";
import {isEmptyString} from "@/utils/lang/StringUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {getForText} from "@/plugin/http";
import {transferTextToLyric} from "@/plugin/music";
import {DialogPlugin} from "tdesign-vue-next";

async function showLyricWrap(id: number, item: IMusicItem) {
  const {getInstance} = usePluginStore()
  const instance = getInstance(id);
  const {getLyric} = instance;
  if (isEmptyString(item.lrc) && isEmptyString(item.rawLrc)) {
    if (getLyric) {
      const res = await getLyric(item);
      if (res) {
        item.rawLrc = res.rawLrc;
      }
    }
  }
  let rawLrc: string;
  if (item.rawLrc) {
    rawLrc = item.rawLrc;
  } else if (item.lrc) {
    rawLrc = await getForText(item.lrc);
  } else {
    return Promise.reject(new Error("歌词不存在"))
  }
  let lyricLines = transferTextToLyric(rawLrc);
  DialogPlugin({
    header: "歌词详情",
    top: '8vh',
    default: () => <ul style={{maxHeight: '45vh'}}>
      {lyricLines.map((line, i) => <li key={i}>{line.text}</li>)}
    </ul>,
    confirmBtn: {
      default: '设为歌词',
    },
    onConfirm() {
      // TODO: 设为歌词
    }
  })
}

export function showLyric(id: number, item: IMusicItem, onComplete: () => void) {
  showLyricWrap(id, item)
    .catch(e => MessageUtil.error("获取歌词失败", e))
    .finally(onComplete);
}