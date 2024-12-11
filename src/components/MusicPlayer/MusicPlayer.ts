import {MusicPlayEvent} from "@/global/Event";
import {MusicItem} from "@/entity/MusicItem";
import {getEffectiveNumber} from "@/utils/lang/FieldUtil";
import {random} from "radash";
import {LyricContent, LyricLine} from "@/types/LyricLine";
import MessageUtil from "@/utils/modal/MessageUtil";
import {musicControls, musicLyric} from "@/global/BeanFactory";
import {globalSetting} from "@/store";
import {GlobalSettingPlayErrorType} from "@/entity/GlobalSetting";
import {MusicInstance} from "@/types/MusicInstance";
import {matchMusicAttachment} from "@/components/MusicPlayer/MusicAttachment";
import {useUtoolsDbStorage} from "@/hooks/UtoolsDbStorage";
import {LocalNameEnum} from "@/global/LocalNameEnum";

export const musics = ref(new Array<MusicInstance>());
export const index = ref(0);
export const music = ref<MusicInstance>();
// 1: 单，2：顺，3：随
export const loop = ref(2);

export const audio = new Audio();

export const duration = ref(0);
export const currentTime = ref(0);
export const played = ref(false);
export const volume = useUtoolsDbStorage<number>(
  LocalNameEnum.KEY_VOLUME,
  50
);
export const listVisible = ref(false);
export const displayVisible = ref(false);

export const lyricGroups = ref(new Array<LyricContent>())
export const lyrics = ref(new Array<LyricLine>());
export const lyricIndex = ref(0);

export const playLoading = ref(false);
const errorCount = ref(0);

watch(volume, val => {
  audio.volume = val / 100
}, {immediate: true});
watch(lyricIndex, val => {
  if (lyrics.value.length > 0) {
    const cur = lyrics.value[val];
    if (cur) {
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
  musicControls.sendProgress(audio.currentTime, audio.duration)
  // 歌词处理
  sendLyricWrap()
});
audio.addEventListener('playing', () => {
  played.value = true;
  musicControls.sendControl('play');
});
audio.addEventListener('pause', () => {
  played.value = false;
  musicControls.sendControl('pause');
});
audio.addEventListener('ended', () => {
  played.value = false;
  // 播放完，下一个
  next();
});

function sendLyricWrap() {
  // 歌词处理
  if (lyrics.value.length > 0) {
    for (let i = 0; i < lyrics.value.length; i++) {
      const ly = lyrics.value[i];
      if (ly.start <= currentTime.value && currentTime.value <= ly.end) {
        lyricIndex.value = i;
        musicLyric.sendLyric(ly.text);
        return;
      }
    }
  } else {
    lyricIndex.value = 0;
    musicLyric.sendLyric("暂无歌词");
  }
}

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

function onError(m: MusicItem) {
  errorCount.value += 1;
  if (errorCount.value > 4) {
    MessageUtil.warning("已经超过4次播放错误，播放暂停。")
    return;
  }
  const {playError} = toRaw(globalSetting.value);
  if (playError === GlobalSettingPlayErrorType.NEXT) {
    if (musics.value.length > 1) {
      MessageUtil.warning(`歌曲【${m.name}】不存在，自动切换下一曲`)
      setTimeout(next, 1500);
      return;
    }
  }
  MessageUtil.warning(`歌曲【${m.name}】不存在，已暂停`)
}

async function playWrapper() {
  if (music.value) {
    // 销毁旧的封面
    // await music.value.destroy()
  }
  // 暂停音乐
  audio.pause()
  currentTime.value = 0;
  const oldIndex = index.value;
  music.value = musics.value[getEffectiveNumber(index.value, 0, musics.value.length)];
  const instance = await music.value.getInfo();
  let exist = await music.value.usable();
  if (!exist) {
    return onError(instance);
  }
  if (oldIndex != index.value) {
    // 索引变了，代表用户没有等待
    return;
  }
  audio.src = instance.url;
  lyricGroups.value = []
  lyrics.value = [];
  lyricIndex.value = 0;
  audio.load();
  audio.play()
    .then(() => console.log('播放成功'))
    .catch(e => MessageUtil.error("播放失败", e));
  try {
    lyricGroups.value = await music.value.getLyric();
    lyricIndex.value = 0
    if (lyricGroups.value.length > 0) {
      lyrics.value = lyricGroups.value[0].lines;
    }
  } catch (e) {
    MessageUtil.warning("获取歌词失败", e);
  }
  // 播放成功，清空
  errorCount.value = 0;
  matchMusicAttachment(instance, music.value);
}

export function play() {
  if (playLoading.value) return;
  playLoading.value = true;
  currentTime.value = 0;
  duration.value = 0
  playWrapper()
    .catch(e => {
      MessageUtil.error("获取音乐播放信息失败", e);
      // 数据重置
      music.value = undefined;
      lyricGroups.value = []
      lyrics.value = [];
      lyricIndex.value = 0;
    })
    .finally(() => playLoading.value = false);
}

export function pre() {
  if (loop.value === 1) {
    return;
  }
  if (loop.value === 3) {
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
  if (loop.value === 3) {
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

export function removeIndex(idx: number, m: MusicInstance) {
  musics.value.splice(idx, 1);
  if (music.value?.id === m.id) {
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

export function onMusicAppend(e: MusicInstance) {
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
  if (listVisible.value) {
    listVisible.value = false;
  }
}

export function switchList() {
  listVisible.value = !listVisible.value;
}

export function switchLyric() {
  musicLyric.switchWindow(sendLyricWrap);
}

export function switchControls() {
  musicControls.switchWindow();
}

export function switchCurrentTime(currentTime: number) {
  audio.currentTime = currentTime;
}
