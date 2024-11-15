import {MusicPlayEvent} from "@/global/Event";
import {MusicItemSource, MusicItemView} from "@/entity/MusicItem";
import {getEffectiveNumber, isNotEmptyArray} from "@/utils/lang/FieldUtil";
import {random} from "radash";
import {LyricContent, LyricLine} from "@/types/LyricLine";
import {readFile, readFileAsString} from "@/utils/file/FileUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {IAudioMetadata, parseBuffer} from "music-metadata";
import {musicLyric} from "@/global/BeanFactory";
import {isNotEmptyString} from "@/utils/lang/StringUtil";
import {base64ToString} from "@/utils/file/CovertUtil";
import {getForText, headForExist} from "@/plugin/http";
import {globalSetting, useDownloadStore} from "@/store";
import {GlobalSettingPlayErrorType} from "@/entity/GlobalSetting";

export const musics = ref(new Array<MusicItemView>());
export const index = ref(0);
export const music = ref<MusicItemView | null>(null);
// 1: 单，2：顺，3：随
export const loop = ref(2);

export const audio = new Audio();

export const duration = ref(0);
export const currentTime = ref(0);
export const played = ref(false);
export const volume = ref(audio.volume * 100);
export const listVisible = ref(false);
export const displayVisible = ref(false);

export const lyricGroups = ref(new Array<LyricContent>())
export const lyrics = ref(new Array<LyricLine>());
export const lyricIndex = ref(0);

watch(volume, val => {
  audio.volume = val / 100
});
watch(lyricIndex, val => {
  if (lyrics.value.length > 0) {
    const cur = lyrics.value[val];
    if (cur) {
      musicLyric.sendLyric(cur.text);
      // 滚动
      let selector = document.querySelectorAll('.lyric-line');
      if (selector) {
        selector[val]?.scrollIntoView({behavior: "smooth", inline: 'center', block: 'center'});
      }
    }
  }
})

audio.addEventListener('canplay', () => {
  duration.value = audio.duration;
});
audio.addEventListener('timeupdate', () => {
  currentTime.value = audio.currentTime;
  // 歌词处理
  if (lyrics.value.length > 0) {
    for (let i = 0; i < lyrics.value.length; i++) {
      const ly = lyrics.value[i];
      if (ly.start <= currentTime.value && currentTime.value <= ly.end) {
        lyricIndex.value = i;
        return;
      }
    }
  }
});
audio.addEventListener('playing', () => {
  played.value = true;
});
audio.addEventListener('pause', () => {
  played.value = false;
});
audio.addEventListener('ended', () => {
  played.value = false;
  // 播放完，下一个
  next();
});

export function audioControl() {
  if (played.value) {
    audio.pause();
  } else {
    audio.play();
  }
}

export function loopControl() {
  switch (loop.value) {
    case 1:
      loop.value = 2;
      break;
    case 2:
      loop.value = 3;
      break;
    case 3:
      loop.value = 1;
      break;
    default:
      loop.value = 2;
      break;
  }
}

