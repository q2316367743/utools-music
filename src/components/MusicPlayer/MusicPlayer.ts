import {MusicPlayEvent} from "@/global/Event";
import {MusicItemView} from "@/entity/MusicItem";
import {getEffectiveNumber} from "@/utils/lang/FieldUtil";
import {random} from "radash";
import {LyricLine} from "@/types/LyricLine";
import {readFile, readFileAsString} from "@/utils/file/FileUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {parseBuffer} from "music-metadata";
import {musicLyric} from "@/global/BeanFactory";

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
      let selector = document.querySelector('.lyric-line.active');
      if (selector) {
        selector.scrollIntoView({behavior: "smooth", inline: 'center', block: 'center'});
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

export async function renderLyric(m: MusicItemView) {
  // 解析音乐，解析歌词
  lyrics.value = [];
  let lyricLines = new Array<LyricLine>();
  if (m.lyric) {
    // 读取歌词
    let lineStr: string
    if (m.lyric.startsWith("http")) {
      const rsp = await fetch(m.lyric, {
        method: 'GET'
      });
      lineStr = await rsp.text();
    } else {
      // 读取文件
      lineStr = await readFileAsString(m.lyric);
    }
    lyricLines = transferTextToLyric(lineStr);
  } else {
    // 尝试获取文件
    if (m.url.startsWith('http')) {
      // TODO: 网络
    } else {
      // 本地
      const ub = await readFile(m.url);
      const {common} = await parseBuffer(ub);
      // TODO: 封面
      const {lyrics: lyricsTag} = common;
      console.log(lyricsTag)
      if (lyricsTag) {
        if (lyricsTag.length > 0) {
          const lt = lyricsTag[0]
          const {text} = lt;
          if (text) {
            lyricLines = transferTextToLyric(text);
          }
        }
      }
    }
  }
  if (lyricLines.length > 0) {
    // 处理截止音乐时间
    for (let i = 0; i < lyricLines.length; i++) {
      lyricLines[i].end = lyricLines[i + 1]?.start || 9999999999;
    }
    lyrics.value = lyricLines;
  }
}

export function play() {
  music.value = musics.value[getEffectiveNumber(index.value, 0, musics.value.length)];
  audio.src = music.value.url;
  lyrics.value = [];
  lyricIndex.value = 0;
  audio.load();
  audio.play()
    .then(() => console.log('播放成功'))
    .catch(e => MessageUtil.error("播放失败", e));
  renderLyric(music.value)
    .then(() => console.log('渲染歌词成功'))
    .catch(e => MessageUtil.error("渲染歌词失败", e));
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
