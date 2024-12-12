import {getEffectiveNumber} from "@/utils/lang/FieldUtil";
import {buildMusicInstance} from "@/music/MusicUtil";
import {audio, index, music, musics, next, onError, pre} from "@/components/MusicPlayer/MusicPlayer";
import MessageUtil from "@/utils/modal/MessageUtil";
import {MusicInstance} from "@/types/MusicInstance";
import {readFile} from "@/utils/file/FileUtil";

async function initMusicList() {
  if (index.value === -1) {
    return;
  }
  const listItem = musics.value[getEffectiveNumber(index.value, 0, musics.value.length)];
  music.value = buildMusicInstance(listItem);
  const instance = await music.value.getInfo();
  let exist = await music.value.usable();
  if (!exist) {
    return onError(instance);
  }
  audio.src = instance.url;
  await changeMediaSession(music.value);
}

export async function changeMediaSession(instance: MusicInstance) {
  if (!('mediaSession' in navigator)) return;
  
  const artwork = [];
  if (instance.cover) {
    if (/^https?:\/\//.test(instance.cover) || /^blob:/.test(instance.cover)) {
      artwork.push({src: instance.cover, sizes: '96x96', type: 'image/png'})
      artwork.push({src: instance.cover, sizes: '128x128', type: 'image/png'})
      artwork.push({src: instance.cover, sizes: '192x192', type: 'image/png'})
      artwork.push({src: instance.cover, sizes: '256x256', type: 'image/png'})
    } else {
      const data = await readFile(instance.cover);
      const blob = new Blob([data], {type: 'image/png'});
      const url = URL.createObjectURL(blob);
      artwork.push({src: url, sizes: '96x96', type: 'image/png'})
      artwork.push({src: url, sizes: '128x128', type: 'image/png'})
      artwork.push({src: url, sizes: '192x192', type: 'image/png'})
      artwork.push({src: url, sizes: '256x256', type: 'image/png'})
    }
  }
  
  navigator.mediaSession.metadata = new MediaMetadata({
    title: instance.name,
    artist: instance.artist,
    album: instance.album,
    artwork: artwork
  });
}

async function initMediaSession() {
  if (!('mediaSession' in navigator)) return;
  
  if (musics.value.length > 0 && index.value > -1 && index.value < musics.value.length) {
    const listItem = musics.value[getEffectiveNumber(index.value, 0, musics.value.length)];
    const instance = buildMusicInstance(listItem);
    await changeMediaSession(instance);
  }

  navigator.mediaSession.setActionHandler('play', () => {
    audio.play();
    navigator.mediaSession.playbackState = 'playing';
  });
  
  navigator.mediaSession.setActionHandler('pause', () => {
    audio.pause();
    navigator.mediaSession.playbackState = 'paused';
  });
  
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    pre();
  });
  
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    next();
  });

  audio.addEventListener('play', () => {
    navigator.mediaSession.playbackState = 'playing';
  });
  
  audio.addEventListener('pause', () => {
    navigator.mediaSession.playbackState = 'paused';
  });
}

export function initPlayer() {
  // 初始化音乐列表
  initMusicList()
    .then(() => console.log("初始化音乐列表成功"))
    .catch(e => MessageUtil.error("初始化音乐列表失败", e));
  // 增加媒体控制
  initMediaSession()
    .then(() => console.log("增加媒体控制成功"))
    .catch(e => MessageUtil.error("增加媒体控制失败", e));
}