function transferTextToLyric(text: string): Array<LyricLine> {
  const lyricLines = new Array<LyricLine>();
  const lines = text.split("\n");
  for (let line of lines) {
    const time = line.match(/\[\d{2}:\d{2}\.\d{2}]/g);
    const text = line.replace(/\[\d{2}:\d{2}\.\d{2}]/g, '');
    if (time) {
      time.forEach(t => {
        const minutes = parseInt(t.slice(1, 3));
        const seconds = parseFloat(t.slice(4, 9));
        const timeInSeconds = minutes * 60 + seconds;
        lyricLines.push({
          text: text.trim(),
          start: timeInSeconds,
          end: 0
        })
      });
    }
  }
  return lyricLines;
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

function renderCoverFromMeta(meta: IAudioMetadata, m: MusicItemView) {
  if (isNotEmptyString(m.cover)) {
    return;
  }
  const {common} = meta;
  const {picture} = common;
  if (isNotEmptyArray(picture)) {
    const first = picture![0];
    const blob = new Blob([first.data], {type: 'image/png'});
    m.cover = URL.createObjectURL(blob);
  }
}

async function renderMusicMeta(m: MusicItemView) {
  // 解析音乐，解析歌词
  let lyricContents = new Array<LyricContent>();
  let index = 0;

  // 尝试读取自带的歌词
  if (m.lyric) {
    // 读取歌词
    let lineStr: string
    if (/^https?:\/\//.test(m.lyric)) {
      lineStr = await getForText(m.lyric);
    } else if (/^data:(.*?);base64,/.test(m.lyric)) {
      lineStr = m.lyric.substring(5)
      lineStr = base64ToString(m.lyric.replace(/^data:(.*?);base64,/, ""));
    } else {
      // 读取文件
      lineStr = await readFileAsString(m.lyric);
    }
    lyricContents.push({
      id: index++,
      lines: transferTextToLyric(lineStr)
    });
    // 存在本地歌词，先设置一波
    lyricGroups.value = lyricContents;
    lyrics.value = lyricContents[0].lines;
  }

  // 尝试获取元数据
  let tagsResult: IAudioMetadata;
  if (m.url.startsWith('http')) {
    // 如果是网络数据，则不处理音乐元数据
    return;
    // const rsp = await fetch(new URL(m.url), {
    //   method: 'GET'
    // });
    // const mc = await rsp.blob();
    // tagsResult = await parseBlob(mc);
  } else {
    // 本地
    const ub = await readFile(m.url);
    tagsResult = await parseBuffer(ub);

  }
  // 渲染封面
  renderCoverFromMeta(tagsResult, m);
  // 渲染歌词
  const res = renderLyricFromMeta(tagsResult)
  if (res.length > 0) {
    res.forEach(t => {
      lyricContents.push({
        id: index++,
        lines: t
      })
    })
  }


  // 处理歌词
  if (lyricContents.length > 0) {
    // 处理每一个歌词的截止时间
    for (let lyricContent of lyricContents) {
      const {lines} = lyricContent;
      for (let i = 0; i < lines.length; i++) {
        lines[i].end = lines[i + 1]?.start || 9999999999;
      }
    }
    lyricGroups.value = lyricContents;
    lyrics.value = lyricContents[0].lines;
  }
}

function onError(m: MusicItemView) {
  const {playError} = toRaw(globalSetting.value);
  if (playError === GlobalSettingPlayErrorType.NEXT) {
    if (musics.value.length > 1) {
      MessageUtil.warning(`歌曲【${m.name}】不存在，自动切换下一曲`)
      next();
      return;
    }
  }
  MessageUtil.warning(`歌曲【${m.name}】不存在，已暂停`)
}

export async function play() {
  if (music.value) {
    // 销毁旧的封面
    const {cover} = music.value;
    if (cover.startsWith('blob')) {
      URL.revokeObjectURL(cover);
    }
  }
  music.value = musics.value[getEffectiveNumber(index.value, 0, musics.value.length)];
  let exist: boolean;
  if (/^https?:\/\//.test(music.value.url)) {
    // 网络音乐
    exist = await headForExist(music.value.url);
    if (music.value.source === MusicItemSource.WEB) {
      // 如果支持缓存
      const {playDownload} = toRaw(globalSetting.value);
      if (playDownload) {
        // 下载
        useDownloadStore().cache(music.value);
      }
    }
    // TODO: 如果是webdav，还要进行缓存
  }else {
    // 本地音乐，判断URL是否存在
    exist = window.preload.fs.existsSync(music.value.url);
  }
  if (!exist) {
    return onError(music.value);
  }
  audio.src = music.value.url;
  lyricGroups.value = []
  lyrics.value = [];
  lyricIndex.value = 0;
  audio.load();
  audio.play()
    .then(() => console.log('播放成功'))
    .catch(e => MessageUtil.error("播放失败", e));
  renderMusicMeta(music.value)
    .then(() => console.log('渲染歌词成功'))
    .catch(e => console.error("渲染歌词失败", e));
}

export function pre() {
  if (loop.value === 1) {
    return;
  }
  if (index.value === 3) {
    index.value = random(0, musics.value.length - 1)
  } else {
    if (index.value === 0) {
      index.value = musics.value.length - 1;
    } else {
      index.value -= 1;
    }
  }
  play();
}

export function next() {
  if (loop.value === 1) {
    return;
  }
  if (index.value === 3) {
    index.value = random(0, musics.value.length - 1)
  } else {
    if (index.value === musics.value.length - 1) {
      index.value = 0;
    } else {
      index.value += 1;
    }
  }
  play();
}

export function switchIndex(idx: number) {
  index.value = idx;
  play();
}

export function removeIndex(idx: number, m: MusicItemView) {
  musics.value.splice(idx, 1);
  if (music.value?.id === m.id) {
    console.log(index.value, musics.value.length)
    play();
  } else {
    index.value = musics.value.findIndex(v => {
      return v.id === music.value?.id
    });
  }
}

export function rePlay() {
  // 清空音频状态
  audio.pause()
  audio.src = '';
  // 如果不存在音乐
  if (musics.value.length === 0) {
    return;
  }
  play();
}

export function onMusicPlay(e: MusicPlayEvent) {
  musics.value = e.views;
  index.value = e.index;
  // 触发重新播放
  rePlay();
}

export function onMusicAppend(e: MusicItemView) {
  if (musics.value.length === 0) {
    // 没有，直接覆盖
    musics.value = [e];
    index.value = 0;
    // 触发重新播放
    rePlay();
  } else if (index.value >= musics.value.length - 1) {
    // 插入
    musics.value.push(e);
  } else if (index.value < 0) {
    musics.value.unshift(e);
    index.value = 0;
    // 触发重新播放
    rePlay();
  } else {
    // 中间
    musics.value.splice(index.value + 1, 0, e);
  }
}

export function switchDisplay() {
  displayVisible.value = !displayVisible.value;
  if (displayVisible.value) {
    if (listVisible.value) {
      listVisible.value = false;
    }
  }
}

export function switchList() {
  if (displayVisible.value) {
    listVisible.value = false;
    return;
  }
  listVisible.value = !listVisible.value;
}

export function switchLyric() {
  musicLyric.switchWindow(() => {
    if (lyrics.value.length > 0) {
      for (let ly of lyrics.value) {
        if (ly.start <= currentTime.value && currentTime.value <= ly.end) {
          musicLyric.sendLyric(ly.text);
          return;
        }
      }
    }
  });
}

export function switchCurrentTime(currentTime: number) {
  audio.currentTime = currentTime;
}
