import {IMusicItem} from "@/types/PluginInstance";
import {useMusicStore, usePluginStore} from "@/store";
import {isEmptyString} from "@/utils/lang/StringUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {getForText} from "@/plugin/http";
import {transferLyricToText, transferTextToLyric} from "@/plugin/music";
import {DialogPlugin} from "tdesign-vue-next";
import {lyricGroups, lyricIndex, lyrics, music} from "@/components/MusicPlayer/MusicPlayer";
import {MusicInstance} from "@/types/MusicInstance";
import {stringToBase64} from "@/utils/file/CovertUtil";
import {MusicItem} from "@/entity/MusicItem";
import {unlinkAsync} from "@/utils/file/FileUtil";
import {LyricLine} from "@/types/LyricLine";

export interface IMusicItemLyric {
  item: IMusicItem,
  source: MusicInstance
}

async function downloadLrc(lrcLines: Array<LyricLine>, source: MusicInstance) {
  // 下载歌词
  const {name, artist, self} = source;
  const {url, id} = (self as MusicItem);
  const lrcName = `${artist} - ${name}.lrc`;
  let dirname = window.preload.path.dirname(url);
  const target = window.preload.path.join(dirname, lrcName);

  if (window.preload.fs.existsSync(target)) {
    // 如果存在，则删除
    await unlinkAsync(target);
  }

  await window.preload.downloadFile(
    `data:text/plain;base64,${stringToBase64(transferLyricToText(lrcLines))}`,
    lrcName,
    dirname)
  // 修改源
  await useMusicStore().updateById({
    id: id,
    lyric: target
  });
}

async function showLyricWrap(id: number, itemLyric: IMusicItemLyric,
                             onComplete: () => void) {
  const {item, source} = itemLyric;
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
  const lyricLines = transferTextToLyric(rawLrc);
  const dialogInstance = DialogPlugin({
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
      downloadLrc(lyricLines, source);
      // 设为歌词
      const current = music.value;
      if (!current) {
        MessageUtil.error("当前没有歌曲播放！");
        return;
      }
      lyricGroups.value.push({
        id: Date.now(),
        lines: lyricLines
      });
      lyricIndex.value = lyricGroups.value.length - 1;
      lyrics.value = lyricLines;
      dialogInstance.destroy();
      onComplete();
    }
  });
}

export function showLyric(
  id: number,
  item: IMusicItemLyric,
  onComplete: () => void
) {
  showLyricWrap(id, item, onComplete)
    .catch(e => MessageUtil.error("获取歌词失败", e))
}